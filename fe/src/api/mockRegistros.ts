export interface RegistroAnalisis {
  id: string;
  usuarioId: string;
  nombreImagen: string;
  fecha: string;
  temperaturaMax: number;
  temperaturaMin: number;
  estado: 'Completado' | 'Pendiente' | 'Error';
}

// Registros de ejemplo asociados a los técnicos definidos en mockUsers.ts
export const mockRegistros: RegistroAnalisis[] = [
  {
    id: 'r1',
    usuarioId: 'u1',
    nombreImagen: 'panel-solar-01.jpg',
    fecha: '2026-07-28T10:15:00',
    temperaturaMax: 68.4,
    temperaturaMin: 22.1,
    estado: 'Completado',
  },
  {
    id: 'r2',
    usuarioId: 'u1',
    nombreImagen: 'tablero-electrico-04.jpg',
    fecha: '2026-07-30T09:40:00',
    temperaturaMax: 91.2,
    temperaturaMin: 24.5,
    estado: 'Completado',
  },
  {
    id: 'r3',
    usuarioId: 'u1',
    nombreImagen: 'motor-bomba-02.jpg',
    fecha: '2026-08-02T14:05:00',
    temperaturaMax: 54.7,
    temperaturaMin: 21.8,
    estado: 'Pendiente',
  },
  {
    id: 'r4',
    usuarioId: 'u2',
    nombreImagen: 'subestacion-03.jpg',
    fecha: '2026-08-01T08:20:00',
    temperaturaMax: 102.6,
    temperaturaMin: 25.3,
    estado: 'Error',
  },
  {
    id: 'r5',
    usuarioId: 'u2',
    nombreImagen: 'techo-industrial-01.jpg',
    fecha: '2026-08-05T11:50:00',
    temperaturaMax: 47.9,
    temperaturaMin: 19.4,
    estado: 'Completado',
  },
];