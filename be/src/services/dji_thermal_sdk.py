"""
dji_thermal_sdk.py
 
Extrae la matriz REAL de temperatura de un R-JPEG de dron DJI (M3T, M30T, H20T, etc.)
usando ctypes directamente sobre las librerías .so del DJI Thermal SDK.
 
IMPORTANTE: las librerías .so ya están incluidas en este proyecto, en la carpeta
hermana `dji_sdk_plugins/dji_thermal_sdk_v1.4_20220929/`. NO necesitas descargar
nada de la web de DJI ni instalar un programa aparte -- esto corre 100% dentro
de tu backend Python.
 
¿Por qué la versión 1.4 y no una más nueva? Se probó contra un archivo real
de esta cámara (DJI M3T, firmware 11.09.10.58) y fue la única, de las 5
empaquetadas, que reconoció el R-JPEG (las versiones 1.7 y 1.0 lo rechazaron
por incompatibilidad de versión/activación). Si en el futuro usas otro modelo
de dron/cámara y esta versión falla, hay que repetir esa prueba con las otras
carpetas disponibles en `dji_sdk_plugins/`.
"""
 
import os
import platform
from ctypes import (
    CDLL, Structure, byref, c_float, c_int32, c_void_p,
    create_string_buffer, cast, POINTER,
)
from pathlib import Path
 
import numpy as np
 
_CARPETA_SDK = Path(__file__).parent / "dji_sdk_plugins" / "dji_thermal_sdk_v1.4_20220929"
 
 
class DjiThermalSdkError(Exception):
    pass
 
 
class _Resolucion(Structure):
    _fields_ = [("width", c_int32), ("height", c_int32)]
 
 
class _ParametrosMedicion(Structure):
    _fields_ = [
        ("distance", c_float),
        ("humidity", c_float),
        ("emissivity", c_float),
        ("reflection", c_float),
    ]
 
 
def _cargar_libreria() -> CDLL:
    sistema = platform.system().lower()
    arquitectura = "x64" if platform.architecture()[0] == "64bit" else "x86"
    carpeta = _CARPETA_SDK / sistema / f"release_{arquitectura}"
 
    if sistema == "windows":
        nombre_lib = "libdirp.dll"
        # En Windows, libdirp.dll depende de libv_dirp.dll que vive en la misma
        # carpeta. Desde Python 3.8, CDLL ya no busca ahí automáticamente --
        # hay que agregarla explícitamente al path de búsqueda de DLLs.
        if hasattr(os, "add_dll_directory"):
            os.add_dll_directory(str(carpeta))
    elif sistema == "darwin":
        raise DjiThermalSdkError(
            "Esta SDK empaquetada no trae binarios para macOS, solo Windows y Linux."
        )
    else:
        nombre_lib = "libdirp.so"
 
    ruta = carpeta / nombre_lib
    if not ruta.exists():
        raise DjiThermalSdkError(
            f"No se encontró {ruta}. Esta SDK empaquetada solo trae binarios "
            "para Linux/Windows x64 y x86."
        )
    return CDLL(str(ruta))
 
 
def medir_temperatura_matriz(
    ruta_jpg: str,
    distancia_m: float = 25.0,
    humedad_pct: float = 70.0,
    emisividad: float = 0.98,
    temp_reflejada_c: float = 23.0,
) -> np.ndarray:
    """
    Devuelve un numpy.ndarray (alto, ancho) en float32 con la temperatura
    real (°C) de cada píxel del R-JPEG.
    """
    dll = _cargar_libreria()
    contenido = Path(ruta_jpg).read_bytes()
    buffer_entrada = create_string_buffer(contenido, len(contenido))
    handle = c_void_p()
 
    ret = dll.dirp_create_from_rjpeg(buffer_entrada, c_int32(len(contenido)), byref(handle))
    if ret != 0:
        raise DjiThermalSdkError(
            f"El archivo no pudo abrirse como R-JPEG DJI (código {ret}). "
            "¿Es realmente una imagen de un dron/cámara DJI compatible?"
        )
 
    try:
        resolucion = _Resolucion()
        ret = dll.dirp_get_rjpeg_resolution(handle, byref(resolucion))
        if ret != 0:
            raise DjiThermalSdkError(f"No se pudo leer la resolución (código {ret})")
 
        parametros = _ParametrosMedicion(
            distance=distancia_m,
            humidity=humedad_pct,
            emissivity=emisividad,
            reflection=temp_reflejada_c,
        )
        ret = dll.dirp_set_measurement_params(handle, byref(parametros))
        if ret != 0:
            raise DjiThermalSdkError(f"No se pudieron aplicar los parámetros (código {ret})")
 
        total_pixeles = resolucion.width * resolucion.height
        buffer_salida = (c_float * total_pixeles)()
        ret = dll.dirp_measure_ex(
            handle, cast(buffer_salida, POINTER(c_float)), c_int32(total_pixeles * 4)
        )
        if ret != 0:
            raise DjiThermalSdkError(f"Falló el cálculo de temperatura (código {ret})")
 
        matriz = np.frombuffer(buffer_salida, dtype=np.float32).reshape(
            (resolucion.height, resolucion.width)
        ).copy()
        return matriz
    finally:
        dll.dirp_destroy(handle)
 
 
