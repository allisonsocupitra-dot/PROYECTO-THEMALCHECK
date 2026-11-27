"""Pruebas de api/v1/endpoints/visor/comun.py que NO necesitan base de datos.

Se usan objetos SimpleNamespace en vez de registros reales de SQLAlchemy para
simular un "punto" o una "imagen" con los mismos atributos: estas funciones
solo LEEN atributos (x1, y1, ruta_archivo, etc.).
"""
from types import SimpleNamespace

import numpy as np
import pytest
from PIL import Image

from api.v1.endpoints.visor.comun import (
    _o_defecto,
    aplicar_region_a_punto,
    calcular_matriz,
    medir_region,
)


def test_o_defecto_usa_el_valor_guardado_si_no_es_none():
    assert _o_defecto(12.5, 25.0) == 12.5


def test_o_defecto_usa_el_defecto_si_el_valor_es_none():
    assert _o_defecto(None, 25.0) == 25.0


def test_o_defecto_respeta_un_cero_valido_sin_reemplazarlo_por_el_defecto():
    # Importante: un 0°C real no debe perderse solo por ser "falsy"
    assert _o_defecto(0, 25.0) == 0.0


def test_calcular_matriz_devuelve_none_si_el_registro_no_tiene_ruta_archivo():
    registro = SimpleNamespace(id_imagen=1, ruta_archivo=None)
    assert calcular_matriz(registro) is None


def test_calcular_matriz_devuelve_none_si_el_archivo_no_es_de_dji(tmp_path):
    ruta = tmp_path / "foto_normal.jpg"
    Image.new("RGB", (100, 100), color=(10, 20, 30)).save(ruta, format="JPEG")

    registro = SimpleNamespace(
        id_imagen=1,
        ruta_archivo=str(ruta),
        distancia_m=None,
        humedad=None,
        emisividad=None,
        temp_reflejada=None,
    )
    assert calcular_matriz(registro) is None


def _matriz_de_prueba() -> np.ndarray:
    fila = np.arange(10, dtype=float)
    return np.tile(fila, (10, 1))


def test_medir_region_usa_el_calculo_de_circulo_para_una_etiqueta_c():
    punto = SimpleNamespace(tipo="region", etiqueta="C1", x1=2, y1=2, x2=7, y2=7)
    resultado = medir_region(punto, _matriz_de_prueba())
    assert resultado["temp_min"] <= resultado["temp_max"]


def test_aplicar_region_a_punto_asigna_los_valores_calculados():
    punto = SimpleNamespace(
        tipo="region", etiqueta="C1", x1=2, y1=2, x2=7, y2=7,
        valor_min=None, valor_avg=None, valor_max=None,
        pos_min_x=None, pos_min_y=None, pos_max_x=None, pos_max_y=None,
    )
    aplicar_region_a_punto(punto, _matriz_de_prueba())
    assert punto.valor_min is not None
    assert punto.valor_max is not None
    assert punto.valor_min <= punto.valor_max


def test_aplicar_region_a_punto_no_cambia_nada_si_la_region_es_invalida():
    punto = SimpleNamespace(
        tipo="region", etiqueta="C1", x1=50, y1=50, x2=60, y2=60,
        valor_min="sin-tocar", valor_avg=None, valor_max=None,
        pos_min_x=None, pos_min_y=None, pos_max_x=None, pos_max_y=None,
    )
    aplicar_region_a_punto(punto, _matriz_de_prueba())
    # La caja está fuera de la imagen -> medir_region lanza ValueError -> no se toca nada
    assert punto.valor_min == "sin-tocar"