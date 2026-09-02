import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from api.deps import get_db  # ajusta el import según tu estructura real
from src.models.imagen_termografica import ImagenTermografica, PuntoMedicion
from src.schemas.imagen import ImagenTermograficaOut, PuntosMedicionGuardar, ParametrosUpdate
from src.services.thermal_extractor import extraer_propiedades_imagen
from src.services.dji_thermal_sdk import (
    medir_temperatura_matriz, temperatura_en_punto, temperatura_en_region_detallada, es_dji_rjpeg,
)
from src.services.pdf_export import generar_pdf_informe  # ver nota al final

router = APIRouter()

CARPETA_SUBIDAS = Path("uploads/termograficas")
CARPETA_SUBIDAS.mkdir(parents=True, exist_ok=True)


def _calcular_matriz(registro: ImagenTermografica):
    """
    Calcula la matriz completa de temperatura de una imagen DJI usando los
    parámetros ambientales ACTUALES del registro (distancia, humedad,
    emisividad, temp. reflejada). Devuelve None si la imagen no es DJI, no
    tiene ruta guardada, o el cálculo falla (se loguea el motivo en consola).
    """
    ruta_archivo = registro.ruta_archivo
    if not ruta_archivo:
        print(f"[thermal] AVISO: imagen {registro.id_imagen} no tiene ruta_archivo guardada")
        return None
    if not es_dji_rjpeg(str(ruta_archivo)):
        print(f"[thermal] AVISO: es_dji_rjpeg devolvió False para {ruta_archivo!r}")
        return None
    try:
        matriz = medir_temperatura_matriz(
            str(ruta_archivo),
            distancia_m=float(registro.distancia_m or 25.0),
            humedad_pct=float(registro.humedad or 70.0),
            emisividad=float(registro.emisividad or 0.98),
            temp_reflejada_c=float(registro.temp_reflejada or 23.0),
        )
        print(f"[thermal] matriz recalculada OK para imagen {registro.id_imagen}, shape={matriz.shape}")
        return matriz
    except Exception:
        import traceback
        print(f"[thermal] ERROR calculando matriz para imagen {registro.id_imagen}:")
        traceback.print_exc()
        return None


def _aplicar_region_a_punto(punto, matriz) -> None:
    """
    Calcula min/avg/max Y la posición del píxel min/max para un punto tipo
    'region', y los asigna directamente sobre el objeto `punto` (funciona
    tanto para el modelo PuntoMedicion como para el schema de salida, ya
    que solo usa setattr sobre atributos que ambos tienen).
    """
    try:
        detalle = temperatura_en_region_detallada(matriz, punto.x1, punto.y1, punto.x2, punto.y2)
    except ValueError:
        return  # región vacía / fuera de rango: se conserva lo que ya tenía

    punto.valor_min = detalle["temp_min"]
    punto.valor_avg = detalle["temp_avg"]
    punto.valor_max = detalle["temp_max"]
    punto.pos_min_x = detalle["pos_min"]["x"]
    punto.pos_min_y = detalle["pos_min"]["y"]
    punto.pos_max_x = detalle["pos_max"]["x"]
    punto.pos_max_y = detalle["pos_max"]["y"]


def _recalcular_puntos_existentes(db: Session, registro: ImagenTermografica, matriz) -> None:
    """Recalcula valor_temp / valor_min,avg,max + posición min/max de TODOS los puntos ya guardados de esta imagen."""
    puntos = db.query(PuntoMedicion).filter(PuntoMedicion.id_imagen == registro.id_imagen).all()
    for punto in puntos:
        if punto.tipo == 'punto' and punto.x is not None and punto.y is not None:
            try:
                punto.valor_temp = temperatura_en_punto(matriz, punto.x, punto.y)
            except ValueError:
                pass
        elif punto.tipo == 'region' and None not in (punto.x1, punto.y1, punto.x2, punto.y2):
            _aplicar_region_a_punto(punto, matriz)


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
    registro = db.query(ImagenTermografica).filter(
        ImagenTermografica.id_imagen == id_imagen
    ).first()
    if not registro:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    return registro


