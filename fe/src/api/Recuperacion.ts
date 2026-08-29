import { API_BASE_URL } from './Config';

export interface ErrorRecuperacion {
  mensaje?: string;
}

// POST /api/v1/auth/forgot-password
// El backend debe: buscar el usuario por correo_usuario, generar un token de un solo uso
// con expiración corta (ej. 30 min), guardarlo asociado a ese usuario, y enviarlo por correo
// con un enlace tipo: {URL_FRONTEND}/restablecer-contrasena?token=XXXX
// Por seguridad, debe responder 200 siempre exista o no el correo (para no revelar qué
// correos están registrados). El frontend ya asume ese comportamiento.
export const solicitarRecuperacion = async (correo: string): Promise<void> => {
  const respuesta = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo_usuario: correo }),
  });

  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => null);
    const error: ErrorRecuperacion = { mensaje: cuerpo?.detail };
    throw error;
  }
};

// POST /api/v1/auth/reset-password
// El backend debe validar que el token exista, no haya expirado y no se haya usado antes.
// Si es válido: actualiza contraseña_usuario con hash_password() (la misma función que ya
// usan en /auth/register) e invalida el token para que no se pueda reutilizar.
// Debe responder 400/404 si el token es inválido o ya expiró.
export const restablecerContrasena = async (token: string, nuevaContrasena: string): Promise<void> => {
  const respuesta = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, nueva_contraseña: nuevaContrasena }),
  });

  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => null);
    const error: ErrorRecuperacion = { mensaje: cuerpo?.detail };
    throw error;
  }
};