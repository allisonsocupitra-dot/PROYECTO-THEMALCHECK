import { API_BASE_URL } from './Config';
import type { ImagenCargada } from '../types/galeria';
import { mapearImagenCruda } from './ImagenesTermograficas';
import type { ImagenTermograficaOutCruda } from './ImagenesTermograficas';

export interface ImagenRestaurada {
  carpeta: string;
  imagen: ImagenCargada;
}

export async function listarImagenesDeUsuario(idUsuario: number | string): Promise<ImagenRestaurada[]> {
  const resp = await fetch(`${API_BASE_URL}/api/v1/imagenes/usuario/${idUsuario}`);
  if (!resp.ok) throw new Error('No se pudo cargar la galería');
  const items: ImagenTermograficaOutCruda[] = await resp.json();

  const restauradas = await Promise.all(
    items.map(async (item): Promise<ImagenRestaurada | null> => {
      try {
        if (!item.ruta_archivo) return null;
        const analizada = mapearImagenCruda(item);

        // Se descarga el archivo guardado para recrear el File que usa el visor
        const ruta = String(item.ruta_archivo).replace(/\\/g, '/').replace(/^\/+/, '');
        const blobResp = await fetch(`${API_BASE_URL}/${ruta}`);
        if (!blobResp.ok) return null;

        const blob = await blobResp.blob();
        const nombre = item.nombre_archivo ?? 'imagen.jpg';
        const archivo = new File([blob], nombre, { type: blob.type || 'image/jpeg' });

        return {
          carpeta: item.carpeta ?? 'General',
          imagen: {
            id: `bd-${analizada.idBackend}`,
            archivo,
            urlPrevia: URL.createObjectURL(archivo),
            fecha: item.fecha_modificacion ?? new Date().toISOString(),
            temperaturaMin: analizada.temperaturaMin ?? 0,
            temperaturaMax: analizada.temperaturaMax ?? 0,
            unidadOrigen: 'C',
            parametros: analizada.parametros,
            infoImagen: analizada.infoImagen,
            idBackend: analizada.idBackend,
            subiendo: false,
            errorSubida: undefined,
            puntos: analizada.puntos,
            observaciones: analizada.observaciones,
          },
        };
      } catch {
        return null;
      }
    })
  );

  return restauradas.filter((r): r is ImagenRestaurada => r !== null);
}

export async function eliminarImagenTermografica(idBackend: number): Promise<void> {
  await fetch(`${API_BASE_URL}/api/v1/imagenes/${idBackend}`, { method: 'DELETE' });
}