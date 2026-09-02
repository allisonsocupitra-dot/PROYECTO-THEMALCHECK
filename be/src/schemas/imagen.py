from datetime import datetime
from typing import Optional, List, Literal

from pydantic import BaseModel


class PuntoMedicionCreate(BaseModel):
    etiqueta: Optional[str] = None
    tipo: Literal['punto', 'region'] = 'punto'

    # Herramienta "punto": coordenada única de pixel en la imagen original.
    x: Optional[int] = None
    y: Optional[int] = None

    # Herramienta "region" (rectángulo o círculo): esquinas del área, en pixeles
    # de la imagen original (el círculo se mide con su caja delimitadora).
    x1: Optional[int] = None
    y1: Optional[int] = None
    x2: Optional[int] = None
    y2: Optional[int] = None

    # Valores que llegan del frontend como provisionales (p.ej. 0); el backend
    # los recalcula con la matriz real cuando la imagen es DJI y hay coordenadas.
    valor_temp: Optional[float] = None
    valor_min: Optional[float] = None
    valor_avg: Optional[float] = None
    valor_max: Optional[float] = None

    # Posición del píxel min/max dentro de la región; el frontend puede
    # enviarlos como provisionales (o ni enviarlos), el backend los recalcula.
    pos_min_x: Optional[int] = None
    pos_min_y: Optional[int] = None
    pos_max_x: Optional[int] = None
    pos_max_y: Optional[int] = None


class PuntoMedicionOut(BaseModel):
    id_punto: int
    id_imagen: int
    etiqueta: Optional[str] = None
    tipo: str
    x: Optional[int] = None
    y: Optional[int] = None
    x1: Optional[int] = None
    y1: Optional[int] = None
    x2: Optional[int] = None
    y2: Optional[int] = None
    valor_temp: Optional[float] = None
    valor_min: Optional[float] = None
    valor_avg: Optional[float] = None
    valor_max: Optional[float] = None
    pos_min_x: Optional[int] = None
    pos_min_y: Optional[int] = None
    pos_max_x: Optional[int] = None
    pos_max_y: Optional[int] = None

    class Config:
        from_attributes = True


class PuntosMedicionGuardar(BaseModel):
    """Lo que el frontend envía al dar 'Guardar' o al exportar el PDF."""
    puntos: List[PuntoMedicionCreate]


class ImagenTermograficaOut(BaseModel):
    id_imagen: int
    nombre_archivo: str
    fecha_modificacion: Optional[datetime] = None
    ancho: Optional[int] = None
    alto: Optional[int] = None
    formato: Optional[str] = None
    modelo_camara: Optional[str] = None
    numero_serie: Optional[str] = None
    distancia_focal: Optional[float] = None
    numero_f: Optional[float] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    distancia_m: Optional[float] = None
    humedad: Optional[float] = None
    emisividad: Optional[float] = None
    temp_reflejada: Optional[float] = None
    temp_max: Optional[float] = None
    temp_min: Optional[float] = None
    puntos_medicion: List[PuntoMedicionOut] = []

    class Config:
        from_attributes = True


class ParametrosUpdate(BaseModel):
    """
    Body de PUT /imagenes/{id}/parametros -- cualquiera de los 4 parámetros
    ambientales que el usuario puede tocar en el panel PARÁMETROS. Solo se
    actualizan los que vengan presentes (los demás quedan como estaban).
    Al guardar, el backend recalcula temp_max/temp_min de la imagen Y la
    temperatura de todos los puntos/regiones ya marcados, con los valores nuevos.
    """
    distancia_m: Optional[float] = None
    humedad: Optional[float] = None
    emisividad: Optional[float] = None
    temp_reflejada: Optional[float] = None