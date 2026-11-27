"""Pruebas de la herramienta CÍRCULO del visor (api/v1/endpoints/visor/circulos.py)."""


from types import SimpleNamespace

import numpy as np
import pytest

from api.v1.endpoints.visor.circulos import es_circulo, medir_circulo


def test_es_circulo_reconoce_una_region_con_etiqueta_c():
    punto = SimpleNamespace(tipo="region", etiqueta="C1")
    assert es_circulo(punto) is True


def test_es_circulo_rechaza_un_rectangulo():
    punto = SimpleNamespace(tipo="region", etiqueta="R1")
    assert es_circulo(punto) is False


def test_es_circulo_rechaza_un_punto_simple():
    punto = SimpleNamespace(tipo="punto", etiqueta="SP1")
    assert es_circulo(punto) is False


def _matriz_de_prueba() -> np.ndarray:
    # Matriz 10x10 donde cada celda vale su columna (0..9), fácil de razonar.
    fila = np.arange(10, dtype=float)
    return np.tile(fila, (10, 1))


def test_medir_circulo_devuelve_min_avg_max_dentro_de_la_caja():
    matriz = _matriz_de_prueba()
    resultado = medir_circulo(matriz, x1=2, y1=2, x2=7, y2=7)

    assert resultado["temp_min"] <= resultado["temp_avg"] <= resultado["temp_max"]
    # El centro de la caja (columna ~4-5) siempre está dentro de la elipse inscrita
    assert 2 <= resultado["pos_max"]["x"] <= 7
    assert 2 <= resultado["pos_min"]["x"] <= 7


def test_medir_circulo_lanza_valueerror_si_la_caja_esta_fuera_de_la_imagen():
    matriz = _matriz_de_prueba()
    with pytest.raises(ValueError):
        medir_circulo(matriz, x1=50, y1=50, x2=60, y2=60)