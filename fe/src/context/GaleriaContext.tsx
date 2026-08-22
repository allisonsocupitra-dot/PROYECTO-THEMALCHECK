import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Carpeta, ImagenCargada } from '../types/galeria';
import { normalizarRangoTermico } from '../utils/temperaturas';

interface GaleriaContextType {
  carpetas: Carpeta[];
  carpetaActivaId: string;
  imagenSeleccionadaId: string | null;
  crearCarpeta: (nombre: string) => void;
  seleccionarCarpeta: (id: string) => void;
  agregarImagenes: (carpetaId: string, archivos: File[]) => void;
  seleccionarImagen: (id: string) => void;
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
  const [carpetas, setCarpetas] = useState<Carpeta[]>([CARPETA_INICIAL]);
  const [carpetaActivaId, setCarpetaActivaId] = useState<string>('general');
  const [imagenSeleccionadaId, setImagenSeleccionadaId] = useState<string | null>(null);

  const crearCarpeta = (nombre: string) => {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) return;

    const nueva: Carpeta = {
      id: `carpeta-${Date.now()}`,
      nombre: nombreLimpio,
      imagenes: [],
    };

    setCarpetas((prev) => [...prev, nueva]);
    setCarpetaActivaId(nueva.id);
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

  return (
    <GaleriaContext.Provider
      value={{
        carpetas,
        carpetaActivaId,
        imagenSeleccionadaId,
        crearCarpeta,
        seleccionarCarpeta,
        agregarImagenes,
        seleccionarImagen,
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