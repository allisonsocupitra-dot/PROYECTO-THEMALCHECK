# be/api/v1/endpoints/informes.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from api.deps import get_db
from src.models.usuario import Usuario
from src.models.informe import Informe

router = APIRouter()

@router.get("/tecnicos")
def listar_tecnicos_con_registros(
    busqueda: str = Query(None, description="Nombre o correo a buscar"),
    db: Session = Depends(get_db)
):
    query = (
        db.query(
            Usuario.id_usuario,
            Usuario.nombre_usuario,
            Usuario.correo_usuario,
            func.count(Informe.id_informe).label("total_registros")
        )
        .outerjoin(Informe, Informe.id_usuario == Usuario.id_usuario)
        .filter(Usuario.id_rol == 2)  # solo técnicos
        .group_by(Usuario.id_usuario)
    )

    if busqueda:
        like = f"%{busqueda}%"
        query = query.filter(
            (Usuario.nombre_usuario.ilike(like)) |
            (Usuario.correo_usuario.ilike(like))
        )

    resultados = query.all()

    return [
        {
            "id_usuario": r.id_usuario,
            "nombre_usuario": r.nombre_usuario,
            "correo_usuario": r.correo_usuario,
            "total_registros": r.total_registros
        }
        for r in resultados
    ]


@router.get("/tecnicos/{id_usuario}/informes")
def listar_informes_por_tecnico(id_usuario: int, db: Session = Depends(get_db)):
    informe = (
        db.query(Informe)
        .filter(Informe.id_usuario == id_usuario)
        .order_by(Informe.fecha_generacion.desc())
        .all()
    )
    return informe