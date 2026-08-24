from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from src.db.session import Base

class Rol(Base):
    __tablename__ = "rol"

    id_rol = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tipo_rol = Column(String(50))

    usuarios = relationship("Usuario", back_populates="rol")