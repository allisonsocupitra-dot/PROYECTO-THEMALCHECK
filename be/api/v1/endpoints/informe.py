from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from datetime import date
from io import BytesIO
from pathlib import Path
from reportlab.pdfgen import canvas  # o la librería que uses para el PDF
 
from api.deps import get_db  # tu sesión de DB (SQLAlchemy, etc.)
from src.models.informe import Informe  # tu modelo ORM de la tabla informe
 
router = APIRouter(tags=["Informe"])
 
 
class ExportarInformeRequest(BaseModel):
    nombre_archivo: str
    nivel_riesgo: str
    observaciones: str | None = None
    estado: str
    id_usuario: int
    # aquí agregas los datos que necesites para armar el PDF:
    # medidas, imagen_base64, parametros, etc.
 
 
def generar_pdf(data: ExportarInformeRequest) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer)
    pdf.drawString(50, 800, f"Informe: {data.nombre_archivo}")
    pdf.drawString(50, 780, f"Nivel de riesgo: {data.nivel_riesgo}")
    pdf.drawString(50, 760, f"Estado: {data.estado}")
    if data.observaciones:
        pdf.drawString(50, 740, f"Observaciones: {data.observaciones}")
    pdf.save()
    buffer.seek(0)
    return buffer.read()
 
 
@router.post("/exportar")
def exportar_informe(data: ExportarInformeRequest, db=Depends(get_db)):
    # 1. Generar el PDF
    pdf_bytes = generar_pdf(data)
    nombre_pdf = f"{Path(data.nombre_archivo).stem}.pdf"
    carpeta_pdfs = Path("uploads/informes_pdf")
    carpeta_pdfs.mkdir(parents=True, exist_ok=True)
    (carpeta_pdfs / nombre_pdf).write_bytes(pdf_bytes)
 
    ruta_pdf = f"informes_pdf/{nombre_pdf}"
 
    # 2. Guardar el registro en la base de datos
    nuevo_informe = Informe(
        fecha_generacion=date.today(),
        nivel_riesgo=data.nivel_riesgo,
        observaciones=data.observaciones,
        estado=data.estado,
        nombre_archivo=data.nombre_archivo,
        ruta_pdf=ruta_pdf,
        id_usuario=data.id_usuario,
    )
    db.add(nuevo_informe)
    db.commit()
    db.refresh(nuevo_informe)
 
    # 3. Devolver el PDF como binario para que el frontend lo guarde
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{data.nombre_archivo}.pdf"',
            "X-Id-Informe": str(nuevo_informe.id_informe),
        },
    )
 