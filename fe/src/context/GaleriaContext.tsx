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
}

const GaleriaContext = createContext<GaleriaContextType | undefined>(undefined);

// El proyecto no tiene backend para leer metadatos FLIR aún, por lo que se usa
// un valor de referencia equivalente al rango térmico de la escala original.
const generarTemperaturas = () => {
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
    const { temperaturaMin, temperaturaMax } = generarTemperaturas();
    return {
      id: `${archivo.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      archivo,
      urlPrevia: URL.createObjectURL(archivo),
      fecha: new Date().toISOString(),
      temperaturaMin,
      temperaturaMax,
      unidadOrigen: 'C',
      // Los valores reales de estos dos bloques los completará el backend de
      // análisis (lectura EXIF / FLIR) cuando quede integrado.
      parametros: {},
      infoImagen: {},
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

    grupos.forEach((archivosGrupo, ruta) => {
      const segmentos = ruta.startsWith('__raiz__/') ? [ruta.replace('__raiz__/', '')] : ruta.split('/');
      arbolNuevo = insertarEnArbol(arbolNuevo, segmentos, crearImagenesDesdeArchivos(archivosGrupo));

      const hoja = buscarCarpetaPorRuta(arbolNuevo, segmentos);
      if (hoja) idSeleccion = hoja.id;
    });

    setCarpetas(arbolNuevo);
    setCarpetaActivaId(idSeleccion);
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
