import type { Rol, Usuario } from '../types/auth';
import { API_BASE_URL } from './config';

export interface RespuestaLogin {
  token: string;
  usuario: Usuario;
}

export type CodigoErrorAuth = 'credenciales' | 'rol' | 'correoExistente' | 'error';

export interface ErrorAuth {
  codigo: CodigoErrorAuth;
  rolReal?: Rol; // solo viene lleno cuando codigo === 'rol'
}

// POST /auth/login — el backend valida correo+contraseña+rol y devuelve token + usuario.
// Si el rol no coincide con el real de la cuenta, debe responder 403 con { rolReal } en el body.
export const iniciarSesion = async (correo: string, contraseña: string, rol: Rol): Promise<RespuestaLogin> => {
  const respuesta = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contraseña, rol }),
  });

  if (!respuesta.ok) {
    if (respuesta.status === 403) {
      const cuerpo = await respuesta.json().catch(() => null);
      const error: ErrorAuth = { codigo: 'rol', rolReal: cuerpo?.rolReal };
      throw error;
    }

    const error: ErrorAuth = { codigo: 'credenciales' };
    throw error;
  }

  return respuesta.json();
};

// POST /auth/register — crea la cuenta con el rol elegido.
// Debe responder 409 si el correo ya existe.
export const registrarUsuario = async (
  nombre: string,
  apellido: string,
  correo: string,
  contraseña: string,
  rol: Rol
): Promise<void> => {
  const respuesta = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, apellido, correo, contraseña, rol }),
  });

  if (!respuesta.ok) {
    const codigo: CodigoErrorAuth = respuesta.status === 409 ? 'correoExistente' : 'error';
    const error: ErrorAuth = { codigo };
    throw error;
  }
};

// GET /usuarios?rol=tecnico&busqueda=texto — usado solo por el panel de administración.
// Requiere el token del administrador autenticado.
export const listarTecnicos = async (busqueda: string, token: string): Promise<Usuario[]> => {
  const parametros = new URLSearchParams({ rol: 'tecnico' });
  if (busqueda.trim()) parametros.set('busqueda', busqueda.trim());

  const respuesta = await fetch(`${API_BASE_URL}/usuarios?${parametros.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los técnicos');
  }

  return respuesta.json();
};