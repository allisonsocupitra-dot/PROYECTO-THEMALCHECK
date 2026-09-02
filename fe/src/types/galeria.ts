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
 
// Punto de medición ya guardado en el backend (tabla punto_medicion).
export interface PuntoMedicionGuardado {
  id?: number;
  etiqueta: string;
  valorTemp: number;
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
 