def temperatura_en_punto(matriz_temperatura: np.ndarray, x: int, y: int) -> float:
    """
    x, y = coordenadas de píxel donde el usuario hizo clic en el visor
    (0,0 = esquina superior izquierda), ya escaladas a la resolución real
    de la imagen (ancho/alto guardados en imagen_termografica).
    """
    alto, ancho = matriz_temperatura.shape
    if not (0 <= x < ancho and 0 <= y < alto):
        raise ValueError(f"Punto ({x},{y}) fuera de rango de la imagen ({ancho}x{alto})")
    return round(float(matriz_temperatura[y, x]), 2)
 
 
def temperatura_en_region(
    matriz_temperatura: np.ndarray, x1: int, y1: int, x2: int, y2: int
) -> tuple[float, float, float]:
    """
    Para herramientas de área (Rectángulo, Círculo -- el círculo se mide con su
    caja delimitadora, que es una aproximación estándar en software de análisis
    térmico). x1,y1,x2,y2 son las esquinas del área en píxeles reales de la
    imagen (no hace falta que x1<x2 ni y1<y2, se normalizan aquí).
 
    Devuelve (temp_min, temp_avg, temp_max) dentro de esa región.
    """
    alto, ancho = matriz_temperatura.shape
    xi, xf = sorted((max(0, min(x1, ancho - 1)), max(0, min(x2, ancho - 1))))
    yi, yf = sorted((max(0, min(y1, alto - 1)), max(0, min(y2, alto - 1))))
 
    region = matriz_temperatura[yi:yf + 1, xi:xf + 1]
    if region.size == 0:
        raise ValueError(f"Región vacía: ({x1},{y1})-({x2},{y2})")
 
    return (
        round(float(region.min()), 2),
        round(float(region.mean()), 2),
        round(float(region.max()), 2),
    )
 
 
def es_dji_rjpeg(ruta_jpg: str) -> bool:
    """Prueba rápida y segura: intenta crear el handle; si funciona, es un R-JPEG DJI válido."""
    try:
        dll = _cargar_libreria()
        contenido = Path(ruta_jpg).read_bytes()
        buffer_entrada = create_string_buffer(contenido, len(contenido))
        handle = c_void_p()
        ret = dll.dirp_create_from_rjpeg(buffer_entrada, c_int32(len(contenido)), byref(handle))
        if ret == 0:
            dll.dirp_destroy(handle)
            return True
        print(f"[dji_thermal_sdk] dirp_create_from_rjpeg devolvió código {ret} para {ruta_jpg!r}")
        return False
    except Exception as e:
        print(f"[dji_thermal_sdk] es_dji_rjpeg falló para {ruta_jpg!r}: {e!r}")
        return False
def temperatura_en_region(
    matriz_temperatura: np.ndarray, x1: int, y1: int, x2: int, y2: int
) -> tuple[float, float, float]:
    """
    Para herramientas de área (Rectángulo, Círculo -- el círculo se mide con su
    caja delimitadora, que es una aproximación estándar en software de análisis
    térmico). x1,y1,x2,y2 son las esquinas del área en píxeles reales de la
    imagen (no hace falta que x1<x2 ni y1<y2, se normalizan aquí).

    Devuelve (temp_min, temp_avg, temp_max) dentro de esa región.
    """
    resultado = temperatura_en_region_detallada(matriz_temperatura, x1, y1, x2, y2)
    return resultado["temp_min"], resultado["temp_avg"], resultado["temp_max"]


def temperatura_en_region_detallada(
    matriz_temperatura: np.ndarray, x1: int, y1: int, x2: int, y2: int
) -> dict:
    """
    Igual que temperatura_en_region, pero además devuelve la posición exacta
    (en coordenadas de la imagen completa, no relativas al recorte) del
    píxel con la temperatura mínima y del píxel con la temperatura máxima,
    para poder dibujar los puntos azul/rojo como en el visor de DJI.
    """
    alto, ancho = matriz_temperatura.shape
    xi, xf = sorted((max(0, min(x1, ancho - 1)), max(0, min(x2, ancho - 1))))
    yi, yf = sorted((max(0, min(y1, alto - 1)), max(0, min(y2, alto - 1))))

    region = matriz_temperatura[yi:yf + 1, xi:xf + 1]
    if region.size == 0:
        raise ValueError(f"Región vacía: ({x1},{y1})-({x2},{y2})")

    fila_min, col_min = np.unravel_index(np.argmin(region), region.shape)
    fila_max, col_max = np.unravel_index(np.argmax(region), region.shape)

    return {
        "temp_min": round(float(region.min()), 2),
        "temp_avg": round(float(region.mean()), 2),
        "temp_max": round(float(region.max()), 2),
        "pos_min": {"x": xi + int(col_min), "y": yi + int(fila_min)},
        "pos_max": {"x": xi + int(col_max), "y": yi + int(fila_max)},
    }


def es_dji_rjpeg(ruta_jpg: str) -> bool:
    """Prueba rápida y segura: intenta crear el handle; si funciona, es un R-JPEG DJI válido."""
    try:
        dll = _cargar_libreria()
        contenido = Path(ruta_jpg).read_bytes()
        buffer_entrada = create_string_buffer(contenido, len(contenido))
        handle = c_void_p()
        ret = dll.dirp_create_from_rjpeg(buffer_entrada, c_int32(len(contenido)), byref(handle))
        if ret == 0:
            dll.dirp_destroy(handle)
            return True
        print(f"[dji_thermal_sdk] dirp_create_from_rjpeg devolvió código {ret} para {ruta_jpg!r}")
        return False
    except Exception as e:
        print(f"[dji_thermal_sdk] es_dji_rjpeg falló para {ruta_jpg!r}: {e!r}")
        return False