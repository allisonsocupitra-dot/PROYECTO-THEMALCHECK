"""Generador del PDF del visor con el formato del reporte de DJI Thermal.

Estructura: encabezado (logo + nombre) / imagen con barra de escala /
nombre y fecha / Measurements / Parameters / Image Info / Remarks.
"""
import base64
from io import BytesIO
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    CondPageBreak,
    Flowable,
    Image,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from src.schemas.informe import ExportarInformeRequest

GRIS = colors.HexColor("#666666")
GRIS_CLARO = colors.HexColor("#DDDDDD")
FONDO_TABLA = colors.HexColor("#FAFAFA")

# Se usa si el frontend no manda la paleta (o llega en un formato no válido)
PALETA_POR_DEFECTO = ["#000000", "#3b0764", "#a21caf", "#f97316", "#fde047"]
# Pon True si la barra sale con el color caliente abajo en lugar de arriba
INVERTIR_ESCALA = False

RUTA_LOGO = Path(__file__).resolve().parent.parent / "assets" / "logo.png"


# ---------------------------------------------------------------- utilidades
def _temp(valor: float | None) -> str:
    return f"{valor:.1f}°C" if valor is not None else "—"


def _paleta(hexes: list[str]) -> list:
    resultado = []
    for h in hexes:
        try:
            resultado.append(colors.HexColor(h))
        except Exception:
            continue
    if len(resultado) < 2:
        resultado = [colors.HexColor(h) for h in PALETA_POR_DEFECTO]
    return resultado


def _color_en(paleta: list, t: float):
    """Color interpolado en la posición t (0 = primer color, 1 = último)."""
    pos = max(0.0, min(1.0, t)) * (len(paleta) - 1)
    i = int(pos)
    if i >= len(paleta) - 1:
        return paleta[-1]
    f = pos - i
    a, b = paleta[i], paleta[i + 1]
    return colors.Color(
        a.red + (b.red - a.red) * f,
        a.green + (b.green - a.green) * f,
        a.blue + (b.blue - a.blue) * f,
    )


def _leer_imagen(imagen_base64: str | None):
    if not imagen_base64:
        return None, 0, 0
    if imagen_base64.startswith("data:"):
        imagen_base64 = imagen_base64.split(",", 1)[1]
    try:
        lector = ImageReader(BytesIO(base64.b64decode(imagen_base64)))
        ancho, alto = lector.getSize()
        return lector, ancho, alto
    except Exception:
        return None, 0, 0


# ------------------------------------------------------------------ flowables
class TituloSeccion(Flowable):
    """Título con la barrita oscura a la izquierda (▌ Measurements)."""

    def __init__(self, texto: str):
        super().__init__()
        self.texto = texto

    def wrap(self, ancho_disp, alto_disp):
        return ancho_disp, 14

    def draw(self):
        c = self.canv
        c.setFillColor(colors.HexColor("#555555"))
        c.rect(0, 2, 3, 10, stroke=0, fill=1)
        c.setFillColor(GRIS)
        c.setFont("Helvetica", 10)
        c.drawString(8, 4, self.texto)


class ImagenConEscala(Flowable):
    """Imagen térmica a la izquierda y barra de colores con máx/mín a la derecha."""

    ANCHO_BARRA = 5 * mm
    SEPARACION = 4 * mm
    ANCHO_ETIQUETA = 16 * mm
    ALTO_MAXIMO = 170 * mm

    def __init__(self, lector, ancho_px, alto_px, ancho_total, escala):
        super().__init__()
        self.lector = lector
        self.escala = escala
        self.ancho_total = ancho_total
        self.ancho_img = ancho_total - self.ANCHO_BARRA - self.SEPARACION - self.ANCHO_ETIQUETA
        proporcion = (alto_px / ancho_px) if (lector and ancho_px) else 0.8
        self.alto_img = self.ancho_img * proporcion
        if self.alto_img > self.ALTO_MAXIMO:
            factor = self.ALTO_MAXIMO / self.alto_img
            self.alto_img *= factor
            self.ancho_img *= factor

    def wrap(self, ancho_disp, alto_disp):
        return self.ancho_total, self.alto_img

    def draw(self):
        c = self.canv
        if self.lector:
            c.drawImage(self.lector, 0, 0, width=self.ancho_img, height=self.alto_img)
        else:
            c.setFillColor(colors.HexColor("#EEEEEE"))
            c.rect(0, 0, self.ancho_img, self.alto_img, stroke=0, fill=1)
            c.setFillColor(GRIS)
            c.setFont("Helvetica", 10)
            c.drawCentredString(self.ancho_img / 2, self.alto_img / 2, "Sin imagen")
        if self.escala:
            self._dibujar_escala()

    def _dibujar_escala(self):
        c = self.canv
        paleta = _paleta(self.escala.colores)
        if INVERTIR_ESCALA:
            paleta = paleta[::-1]

        x0 = self.ancho_img + self.SEPARACION
        pasos = 120
        alto_paso = self.alto_img / pasos
        for i in range(pasos):
            c.setFillColor(_color_en(paleta, i / (pasos - 1)))
            c.rect(x0, i * alto_paso, self.ANCHO_BARRA, alto_paso + 0.4, stroke=0, fill=1)

        c.setStrokeColor(GRIS_CLARO)
        c.setLineWidth(0.5)
        c.rect(x0, 0, self.ANCHO_BARRA, self.alto_img, stroke=1, fill=0)

        c.setFillColor(GRIS)
        c.setFont("Helvetica", 8)
        x_texto = x0 + self.ANCHO_BARRA + 2 * mm
        if self.escala.temp_max is not None:
            c.drawString(x_texto, self.alto_img - 7, _temp(self.escala.temp_max))
        if self.escala.temp_min is not None:
            c.drawString(x_texto, 2, _temp(self.escala.temp_min))


