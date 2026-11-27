"""Pruebas unitarias del renderizado de paletas térmicas (src/services/paletas.py).

No requieren base de datos: trabajan solo con matrices en memoria.
"""
import numpy as np
import pytest

from src.services.paletas import renderizar_con_paleta, PALETAS


def test_todas_las_paletas_estan_definidas_con_al_menos_dos_colores():
    for nombre, colores in PALETAS.items():
        assert len(colores) >= 2, f"La paleta {nombre} necesita al menos 2 colores"


def test_renderizar_con_paleta_devuelve_un_png_valido():
    matriz = np.array([[20.0, 25.0], [30.0, 35.0]])
    resultado = renderizar_con_paleta(matriz, "iron_red")
    # Firma PNG: los primeros 8 bytes siempre son los mismos
    assert resultado[:8] == b"\x89PNG\r\n\x1a\n"


def test_renderizar_con_paleta_desconocida_lanza_error():
    matriz = np.array([[20.0, 25.0]])
    with pytest.raises(ValueError):
        renderizar_con_paleta(matriz, "paleta-que-no-existe")