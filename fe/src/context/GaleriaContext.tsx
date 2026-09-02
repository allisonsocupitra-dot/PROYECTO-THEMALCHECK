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
  // Carga un lote de archivos que puede traer subcarpetas (webkitRelativePath),
  // reconstruye el árbol y devuelve el id de la carpeta más útil para seleccionar.
  cargarCarpetaDesdeArchivos: (archivos: File[], nombrePorDefecto: string) => string;
  seleccionarImagen: (id: string) => void;
  eliminarImagenes: (carpetaId: string, imagenIds: string[]) => void;
  eliminarCarpeta: (carpetaId: string) => void;
  obtenerCarpeta: (id: string) => Carpeta | undefined;
  registrarReporte: (nombreImagen: string, carpeta: string, formato: 'PDF' | 'DOC') => void;
  // Ajusta la Temperatura Reflejada de una imagen (botones +/- del panel
  // PARÁMETROS) y refresca temp_max/temp_min con lo que devuelva el backend,
  // ya recalculado según el nuevo entorno de la toma.
  actualizarTemperaturaReflejada: (imagen: ImagenCargada, valor: number) => void;
}
 
const GaleriaContext = createContext<GaleriaContextType | undefined>(undefined);
 
// Valor de referencia inicial mientras responde el backend (se reemplaza con
// temperatura_min/temperatura_max reales apenas termina la subida).
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
      // Parámetros e info real de imagen llegan del backend al terminar la subida.
      parametros: {},
      infoImagen: {},
      idBackend: undefined,
      subiendo: true,
      errorSubida: undefined,
      puntos: [],
    };
  });
 
export const GaleriaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { usuario } = useAuth();
  const [carpetas, setCarpetas] = useState<Carpeta[]>([CARPETA_INICIAL]);
  const [carpetaActivaId, setCarpetaActivaId] = useState<string>('general');
  const [imagenSeleccionadaId, setImagenSeleccionadaId] = useState<string | null>(null);
  const [reportes, setReportes] = useState<ReporteGenerado[]>([]);
 
  // Bug corregido: como el GaleriaProvider vive por encima del router y nunca se desmonta,
  // el estado en memoria sobrevivía a un logout/login dentro de la misma pestaña y se veían
  // las carpetas/imágenes de la cuenta anterior. Ahora, cada vez que cambia el usuario
  // autenticado (login, logout o cambio de cuenta), se limpia todo lo cargado en memoria.
  useEffect(() => {
    setCarpetas([CARPETA_INICIAL]);
    setCarpetaActivaId('general');
    setImagenSeleccionadaId(null);
    setReportes([]);
  }, [usuario?.id]);
 
  // Actualiza in-place (en cualquier carpeta/subcarpeta) una imagen ya insertada,
  // por su id de frontend. Se usa para volcar el resultado de la subida al backend.
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
 
  // Sube cada imagen recién agregada al backend y, cuando responde, vuelca el
  // resultado real (temperaturas, parámetros, info EXIF, idBackend) sobre esa
  // imagen en el árbol. No bloquea la UI: la imagen ya aparece en la galería
  // con subiendo=true mientras tanto.
  const subirImagenesAlBackend = (imagenes: ImagenCargada[]) => {
    imagenes.forEach((imagen) => {
      subirImagenTermografica(imagen.archivo)
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
 
  // Ajusta la Temperatura Reflejada de una imagen ya subida:
  // 1) Actualiza el panel al instante (optimista), para que el input responda
  //    de inmediato al +/- sin esperar la respuesta del servidor.
  // 2) Si la imagen ya tiene idBackend, llama al endpoint que recalcula
  //    temp_max/temp_min reales con el nuevo entorno, y al volver reemplaza
  //    todo (temperaturas, parámetros) con lo que confirme el backend.
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
        // Si falla, dejamos el valor optimista tal cual (el usuario lo acaba
        // de escribir); no hay indicador de error específico para este campo
        // todavía, se podría agregar un estado de error puntual más adelante.
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
 
  // Inserta imágenes directamente en la carpeta con ese id (sin crear más niveles)
  const insertarEnArbolPorId = (lista: Carpeta[], carpetaId: string, imagenes: ImagenCargada[]): Carpeta[] =>
    lista.map((c) => {
      if (c.id === carpetaId) return { ...c, imagenes: [...imagenes, ...c.imagenes] };
      return { ...c, subcarpetas: insertarEnArbolPorId(c.subcarpetas, carpetaId, imagenes) };
    });
 
  const agregarImagenes = (carpetaId: string, archivos: File[]) => {
    const nuevasImagenes = crearImagenesDesdeArchivos(archivos);
    setCarpetas((prev) => insertarEnArbolPorId(prev, carpetaId, nuevasImagenes));
    subirImagenesAlBackend(nuevasImagenes);
  };
 
  // Recibe archivos que pueden traer webkitRelativePath (carpeta del sistema
  // operativo, con o sin subcarpetas dentro) y reconstruye el árbol completo,
  // fusionándolo con lo que ya existía si los nombres coinciden.
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
    const todasLasNuevasImagenes: ImagenCargada[] = [];
 
    grupos.forEach((archivosGrupo, ruta) => {
      const segmentos = ruta.startsWith('__raiz__/') ? [ruta.replace('__raiz__/', '')] : ruta.split('/');
      const imagenesGrupo = crearImagenesDesdeArchivos(archivosGrupo);
      todasLasNuevasImagenes.push(...imagenesGrupo);
      arbolNuevo = insertarEnArbol(arbolNuevo, segmentos, imagenesGrupo);
 
      const hoja = buscarCarpetaPorRuta(arbolNuevo, segmentos);
      if (hoja) idSeleccion = hoja.id;
    });
 
    setCarpetas(arbolNuevo);
    setCarpetaActivaId(idSeleccion);
    subirImagenesAlBackend(todasLasNuevasImagenes);
    return idSeleccion;
  };
 
  const seleccionarImagen = (id: string) => setImagenSeleccionadaId(id);
 
  const eliminarImagenes = (carpetaId: string, imagenIds: string[]) => {
    const idsAEliminar = new Set(imagenIds);
    setCarpetas((prev) => eliminarImagenesDeArbol(prev, carpetaId, idsAEliminar));
 
    if (imagenSeleccionadaId && idsAEliminar.has(imagenSeleccionadaId)) {
      setImagenSeleccionadaId(null);
    }
  };
 
  const eliminarCarpeta = (carpetaId: string) => {
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
 