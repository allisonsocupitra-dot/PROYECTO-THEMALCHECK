"""Pruebas de extracción de metadatos/temperatura de imágenes térmicas.

No requieren base de datos.

Para la parte "imagen NO DJI" se genera una imagen cualquiera al vuelo con
Pillow, así que corre siempre, sin archivos externos.

Para la parte "imagen SÍ es un R-JPEG real de DJI" se necesita UNA imagen
de ejemplo real, ya que no se puede generar una de mentira: el SDK la
rechazaría igual que rechaza cualquier JPG normal.
"""
from pathlib import Path

import pytest
from PIL import Image

from src.services.dji_thermal_sdk import es_dji_rjpeg, medir_temperatura_matriz
from src.services.thermal_extractor import extraer_propiedades_imagen

CARPETA_FIXTURES = Path(__file__).parent / "fixtures"
IMAGEN_DJI_REAL = CARPETA_FIXTURES / "Camera_1_2026-08-20_08.07.23.000_T.jpg"  # Una imagen DJI R-JPEG real de prueba


@pytest.fixture
def imagen_normal(tmp_path) -> str:
    """Crea una imagen JPG cualquiera (NO térmica, NO de DJI) para las pruebas negativas."""
    ruta = tmp_path / "foto_normal.jpg"
    Image.new("RGB", (320, 240), color=(120, 80, 40)).save(ruta, format="JPEG")
    return str(ruta)


def test_es_dji_rjpeg_devuelve_false_con_una_imagen_que_no_es_de_dji(imagen_normal):
    assert es_dji_rjpeg(imagen_normal) is False


def test_extraer_propiedades_no_revienta_con_una_imagen_que_no_es_de_dji(imagen_normal):
    propiedades = extraer_propiedades_imagen(imagen_normal, "foto_normal.jpg")
    # Lo "seguro" (ancho/alto/formato) sí se debe poder leer siempre
    assert propiedades["ancho"] == 320
    assert propiedades["alto"] == 240
    assert propiedades["formato"] == "JPEG"
    # Al no ser de DJI y no traer datos radiométricos embebidos, quedan en None
    assert propiedades["temp_max"] is None
    assert propiedades["temp_min"] is None


@pytest.mark.skipif(
    not IMAGEN_DJI_REAL.exists(),
    reason="Falta be/tests/fixtures/Camera_1_2026-08-20_08.07.23.000_T.jpg (una imagen DJI R-JPEG real de prueba)",
)
def test_es_dji_rjpeg_devuelve_true_con_una_imagen_dji_real():
    assert es_dji_rjpeg(str(IMAGEN_DJI_REAL)) is True


@pytest.mark.skipif(
    not IMAGEN_DJI_REAL.exists(),
    reason="Falta be/tests/fixtures/Camera_1_2026-08-20_08.07.23.000_T.jpg (una imagen DJI R-JPEG real de prueba)",
)
def test_medir_temperatura_matriz_con_imagen_dji_real_devuelve_valores_razonables():
    matriz = medir_temperatura_matriz(str(IMAGEN_DJI_REAL))
    # Rango razonable para temperaturas de escenas reales en grados Celsius
    assert -40 <= float(matriz.min()) <= 200
    assert -40 <= float(matriz.max()) <= 200
    assert matriz.max() >= matriz.min()


@pytest.mark.skipif(
    not IMAGEN_DJI_REAL.exists(),
    reason="Falta be/tests/fixtures/Camera_1_2026-08-20_08.07.23.000_T.jpg (una imagen DJI R-JPEG real de prueba)",
)
def test_extraer_propiedades_con_imagen_dji_real_completa_temp_max_y_min():
    propiedades = extraer_propiedades_imagen(str(IMAGEN_DJI_REAL), "Camera_1_2026-08-20_08.07.23.000_T.jpg")
    assert propiedades["temp_max"] is not None
    assert propiedades["temp_min"] is not None
    assert propiedades["temp_max"] >= propiedades["temp_min"]