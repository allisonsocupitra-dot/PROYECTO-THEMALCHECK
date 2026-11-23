from pydantic import BaseModel, Field


class PuntoPdf(BaseModel):
    etiqueta: str                      # SP1, R1, C1...
    tipo: str = "punto"                # "punto" -> VALUE | "region" -> MAX/MIN/AVG
    valor: float | None = None
    valor_max: float | None = None
    valor_min: float | None = None
    valor_avg: float | None = None


class EscalaPdf(BaseModel):
    temp_min: float | None = None
    temp_max: float | None = None
    colores: list[str] = Field(default_factory=list)  # paleta activa, de frío a caliente


class ExportarInformeRequest(BaseModel):
    nombre_archivo: str
    nivel_riesgo: str
    observaciones: str | None = None
    estado: str
    id_usuario: int

    # Datos para armar el PDF con el formato del reporte
    fecha: str | None = None
    imagen_base64: str | None = None   # imagen con paleta y marcas ya dibujadas
    puntos: list[PuntoPdf] = Field(default_factory=list)
    parametros: dict[str, str] = Field(default_factory=dict)
    info_imagen: dict[str, str] = Field(default_factory=dict)
    escala: EscalaPdf | None = None