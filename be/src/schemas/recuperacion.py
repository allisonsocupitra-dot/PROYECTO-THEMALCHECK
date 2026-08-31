from pydantic import BaseModel, EmailStr

class SolicitudRecuperacion(BaseModel):
    correo_usuario: EmailStr

class RestablecerContrasena(BaseModel):
    correo_usuario: EmailStr
    nueva_contrasena: str