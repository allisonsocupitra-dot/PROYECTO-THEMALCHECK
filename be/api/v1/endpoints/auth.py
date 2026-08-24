from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.deps import get_db
from src.models.usuario import Usuario
from src.schemas.usuario import UsuarioCreate, UsuarioLogin, UsuarioOut, LoginResponse
from src.core.security import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def register(usuario_in: UsuarioCreate, db: Session = Depends(get_db)):
    existente = db.query(Usuario).filter(Usuario.correo_usuario == usuario_in.correo_usuario).first()
    if existente:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    nuevo_usuario = Usuario(
        nombre_usuario=usuario_in.nombre_usuario,
        correo_usuario=usuario_in.correo_usuario,
        contraseña_usuario=hash_password(usuario_in.contraseña_usuario),
        id_rol=usuario_in.id_rol,
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@router.post("/login", response_model=LoginResponse)
def login(datos_login: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.correo_usuario == datos_login.correo_usuario).first()

    if not usuario or not verify_password(datos_login.contraseña_usuario, usuario.contraseña_usuario):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

    if not usuario.rol:
        raise HTTPException(status_code=400, detail="El usuario no tiene un rol asignado")

    if usuario.id_rol != datos_login.id_rol:
        raise HTTPException(
            status_code=403,
            detail=f"Este usuario no tiene el rol seleccionado. Su rol real es '{usuario.rol.tipo_rol}' (id_rol={usuario.id_rol})."
        )

    return {
        "id_usuario": usuario.id_usuario,
        "nombre_usuario": usuario.nombre_usuario,
        "correo_usuario": usuario.correo_usuario,
        "rol": usuario.rol.tipo_rol,
    }