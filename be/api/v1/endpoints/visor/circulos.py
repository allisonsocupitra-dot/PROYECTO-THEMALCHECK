"""Herramienta CÍRCULO del visor.

Mide la temperatura SOLO de los píxeles que caen dentro de la elipse inscrita
en la caja (x1, y1, x2, y2) que manda el frontend. La herramienta rectángulo
sigue midiendo su caja completa con el SDK, sin pasar por aquí.

No se toca la base de datos: el círculo se guarda como tipo 'region' (igual que
el rectángulo) y se distingue por su etiqueta (C1, C2, ...), mientras que los
rectángulos son R1, R2, ... y los puntos SP1, SP2, ...
"""

PREFIJO_ETIQUETA_CIRCULO = "C"


def es_circulo(punto) -> bool:
    """True si el punto (schema o modelo) es una región dibujada con la herramienta círculo."""
    etiqueta = (getattr(punto, "etiqueta", None) or "").upper()
    return punto.tipo == "region" and etiqueta.startswith(PREFIJO_ETIQUETA_CIRCULO)


def medir_circulo(matriz, x1: int, y1: int, x2: int, y2: int) -> dict:
    """
    Devuelve el mismo formato que temperatura_en_region_detallada:
    {"temp_min", "temp_avg", "temp_max", "pos_min": {"x","y"}, "pos_max": {"x","y"}}
    con las posiciones en píxeles de la imagen original.
    Lanza ValueError si la zona queda vacía o fuera de la imagen (igual que el SDK).
    """
    import numpy as np

    alto, ancho = matriz.shape[:2]

    # Normaliza esquinas y recorta a los límites de la imagen
    xa, xb = sorted((int(x1), int(x2)))
    ya, yb = sorted((int(y1), int(y2)))
    x_ini, x_fin = max(0, xa), min(ancho - 1, xb)
    y_ini, y_fin = max(0, ya), min(alto - 1, yb)
    if x_ini > x_fin or y_ini > y_fin:
        raise ValueError("Círculo fuera de la imagen")

    # Elipse inscrita en la caja original (no en la recortada)
    cx = (xa + xb) / 2
    cy = (ya + yb) / 2
    rx = (xb - xa + 1) / 2
    ry = (yb - ya + 1) / 2

    ys, xs = np.ogrid[y_ini:y_fin + 1, x_ini:x_fin + 1]
    mascara = ((xs - cx) / rx) ** 2 + ((ys - cy) / ry) ** 2 <= 1.0
    if not mascara.any():
        raise ValueError("Círculo sin píxeles")

    zona = matriz[y_ini:y_fin + 1, x_ini:x_fin + 1].astype(float)
    valores = np.where(mascara, zona, np.nan)
    if np.isnan(valores).all():
        raise ValueError("Círculo sin datos de temperatura")

    iy_min, ix_min = np.unravel_index(np.nanargmin(valores), valores.shape)
    iy_max, ix_max = np.unravel_index(np.nanargmax(valores), valores.shape)

    return {
        "temp_min": float(np.nanmin(valores)),
        "temp_avg": float(np.nanmean(valores)),
        "temp_max": float(np.nanmax(valores)),
        "pos_min": {"x": int(x_ini + ix_min), "y": int(y_ini + iy_min)},
        "pos_max": {"x": int(x_ini + ix_max), "y": int(y_ini + iy_max)},
    }