from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from api.deps import get_db  # ajusta el import según tu estructura real
from src.schemas.imagen import PuntosMedicionGuardar

from .comun import guardar_puntos, obtener_registro_o_404

router = APIRouter()


@router.post("/{id_imagen}/exportar-pdf")
def exportar_pdf(
    id_imagen: int, datos: PuntosMedicionGuardar, db: Session = Depends(get_db)
):
    """
    Botón 'Exportar reporte (PDF)' del visor.
    1) Guarda/actualiza los puntos de medición actuales.
    2) Genera el PDF con los datos ya persistidos en BD.
    3) Devuelve el archivo.
    """
    guardar_puntos(db, id_imagen, datos)
    registro = obtener_registro_o_404(db, id_imagen)

    try:
        # Import aquí: si la librería del PDF falla, solo se cae esta herramienta.
        from src.services.pdf_export import generar_pdf_informe

        ruta_pdf = generar_pdf_informe(registro)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se pudo generar el PDF: {e}")

    return FileResponse(ruta_pdf, media_type="application/pdf", filename=Path(ruta_pdf).name)