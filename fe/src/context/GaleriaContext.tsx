import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Carpeta, ImagenCargada } from '../types/galeria';
import { normalizarRangoTermico } from '../utils/temperaturas';
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
  seleccionarImagen: (id: string) => void;
  eliminarImagenes: (carpetaId: string, imagenIds: string[]) => void;
  eliminarCarpeta: (carpetaId: string) => void;
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

const CARPETA_INICIAL: Carpeta = { id: 'general', nombre: 'General', imagenes: [] };

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
    };

    setCarpetas((prev) => [...prev, nueva]);
    setCarpetaActivaId(nueva.id);
    return nueva.id;
  };

  const seleccionarCarpeta = (id: string) => setCarpetaActivaId(id);

  const agregarImagenes = (carpetaId: string, archivos: File[]) => {
    const nuevasImagenes: ImagenCargada[] = archivos.map((archivo) => {
      const { temperaturaMin, temperaturaMax } = generarTemperaturas();
      return {
        id: `${archivo.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        archivo,
        urlPrevia: URL.createObjectURL(archivo),
        fecha: new Date().toISOString(),
        temperaturaMin,
        temperaturaMax,
        unidadOrigen: 'C',
      };
    });

    setCarpetas((prev) =>
      prev.map((c) =>
        c.id === carpetaId ? { ...c, imagenes: [...nuevasImagenes, ...c.imagenes] } : c
      )
    );
  };

  const seleccionarImagen = (id: string) => setImagenSeleccionadaId(id);

  const eliminarImagenes = (carpetaId: string, imagenIds: string[]) => {
    const idsAEliminar = new Set(imagenIds);

    setCarpetas((prev) =>
      prev.map((c) => {
        if (c.id !== carpetaId) return c;

        // Liberamos la vista previa de las imágenes que se van a borrar
        c.imagenes.forEach((img) => {
          if (idsAEliminar.has(img.id)) URL.revokeObjectURL(img.urlPrevia);
        });

        return { ...c, imagenes: c.imagenes.filter((img) => !idsAEliminar.has(img.id)) };
      })
    );

    if (imagenSeleccionadaId && idsAEliminar.has(imagenSeleccionadaId)) {
      setImagenSeleccionadaId(null);
    }
  };

  const eliminarCarpeta = (carpetaId: string) => {
    setCarpetas((prev) => {
      const carpetaAEliminar = prev.find((c) => c.id === carpetaId);
      carpetaAEliminar?.imagenes.forEach((img) => URL.revokeObjectURL(img.urlPrevia));

      const restantes = prev.filter((c) => c.id !== carpetaId);

      // Siempre debe quedar al menos una carpeta disponible
      if (restantes.length === 0) {
        setCarpetaActivaId(CARPETA_INICIAL.id);
        return [CARPETA_INICIAL];
      }

      if (carpetaActivaId === carpetaId) {
        setCarpetaActivaId(restantes[0].id);
      }

      return restantes;
    });
  };

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
        seleccionarImagen,
        eliminarImagenes,
        eliminarCarpeta,
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