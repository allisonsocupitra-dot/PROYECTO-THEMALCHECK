import { API_BASE_URL } from './Config';

export interface ErrorMatriz {
  mensaje?: string;
}

// GET /imagenes/{id_imagen}/matriz — temperaturas (°C) por píxel, float32, fila por fila.
export const obtenerMatrizTermica = async (idBackend: number): Promise<Float32Array> => {
  const respuesta = await fetch(`${API_BASE_URL}/api/v1/imagenes/${idBackend}/matriz`);

  if (!respuesta.ok) {
    const error: ErrorMatriz = { mensaje: 'No se pudo obtener la matriz de temperaturas' };
    throw error;
  }

  return new Float32Array(await respuesta.arrayBuffer());
};