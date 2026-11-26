from sqlalchemy import Column, Integer, String
from src.db.session import Base


class ClaveAdmin(Base):
    __tablename__ = "clave_admin"

    id = Column(Integer, primary_key=True, autoincrement=True)
    clave_hash = Column(String(255), nullable=False)