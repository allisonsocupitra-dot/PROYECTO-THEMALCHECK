import type { Rol } from '../types/auth';

export interface MockUser {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  contraseña: string;
  rol: Rol;
}

// Usuarios de prueba mientras no exista backend.
// A diferencia de la versión anterior, ahora el registro público sí permite elegir el rol.
export const mockUsers: MockUser[] = [
  {
    id: 'u1',
    nombre: 'Carlos',
    apellido: 'Ramírez',
    correo: 'carlos.tecnico@themalcheck.com',
    contraseña: '123456',
    rol: 'tecnico',
  },
  {
    id: 'u2',
    nombre: 'Laura',
    apellido: 'Gómez',
    correo: 'laura.tecnico@themalcheck.com',
    contraseña: '123456',
    rol: 'tecnico',
  },
  {
    id: 'u3',
    nombre: 'Andrés',
    apellido: 'Torres',
    correo: 'admin@themalcheck.com',
    contraseña: 'admin123',
    rol: 'admin',
  },
];

// Simula la creación de una cuenta nueva (solo en memoria, mientras no exista backend/API real)
export const agregarUsuario = (
  nombre: string,
  apellido: string,
  correo: string,
  contraseña: string,
  rol: Rol
): MockUser => {
  const nuevo: MockUser = {
    id: `u${mockUsers.length + 1}`,
    nombre,
    apellido,
    correo,
    contraseña,
    rol,
  };
  mockUsers.push(nuevo);
  return nuevo;
};