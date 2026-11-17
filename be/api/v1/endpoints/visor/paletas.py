from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from src.db.session import SessionLocal
from src.services.paletas import PALETAS, renderizar_con_paleta

from .comun import calcular_matriz, obtener_registro_o_404

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{id_imagen}/paleta")
def imagen_con_paleta(id_imagen: int, nombre: str = "iron_red", db: Session = Depends(get_db)):
    """Devuelve la imagen térmica re-pintada con la paleta pedida, en PNG.

    Usa la misma matriz de temperaturas que los puntos y las regiones (calcular_matriz),
    con los parámetros ambientales actuales de la imagen (distancia, humedad,
    emisividad y temperatura reflejada).
    """
    if nombre not in PALETAS:
        raise HTTPException(status_code=400, detail="Paleta no válida")

    registro = obtener_registro_o_404(db, id_imagen)

    matriz = calcular_matriz(registro)
    if matriz is None:
        raise HTTPException(
            status_code=422,
            detail="No se pudo leer la matriz de temperaturas (¿la imagen no es un R-JPEG de DJI?)",
        )

    return Response(content=renderizar_con_paleta(matriz, nombre), media_type="image/png")