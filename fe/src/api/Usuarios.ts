import type { Rol, Usuario } from '../types/auth';
import { API_BASE_URL } from './Config';

export type CodigoErrorAuth = 'credenciales' | 'rol' | 'correoExistente' | 'error';

export interface ErrorAuth {
  codigo: CodigoErrorAuth;
  rolReal?: Rol; // solo viene lleno cuando codigo === 'rol'
  mensaje?: string;
}

// El backend usa id_rol numérico y nombres de rol capitalizados en la tabla `rol`.
const ID_POR_ROL: Record<Rol, number> = {
  admin: 1,
  tecnico: 2,
};

const ROL_POR_NOMBRE: Record<string, Rol> = {
  Administrador: 'admin',
  Tecnico: 'tecnico',
};

function normalizarRol(nombreRol: string): Rol {
  return ROL_POR_NOMBRE[nombreRol] ?? 'tecnico';
}

// POST /api/v1/auth/login — el backend valida correo+contraseña+id_rol y devuelve los datos del usuario (sin token).
// Si el rol no coincide con el real de la cuenta, responde 403 con { detail: "...id_rol=N" }.
export const iniciarSesion = async (correo: string, contraseña: string, rol: Rol): Promise<Usuario> => {
  const respuesta = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      correo_usuario: correo,
      contraseña_usuario: contraseña,
      id_rol: ID_POR_ROL[rol],
    }),
  });

  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => null);
    if (respuesta.status === 403) {
      const error: ErrorAuth = { codigo: 'rol', mensaje: cuerpo?.detail };
      throw error;
    }
    const error: ErrorAuth = { codigo: 'credenciales', mensaje: cuerpo?.detail };
    throw error;
  }

  const datos = await respuesta.json();
  const usuario: Usuario = {
    id: String(datos.id_usuario),
    nombre: datos.nombre_usuario,
    apellido: '',
    correo: datos.correo_usuario,
    rol: normalizarRol(datos.rol),
  };
  return usuario;
};

// POST /api/v1/auth/register — crea la cuenta con el rol elegido.
// Responde 400 si el correo ya existe (no 409).
export const registrarUsuario = async (
  nombre: string,
  apellido: string,
  correo: string,
  contraseña: string,
  rol: Rol
): Promise<void> => {
  const respuesta = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre_usuario: `${nombre} ${apellido}`.trim(),
      correo_usuario: correo,
      contraseña_usuario: contraseña,
      id_rol: ID_POR_ROL[rol],
    }),
  });

  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => null);
    const codigo: CodigoErrorAuth = respuesta.status === 400 ? 'correoExistente' : 'error';
    const error: ErrorAuth = { codigo, mensaje: cuerpo?.detail };
    throw error;
  }
};

// GET /usuarios?rol=tecnico&busqueda=texto — lista de técnicos para el panel de administración.
// NOTA: revisa en tu Swagger (http://127.0.0.1:8000/docs) si esta ruta también lleva el prefijo
// /api/v1/... antes de probarla; todavía no la hemos confirmado como hicimos con auth.
export const listarTecnicos = async (busqueda: string): Promise<Usuario[]> => {
  const parametros = new URLSearchParams({ rol: 'tecnico' });
  if (busqueda.trim()) parametros.set('busqueda', busqueda.trim());

  const respuesta = await fetch(`${API_BASE_URL}/usuarios?${parametros.toString()}`);

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los técnicos');
  }

  return respuesta.json();
};