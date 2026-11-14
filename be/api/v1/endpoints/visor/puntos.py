from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_db  # ajusta el import según tu estructura real
from src.schemas.imagen import ImagenTermograficaOut, PuntosMedicionGuardar

from .comun import guardar_puntos

router = APIRouter()


@router.put("/{id_imagen}/puntos", response_model=ImagenTermograficaOut)
def guardar_puntos_medicion(
    id_imagen: int, datos: PuntosMedicionGuardar, db: Session = Depends(get_db)
):
    """
    Se llama cada vez que el usuario agrega/edita/borra un punto en el visor.
    """
    return guardar_puntos(db, id_imagen, datos)