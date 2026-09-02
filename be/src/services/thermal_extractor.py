"""
thermal_extractor.py
 
Extrae automáticamente los metadatos de una imagen térmica al subirla:
- Datos "seguros" (siempre disponibles): ancho, alto, formato, fecha, modelo, número de serie,
  distancia focal, apertura (número f), lat/lon si existen.
- Datos radiométricos (temp_max, temp_min, humedad, emisividad, temp_reflejada, distancia):
  SOLO si la cámara/app grabó esa información dentro del archivo (EXIF UserComment/XMP en JSON,
  o un stream radiométrico FLIR). Si no existen, se devuelven como None y el frontend los deja
  editables manualmente en el panel de PARÁMETROS — nunca se inventan valores.
 
Dependencias (agregar a requirements.txt):
    pip install pillow exifread
Opcional, solo si vas a trabajar con FLIR radiométrico real (.jpg con raw thermal data):
    pip install flyr
 
NOTA sobre logging: antes, cualquier error durante la extracción (PIL, exifread
o el SDK de DJI) se tragaba con un "except Exception: pass" silencioso, así
que si algo fallaba, el panel del frontend simplemente se veía vacío sin
ninguna pista de por qué. Ahora cada bloque deja un logger.warning/exception
con el error real, para poder ver en la consola del backend qué está pasando
con un archivo concreto.
"""
 
import json
import logging
import re
from datetime import datetime
from pathlib import Path
from typing import Optional
 
import exifread
from PIL import Image
 
try:
    import flyr  # opcional: solo existe si la imagen es un FLIR radiométrico real
    FLYR_AVAILABLE = True
except ImportError:
    FLYR_AVAILABLE = False
 
logger = logging.getLogger(__name__)
 
 
def _to_float(value) -> Optional[float]:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None
 
 
def _parse_exif_datetime(raw: str) -> Optional[datetime]:
    # formato EXIF típico: "2026:08:20 08:08:11"
    try:
        return datetime.strptime(str(raw), "%Y:%m:%d %H:%M:%S")
    except (ValueError, TypeError):
        return None
 
 
