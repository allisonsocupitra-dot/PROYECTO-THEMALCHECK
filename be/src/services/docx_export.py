"""Generador del reporte en Word (.docx) del visor.

Mismo contenido y orden que el PDF: encabezado / imagen con barra de escala /
nombre y fecha / Measurements / Parameters / Image Info / Remarks.
"""
import base64
from io import BytesIO

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from PIL import Image as PILImage
from PIL import ImageDraw

from src.schemas.informe import ExportarInformeRequest
from src.services.pdf_export import (
    INVERTIR_ESCALA,
    RUTA_LOGO,
    _color_en,
    _filas_mediciones,
    _paleta,
    _temp,
)

GRIS = RGBColor(0x66, 0x66, 0x66)
ANCHO_UTIL_CM = 18.0      # A4 (21 cm) - márgenes de 1.5 cm
ANCHO_BARRA_CM = 0.5
ALTO_MAX_IMAGEN_CM = 15.0


# ---------------------------------------------------------------- utilidades
def _bytes_imagen(imagen_base64: str | None) -> bytes | None:
    if not imagen_base64:
        return None
    if imagen_base64.startswith("data:"):
        imagen_base64 = imagen_base64.split(",", 1)[1]
    try:
        return base64.b64decode(imagen_base64)
    except Exception:
        return None


def _barra_escala_png(colores: list[str], alto_px: int = 300, ancho_px: int = 20) -> BytesIO:
    """Barra vertical con la paleta (color caliente arriba, igual que en el PDF)."""
    paleta = _paleta(colores)
    if INVERTIR_ESCALA:
        paleta = paleta[::-1]
    barra = PILImage.new("RGB", (ancho_px, alto_px))
    dibujo = ImageDraw.Draw(barra)
    for y in range(alto_px):
        c = _color_en(paleta, 1 - y / (alto_px - 1))
        rgb = (int(c.red * 255), int(c.green * 255), int(c.blue * 255))
        dibujo.line([(0, y), (ancho_px, y)], fill=rgb)
    salida = BytesIO()
    barra.save(salida, format="PNG")
    salida.seek(0)
    return salida


def _texto(parrafo, texto: str, size: float = 9, color=GRIS):
    run = parrafo.add_run(texto)
    run.font.size = Pt(size)
    run.font.color.rgb = color
    run.font.name = "Arial"
    return run


def _sombrear(celda, hex_color: str) -> None:
    tc_pr = celda._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tc_pr.append(shd)


def _bordes(tabla, color: str = "DDDDDD") -> None:
    bordes = OxmlElement("w:tblBorders")
    for lado in ("top", "left", "bottom", "right", "insideH", "insideV"):
        b = OxmlElement(f"w:{lado}")
        b.set(qn("w:val"), "single")
        b.set(qn("w:sz"), "4")
        b.set(qn("w:space"), "0")
        b.set(qn("w:color"), color)
        bordes.append(b)
    tabla._tbl.tblPr.append(bordes)


def _fijar_anchos(tabla, anchos_cm: list[float]) -> None:
    tabla.autofit = False
    for fila in tabla.rows:
        for celda, ancho in zip(fila.cells, anchos_cm):
            celda.width = Cm(ancho)


def _tabla_datos(doc, filas, anchos_cm, alineacion=WD_ALIGN_PARAGRAPH.CENTER):
    tabla = doc.add_table(rows=0, cols=len(anchos_cm))
    tabla.alignment = WD_TABLE_ALIGNMENT.CENTER
    for fila in filas:
        for celda, valor in zip(tabla.add_row().cells, fila):
            _sombrear(celda, "FAFAFA")
            parrafo = celda.paragraphs[0]
            parrafo.alignment = alineacion
            _texto(parrafo, str(valor))
    _bordes(tabla)
    _fijar_anchos(tabla, anchos_cm)
    return tabla


def _seccion(doc, titulo, filas, anchos_cm, alineacion=WD_ALIGN_PARAGRAPH.CENTER) -> None:
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.keep_with_next = True
    _texto(p, "▌ ", size=10, color=RGBColor(0x55, 0x55, 0x55))
    _texto(p, titulo, size=10)
    _tabla_datos(doc, filas, anchos_cm, alineacion)


