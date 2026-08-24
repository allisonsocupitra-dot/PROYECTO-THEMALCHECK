from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from src.db.session import Base

class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_usuario = Column(String(100))
    correo_usuario = Column(String(100), unique=True, index=True)
    contraseña_usuario = Column(String(255))
    id_rol = Column(Integer, ForeignKey("rol.id_rol"))

    rol = relationship("Rol", back_populates="usuarios")

