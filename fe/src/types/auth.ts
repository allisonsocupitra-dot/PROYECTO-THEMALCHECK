export type Rol = 'tecnico' | 'admin';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
}