from fastapi import APIRouter
from api.v1.endpoints import auth, recuperacion
from api.v1.endpoints import imagenes

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
api_router.include_router(recuperacion.router, prefix="/recuperacion", tags=["Recuperación de contraseña"])
api_router.include_router(imagenes.router, prefix="/imagenes", tags=["imagenes"])