def _extraer_json_embebido(tags: dict) -> dict:
    """
    Muchas apps de cámaras térmicas (y algunas FLIR) guardan un JSON con
    temperatura, humedad, emisividad, etc. dentro de EXIF UserComment o XMP.
    Intentamos leerlo; si no existe o no es JSON válido, devolvemos {}.
    """
    for campo in ("EXIF UserComment", "Image ImageDescription", "EXIF MakerNote"):
        tag = tags.get(campo)
        if not tag:
            continue
        texto = str(tag)
        match = re.search(r"\{.*\}", texto, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                continue
    return {}
 
 
def _extraer_radiometrico_flir(ruta_archivo: str) -> dict:
    """Si el archivo es un FLIR radiométrico real, flyr puede leer la matriz de temperatura."""
    if not FLYR_AVAILABLE:
        return {}
    try:
        thermogram = flyr.unpack(ruta_archivo)
        celsius = thermogram.celsius
        return {
            "temp_max": round(float(celsius.max()), 2),
            "temp_min": round(float(celsius.min()), 2),
        }
    except Exception as exc:
        # No es un FLIR radiométrico válido, o flyr no pudo interpretarlo
        logger.warning("flyr no pudo leer %s como FLIR radiométrico: %s", ruta_archivo, exc)
        return {}
 
 
def extraer_propiedades_imagen(ruta_archivo: str, nombre_archivo: str) -> dict:
    """
    Punto de entrada único. Se llama automáticamente cuando el usuario
    abre/selecciona/sube una imagen en el visor.
 
    Devuelve un dict con exactamente las columnas de `imagen_termografica`
    que se puedan completar automáticamente. Las que no se puedan
    determinar quedan en None (el frontend las muestra como "—" / editables).
    """
    propiedades = {
        "nombre_archivo": nombre_archivo,
        "fecha_modificacion": None,
        "ancho": None,
        "alto": None,
        "formato": None,
        "modelo_camara": None,
        "numero_serie": None,
        "distancia_focal": None,
        "numero_f": None,
        "latitud": None,
        "longitud": None,
        "distancia_m": None,
        "humedad": None,
        "emisividad": None,
        "temp_reflejada": None,
        "temp_max": None,
        "temp_min": None,
    }
 
    # 1) Datos básicos de la imagen (siempre disponibles)
    try:
        with Image.open(ruta_archivo) as img:
            propiedades["ancho"] = img.width
            propiedades["alto"] = img.height
            propiedades["formato"] = (img.format or Path(ruta_archivo).suffix.lstrip(".")).upper()
    except Exception as exc:
        logger.exception("No se pudo abrir %s con PIL para leer ancho/alto/formato: %s", ruta_archivo, exc)
 
    # 2) EXIF estándar (modelo, número de serie, distancia focal, apertura, GPS, fecha)
    try:
        with open(ruta_archivo, "rb") as f:
            tags = exifread.process_file(f, details=False)
 
        if not tags:
            logger.warning(
                "exifread no encontró ningún tag EXIF en %s (archivo sin metadatos, o "
                "formato/orientación que exifread no reconoce)",
                ruta_archivo,
            )
 
        propiedades["modelo_camara"] = str(tags.get("Image Model", "")).strip() or None
        propiedades["numero_serie"] = str(tags.get("EXIF BodySerialNumber", "")).strip() or None
 
        if "EXIF FocalLength" in tags:
            valor_focal = tags["EXIF FocalLength"]
            crudo = valor_focal.values[0] if getattr(valor_focal, "values", None) else valor_focal
            propiedades["distancia_focal"] = _to_float(crudo)
 
        if "EXIF FNumber" in tags:
            fnum = tags["EXIF FNumber"]
            crudo = fnum.values[0] if getattr(fnum, "values", None) else fnum
            propiedades["numero_f"] = _to_float(crudo)
 
        fecha_raw = tags.get("EXIF DateTimeOriginal") or tags.get("Image DateTime")
        if fecha_raw:
            propiedades["fecha_modificacion"] = _parse_exif_datetime(str(fecha_raw))
 
        # GPS: exifread devuelve GPSLatitude como lista [grados, minutos, segundos]
        # y GPSLatitudeRef como 'N'/'S' (idem longitud); hay que convertir a decimal.
        def _gps_a_decimal(valores_tag, ref_tag) -> Optional[float]:
            if valores_tag is None or ref_tag is None:
                return None
            try:
                grados, minutos, segundos = [float(v.num) / float(v.den) for v in valores_tag.values]
                decimal = grados + minutos / 60 + segundos / 3600
                if str(ref_tag).strip().upper() in ("S", "W"):
                    decimal = -decimal
                return round(decimal, 6)
            except Exception as exc:
                logger.warning("No se pudo convertir GPS de %s a decimal: %s", ruta_archivo, exc)
                return None
 
        propiedades["latitud"] = _gps_a_decimal(tags.get("GPS GPSLatitude"), tags.get("GPS GPSLatitudeRef"))
        propiedades["longitud"] = _gps_a_decimal(tags.get("GPS GPSLongitude"), tags.get("GPS GPSLongitudeRef"))
 
        # 3) JSON embebido por apps térmicas (humedad, emisividad, temp. reflejada, distancia, temp max/min)
        extra = _extraer_json_embebido(tags)
        for clave_json, clave_bd in {
            "humidity": "humedad",
            "emissivity": "emisividad",
            "reflected_temp": "temp_reflejada",
            "distance": "distancia_m",
            "max_temp": "temp_max",
            "min_temp": "temp_min",
        }.items():
            if clave_json in extra:
                propiedades[clave_bd] = _to_float(extra[clave_json])
 
    except Exception as exc:
        logger.exception("Fallo leyendo EXIF de %s: %s", ruta_archivo, exc)
 
    # 5) Si es un R-JPEG de dron DJI, usar el DJI Thermal SDK (100% Python, sin instalar nada
    #    externo) para obtener la matriz REAL de temperatura por píxel.
    from src.services.dji_thermal_sdk import medir_temperatura_matriz, es_dji_rjpeg, DjiThermalSdkError
 
    try:
        es_dji = es_dji_rjpeg(ruta_archivo)
    except Exception as exc:
        logger.exception("es_dji_rjpeg falló para %s: %s", ruta_archivo, exc)
        es_dji = False
 
    if es_dji:
        try:
            matriz = medir_temperatura_matriz(
                ruta_archivo,
                distancia_m=propiedades.get("distancia_m") or 25.0,
                humedad_pct=propiedades.get("humedad") or 70.0,
                emisividad=propiedades.get("emisividad") or 0.98,
                temp_reflejada_c=propiedades.get("temp_reflejada") or 23.0,
            )
            propiedades["temp_max"] = round(float(matriz.max()), 2)
            propiedades["temp_min"] = round(float(matriz.min()), 2)
            # valores usados en el cálculo, para dejarlos visibles/editables en el panel
            propiedades.setdefault("distancia_m", 25.0)
            propiedades.setdefault("humedad", 70.0)
            propiedades.setdefault("emisividad", 0.98)
            propiedades.setdefault("temp_reflejada", 23.0)
        except DjiThermalSdkError as exc:
            # No se pudo medir (archivo dañado, modelo no soportado, etc.):
            # se deja para completar manualmente, sin romper la subida.
            logger.warning("DJI Thermal SDK no pudo medir %s: %s", ruta_archivo, exc)
        except Exception as exc:
            # Antes, cualquier excepción que NO fuera DjiThermalSdkError se
            # propagaba hacia arriba y podía tumbar toda la subida (el
            # endpoint /upload terminaba en 500 sin explicación clara).
            # Ahora se registra y la subida sigue con lo que sí se pudo extraer.
            logger.exception(
                "Error inesperado (no DjiThermalSdkError) midiendo temperatura de %s: %s",
                ruta_archivo,
                exc,
            )
 
    return propiedades


 