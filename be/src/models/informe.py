# models.py
from sqlalchemy import Column, Integer, String, Date, Text
from src.db.session import Base

class Informe(Base):
    __tablename__ = "informe"

    id_informe = Column(Integer, primary_key=True, autoincrement=True)
    fecha_generacion = Column(Date, server_default="CURRENT_DATE")
    nivel_riesgo = Column(String(400))
    observaciones = Column(Text)
    estado = Column(String(10))
    nombre_archivo = Column(String(255), nullable=False)
    ruta_pdf = Column(String(500), nullable=False)
    id_usuario = Column(Integer, nullable=False)