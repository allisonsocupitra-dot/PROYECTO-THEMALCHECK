from sqlalchemy import Column, Integer, String, DateTime, DECIMAL, ForeignKey, Enum
from sqlalchemy.orm import relationship

from src.db.session import Base  # ajusta el import según tu estructura real


class ImagenTermografica(Base):
    __tablename__ = "imagen_termografica"

    id_imagen = Column(Integer, primary_key=True, autoincrement=True)
    nombre_archivo = Column(String(300), nullable=False)
    ruta_archivo = Column(String(500), nullable=True)  # ruta real en disco (nombre_archivo es el original del usuario)
    fecha_modificacion = Column(DateTime, nullable=True)
    ancho = Column(Integer, nullable=True)
    alto = Column(Integer, nullable=True)
    formato = Column(String(10), nullable=True)
    modelo_camara = Column(String(100), nullable=True)
    numero_serie = Column(String(100), nullable=True)
    distancia_focal = Column(DECIMAL(5, 2), nullable=True)
    numero_f = Column(DECIMAL(4, 2), nullable=True)
    latitud = Column(DECIMAL(10, 6), nullable=True)
    longitud = Column(DECIMAL(10, 6), nullable=True)
    distancia_m = Column(DECIMAL(6, 2), nullable=True)
    humedad = Column(DECIMAL(5, 2), nullable=True)
    emisividad = Column(DECIMAL(4, 2), nullable=True)
    temp_reflejada = Column(DECIMAL(6, 2), nullable=True)
    temp_max = Column(DECIMAL(6, 2), nullable=True)
    temp_min = Column(DECIMAL(6, 2), nullable=True)
    id_usuario = Column(Integer, nullable=True)
    id_informe = Column(Integer, nullable=True)

    puntos_medicion = relationship(
        "PuntoMedicion", back_populates="imagen", cascade="all, delete-orphan"
    )


class PuntoMedicion(Base):
    __tablename__ = "punto_medicion"

    id_punto = Column(Integer, primary_key=True, autoincrement=True)
    etiqueta = Column(String(20), nullable=True)
    valor_temp = Column(DECIMAL(6, 2), nullable=True)   # herramienta "punto"
    id_imagen = Column(Integer, ForeignKey("imagen_termografica.id_imagen"), nullable=True)
    tipo = Column(Enum('punto', 'region', name='tipo_punto_medicion'), nullable=False, default='punto')
    x = Column(Integer, nullable=True)
    y = Column(Integer, nullable=True)
    x1 = Column(Integer, nullable=True)
    y1 = Column(Integer, nullable=True)
    x2 = Column(Integer, nullable=True)
    y2 = Column(Integer, nullable=True)
    valor_min = Column(DECIMAL(6, 2), nullable=True)    # herramienta "region" (rectángulo/círculo)
    valor_avg = Column(DECIMAL(6, 2), nullable=True)
    valor_max = Column(DECIMAL(6, 2), nullable=True)

    # Posición (en píxeles de la imagen original) del punto con la temperatura
    # mínima y del punto con la temperatura máxima DENTRO de la región. Solo
    # aplican a tipo='region'; permiten dibujar los marcadores azul (min) y
    # rojo (max) sobre el recuadro, igual que el software oficial de DJI.
    pos_min_x = Column(Integer, nullable=True)
    pos_min_y = Column(Integer, nullable=True)
    pos_max_x = Column(Integer, nullable=True)
    pos_max_y = Column(Integer, nullable=True)

    imagen = relationship("ImagenTermografica", back_populates="puntos_medicion")