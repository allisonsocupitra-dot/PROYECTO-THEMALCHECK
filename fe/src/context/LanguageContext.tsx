import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { traducciones, type Idioma, } from '../i18n/translations';

interface LanguageContextType {
  idioma: Idioma;
  cambiarIdioma: (idioma: Idioma) => void;
  t: (clave: string) => string;
}

const CLAVE_STORAGE = 'themalcheck_idioma';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [idioma, setIdioma] = useState<Idioma>(() => {
    const guardado = sessionStorage.getItem(CLAVE_STORAGE);
    return guardado === 'en' ? 'en' : 'es';
  });

  const cambiarIdioma = (nuevo: Idioma) => {
    setIdioma(nuevo);
    sessionStorage.setItem(CLAVE_STORAGE, nuevo);
  };

  const t = (clave: string): string => {
    const entrada = traducciones[clave];
    if (!entrada) return clave; // si falta la clave, mostramos la clave para detectar el hueco rápido
    return entrada[idioma];
  };

  return (
    <LanguageContext.Provider value={{ idioma, cambiarIdioma, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de un <LanguageProvider>');
  }
  return context;
};