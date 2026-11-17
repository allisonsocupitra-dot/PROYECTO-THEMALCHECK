export type UnidadTemperatura = 'C' | 'F';

// Parámetros de captura térmica (distancia, humedad, emisividad, temp. reflejada).
// Vienen del backend (imagen_termografica) una vez la imagen fue subida y analizada.
export interface ParametrosTermicos {
  distancia?: string;
  humedad?: string;
  emisividad?: string;
  temperaturaReflejada?: string;
}

// Metadatos EXIF / de cámara de la imagen. Vienen del backend igual que arriba.
export interface InfoImagen {
  modelo?: string;
  numeroSerie?: string;
  distanciaFocal?: string;
  apertura?: string;
  ancho?: number;
  alto?: number;
  modificado?: string;
  coordenadas?: string;
}

// Posición de un píxel sobre la imagen ORIGINAL (no en % de pantalla).
export interface PosicionPixel {
  x: number;
  y: number;
}

// Punto de medición ya guardado en el backend (tabla punto_medicion).
// tipo 'punto' → usa valorTemp y las coordenadas x, y.
// tipo 'region' (rectángulo o círculo) → usa valorMin / valorAvg / valorMax, la caja
// x1, y1, x2, y2 y las posiciones del píxel más frío (posMin) y más caliente (posMax).
// La etiqueta distingue la figura: SP# punto, R# rectángulo, C# círculo.
export interface PuntoMedicionGuardado {
  id?: number;
  etiqueta: string;
  tipo?: 'punto' | 'region';
  valorTemp: number;
  valorMin?: number | null;
  valorAvg?: number | null;
  valorMax?: number | null;
  posMin?: PosicionPixel | null;
  posMax?: PosicionPixel | null;
  x?: number | null;
  y?: number | null;
  x1?: number | null;
  y1?: number | null;
  x2?: number | null;
  y2?: number | null;
  color?: string | null;
}

export interface ImagenCargada {
  id: string;
  archivo: File;
  urlPrevia: string;
  fecha: string;
  temperaturaMax: number;
  temperaturaMin: number;
  unidadOrigen?: UnidadTemperatura;
  parametros?: ParametrosTermicos;
  infoImagen?: InfoImagen;
  // Id numérico real en la BD (tabla imagen_termografica). Se obtiene al subir
  // el archivo a POST /imagenes/upload. Mientras la subida está en curso vale
  // undefined; si la subida falla, queda null y el visor debe avisar al usuario.
  idBackend?: number | null;
  subiendo?: boolean;
  errorSubida?: string;
  puntos?: PuntoMedicionGuardado[];
  // Notas de la imagen (tabla clave/valor serializada como JSON en la BD).
  observaciones?: string;
}

export interface Carpeta {
  id: string;
  nombre: string;
  imagenes: ImagenCargada[];
  // Soporte de árbol: una carpeta puede contener otras carpetas (por ejemplo,
  // al subir una carpeta del sistema operativo que trae subcarpetas adentro).
  subcarpetas: Carpeta[];
  parentId?: string | null;
}