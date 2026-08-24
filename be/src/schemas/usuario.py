from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioBase(BaseModel):
    nombre_usuario: str
    correo_usuario: EmailStr

class UsuarioCreate(UsuarioBase):
    contraseña_usuario: str
    id_rol: Optional[int] = None

class UsuarioLogin(BaseModel):
    correo_usuario: EmailStr
    contraseña_usuario: str
    id_rol: int

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