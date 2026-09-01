import type { Carpeta, ImagenCargada } from '../types/galeria';

// Busca una carpeta por id en todo el árbol (no solo en el primer nivel)
export const buscarCarpetaPorId = (lista: Carpeta[], id: string): Carpeta | undefined => {
  for (const carpeta of lista) {
    if (carpeta.id === id) return carpeta;
    const enHijos = buscarCarpetaPorId(carpeta.subcarpetas, id);
    if (enHijos) return enHijos;
  }
  return undefined;
};

// Busca una carpeta siguiendo una ruta de nombres (ej: ["PUNTOS_CALIENTES","nodo_230"])
export const buscarCarpetaPorRuta = (lista: Carpeta[], segmentos: string[]): Carpeta | undefined => {
  let nivel = lista;
  let nodo: Carpeta | undefined;
  for (const segmento of segmentos) {
    nodo = nivel.find((c) => c.nombre === segmento);
    if (!nodo) return undefined;
    nivel = nodo.subcarpetas;
  }
  return nodo;
};

// Inserta un lote de archivos en la ruta de carpetas indicada, creando las
// carpetas intermedias que hagan falta y reutilizando las que ya existan
// (mismo nombre en el mismo nivel).
export const insertarEnArbol = (
  nodos: Carpeta[],
  segmentos: string[],
  archivosImg: ImagenCargada[]
): Carpeta[] => {
  const [actual, ...resto] = segmentos;
  const idx = nodos.findIndex((n) => n.nombre === actual);

  if (idx === -1) {
    const nueva: Carpeta = {
      id: `carpeta-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      nombre: actual,
      parentId: null,
      imagenes: resto.length === 0 ? archivosImg : [],
      subcarpetas: resto.length === 0 ? [] : insertarEnArbol([], resto, archivosImg),
    };
    return [...nodos, nueva];
  }

  const copia = [...nodos];
  const existente = copia[idx];

  if (resto.length === 0) {
    copia[idx] = { ...existente, imagenes: [...archivosImg, ...existente.imagenes] };
  } else {
    copia[idx] = { ...existente, subcarpetas: insertarEnArbol(existente.subcarpetas, resto, archivosImg) };
  }

  return copia;
};

// Devuelve la ruta de nombres (desde la raíz) hasta la carpeta con ese id,
// para mostrar breadcrumbs como "PUNTOS_CALIENTES / nodo_230".
export const buscarRutaCarpeta = (lista: Carpeta[], id: string, ruta: string[] = []): string[] | null => {
  for (const carpeta of lista) {
    const rutaActual = [...ruta, carpeta.nombre];
    if (carpeta.id === id) return rutaActual;
    const enHijos = buscarRutaCarpeta(carpeta.subcarpetas, id, rutaActual);
    if (enHijos) return enHijos;
  }
  return null;
};

// Devuelve los ids de todos los ancestros (sin incluir el propio id) de una carpeta
export const buscarAncestros = (lista: Carpeta[], id: string, ancestros: string[] = []): string[] | null => {
  for (const carpeta of lista) {
    if (carpeta.id === id) return ancestros;
    const enHijos = buscarAncestros(carpeta.subcarpetas, id, [...ancestros, carpeta.id]);
    if (enHijos) return enHijos;
  }
  return null;
};

// Elimina una carpeta (en cualquier nivel) y devuelve tanto el árbol resultante
// como el nodo eliminado (para poder liberar sus URLs de vista previa).
export const eliminarDeArbol = (
  lista: Carpeta[],
  id: string
): { lista: Carpeta[]; eliminada: Carpeta | null } => {
  let eliminada: Carpeta | null = null;

  const filtrada = lista.filter((c) => {
    if (c.id === id) {
      eliminada = c;
      return false;
    }
    return true;
  });

  if (eliminada) return { lista: filtrada, eliminada };

  const nueva = lista.map((c) => {
    const resultado = eliminarDeArbol(c.subcarpetas, id);
    if (resultado.eliminada) {
      eliminada = resultado.eliminada;
      return { ...c, subcarpetas: resultado.lista };
    }
    return c;
  });

  return { lista: nueva, eliminada };
};

export const revocarUrlsRecursivo = (carpeta: Carpeta) => {
  carpeta.imagenes.forEach((img) => URL.revokeObjectURL(img.urlPrevia));
  carpeta.subcarpetas.forEach(revocarUrlsRecursivo);
};

// Elimina imágenes puntuales dentro de una carpeta específica del árbol
export const eliminarImagenesDeArbol = (
  lista: Carpeta[],
  carpetaId: string,
  idsAEliminar: Set<string>
): Carpeta[] =>
  lista.map((c) => {
    if (c.id === carpetaId) {
      c.imagenes.forEach((img) => {
        if (idsAEliminar.has(img.id)) URL.revokeObjectURL(img.urlPrevia);
      });
      return { ...c, imagenes: c.imagenes.filter((img) => !idsAEliminar.has(img.id)) };
    }
    return { ...c, subcarpetas: eliminarImagenesDeArbol(c.subcarpetas, carpetaId, idsAEliminar) };
  });

export interface ImagenConRuta extends ImagenCargada {
  carpetaId: string;
  carpeta: string; // nombre de la carpeta directa que la contiene
  rutaCompleta: string; // ej: "PUNTOS_CALIENTES / nodo_230"
}

// Aplana todo el árbol en una sola lista de imágenes, conservando de qué
// carpeta (y con qué ruta completa) viene cada una.
export const aplanarImagenes = (lista: Carpeta[], rutaPadres: string[] = []): ImagenConRuta[] =>
  lista.flatMap((c) => {
    const ruta = [...rutaPadres, c.nombre];
    const propias: ImagenConRuta[] = c.imagenes.map((img) => ({
      ...img,
      carpetaId: c.id,
      carpeta: c.nombre,
      rutaCompleta: ruta.join(' / '),
    }));
    return [...propias, ...aplanarImagenes(c.subcarpetas, ruta)];
  });
