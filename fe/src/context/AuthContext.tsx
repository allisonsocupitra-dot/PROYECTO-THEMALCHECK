import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { mockUsers, agregarUsuario } from '../api/mockUsers';
import type { Usuario, Rol } from '../types/auth';

type CodigoError = 'credenciales' | 'rol' | 'correoExistente';

interface ResultadoAuth {
  ok: boolean;
  codigo?: CodigoError;
  rolReal?: Rol;
}

interface AuthContextType {
  usuario: Usuario | null;
  estaAutenticado: boolean;
  login: (correo: string, contraseña: string, rol: Rol) => ResultadoAuth;
  registrar: (nombre: string, apellido: string, correo: string, contraseña: string, rol: Rol) => ResultadoAuth;
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

  // El login ahora exige que el rol elegido coincida con el rol real de la cuenta.
  // Si el correo y la contraseña son correctos pero el rol no coincide, se rechaza el ingreso.
  const login = (correo: string, contraseña: string, rol: Rol): ResultadoAuth => {
    const encontrado = mockUsers.find(
      (u) => u.correo.toLowerCase() === correo.toLowerCase() && u.contraseña === contraseña
    );

    if (!encontrado) {
      return { ok: false, codigo: 'credenciales' };
    }

    if (encontrado.rol !== rol) {
      return { ok: false, codigo: 'rol', rolReal: encontrado.rol };
    }

    guardarSesion({
      id: encontrado.id,
      nombre: encontrado.nombre,
      apellido: encontrado.apellido,
      correo: encontrado.correo,
      rol: encontrado.rol,
    });

    return { ok: true };
  };

  const registrar = (
    nombre: string,
    apellido: string,
    correo: string,
    contraseña: string,
    rol: Rol
  ): ResultadoAuth => {
    const yaExiste = mockUsers.some((u) => u.correo.toLowerCase() === correo.toLowerCase());

    if (yaExiste) {
      return { ok: false, codigo: 'correoExistente' };
    }

    agregarUsuario(nombre, apellido, correo, contraseña, rol);
    return { ok: true };
  };

  const logout = () => {
    setUsuario(null);
    sessionStorage.removeItem(CLAVE_STORAGE);
  };

  return (
    <AuthContext.Provider value={{ usuario, estaAutenticado: !!usuario, login, registrar, logout }}>
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