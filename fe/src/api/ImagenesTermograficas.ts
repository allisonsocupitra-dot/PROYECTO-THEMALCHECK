import type { ParametrosTermicos, InfoImagen, PuntoMedicionGuardado } from '../types/galeria';
import { API_BASE_URL } from './Config';

export interface ErrorImagen {
  mensaje?: string;
}

// Forma cruda que devuelve el backend (ImagenTermograficaOut).
interface PuntoMedicionCrudo {
  id_punto?: number;
  etiqueta: string;
  tipo?: string | null;
  valor_temp?: number | null;
  valor_min?: number | null;
  valor_avg?: number | null;
  valor_max?: number | null;
  pos_min_x?: number | null;
  pos_min_y?: number | null;
  pos_max_x?: number | null;
  pos_max_y?: number | null;
  x?: number | null;
  y?: number | null;
  x1?: number | null;
  y1?: number | null;
  x2?: number | null;
  y2?: number | null;
  color?: string | null;
}

interface ImagenTermograficaOutCruda {
  id_imagen: number;
  // El schema del backend expone temp_min / temp_max; se aceptan ambos nombres.
  temp_min?: number | null;
  temp_max?: number | null;
  temperatura_min?: number | null;
  temperatura_max?: number | null;
  distancia_m?: number | null;
  humedad?: number | null;
  emisividad?: number | null;
  temp_reflejada?: number | null;
  modelo_camara?: string | null;
  numero_serie?: string | null;
  distancia_focal?: string | number | null;
  apertura?: string | null;
  ancho?: number | null;
  alto?: number | null;
  fecha_modificacion?: string | null;
  coordenadas?: string | null;
  observaciones?: string | null;
  puntos_medicion?: PuntoMedicionCrudo[];
}

export interface ImagenAnalizada {
  idBackend: number;
  temperaturaMin: number | null;
  temperaturaMax: number | null;
  parametros: ParametrosTermicos;
  infoImagen: InfoImagen;
  puntos: PuntoMedicionGuardado[];
  observaciones: string;
}

const mapearPunto = (p: PuntoMedicionCrudo): PuntoMedicionGuardado => ({
  id: p.id_punto,
  etiqueta: p.etiqueta,
  tipo: p.tipo === 'region' ? 'region' : 'punto',
  valorTemp: p.valor_temp ?? 0,
  valorMin: p.valor_min ?? null,
  valorAvg: p.valor_avg ?? null,
  valorMax: p.valor_max ?? null,
  posMin: p.pos_min_x != null && p.pos_min_y != null ? { x: p.pos_min_x, y: p.pos_min_y } : null,
  posMax: p.pos_max_x != null && p.pos_max_y != null ? { x: p.pos_max_x, y: p.pos_max_y } : null,
  x: p.x ?? null,
  y: p.y ?? null,
  x1: p.x1 ?? null,
  y1: p.y1 ?? null,
  x2: p.x2 ?? null,
  y2: p.y2 ?? null,
  color: p.color ?? null,
});

const mapearImagenCruda = (datos: ImagenTermograficaOutCruda): ImagenAnalizada => ({
  idBackend: datos.id_imagen,
  temperaturaMin: datos.temperatura_min ?? datos.temp_min ?? null,
  temperaturaMax: datos.temperatura_max ?? datos.temp_max ?? null,
  parametros: {
    distancia: datos.distancia_m != null ? String(datos.distancia_m) : undefined,
    humedad: datos.humedad != null ? String(datos.humedad) : undefined,
    emisividad: datos.emisividad != null ? String(datos.emisividad) : undefined,
    temperaturaReflejada: datos.temp_reflejada != null ? String(datos.temp_reflejada) : undefined,
  },
  infoImagen: {
    modelo: datos.modelo_camara ?? undefined,
    numeroSerie: datos.numero_serie ?? undefined,
    distanciaFocal: datos.distancia_focal != null ? String(datos.distancia_focal) : undefined,
    apertura: datos.apertura ?? undefined,
    ancho: datos.ancho ?? undefined,
    alto: datos.alto ?? undefined,
    modificado: datos.fecha_modificacion ?? undefined,
    coordenadas: datos.coordenadas ?? undefined,
  },
  puntos: (datos.puntos_medicion ?? []).map(mapearPunto),
  observaciones: datos.observaciones ?? '',
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
  // 'punto' (por defecto) o 'region' (rectángulo / círculo).
  tipo?: 'punto' | 'region';
  valorTemp: number;
  // Coordenadas en píxeles sobre la imagen ORIGINAL (no el % de pantalla).
  // Para un punto: x, y. Para una región: x1, y1 (esquina superior izquierda)
  // y x2, y2 (esquina inferior derecha). Si vienen, el backend recalcula la
  // temperatura real con la matriz DJI.
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  color?: string | null;
}

const serializarPunto = (p: PuntoAGuardar) => ({
  etiqueta: p.etiqueta,
  tipo: p.tipo ?? 'punto',
  valor_temp: p.valorTemp,
  x: p.x ?? null,
  y: p.y ?? null,
  x1: p.x1 ?? null,
  y1: p.y1 ?? null,
  x2: p.x2 ?? null,
  y2: p.y2 ?? null,
  color: p.color ?? null,
});

// PUT /imagenes/{id_imagen}/puntos — reemplaza todos los puntos de medición
// (puntos y regiones) de la imagen. Siempre hay que mandar la lista completa.
// Si se envían observaciones, también se guardan en la imagen.
export const guardarPuntosMedicion = async (
  idBackend: number,
  puntos: PuntoAGuardar[],
  observaciones?: string
): Promise<ImagenAnalizada> => {
  const respuesta = await fetch(`${API_BASE_URL}/api/v1/imagenes/${idBackend}/puntos`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      puntos: puntos.map(serializarPunto),
      ...(observaciones !== undefined && { observaciones }),
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
    body: JSON.stringify({ puntos: puntos.map(serializarPunto) }),
  });

  if (!respuesta.ok) {
    const error: ErrorImagen = { mensaje: 'No se pudo generar el PDF' };
    throw error;
  }

  return respuesta.blob();
};

// GET /imagenes/{id_imagen}/paleta?nombre=... — devuelve la imagen térmica re-pintada
// con la paleta elegida (white_hot, fulgurite, hot_iron...). Se descarga como blob y se
// devuelve una URL local, así el canvas de exportación no queda "contaminado" por venir
// de otro origen (localhost:8000 vs localhost:5173).
export const obtenerImagenConPaleta = async (idBackend: number, paleta: string): Promise<string> => {
  const respuesta = await fetch(
    `${API_BASE_URL}/api/v1/imagenes/${idBackend}/paleta?nombre=${encodeURIComponent(paleta)}`
  );

  if (!respuesta.ok) {
    const error: ErrorImagen = { mensaje: 'No se pudo aplicar la paleta' };
    throw error;
  }

  return URL.createObjectURL(await respuesta.blob());
};