@router.put("/{id_imagen}/parametros", response_model=ImagenTermograficaOut)
def actualizar_parametros(
    id_imagen: int, datos: ParametrosUpdate, db: Session = Depends(get_db)
):
    """
    Botones +/- de Distancia, Humedad, Emisividad y Temp. reflejada en el panel.
    Al cambiar cualquiera de estos, se recalculan:
      1) temp_max / temp_min de la imagen completa.
      2) La temperatura de TODOS los puntos y regiones ya marcados (incluida
         la posición del píxel min/max de cada región).
    Igual que hace el software oficial de DJI.
    """
    registro = db.query(ImagenTermografica).filter(
        ImagenTermografica.id_imagen == id_imagen
    ).first()
    if not registro:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")

    if datos.distancia_m is not None:
        registro.distancia_m = datos.distancia_m
    if datos.humedad is not None:
        registro.humedad = datos.humedad
    if datos.emisividad is not None:
        registro.emisividad = datos.emisividad
    if datos.temp_reflejada is not None:
        registro.temp_reflejada = datos.temp_reflejada

    matriz = _calcular_matriz(registro)
    if matriz is not None:
        registro.temp_max = round(float(matriz.max()), 2)
        registro.temp_min = round(float(matriz.min()), 2)
        _recalcular_puntos_existentes(db, registro, matriz)

    db.commit()
    db.refresh(registro)
    return registro


@router.put("/{id_imagen}/puntos", response_model=ImagenTermograficaOut)
def guardar_puntos_medicion(
    id_imagen: int, datos: PuntosMedicionGuardar, db: Session = Depends(get_db)
):
    """
    Reemplaza todos los puntos de medición de la imagen por los que llegan del frontend.
    Se llama cada vez que el usuario agrega/edita/borra un punto en el visor
    (y también justo antes de exportar el PDF, para asegurar que quede todo guardado).
    """
    registro = db.query(ImagenTermografica).filter(
        ImagenTermografica.id_imagen == id_imagen
    ).first()
    if not registro:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")

    db.query(PuntoMedicion).filter(PuntoMedicion.id_imagen == id_imagen).delete()

    necesita_matriz = any(
        (p.x is not None and p.y is not None) or
        (p.x1 is not None and p.y1 is not None and p.x2 is not None and p.y2 is not None)
        for p in datos.puntos
    )
    matriz = _calcular_matriz(registro) if necesita_matriz else None

    for punto in datos.puntos:
        valor_temp = punto.valor_temp
        valor_min = punto.valor_min
        valor_avg = punto.valor_avg
        valor_max = punto.valor_max
        pos_min_x = punto.pos_min_x
        pos_min_y = punto.pos_min_y
        pos_max_x = punto.pos_max_x
        pos_max_y = punto.pos_max_y

        if matriz is not None:
            if punto.tipo == 'punto' and punto.x is not None and punto.y is not None:
                try:
                    valor_temp = temperatura_en_punto(matriz, punto.x, punto.y)
                except ValueError:
                    pass
            elif punto.tipo == 'region' and None not in (punto.x1, punto.y1, punto.x2, punto.y2):
                try:
                    detalle = temperatura_en_region_detallada(matriz, punto.x1, punto.y1, punto.x2, punto.y2)
                    valor_min, valor_avg, valor_max = detalle["temp_min"], detalle["temp_avg"], detalle["temp_max"]
                    pos_min_x, pos_min_y = detalle["pos_min"]["x"], detalle["pos_min"]["y"]
                    pos_max_x, pos_max_y = detalle["pos_max"]["x"], detalle["pos_max"]["y"]
                except ValueError:
                    pass

        db.add(PuntoMedicion(
            etiqueta=punto.etiqueta,
            tipo=punto.tipo,
            x=punto.x, y=punto.y,
            x1=punto.x1, y1=punto.y1, x2=punto.x2, y2=punto.y2,
            valor_temp=valor_temp,
            valor_min=valor_min,
            valor_avg=valor_avg,
            valor_max=valor_max,
            pos_min_x=pos_min_x, pos_min_y=pos_min_y,
            pos_max_x=pos_max_x, pos_max_y=pos_max_y,
            id_imagen=id_imagen,
        ))

    db.commit()
    db.refresh(registro)
    return registro


@router.post("/{id_imagen}/exportar-pdf")
def exportar_pdf(
    id_imagen: int, datos: PuntosMedicionGuardar, db: Session = Depends(get_db)
):
    """
    Botón 'Exportar reporte (PDF)' del visor.
    1) Guarda/actualiza los puntos de medición actuales (por si el usuario no dio 'Guardar' antes).
    2) Genera el PDF con los datos ya persistidos en BD.
    3) Devuelve el archivo.
    """
    guardar_puntos_medicion(id_imagen, datos, db)

    registro = db.query(ImagenTermografica).filter(
        ImagenTermografica.id_imagen == id_imagen
    ).first()
    if not registro:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")

    ruta_pdf = generar_pdf_informe(registro)
    return FileResponse(ruta_pdf, media_type="application/pdf", filename=Path(ruta_pdf).name)