# ------------------------------------------------------------------ principal
def generar_docx_informe(datos: ExportarInformeRequest) -> bytes:
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Cm(21), Cm(29.7)
    sec.left_margin = sec.right_margin = Cm(1.5)
    sec.top_margin = sec.bottom_margin = Cm(1.2)
    doc.core_properties.title = datos.nombre_archivo
    doc.core_properties.author = "ThermalCheck"

    # 1) Encabezado: logo a la izquierda, nombre del archivo a la derecha
    enc = doc.add_table(rows=1, cols=2)
    celda_logo, celda_nombre = enc.rows[0].cells
    if RUTA_LOGO.exists():
        celda_logo.paragraphs[0].add_run().add_picture(str(RUTA_LOGO), width=Cm(1.8))
    p = celda_nombre.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    _texto(p, datos.nombre_archivo, size=11)
    _fijar_anchos(enc, [ANCHO_UTIL_CM * 0.3, ANCHO_UTIL_CM * 0.7])

    # 2) Imagen térmica (izquierda) + barra de escala con máx/mín (derecha)
    raw = _bytes_imagen(datos.imagen_base64)
    tam = None
    if raw:
        try:
            tam = PILImage.open(BytesIO(raw)).size
        except Exception:
            raw = None

    bloque = doc.add_table(rows=1, cols=2)
    c_img, c_barra = bloque.rows[0].cells
    ancho_img = ANCHO_UTIL_CM - ANCHO_BARRA_CM - 2.5
    alto_img = ancho_img * 0.8
    if raw and tam:
        alto_img = ancho_img * tam[1] / tam[0]
        if alto_img > ALTO_MAX_IMAGEN_CM:
            ancho_img *= ALTO_MAX_IMAGEN_CM / alto_img
            alto_img = ALTO_MAX_IMAGEN_CM
        c_img.paragraphs[0].add_run().add_picture(
            BytesIO(raw), width=Cm(ancho_img), height=Cm(alto_img)
        )
    else:
        _texto(c_img.paragraphs[0], "Sin imagen")

    esc = datos.escala
    if esc:
        _texto(c_barra.paragraphs[0], _temp(esc.temp_max), size=8)
        c_barra.add_paragraph().add_run().add_picture(
            _barra_escala_png(esc.colores),
            width=Cm(ANCHO_BARRA_CM),
            height=Cm(max(alto_img - 1.2, 2)),
        )
        _texto(c_barra.add_paragraph(), _temp(esc.temp_min), size=8)
    _fijar_anchos(bloque, [ancho_img + 0.3, ANCHO_UTIL_CM - ancho_img - 0.3])

    # 3) Nombre y fecha debajo de la imagen
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(0)
    _texto(p, datos.nombre_archivo, size=12)
    _texto(doc.add_paragraph(), datos.fecha or "", size=8)

    # 4) Measurements
    _seccion(
        doc,
        "Measurements",
        _filas_mediciones(datos.puntos),
        [ANCHO_UTIL_CM * 0.2, ANCHO_UTIL_CM * 0.2, ANCHO_UTIL_CM * 0.6],
    )

    # 5) Parameters
    if datos.parametros:
        _seccion(
            doc,
            "Parameters",
            [[k, v] for k, v in datos.parametros.items()],
            [ANCHO_UTIL_CM * 0.2, ANCHO_UTIL_CM * 0.8],
        )

    # 6) Image Info
    if datos.info_imagen:
        _seccion(
            doc,
            "Image Info",
            [[k, v] for k, v in datos.info_imagen.items()],
            [ANCHO_UTIL_CM * 0.2, ANCHO_UTIL_CM * 0.8],
        )

    # 7) Remarks (solo si el técnico escribió observaciones)
    if datos.observaciones and datos.observaciones.strip():
        _seccion(
            doc,
            "Remarks",
            [[datos.observaciones.strip()]],
            [ANCHO_UTIL_CM],
            alineacion=WD_ALIGN_PARAGRAPH.LEFT,
        )

    buffer = BytesIO()
    doc.save(buffer)
    return buffer.getvalue()