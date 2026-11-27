"""Pruebas de la API con el TestClient de FastAPI.

Importante: al importar src.main se ejecuta Base.metadata.create_all(), por lo
que tu base de datos MySQL local (la del backend) debe estar encendida y
configurada en el .env, igual que cuando corres el backend con uvicorn.
"""
from fastapi.testclient import TestClient

from src.main import app

cliente = TestClient(app)


def test_la_ruta_raiz_responde_con_mensaje_de_bienvenida():
    respuesta = cliente.get("/")
    assert respuesta.status_code == 200
    assert "message" in respuesta.json()


def test_test_db_responde_ok_si_la_base_de_datos_esta_disponible():
    respuesta = cliente.get("/test-db")
    assert respuesta.status_code == 200
    assert respuesta.json()["status"] == "ok"


def test_listar_tecnicos_responde_200():
    respuesta = cliente.get("/api/v1/informes/tecnicos")
    assert respuesta.status_code == 200