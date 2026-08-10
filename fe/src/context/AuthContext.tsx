import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { mockUsers, agregarUsuarioTecnico } from '../api/mockUsers';
import type { Usuario } from '../types/auth';

interface ResultadoAuth {
  ok: boolean;
  mensaje?: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  estaAutenticado: boolean;
  login: (correo: string, contraseña: string) => ResultadoAuth;
  registrar: (nombre: string, correo: string, contraseña: string) => ResultadoAuth;
  logout: () => void;
}

const CLAVE_STORAGE = 'themalcheck_usuario';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const guardado = sessionStorage.getItem(CLAVE_STORAGE);
    return guardado ? JSON.parse(guardado) : null;
  });

  const guardarSesion = (u: Usuario) => {
    setUsuario(u);
    sessionStorage.setItem(CLAVE_STORAGE, JSON.stringify(u));
  };

  const login = (correo: string, contraseña: string): ResultadoAuth => {
    const encontrado = mockUsers.find(
      (u) => u.correo.toLowerCase() === correo.toLowerCase() && u.contraseña === contraseña
    );

    if (!encontrado) {
      return { ok: false, mensaje: 'Correo o contraseña incorrectos' };
    }

    guardarSesion({
      id: encontrado.id,
      nombre: encontrado.nombre,
      correo: encontrado.correo,
      rol: encontrado.rol,
    });

    return { ok: true };
  };

  // Los registros nuevos siempre quedan como "tecnico"; el rol "admin" se asigna manualmente en mockUsers.ts
  const registrar = (nombre: string, correo: string, contraseña: string): ResultadoAuth => {
    const yaExiste = mockUsers.some((u) => u.correo.toLowerCase() === correo.toLowerCase());

    if (yaExiste) {
      return { ok: false, mensaje: 'Ya existe una cuenta con ese correo' };
    }

    agregarUsuarioTecnico(nombre, correo, contraseña);
    return { ok: true };
  };

  const logout = () => {
    setUsuario(null);
    sessionStorage.removeItem(CLAVE_STORAGE);
  };

  return (
    <AuthContext.Provider
      value={{ usuario, estaAutenticado: !!usuario, login, registrar, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
};