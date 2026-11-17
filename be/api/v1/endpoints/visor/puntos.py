from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_db  # ajusta el import según tu estructura real
from src.schemas.imagen import ImagenTermograficaOut, PuntosMedicionGuardar

from .comun import guardar_puntos, obtener_registro_o_404

router = APIRouter()


@router.put("/{id_imagen}/puntos", response_model=ImagenTermograficaOut)
def guardar_puntos_medicion(
    id_imagen: int, datos: PuntosMedicionGuardar, db: Session = Depends(get_db)
):
    """
    Se llama cada vez que el usuario agrega/edita/borra una figura en el visor,
    al pulsar "Guardar" y al salir con la alerta de cambios sin guardar.

    - Reemplaza TODOS los puntos/regiones de la imagen (lista completa).
    - Guarda el color de cada figura, emparejándolo por etiqueta (SP1, R1, C1...).
    - Guarda las observaciones (notas) de la imagen si vienen en el body.
    """
    # La función existente hace el cálculo de temperaturas y reemplaza los puntos.
    guardar_puntos(db, id_imagen, datos)

    # Se vuelve a leer el registro para no depender de lo que devuelva guardar_puntos
    registro = obtener_registro_o_404(db, id_imagen)
    db.refresh(registro)

    if datos.observaciones is not None:
        registro.observaciones = datos.observaciones

    colores = {p.etiqueta: p.color for p in datos.puntos}
    for punto in registro.puntos_medicion:
        punto.color = colores.get(punto.etiqueta)

    db.commit()
    db.refresh(registro)
    return registro