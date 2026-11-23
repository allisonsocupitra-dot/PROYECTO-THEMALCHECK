import re
from datetime import date
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from api.deps import get_db
from src.models.informe import Informe
from src.schemas.informe import ExportarInformeRequest
from src.services.pdf_export import generar_pdf_informe

router = APIRouter(tags=["Informe"])

DOCX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


def _nombre_base(nombre_archivo: str) -> str:
    """Nombre de archivo seguro (sin extensión ni caracteres raros)."""
    return re.sub(r"[^\w\-. ]", "_", Path(nombre_archivo).stem, flags=re.ASCII) or "informe"


@router.post("/exportar")
def exportar_informe(data: ExportarInformeRequest, db: Session = Depends(get_db)):
    # 1. Generar el PDF con el formato del reporte
    try:
        pdf_bytes = generar_pdf_informe(data)
    except Exception as e:  # el frontend muestra este detalle si algo falla
        raise HTTPException(status_code=500, detail=f"No se pudo generar el PDF: {e}")

    nombre_pdf = f"{_nombre_base(data.nombre_archivo)}.pdf"

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
    try:
        db.add(nuevo_informe)
        db.commit()
        db.refresh(nuevo_informe)
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"No se pudo registrar el informe (revisa id_usuario, estado y nivel_riesgo): {e.__class__.__name__}",
        )

    # 3. Devolver el PDF como binario para que el frontend lo guarde
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{nombre_pdf}"',
            "X-Id-Informe": str(nuevo_informe.id_informe),
        },
    )


@router.post("/exportar-doc")
def exportar_informe_doc(data: ExportarInformeRequest):
    """Mismo reporte que el PDF, pero en Word (.docx). No crea registro en BD."""
    try:
        # Import aquí: si falta python-docx, solo falla esta exportación
        from src.services.docx_export import generar_docx_informe

        docx_bytes = generar_docx_informe(data)
    except Exception as e:  # el frontend muestra este detalle si algo falla
        raise HTTPException(status_code=500, detail=f"No se pudo generar el DOC: {e}")

    nombre_docx = f"{_nombre_base(data.nombre_archivo)}.docx"
    return Response(
        content=docx_bytes,
        media_type=DOCX_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{nombre_docx}"'},
    )