export type Rol = 'tecnico' | 'admin';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: Rol;
}