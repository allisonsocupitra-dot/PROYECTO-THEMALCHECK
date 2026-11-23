"""
matriz.py

Entrega la matriz de temperaturas (°C) de una imagen DJI como bytes float32,
para que el frontend pueda recolorear la imagen según el rango elegido en la
barra de escala (herramienta de rango térmico). No toca la base de datos.
"""
import logging

import numpy as np
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from api.deps import get_db  # igual que en imagen.py
from src.services.dji_thermal_sdk import DjiThermalSdkError, es_dji_rjpeg, medir_temperatura_matriz

from .comun import obtener_registro_o_404

logger = logging.getLogger(__name__)
router = APIRouter()

# Mismos valores por defecto que thermal_extractor.py y comun.py
DEFECTOS = {"distancia_m": 25.0, "humedad": 70.0, "emisividad": 0.98, "temp_reflejada": 23.0}

# Caché en memoria: calcular la matriz tarda; así solo se hace una vez por
# imagen y por combinación de parámetros (si cambia la temp. reflejada, la clave cambia).
_CACHE: dict[tuple, bytes] = {}
_CACHE_MAX = 10


@router.get("/{id_imagen}/matriz")
def obtener_matriz(id_imagen: int, db: Session = Depends(get_db)):
    registro = obtener_registro_o_404(db, id_imagen)
    ruta = registro.ruta_archivo

    def valor(nombre: str) -> float:
        v = getattr(registro, nombre, None)
        return float(v) if v is not None else DEFECTOS[nombre]

    distancia = valor("distancia_m")
    humedad = valor("humedad")
    emisividad = valor("emisividad")
    temp_reflejada = valor("temp_reflejada")

    clave = (id_imagen, distancia, humedad, emisividad, temp_reflejada)
    datos = _CACHE.get(clave)

    if datos is None:
        try:
            if not es_dji_rjpeg(ruta):
                raise HTTPException(status_code=422, detail="La imagen no es un R-JPEG de DJI")
            matriz = medir_temperatura_matriz(
                ruta,
                distancia_m=distancia,
                humedad_pct=humedad,
                emisividad=emisividad,
                temp_reflejada_c=temp_reflejada,
            )
        except DjiThermalSdkError as exc:
            logger.warning("No se pudo medir la matriz de %s: %s", ruta, exc)
            raise HTTPException(status_code=422, detail="No se pudo calcular la matriz de temperaturas")

        # float32 little-endian, fila por fila (alto x ancho)
        datos = np.ascontiguousarray(matriz, dtype="<f4").tobytes()
        if len(_CACHE) >= _CACHE_MAX:
            _CACHE.pop(next(iter(_CACHE)))
        _CACHE[clave] = datos

    return Response(content=datos, media_type="application/octet-stream")