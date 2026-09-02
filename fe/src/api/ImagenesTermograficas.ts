import type { ParametrosTermicos, InfoImagen, PuntoMedicionGuardado } from '../types/galeria';
import { API_BASE_URL } from './Config';
 
export interface ErrorImagen {
  mensaje?: string;
}
 
// Forma cruda que devuelve el backend (ImagenTermograficaOut). Se asume que
// expone estos nombres de columna; ajusta aquí si tu schema real difiere.
interface ImagenTermograficaOutCruda {
  id_imagen: number;
  temperatura_min?: number | null;
  temperatura_max?: number | null;
  distancia_m?: number | null;
  humedad?: number | null;
  emisividad?: number | null;
  temp_reflejada?: number | null;
  modelo_camara?: string | null;
  numero_serie?: string | null;
  distancia_focal?: string | null;
  apertura?: string | null;
  ancho?: number | null;
  alto?: number | null;
  fecha_modificacion?: string | null;
  coordenadas?: string | null;
  puntos_medicion?: Array<{ id_punto?: number; etiqueta: string; valor_temp: number }>;
}
 
export interface ImagenAnalizada {
  idBackend: number;
  temperaturaMin: number | null;
  temperaturaMax: number | null;
  parametros: ParametrosTermicos;
  infoImagen: InfoImagen;
  puntos: PuntoMedicionGuardado[];
}
 
const mapearImagenCruda = (datos: ImagenTermograficaOutCruda): ImagenAnalizada => ({
  idBackend: datos.id_imagen,
  temperaturaMin: datos.temperatura_min ?? null,
  temperaturaMax: datos.temperatura_max ?? null,
  parametros: {
    distancia: datos.distancia_m != null ? String(datos.distancia_m) : undefined,
    humedad: datos.humedad != null ? String(datos.humedad) : undefined,
    emisividad: datos.emisividad != null ? String(datos.emisividad) : undefined,
    temperaturaReflejada: datos.temp_reflejada != null ? String(datos.temp_reflejada) : undefined,
  },
  infoImagen: {
    modelo: datos.modelo_camara ?? undefined,
    numeroSerie: datos.numero_serie ?? undefined,
    distanciaFocal: datos.distancia_focal ?? undefined,
    apertura: datos.apertura ?? undefined,
    ancho: datos.ancho ?? undefined,
    alto: datos.alto ?? undefined,
    modificado: datos.fecha_modificacion ?? undefined,
    coordenadas: datos.coordenadas ?? undefined,
  },
  puntos: (datos.puntos_medicion ?? []).map((p) => ({
    id: p.id_punto,
    etiqueta: p.etiqueta,
    valorTemp: p.valor_temp,
  })),
});
 
// POST /imagenes/upload — sube el archivo físico y devuelve el análisis inicial
// (propiedades extraídas automáticamente por el backend).
export const subirImagenTermografica = async (archivo: File): Promise<ImagenAnalizada> => {
  const formData = new FormData();
  formData.append('archivo', archivo);
 
  const respuesta = await fetch(`${API_BASE_URL}/api/v1/imagenes/upload`, {
    method: 'POST',
    body: formData,
  });
 
  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => null);
    const error: ErrorImagen = { mensaje: cuerpo?.detail ?? 'No se pudo subir la imagen' };
    throw error;
  }
 
  const datos: ImagenTermograficaOutCruda = await respuesta.json();
  return mapearImagenCruda(datos);
};
 
// GET /imagenes/{id_imagen} — trae el registro actual (por si se necesita refrescar).
export const obtenerImagenTermografica = async (idBackend: number): Promise<ImagenAnalizada> => {
  const respuesta = await fetch(`${API_BASE_URL}/api/v1/imagenes/${idBackend}`);
 
  if (!respuesta.ok) {
    const error: ErrorImagen = { mensaje: 'No se pudo cargar la imagen' };
    throw error;
  }
 
  const datos: ImagenTermograficaOutCruda = await respuesta.json();
  return mapearImagenCruda(datos);
};
 
// PUT /imagenes/{id_imagen}/parametros — ajusta la Temperatura Reflejada (con
// los botones +/- del panel PARÁMETROS) y trae de vuelta temp_max/temp_min
// recalculados según el nuevo entorno de la imagen.
export const actualizarTemperaturaReflejada = async (
  idBackend: number,
  tempReflejada: number
): Promise<ImagenAnalizada> => {
  const respuesta = await fetch(`${API_BASE_URL}/api/v1/imagenes/${idBackend}/parametros`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ temp_reflejada: tempReflejada }),
  });
 
  if (!respuesta.ok) {
    const error: ErrorImagen = { mensaje: 'No se pudo actualizar la temperatura reflejada' };
    throw error;
  }
 
  const datos: ImagenTermograficaOutCruda = await respuesta.json();
  return mapearImagenCruda(datos);
};
 
export interface PuntoAGuardar {
  etiqueta: string;
  valorTemp: number;
  // Coordenadas en píxeles sobre la imagen ORIGINAL (no el % de pantalla).
  // Si vienen, el backend recalcula la temperatura real con la matriz DJI.
  x?: number;
  y?: number;
}
 
// PUT /imagenes/{id_imagen}/puntos — reemplaza todos los puntos de medición.
export const guardarPuntosMedicion = async (
  idBackend: number,
  puntos: PuntoAGuardar[]
): Promise<ImagenAnalizada> => {
  const respuesta = await fetch(`${API_BASE_URL}/api/v1/imagenes/${idBackend}/puntos`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      puntos: puntos.map((p) => ({
        etiqueta: p.etiqueta,
        valor_temp: p.valorTemp,
        x: p.x ?? null,
        y: p.y ?? null,
      })),
    }),
  });
 
  if (!respuesta.ok) {
    const error: ErrorImagen = { mensaje: 'No se pudieron guardar los puntos de medición' };
    throw error;
  }
 
  const datos: ImagenTermograficaOutCruda = await respuesta.json();
  return mapearImagenCruda(datos);
};
 
// POST /imagenes/{id_imagen}/exportar-pdf — guarda los puntos actuales y descarga el PDF.
export const exportarPdfInforme = async (idBackend: number, puntos: PuntoAGuardar[]): Promise<Blob> => {
  const respuesta = await fetch(`${API_BASE_URL}/api/v1/imagenes/${idBackend}/exportar-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      puntos: puntos.map((p) => ({
        etiqueta: p.etiqueta,
        valor_temp: p.valorTemp,
        x: p.x ?? null,
        y: p.y ?? null,
      })),
    }),
  });
 
  if (!respuesta.ok) {
    const error: ErrorImagen = { mensaje: 'No se pudo generar el PDF' };
    throw error;
  }
 
  return respuesta.blob();
};
 