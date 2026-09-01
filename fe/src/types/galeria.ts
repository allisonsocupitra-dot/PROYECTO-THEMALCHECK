export type UnidadTemperatura = 'C' | 'F';

// Parámetros de captura térmica (distancia, humedad, emisividad, temp. reflejada).
// El backend de análisis todavía no los calcula: quedan opcionales y se muestran
// como "—" hasta que ese servicio quede integrado.
export interface ParametrosTermicos {
  distancia?: string;
  humedad?: string;
  emisividad?: string;
  temperaturaReflejada?: string;
}

// Metadatos EXIF / de cámara de la imagen. Igual que arriba: opcionales,
// se completan cuando el backend de análisis quede conectado.
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
