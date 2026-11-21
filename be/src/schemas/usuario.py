from pydantic import BaseModel, EmailStr
from typing import Literal, Optional

class UsuarioBase(BaseModel):
    nombre_usuario: str
    correo_usuario: EmailStr

class UsuarioCreate(UsuarioBase):
    contraseña_usuario: str
    rol: Literal["tecnico", "admin"]

class UsuarioLogin(BaseModel):
    correo_usuario: EmailStr
    contraseña_usuario: str
    rol: Literal["tecnico", "admin"]

class UsuarioOut(UsuarioBase):
    id_usuario: int
    id_rol: Optional[int] = None

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    id_usuario: int
    nombre_usuario: str
    correo_usuario: str
    rol: str