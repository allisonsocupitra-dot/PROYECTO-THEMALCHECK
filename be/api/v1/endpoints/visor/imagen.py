import shutil
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, UploadFile, File, Form
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
def subir_imagen(
    archivo: UploadFile = File(...),
    id_usuario: Optional[int] = Form(None),
    carpeta: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    extension = Path(archivo.filename).suffix
    nombre_unico = f"{uuid.uuid4().hex}{extension}"
    ruta_destino = CARPETA_SUBIDAS / nombre_unico

    with ruta_destino.open("wb") as buffer:
        shutil.copyfileobj(archivo.file, buffer)

    propiedades = extraer_propiedades_imagen(str(ruta_destino), archivo.filename)
    propiedades["ruta_archivo"] = ruta_destino.as_posix()
    propiedades["id_usuario"] = id_usuario
    propiedades["carpeta"] = carpeta

    registro = ImagenTermografica(**propiedades)
    db.add(registro)
    db.commit()
    db.refresh(registro)

    return registro


@router.get("/usuario/{id_usuario}", response_model=List[ImagenTermograficaOut])
def listar_imagenes_usuario(id_usuario: int, db: Session = Depends(get_db)):
    return (
        db.query(ImagenTermografica)
        .filter(ImagenTermografica.id_usuario == id_usuario)
        .order_by(ImagenTermografica.id_imagen)
        .all()
    )


@router.get("/{id_imagen}", response_model=ImagenTermograficaOut)
def obtener_imagen(id_imagen: int, db: Session = Depends(get_db)):
    return obtener_registro_o_404(db, id_imagen)


@router.delete("/{id_imagen}", status_code=204)
def eliminar_imagen(id_imagen: int, db: Session = Depends(get_db)):
    registro = obtener_registro_o_404(db, id_imagen)
    if registro.ruta_archivo:
        try:
            Path(registro.ruta_archivo).unlink(missing_ok=True)
        except OSError:
            pass
    db.delete(registro)
    db.commit()