# -------------------------------------------------------------------- tablas
def _tabla(filas: list[list[str]], anchos: list[float]) -> Table:
    tabla = Table(filas, colWidths=anchos)
    tabla.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.5, GRIS_CLARO),
                ("BACKGROUND", (0, 0), (-1, -1), FONDO_TABLA),
                ("TEXTCOLOR", (0, 0), (-1, -1), GRIS),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return tabla


def _seccion(titulo: str, tabla: Table) -> list:
    # CondPageBreak evita que el título quede solo al final de una página
    return [CondPageBreak(35 * mm), Spacer(1, 4 * mm), TituloSeccion(titulo), Spacer(1, 1.5 * mm), tabla]


def _filas_mediciones(puntos) -> list[list[str]]:
    filas = []
    for p in puntos:
        if p.tipo == "punto":
            filas.append([p.etiqueta, "VALUE", _temp(p.valor)])
        else:
            filas.append([p.etiqueta, "MAX", _temp(p.valor_max)])
            filas.append([p.etiqueta, "MIN", _temp(p.valor_min)])
            filas.append([p.etiqueta, "AVG", _temp(p.valor_avg)])
    return filas or [["—", "—", "—"]]


# ------------------------------------------------------------------ principal
def generar_pdf_informe(datos: ExportarInformeRequest) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=12 * mm,
        bottomMargin=12 * mm,
        title=datos.nombre_archivo,
        author="ThermalCheck",
    )
    ancho = doc.width
    elementos: list = []

    # 1) Encabezado: logo a la izquierda, nombre del archivo a la derecha
    logo = (
        Image(str(RUTA_LOGO), width=18 * mm, height=18 * mm, kind="proportional")
        if RUTA_LOGO.exists()
        else Spacer(1, 18 * mm)
    )
    estilo_nombre = ParagraphStyle(
        "nombre", fontName="Helvetica", fontSize=11, textColor=GRIS, alignment=TA_RIGHT
    )
    encabezado = Table(
        [[logo, Paragraph(escape(datos.nombre_archivo), estilo_nombre)]],
        colWidths=[ancho * 0.3, ancho * 0.7],
    )
    encabezado.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LINEBELOW", (0, 0), (-1, 0), 0.5, GRIS_CLARO),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (0, 0), 0),
            ]
        )
    )
    elementos += [encabezado, Spacer(1, 6 * mm)]

    # 2) Imagen térmica con la barra de escala
    lector, ancho_px, alto_px = _leer_imagen(datos.imagen_base64)
    elementos.append(ImagenConEscala(lector, ancho_px, alto_px, ancho, datos.escala))

    # 3) Nombre y fecha debajo de la imagen
    elementos += [
        Spacer(1, 4 * mm),
        Paragraph(
            escape(datos.nombre_archivo),
            ParagraphStyle("titulo", fontName="Helvetica", fontSize=12, textColor=GRIS),
        ),
        Paragraph(
            escape(datos.fecha or ""),
            ParagraphStyle("fecha", fontName="Helvetica", fontSize=8, textColor=GRIS, leading=14),
        ),
    ]

    # 4) Measurements
    elementos += _seccion(
        "Measurements",
        _tabla(_filas_mediciones(datos.puntos), [ancho * 0.2, ancho * 0.2, ancho * 0.6]),
    )

    # 5) Parameters
    if datos.parametros:
        elementos += _seccion(
            "Parameters",
            _tabla([[k, v] for k, v in datos.parametros.items()], [ancho * 0.2, ancho * 0.8]),
        )

    # 6) Image Info (si no cabe en la página 1, sigue en la 2)
    if datos.info_imagen:
        elementos += _seccion(
            "Image Info",
            _tabla([[k, v] for k, v in datos.info_imagen.items()], [ancho * 0.2, ancho * 0.8]),
        )

    # 7) Remarks (solo si el técnico escribió observaciones)
    if datos.observaciones and datos.observaciones.strip():
        estilo_obs = ParagraphStyle(
            "obs", fontName="Helvetica", fontSize=9, leading=12, textColor=GRIS
        )
        texto = escape(datos.observaciones.strip()).replace("\n", "<br/>")
        caja = Table([[Paragraph(texto, estilo_obs)]], colWidths=[ancho])
        caja.setStyle(
            TableStyle(
                [
                    ("GRID", (0, 0), (-1, -1), 0.5, GRIS_CLARO),
                    ("BACKGROUND", (0, 0), (-1, -1), FONDO_TABLA),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )
        elementos += _seccion("Remarks", caja)

    doc.build(elementos)
    return buffer.getvalue()