"""Paletas térmicas: convierte una matriz de temperaturas (°C) en una imagen PNG.

Guarda este archivo como be/src/services/paletas.py.
Los colores deben ser los mismos que PALETAS en fe/src/utils/paletas.ts.
"""
import io

import numpy as np
from PIL import Image

# Colores de frío a caliente
PALETAS: dict[str, list[str]] = {
    "white_hot": ["#000000", "#ffffff"],
    "fulgurite": ["#000000", "#3b0a6b", "#c1272d", "#f7931e", "#fff200", "#ffffff"],
    "iron_red": ["#000000", "#1a0a5a", "#7b1fa2", "#d81b60", "#ff6f00", "#ffd600", "#ffffe0"],
    "hot_iron": ["#000000", "#1a1a8c", "#0a8f3c", "#ffe600", "#ff4500", "#ffffff"],
    "medical": ["#000080", "#0000ff", "#00ffff", "#00ff00", "#ffff00", "#ff0000", "#ffffff"],
    "arctic": ["#000000", "#0000aa", "#0080ff", "#00ffff", "#00ff80", "#ffff00", "#ff0000"],
    "rainbow_1": ["#0000ff", "#00ffff", "#00ff00", "#ffff00", "#ff0000"],
    "rainbow_2": ["#000000", "#0000ff", "#00ffff", "#00ff00", "#ffff00", "#ff0000", "#ffffff"],
    "tint": ["#000000", "#808080", "#ff9999", "#ff0000"],
    "black_hot": ["#ffffff", "#000000"],
}


def _hex_a_rgb(valor: str) -> tuple[int, int, int]:
    valor = valor.lstrip("#")
    return tuple(int(valor[i:i + 2], 16) for i in (0, 2, 4))


def _tabla_colores(colores: list[str], n: int = 256) -> np.ndarray:
    """Interpola los colores de la paleta en una tabla de n entradas (n x 3, uint8)."""
    puntos = np.array([_hex_a_rgb(c) for c in colores], dtype=float)
    xs = np.linspace(0, 1, len(puntos))
    xi = np.linspace(0, 1, n)
    canales = [np.interp(xi, xs, puntos[:, k]) for k in range(3)]
    return np.stack(canales, axis=1).astype(np.uint8)


def renderizar_con_paleta(temperaturas: np.ndarray, paleta: str) -> bytes:
    """Devuelve un PNG con la matriz (alto x ancho, en °C) pintada con la paleta.

    El mínimo de la matriz toma el primer color de la paleta y el máximo el último.
    """
    colores = PALETAS.get(paleta)
    if colores is None:
        raise ValueError(f"Paleta desconocida: {paleta}")

    t_min = float(np.nanmin(temperaturas))
    t_max = float(np.nanmax(temperaturas))
    normalizado = (temperaturas - t_min) / max(t_max - t_min, 1e-6)
    indices = np.clip(np.nan_to_num(normalizado) * 255, 0, 255).astype(np.uint8)

    rgb = _tabla_colores(colores)[indices]  # (alto, ancho, 3)

    buffer = io.BytesIO()
    Image.fromarray(rgb).save(buffer, format="PNG")
    return buffer.getvalue()