from fastapi import APIRouter
from api.v1.endpoints import auth, recuperacion
from api.v1.endpoints import visor
from api.v1.endpoints import informe, busqueda

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
api_router.include_router(recuperacion.router, prefix="/recuperacion", tags=["Recuperación de contraseña"])
api_router.include_router(visor.router, prefix="/imagenes", tags=["Visor"])
api_router.include_router(informe.router, prefix="/informes", tags=["Informe"])
api_router.include_router(busqueda.router, prefix="/informes", tags=["Informes"])