"""Funciones compartidas por las herramientas del visor.

Los imports del SDK de DJI se hacen DENTRO de las funciones a propósito:
si el SDK falla al cargar, solo se afectan las herramientas que miden
temperatura; guardar puntos, subir imágenes, etc. siguen funcionando.

Cada herramienta mide en su propio módulo (círculo -> circulos.py; punto y
rectángulo -> SDK). Aquí solo se decide a cuál llamar.
"""
from fastapi import HTTPException
from sqlalchemy.orm import Session

from src.models.imagen_termografica import ImagenTermografica, PuntoMedicion
from src.schemas.imagen import PuntosMedicionGuardar

from .circulos import es_circulo, medir_circulo


# Valores que se usan cuando la imagen no tiene el parámetro guardado.
# TEMP_REFLEJADA_DEFECTO debe coincidir con TEMP_REFLEJADA_POR_DEFECTO en VisorPage.tsx.
DISTANCIA_DEFECTO = 25.0
HUMEDAD_DEFECTO = 70.0
EMISIVIDAD_DEFECTO = 0.98
TEMP_REFLEJADA_DEFECTO = 23.0


def _o_defecto(valor, defecto: float) -> float:
    """Usa el valor guardado salvo que sea None (así un 0 °C válido no se pierde)."""
    return defecto if valor is None else float(valor)


def obtener_registro_o_404(db: Session, id_imagen: int) -> ImagenTermografica:
    registro = db.query(ImagenTermografica).filter(
        ImagenTermografica.id_imagen == id_imagen
    ).first()
    if not registro:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    return registro


def calcular_matriz(registro: ImagenTermografica):
    """
    Calcula la matriz completa de temperatura de una imagen DJI usando los
    parámetros ambientales ACTUALES del registro (distancia, humedad,
    emisividad, temp. reflejada). Devuelve None si la imagen no es DJI, no
    tiene ruta guardada, o el cálculo falla (se loguea el motivo en consola).
    """
    ruta_archivo = registro.ruta_archivo
    if not ruta_archivo:
        print(f"[thermal] AVISO: imagen {registro.id_imagen} no tiene ruta_archivo guardada")
        return None
    try:
        from src.services.dji_thermal_sdk import medir_temperatura_matriz, es_dji_rjpeg

        if not es_dji_rjpeg(str(ruta_archivo)):
            print(f"[thermal] AVISO: es_dji_rjpeg devolvió False para {ruta_archivo!r}")
            return None
        matriz = medir_temperatura_matriz(
            str(ruta_archivo),
            distancia_m=_o_defecto(registro.distancia_m, DISTANCIA_DEFECTO),
            humedad_pct=_o_defecto(registro.humedad, HUMEDAD_DEFECTO),
            emisividad=_o_defecto(registro.emisividad, EMISIVIDAD_DEFECTO),
            temp_reflejada_c=_o_defecto(registro.temp_reflejada, TEMP_REFLEJADA_DEFECTO),
        )
        print(f"[thermal] matriz recalculada OK para imagen {registro.id_imagen}, shape={matriz.shape}")
        return matriz
    except Exception:
        import traceback
        print(f"[thermal] ERROR calculando matriz para imagen {registro.id_imagen}:")
        traceback.print_exc()
        return None


def medir_region(punto, matriz) -> dict:
    """
    Mide una región según la herramienta que la dibujó:
      - círculo (etiqueta C#): solo los píxeles dentro de la elipse -> circulos.py
      - rectángulo (etiqueta R#): toda la caja -> SDK
    Devuelve el dict {"temp_min","temp_avg","temp_max","pos_min","pos_max"}.
    Lanza ValueError si la región es inválida (el llamador la ignora).
    """
    if es_circulo(punto):
        return medir_circulo(matriz, punto.x1, punto.y1, punto.x2, punto.y2)

    from src.services.dji_thermal_sdk import temperatura_en_region_detallada
    return temperatura_en_region_detallada(matriz, punto.x1, punto.y1, punto.x2, punto.y2)


