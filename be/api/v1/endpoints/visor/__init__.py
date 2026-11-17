from fastapi import APIRouter

from . import imagen, parametros, puntos, exportar, paletas

router = APIRouter()
router.include_router(imagen.router)
router.include_router(parametros.router)
router.include_router(puntos.router)
router.include_router(exportar.router)
router.include_router(paletas.router)