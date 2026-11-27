"""Prueba de carga para el backend de ThermalCheck.

Se guarda en be/locustfile.py (en la raíz de la carpeta be/) y se ejecuta con
el servidor (uvicorn) ya corriendo en otra terminal, en http://127.0.0.1:8000
"""
from locust import HttpUser, task, between


class UsuarioThermalCheck(HttpUser):
    wait_time = between(1, 2)  # Pausa de 1 a 2 segundos entre peticiones

    @task(3)
    def consultar_raiz(self):
        # Ruta liviana, no toca la base de datos: mide el rendimiento base de la API
        self.client.get("/")

    @task(3)
    def consultar_conexion_bd(self):
        # Verifica que la conexión a MySQL responda bajo carga
        self.client.get("/test-db")

    @task(1)
    def listar_tecnicos_con_informes(self):
        # Endpoint real del proyecto: consulta con JOIN a la tabla informe
        self.client.get("/api/v1/informes/tecnicos")