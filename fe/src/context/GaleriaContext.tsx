import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Carpeta, ImagenCargada } from '../types/galeria';
import { normalizarRangoTermico } from '../utils/temperaturas';
import {
  buscarCarpetaPorId,
  buscarCarpetaPorRuta,
  eliminarDeArbol,
  eliminarImagenesDeArbol,
  insertarEnArbol,
  revocarUrlsRecursivo,
} from '../utils/arbolCarpetas';
import { useAuth } from './AuthContext';
import {
  subirImagenTermografica,
  actualizarTemperaturaReflejada as actualizarTemperaturaReflejadaEnBackend,
} from '../api/ImagenesTermograficas';
import type { ErrorImagen } from '../api/ImagenesTermograficas';
import { listarImagenesDeUsuario, eliminarImagenTermografica } from '../api/GaleriaGuardada';
import type { ImagenRestaurada } from '../api/GaleriaGuardada';

export interface ReporteGenerado {
  id: string;
  nombreImagen: string;
  carpeta: string;
  formato: 'PDF' | 'DOC';
  fecha: string;
}

interface GaleriaContextType {
  carpetas: Carpeta[];
  carpetaActivaId: string;
  imagenSeleccionadaId: string | null;
  reportes: ReporteGenerado[];
  crearCarpeta: (nombre: string) => string;
  seleccionarCarpeta: (id: string) => void;
  agregarImagenes: (carpetaId: string, archivos: File[]) => void;
  cargarCarpetaDesdeArchivos: (archivos: File[], nombrePorDefecto: string) => string;
  seleccionarImagen: (id: string) => void;
  eliminarImagenes: (carpetaId: string, imagenIds: string[]) => void;
  eliminarCarpeta: (carpetaId: string) => void;
  obtenerCarpeta: (id: string) => Carpeta | undefined;
  registrarReporte: (nombreImagen: string, carpeta: string, formato: 'PDF' | 'DOC') => void;
  actualizarTemperaturaReflejada: (imagen: ImagenCargada, valor: number) => void;
  actualizarImagen: (imagenId: string, cambios: Partial<ImagenCargada>) => void;
}

const GaleriaContext = createContext<GaleriaContextType | undefined>(undefined);

const generarTemperaturasProvisionales = () => {
  const temperaturaMinOriginal = 12.2;
  const temperaturaMaxOriginal = 69.3;

  return normalizarRangoTermico({
    temperaturaMin: temperaturaMinOriginal,
    temperaturaMax: temperaturaMaxOriginal,
    unidadOrigen: 'F',
  });
};

const CARPETA_INICIAL: Carpeta = { id: 'general', nombre: 'General', imagenes: [], subcarpetas: [], parentId: null };

