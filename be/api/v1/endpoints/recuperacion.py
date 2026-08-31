from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.deps import get_db
from src.models.usuario import Usuario
from src.schemas.recuperacion import SolicitudRecuperacion, RestablecerContrasena
from src.core.recuperacion import enviar_correo_recuperacion
from src.core.security import hash_password

router = APIRouter()


@router.post("/recuperar")
def solicitar_recuperacion(datos: SolicitudRecuperacion, db: Session = Depends(get_db)):
    # 🔒 Filtro de seguridad: el correo debe existir en la BD
    usuario = db.query(Usuario).filter(Usuario.correo_usuario == datos.correo_usuario).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El correo no está registrado en el sistema.",
        )

    try:
        enviar_correo_recuperacion(usuario.correo_usuario)
    except Exception as e:
        print(f"ERROR AL ENVIAR CORREO: {e}")  # 👈 esto te muestra la causa real en la terminal
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo enviar el correo. Intenta más tarde.",
        )

    return {"mensaje": "Se ha enviado un enlace de recuperación a tu correo."}


@router.put("/restablecer")
def restablecer_contrasena(datos: RestablecerContrasena, db: Session = Depends(get_db)):
    # 🔒 Filtro de seguridad: el correo debe existir en la BD
    usuario = db.query(Usuario).filter(Usuario.correo_usuario == datos.correo_usuario).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="El correo no está registrado en el sistema.")

    usuario.contraseña_usuario = hash_password(datos.nueva_contrasena)
    db.commit()

    return {"mensaje": "Contraseña actualizada correctamente."}