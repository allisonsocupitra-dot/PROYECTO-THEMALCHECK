import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from api.deps import get_db  # ajusta el import según tu estructura real
from src.models.imagen_termografica import ImagenTermografica
from src.schemas.imagen import ImagenTermograficaOut
from src.services.thermal_extractor import extraer_propiedades_imagen

from .comun import obtener_registro_o_404

router = APIRouter()

CARPETA_SUBIDAS = Path("uploads/termograficas")
CARPETA_SUBIDAS.mkdir(parents=True, exist_ok=True)


@router.post("/upload", response_model=ImagenTermograficaOut)
def subir_imagen(archivo: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Se llama automáticamente cuando el usuario abre/selecciona una imagen en el visor.
    1) Guarda el archivo físico.
    2) Extrae automáticamente sus propiedades.
    3) Las guarda en imagen_termografica.
    4) Devuelve el registro completo para pintar el panel PARÁMETROS / INFORMACIÓN DE LA IMAGEN.
    """
    extension = Path(archivo.filename).suffix
    nombre_unico = f"{uuid.uuid4().hex}{extension}"
    ruta_destino = CARPETA_SUBIDAS / nombre_unico

    with ruta_destino.open("wb") as buffer:
        shutil.copyfileobj(archivo.file, buffer)

    propiedades = extraer_propiedades_imagen(str(ruta_destino), archivo.filename)
    propiedades["ruta_archivo"] = str(ruta_destino)

    registro = ImagenTermografica(**propiedades)
    db.add(registro)
    db.commit()
    db.refresh(registro)

    return registro


@router.get("/{id_imagen}", response_model=ImagenTermograficaOut)
def obtener_imagen(id_imagen: int, db: Session = Depends(get_db)):
    return obtener_registro_o_404(db, id_imagen)