def aplicar_region_a_punto(punto, matriz) -> None:
    """
    Calcula min/avg/max Y la posición del píxel min/max para un punto tipo
    'region', y los asigna directamente sobre el objeto `punto`.
    """
    try:
        detalle = medir_region(punto, matriz)
    except ValueError:
        return  # región vacía / fuera de rango: se conserva lo que ya tenía

    punto.valor_min = detalle["temp_min"]
    punto.valor_avg = detalle["temp_avg"]
    punto.valor_max = detalle["temp_max"]
    punto.pos_min_x = detalle["pos_min"]["x"]
    punto.pos_min_y = detalle["pos_min"]["y"]
    punto.pos_max_x = detalle["pos_max"]["x"]
    punto.pos_max_y = detalle["pos_max"]["y"]


def recalcular_puntos_existentes(db: Session, registro: ImagenTermografica, matriz) -> None:
    """Recalcula valor_temp / valor_min,avg,max + posición min/max de TODOS los puntos ya guardados de esta imagen."""
    from src.services.dji_thermal_sdk import temperatura_en_punto

    puntos = db.query(PuntoMedicion).filter(PuntoMedicion.id_imagen == registro.id_imagen).all()
    for punto in puntos:
        if punto.tipo == 'punto' and punto.x is not None and punto.y is not None:
            try:
                punto.valor_temp = temperatura_en_punto(matriz, punto.x, punto.y)
            except ValueError:
                pass
        elif punto.tipo == 'region' and None not in (punto.x1, punto.y1, punto.x2, punto.y2):
            aplicar_region_a_punto(punto, matriz)


def guardar_puntos(db: Session, id_imagen: int, datos: PuntosMedicionGuardar) -> ImagenTermografica:
    """
    Reemplaza todos los puntos de medición de la imagen por los que llegan del frontend.
    La usan tanto el endpoint de puntos como el de exportar PDF (así un endpoint
    no tiene que llamar a otro).
    """
    registro = obtener_registro_o_404(db, id_imagen)

    db.query(PuntoMedicion).filter(PuntoMedicion.id_imagen == id_imagen).delete()

    necesita_matriz = any(
        (p.x is not None and p.y is not None) or
        (p.x1 is not None and p.y1 is not None and p.x2 is not None and p.y2 is not None)
        for p in datos.puntos
    )
    matriz = calcular_matriz(registro) if necesita_matriz else None

    if matriz is not None:
        from src.services.dji_thermal_sdk import temperatura_en_punto

    for punto in datos.puntos:
        valor_temp = punto.valor_temp
        valor_min = punto.valor_min
        valor_avg = punto.valor_avg
        valor_max = punto.valor_max
        pos_min_x = punto.pos_min_x
        pos_min_y = punto.pos_min_y
        pos_max_x = punto.pos_max_x
        pos_max_y = punto.pos_max_y

        if matriz is not None:
            if punto.tipo == 'punto' and punto.x is not None and punto.y is not None:
                try:
                    valor_temp = temperatura_en_punto(matriz, punto.x, punto.y)
                except ValueError:
                    pass
            elif punto.tipo == 'region' and None not in (punto.x1, punto.y1, punto.x2, punto.y2):
                try:
                    detalle = medir_region(punto, matriz)
                    valor_min, valor_avg, valor_max = detalle["temp_min"], detalle["temp_avg"], detalle["temp_max"]
                    pos_min_x, pos_min_y = detalle["pos_min"]["x"], detalle["pos_min"]["y"]
                    pos_max_x, pos_max_y = detalle["pos_max"]["x"], detalle["pos_max"]["y"]
                except ValueError:
                    pass

        db.add(PuntoMedicion(
            etiqueta=punto.etiqueta,
            tipo=punto.tipo,
            x=punto.x, y=punto.y,
            x1=punto.x1, y1=punto.y1, x2=punto.x2, y2=punto.y2,
            valor_temp=valor_temp,
            valor_min=valor_min,
            valor_avg=valor_avg,
            valor_max=valor_max,
            pos_min_x=pos_min_x, pos_min_y=pos_min_y,
            pos_max_x=pos_max_x, pos_max_y=pos_max_y,
            id_imagen=id_imagen,
        ))

    db.commit()
    db.refresh(registro)
    return registro