// src/api/Informes.ts
import { API_BASE_URL } from './Config';

// Prefijo real con que informe.py está incluido en api.py:
// api_router.include_router(informe.router, prefix="/informes", tags=["Informe"])
// y api_router a su vez se monta en main.py con prefix="/api/v1"
const BASE_URL = `${API_BASE_URL}/api/v1/informes`;

// URL base donde FastAPI sirve los archivos estáticos (StaticFiles).
// Ojo: los StaticFiles normalmente se montan directo en `app`, NO bajo /api/v1
// (confirma esto en main.py: app.mount("/uploads", StaticFiles(...))).
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

// GET /informes/tecnicos?busqueda=...
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

// GET /informes/tecnicos/{id_usuario}/informes
export const listarInformesPorTecnico = async (idUsuario: number): Promise<Informe[]> => {
  const respuesta = await fetch(`${BASE_URL}/tecnicos/${idUsuario}/informes`);
  if (!respuesta.ok) {
    throw new Error(`Error al listar informes (${respuesta.status})`);
  }
  return respuesta.json();
};

// ruta_pdf ya viene como el path relativo servido por StaticFiles bajo /uploads,
// por ejemplo "termograficas/informes/abc123.pdf" -> "/uploads/termograficas/informes/abc123.pdf"
export const construirUrlDescargaInforme = (rutaPdf: string): string => {
  const rutaLimpia = rutaPdf.replace(/^\/+/, '');
  return `${BASE_ARCHIVOS}/${rutaLimpia}`;
};

// Dispara la descarga del PDF ya generado (no vuelve a llamar al backend
// para regenerarlo; usa el archivo estático servido por FastAPI).
export const descargarInforme = (informe: Informe): void => {
  const url = construirUrlDescargaInforme(informe.ruta_pdf);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = informe.nombre_archivo || `informe-${informe.id_informe}.pdf`;
  enlace.target = '_blank';
  enlace.rel = 'noopener';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
};