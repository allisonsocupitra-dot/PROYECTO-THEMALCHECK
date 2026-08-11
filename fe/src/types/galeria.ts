export interface ImagenCargada {
  id: string;
  archivo: File;
  urlPrevia: string;
  fecha: string;
  temperaturaMax: number;
  temperaturaMin: number;
}

export interface Carpeta {
  id: string;
  nombre: string;
  imagenes: ImagenCargada[];
}