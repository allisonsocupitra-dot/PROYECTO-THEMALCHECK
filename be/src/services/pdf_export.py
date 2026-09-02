"""
Generación de informes PDF a partir de un registro de ImagenTermografica.
 
Versión mínima: produce un PDF simple con los datos ya guardados en BD
(temperaturas, parámetros, puntos de medición). Cuando se quiera un diseño
más elaborado (logo, tabla de puntos con formato, imagen incrustada, etc.)
se amplía generar_pdf_informe sin tocar el resto del backend, porque
imagenes.py solo depende de esta función y de la ruta que devuelve.
"""
 
from pathlib import Path
 
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
 
CARPETA_PDFS = Path("uploads/informes_pdf")
CARPETA_PDFS.mkdir(parents=True, exist_ok=True)
 
 
def generar_pdf_informe(registro) -> str:
    """
    Recibe el registro ImagenTermografica (con sus puntos de medición
    cargados) y genera un PDF simple en CARPETA_PDFS.
    Devuelve la ruta del archivo generado (string), tal como espera
    imagenes.py al llamar FileResponse(ruta_pdf, ...).
    """
    nombre_pdf = f"informe-{registro.id_imagen}.pdf"
    ruta_pdf = CARPETA_PDFS / nombre_pdf
 
    c = canvas.Canvas(str(ruta_pdf), pagesize=letter)
    ancho, alto = letter
    y = alto - 60
 
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, "Informe de inspección termográfica")
    y -= 30
 
    c.setFont("Helvetica", 11)
    c.drawString(50, y, f"Imagen: {getattr(registro, 'nombre_archivo', '-')}")
    y -= 20
    c.drawString(50, y, f"Temperatura máxima: {getattr(registro, 'temperatura_max', '-')} °C")
    y -= 20
    c.drawString(50, y, f"Temperatura mínima: {getattr(registro, 'temperatura_min', '-')} °C")
    y -= 30
 
    c.setFont("Helvetica-Bold", 13)
    c.drawString(50, y, "Puntos de medición")
    y -= 20
    c.setFont("Helvetica", 11)
 
    puntos = getattr(registro, "puntos_medicion", None) or []
    if not puntos:
        c.drawString(50, y, "Sin puntos registrados.")
        y -= 20
    else:
        for punto in puntos:
            etiqueta = getattr(punto, "etiqueta", "-")
            valor = getattr(punto, "valor_temp", "-")
            c.drawString(50, y, f"{etiqueta}: {valor} °C")
            y -= 18
            if y < 60:
                c.showPage()
                y = alto - 60
 
    c.save()
    return str(ruta_pdf)
 