const crearImagenesDesdeArchivos = (archivos: File[]): ImagenCargada[] =>
  archivos.map((archivo) => {
    const { temperaturaMin, temperaturaMax } = generarTemperaturasProvisionales();
    return {
      id: `${archivo.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      archivo,
      urlPrevia: URL.createObjectURL(archivo),
      fecha: new Date().toISOString(),
      temperaturaMin,
      temperaturaMax,
      unidadOrigen: 'C',
      parametros: {},
      infoImagen: {},
      idBackend: undefined,
      subiendo: true,
      errorSubida: undefined,
      puntos: [],
      observaciones: '',
    };
  });

// Ruta de nombres de una carpeta dentro del árbol (["Torre A", "Piso 2"])
const rutaDeCarpeta = (lista: Carpeta[], id: string, acc: string[] = []): string[] | null => {
  for (const c of lista) {
    const ruta = [...acc, c.nombre];
    if (c.id === id) return ruta;
    const enHijas = rutaDeCarpeta(c.subcarpetas, id, ruta);
    if (enHijas) return enHijas;
  }
  return null;
};

// Todas las imágenes de una carpeta y sus subcarpetas
const recolectarImagenes = (c: Carpeta): ImagenCargada[] => [
  ...c.imagenes,
  ...c.subcarpetas.flatMap(recolectarImagenes),
];

// CORREGIDO: reconstruye el árbol de carpetas a partir de lo guardado en la BD
const reconstruirArbol = (restauradas: ImagenRestaurada[]): Carpeta[] => {
  const raiz: Carpeta[] = [{ ...CARPETA_INICIAL, imagenes: [], subcarpetas: [] }];

  restauradas.forEach(({ carpeta, imagen }) => {
    const segmentos = carpeta.split('/').filter(Boolean);
    const ruta: string[] = segmentos.length > 0 ? segmentos : ['General'];

    let nivel: Carpeta[] = raiz;
    let parentId: string | null = null;
    let destino: Carpeta | null = null;
    const acumulado: string[] = [];

    for (const nombre of ruta) {
      acumulado.push(nombre);

      let hallada: Carpeta | undefined = nivel.find((c: Carpeta) => c.nombre === nombre);
      if (!hallada) {
        const nueva: Carpeta = {
          id: `carpeta-bd-${acumulado.join('/')}`,
          nombre,
          imagenes: [],
          subcarpetas: [],
          parentId,
        };
        nivel.push(nueva);
        hallada = nueva;
      }

      destino = hallada;
      parentId = hallada.id;
      nivel = hallada.subcarpetas;
    }

    if (destino) destino.imagenes.push(imagen);
  });

  return raiz;
};

export const GaleriaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { usuario } = useAuth();
  const [carpetas, setCarpetas] = useState<Carpeta[]>([CARPETA_INICIAL]);
  const [carpetaActivaId, setCarpetaActivaId] = useState<string>('general');
  const [imagenSeleccionadaId, setImagenSeleccionadaId] = useState<string | null>(null);
  const [reportes, setReportes] = useState<ReporteGenerado[]>([]);

  // Al cambiar de usuario limpia el estado y RESTAURA la galería desde el backend
  useEffect(() => {
    let cancelado = false;

    setCarpetas([CARPETA_INICIAL]);
    setCarpetaActivaId('general');
    setImagenSeleccionadaId(null);
    setReportes([]);

    if (!usuario) return;

    listarImagenesDeUsuario(usuario.id)
      .then((restauradas) => {
        if (cancelado || restauradas.length === 0) return;
        setCarpetas(reconstruirArbol(restauradas));
      })
      .catch(() => {
        // Si falla la carga, queda la galería vacía (se puede volver a intentar al recargar).
      });

    return () => {
      cancelado = true;
    };
  }, [usuario?.id]);

  const actualizarImagenEnArbol = (
    lista: Carpeta[],
    imagenId: string,
    cambios: Partial<ImagenCargada>
  ): Carpeta[] =>
    lista.map((c) => ({
      ...c,
      imagenes: c.imagenes.map((img) => (img.id === imagenId ? { ...img, ...cambios } : img)),
      subcarpetas: actualizarImagenEnArbol(c.subcarpetas, imagenId, cambios),
    }));

  const actualizarImagen = (imagenId: string, cambios: Partial<ImagenCargada>) => {
    setCarpetas((prev) => actualizarImagenEnArbol(prev, imagenId, cambios));
  };

  // Recibe la ruta de carpeta y la manda al backend junto con el usuario
  const subirImagenesAlBackend = (imagenes: ImagenCargada[], carpetaRuta: string) => {
    imagenes.forEach((imagen) => {
      subirImagenTermografica(imagen.archivo, usuario?.id, carpetaRuta)
        .then((analizada) => {
          setCarpetas((prev) =>
            actualizarImagenEnArbol(prev, imagen.id, {
              idBackend: analizada.idBackend,
              subiendo: false,
              errorSubida: undefined,
              temperaturaMin: analizada.temperaturaMin ?? imagen.temperaturaMin,
              temperaturaMax: analizada.temperaturaMax ?? imagen.temperaturaMax,
              parametros: analizada.parametros,
              infoImagen: analizada.infoImagen,
              puntos: analizada.puntos,
              observaciones: analizada.observaciones,
            })
          );
        })
        .catch((err: ErrorImagen) => {
          setCarpetas((prev) =>
            actualizarImagenEnArbol(prev, imagen.id, {
              idBackend: null,
              subiendo: false,
              errorSubida: err?.mensaje ?? 'No se pudo subir la imagen',
            })
          );
        });
    });
  };

  const actualizarTemperaturaReflejada = (imagen: ImagenCargada, valor: number) => {
    setCarpetas((prev) =>
      actualizarImagenEnArbol(prev, imagen.id, {
        parametros: { ...imagen.parametros, temperaturaReflejada: String(valor) },
      })
    );

    if (!imagen.idBackend) return;

    actualizarTemperaturaReflejadaEnBackend(imagen.idBackend, valor)
      .then((analizada) => {
        setCarpetas((prev) =>
          actualizarImagenEnArbol(prev, imagen.id, {
            temperaturaMin: analizada.temperaturaMin ?? imagen.temperaturaMin,
            temperaturaMax: analizada.temperaturaMax ?? imagen.temperaturaMax,
            parametros: analizada.parametros,
            infoImagen: analizada.infoImagen,
            puntos: analizada.puntos,
          })
        );
      })
      .catch(() => {
        // Si falla, se deja el valor optimista.
      });
  };

  const crearCarpeta = (nombre: string): string => {
    const nombreLimpio = nombre.trim() || 'Nueva carpeta';

    const nueva: Carpeta = {
      id: `carpeta-${Date.now()}`,
      nombre: nombreLimpio,
      imagenes: [],
      subcarpetas: [],
      parentId: null,
    };

    setCarpetas((prev) => [...prev, nueva]);
    setCarpetaActivaId(nueva.id);
    return nueva.id;
  };

  const seleccionarCarpeta = (id: string) => setCarpetaActivaId(id);

  const insertarEnArbolPorId = (lista: Carpeta[], carpetaId: string, imagenes: ImagenCargada[]): Carpeta[] =>
    lista.map((c) => {
      if (c.id === carpetaId) return { ...c, imagenes: [...imagenes, ...c.imagenes] };
      return { ...c, subcarpetas: insertarEnArbolPorId(c.subcarpetas, carpetaId, imagenes) };
    });

  const agregarImagenes = (carpetaId: string, archivos: File[]) => {
    const nuevasImagenes = crearImagenesDesdeArchivos(archivos);
    setCarpetas((prev) => insertarEnArbolPorId(prev, carpetaId, nuevasImagenes));
    // Se guarda en qué carpeta quedó
    const carpetaRuta = (rutaDeCarpeta(carpetas, carpetaId) ?? ['General']).join('/');
    subirImagenesAlBackend(nuevasImagenes, carpetaRuta);
  };

  const cargarCarpetaDesdeArchivos = (archivos: File[], nombrePorDefecto: string): string => {
    const validos = archivos.filter((a) => a.type.startsWith('image/'));
    if (validos.length === 0) return carpetaActivaId;

    const grupos = new Map<string, File[]>();
    validos.forEach((archivo) => {
      const rel = (archivo as File & { webkitRelativePath?: string }).webkitRelativePath;
      const partes = rel ? rel.split('/').filter(Boolean) : [];
      const segmentosCarpeta = partes.slice(0, -1);
      const ruta = segmentosCarpeta.length > 0 ? segmentosCarpeta.join('/') : `__raiz__/${nombrePorDefecto}`;
      const lista = grupos.get(ruta) ?? [];
      lista.push(archivo);
      grupos.set(ruta, lista);
    });

    let arbolNuevo = carpetas;
    let idSeleccion = carpetaActivaId;

    grupos.forEach((archivosGrupo, ruta) => {
      const segmentos = ruta.startsWith('__raiz__/') ? [ruta.replace('__raiz__/', '')] : ruta.split('/');
      const imagenesGrupo = crearImagenesDesdeArchivos(archivosGrupo);
      arbolNuevo = insertarEnArbol(arbolNuevo, segmentos, imagenesGrupo);

      const hoja = buscarCarpetaPorRuta(arbolNuevo, segmentos);
      if (hoja) idSeleccion = hoja.id;

      // Cada grupo se sube con su propia ruta de carpeta
      subirImagenesAlBackend(imagenesGrupo, segmentos.join('/'));
    });

    setCarpetas(arbolNuevo);
    setCarpetaActivaId(idSeleccion);
    return idSeleccion;
  };

  const seleccionarImagen = (id: string) => setImagenSeleccionadaId(id);

  const eliminarImagenes = (carpetaId: string, imagenIds: string[]) => {
    const idsAEliminar = new Set(imagenIds);

    // Borrar también en el servidor
    const carpeta = buscarCarpetaPorId(carpetas, carpetaId);
    carpeta?.imagenes
      .filter((img) => idsAEliminar.has(img.id) && img.idBackend)
      .forEach((img) => {
        eliminarImagenTermografica(img.idBackend as number).catch(() => {});
      });

    setCarpetas((prev) => eliminarImagenesDeArbol(prev, carpetaId, idsAEliminar));

    if (imagenSeleccionadaId && idsAEliminar.has(imagenSeleccionadaId)) {
      setImagenSeleccionadaId(null);
    }
  };

  const eliminarCarpeta = (carpetaId: string) => {
    // Borrar en el servidor todas las imágenes de la carpeta y sus subcarpetas
    const carpeta = buscarCarpetaPorId(carpetas, carpetaId);
    if (carpeta) {
      recolectarImagenes(carpeta)
        .filter((img) => img.idBackend)
        .forEach((img) => {
          eliminarImagenTermografica(img.idBackend as number).catch(() => {});
        });
    }

    setCarpetas((prev) => {
      const { lista, eliminada } = eliminarDeArbol(prev, carpetaId);
      if (eliminada) revocarUrlsRecursivo(eliminada);

      if (lista.length === 0) {
        setCarpetaActivaId(CARPETA_INICIAL.id);
        return [{ ...CARPETA_INICIAL, imagenes: [], subcarpetas: [] }];
      }

      if (!buscarCarpetaPorId(lista, carpetaActivaId)) {
        setCarpetaActivaId(lista[0].id);
      }

      return lista;
    });
  };

  const obtenerCarpeta = (id: string): Carpeta | undefined => buscarCarpetaPorId(carpetas, id);

  const registrarReporte = (nombreImagen: string, carpeta: string, formato: 'PDF' | 'DOC') => {
    const nuevo: ReporteGenerado = {
      id: `reporte-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nombreImagen,
      carpeta,
      formato,
      fecha: new Date().toISOString(),
    };
    setReportes((prev) => [nuevo, ...prev]);
  };

  return (
    <GaleriaContext.Provider
      value={{
        carpetas,
        carpetaActivaId,
        imagenSeleccionadaId,
        reportes,
        crearCarpeta,
        seleccionarCarpeta,
        agregarImagenes,
        cargarCarpetaDesdeArchivos,
        seleccionarImagen,
        eliminarImagenes,
        eliminarCarpeta,
        obtenerCarpeta,
        registrarReporte,
        actualizarTemperaturaReflejada,
        actualizarImagen,
      }}
    >
      {children}
    </GaleriaContext.Provider>
  );
};

export const useGaleria = (): GaleriaContextType => {
  const context = useContext(GaleriaContext);
  if (!context) {
    throw new Error('useGaleria debe usarse dentro de un <GaleriaProvider>');
  }
  return context;
};