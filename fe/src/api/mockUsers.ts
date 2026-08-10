import type { Rol } from '../types/auth';

export interface MockUser {
  id: string;
  nombre: string;
  correo: string;
  contraseña: string;
  rol: Rol;
}

// Usuarios de prueba. El administrador se provisiona manualmente aquí;
// los usuarios que se registran desde la app siempre quedan como "tecnico".
export const mockUsers: MockUser[] = [
  {
    id: 'u1',
    nombre: 'Carlos Ramírez',
    correo: 'carlos.tecnico@themalcheck.com',
    contraseña: '123456',
    rol: 'tecnico',
  },
  {
    id: 'u2',
    nombre: 'Laura Gómez',
    correo: 'laura.tecnico@themalcheck.com',
    contraseña: '123456',
    rol: 'tecnico',
  },
  {
    id: 'u3',
    nombre: 'Andrés Torres',
    correo: 'admin@themalcheck.com',
    contraseña: 'admin123',
    rol: 'admin',
  },
];

// Simula la creación de una cuenta nueva (solo en memoria, mientras no exista backend/API real)
export const agregarUsuarioTecnico = (
  nombre: string,
  correo: string,
  contraseña: string
): MockUser => {
  const nuevo: MockUser = {
    id: `u${mockUsers.length + 1}`,
    nombre,
    correo,
    contraseña,
    rol: 'tecnico',
  };
  mockUsers.push(nuevo);
  return nuevo;
};