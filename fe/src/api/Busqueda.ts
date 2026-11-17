// src/api/Busqueda.ts
import { API_BASE_URL } from './Config';

// api_router.include_router(busqueda.router, prefix="/informes") y api_router se monta con prefix="/api/v1"
const BASE_URL = `${API_BASE_URL}/api/v1/informes`;

// FastAPI sirve los PDFs con StaticFiles montado en /uploads (confirma en main.py)
const BASE_ARCHIVOS = `${API_BASE_URL}/uploads`;

export interface TecnicoConInformes {
  id_usuario: number;
  nombre_usuario: string;
  correo_usuario: string;
  total_registros: number;
}

export interface Informe {
  id_informe: number;
  fecha_generacion: string | null;
  nivel_riesgo: string | null;
  observaciones: string | null;
  estado: string | null;
  nombre_archivo: string;
  ruta_pdf: string;
  id_usuario: number;
}

// GET /api/v1/informes/tecnicos?busqueda=...
export const listarTecnicosConInformes = async (
  busqueda?: string
): Promise<TecnicoConInformes[]> => {
  const url = new URL(`${BASE_URL}/tecnicos`);
  if (busqueda) url.searchParams.set('busqueda', busqueda);

  const respuesta = await fetch(url.toString());
  if (!respuesta.ok) {
    throw new Error(`Error al listar técnicos (${respuesta.status})`);
  }
  return respuesta.json();
};

// GET /api/v1/informes/tecnicos/{id_usuario}/informes
export const listarInformesPorTecnico = async (idUsuario: number): Promise<Informe[]> => {
  const respuesta = await fetch(`${BASE_URL}/tecnicos/${idUsuario}/informes`);
  if (!respuesta.ok) {
    throw new Error(`Error al listar informes (${respuesta.status})`);
  }
  return respuesta.json();
};

// ruta_pdf es relativa a la carpeta servida en /uploads,
// por ejemplo "termograficas/informes/abc123.pdf" -> "/uploads/termograficas/informes/abc123.pdf"
export const construirUrlDescargaInforme = (rutaPdf: string): string => {
  const rutaLimpia = rutaPdf.replace(/^\/+/, '');
  return `${BASE_ARCHIVOS}/${rutaLimpia}`;
};

// Descarga el PDF ya generado: lo baja como archivo y fuerza el guardado,
// porque el atributo `download` no funciona entre orígenes distintos (5173 -> 8000).
export const descargarInforme = async (informe: Informe): Promise<void> => {
  try {
    const respuesta = await fetch(construirUrlDescargaInforme(informe.ruta_pdf));
    if (!respuesta.ok) {
      throw new Error(`No se pudo descargar el archivo (${respuesta.status})`);
    }

    const blob = await respuesta.blob();
    const urlTemporal = URL.createObjectURL(blob);

    const nombre = informe.nombre_archivo || `informe-${informe.id_informe}`;
    const enlace = document.createElement('a');
    enlace.href = urlTemporal;
    enlace.download = nombre.toLowerCase().endsWith('.pdf') ? nombre : `${nombre}.pdf`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(urlTemporal);
  } catch (error) {
    console.error(error);
    window.alert('No se pudo descargar el informe. Verifica que el archivo exista en el servidor.');
  }
};