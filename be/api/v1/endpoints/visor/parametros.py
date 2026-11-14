from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_db  # ajusta el import según tu estructura real
from src.schemas.imagen import ImagenTermograficaOut, ParametrosUpdate

from .comun import calcular_matriz, obtener_registro_o_404, recalcular_puntos_existentes

router = APIRouter()


@router.put("/{id_imagen}/parametros", response_model=ImagenTermograficaOut)
def actualizar_parametros(
    id_imagen: int, datos: ParametrosUpdate, db: Session = Depends(get_db)
):
    """
    Botones +/- de Distancia, Humedad, Emisividad y Temp. reflejada en el panel.
    Al cambiar cualquiera de estos, se recalculan:
      1) temp_max / temp_min de la imagen completa.
      2) La temperatura de TODOS los puntos y regiones ya marcados (incluida
         la posición del píxel min/max de cada región).
    """
    registro = obtener_registro_o_404(db, id_imagen)

    if datos.distancia_m is not None:
        registro.distancia_m = datos.distancia_m
    if datos.humedad is not None:
        registro.humedad = datos.humedad
    if datos.emisividad is not None:
        registro.emisividad = datos.emisividad
    if datos.temp_reflejada is not None:
        registro.temp_reflejada = datos.temp_reflejada

    matriz = calcular_matriz(registro)
    if matriz is not None:
        registro.temp_max = round(float(matriz.max()), 2)
        registro.temp_min = round(float(matriz.min()), 2)
        recalcular_puntos_existentes(db, registro, matriz)

    db.commit()
    db.refresh(registro)
    return registro