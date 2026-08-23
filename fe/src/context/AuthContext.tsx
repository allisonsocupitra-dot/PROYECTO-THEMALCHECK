import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { iniciarSesion, registrarUsuario } from '../api/Usuarios';
import type { ErrorAuth, CodigoErrorAuth } from '../api/Usuarios';
import type { Usuario, Rol } from '../types/auth';

interface ResultadoAuth {
  ok: boolean;
  codigo?: CodigoErrorAuth;
  rolReal?: Rol;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  estaAutenticado: boolean;
  login: (correo: string, contraseña: string, rol: Rol) => Promise<ResultadoAuth>;
  registrar: (nombre: string, apellido: string, correo: string, contraseña: string, rol: Rol) => Promise<ResultadoAuth>;
  logout: () => void;
}

const CLAVE_USUARIO = 'themalcheck_usuario';
const CLAVE_TOKEN = 'themalcheck_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const guardado = sessionStorage.getItem(CLAVE_USUARIO);
    return guardado ? JSON.parse(guardado) : null;
  });
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(CLAVE_TOKEN));

  const guardarSesion = (u: Usuario, t: string) => {
    setUsuario(u);
    setToken(t);
    sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(u));
    sessionStorage.setItem(CLAVE_TOKEN, t);
  };

  const login = async (correo: string, contraseña: string, rol: Rol): Promise<ResultadoAuth> => {
    try {
      const { token: nuevoToken, usuario: usuarioAutenticado } = await iniciarSesion(correo, contraseña, rol);
      guardarSesion(usuarioAutenticado, nuevoToken);
      return { ok: true };
    } catch (err) {
      const error = err as ErrorAuth;
      return { ok: false, codigo: error.codigo ?? 'error', rolReal: error.rolReal };
    }
  };

  const registrar = async (
    nombre: string,
    apellido: string,
    correo: string,
    contraseña: string,
    rol: Rol
  ): Promise<ResultadoAuth> => {
    try {
      await registrarUsuario(nombre, apellido, correo, contraseña, rol);
      return { ok: true };
    } catch (err) {
      const error = err as ErrorAuth;
      return { ok: false, codigo: error.codigo ?? 'error' };
    }
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    sessionStorage.removeItem(CLAVE_USUARIO);
    sessionStorage.removeItem(CLAVE_TOKEN);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, estaAutenticado: !!usuario, login, registrar, logout }}>
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