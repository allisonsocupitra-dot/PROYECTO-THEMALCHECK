import { API_BASE_URL } from './Config';

export interface RegistroAnalisis {
  id: string;
  usuarioId: string;
  nombreImagen: string;
  fecha: string; // ISO 8601
  temperaturaMax: number;
  temperaturaMin: number;
  estado: 'Completado' | 'Pendiente' | 'Error';
}

// GET /usuarios/:id/registros — historial de análisis de un técnico puntual.
export const obtenerRegistrosPorTecnico = async (usuarioId: string): Promise<RegistroAnalisis[]> => {
  const respuesta = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}/registros`);

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los registros');
  }

  return respuesta.json();
};