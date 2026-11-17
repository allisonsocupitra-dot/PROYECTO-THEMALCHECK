export type IdPaleta =
  | 'white_hot'
  | 'fulgurite'
  | 'iron_red'
  | 'hot_iron'
  | 'medical'
  | 'arctic'
  | 'rainbow_1'
  | 'rainbow_2'
  | 'tint'
  | 'black_hot';

export interface Paleta {
  id: IdPaleta;
  nombre: string;
  colores: string[]; // de frío a caliente
}

// La imagen original de DJI ya viene pintada en Iron Red, así que esa paleta
// no necesita pedirle nada al backend: se usa la imagen tal cual.
export const PALETA_POR_DEFECTO: IdPaleta = 'iron_red';

// IMPORTANTE: esta lista debe ser igual a PALETAS en be/src/services/paletas.py,
// para que el degradado de la barra coincida con los colores de la imagen generada.
export const PALETAS: Paleta[] = [
  { id: 'white_hot', nombre: 'White Hot', colores: ['#000000', '#ffffff'] },
  { id: 'fulgurite', nombre: 'Fulgurite', colores: ['#000000', '#3b0a6b', '#c1272d', '#f7931e', '#fff200', '#ffffff'] },
  { id: 'iron_red', nombre: 'Iron Red', colores: ['#000000', '#1a0a5a', '#7b1fa2', '#d81b60', '#ff6f00', '#ffd600', '#ffffe0'] },
  { id: 'hot_iron', nombre: 'Hot Iron', colores: ['#000000', '#1a1a8c', '#0a8f3c', '#ffe600', '#ff4500', '#ffffff'] },
  { id: 'medical', nombre: 'Medical', colores: ['#000080', '#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000', '#ffffff'] },
  { id: 'arctic', nombre: 'Arctic', colores: ['#000000', '#0000aa', '#0080ff', '#00ffff', '#00ff80', '#ffff00', '#ff0000'] },
  { id: 'rainbow_1', nombre: 'Rainbow 1', colores: ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000'] },
  { id: 'rainbow_2', nombre: 'Rainbow 2', colores: ['#000000', '#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000', '#ffffff'] },
  { id: 'tint', nombre: 'Tint', colores: ['#000000', '#808080', '#ff9999', '#ff0000'] },
  { id: 'black_hot', nombre: 'Black Hot', colores: ['#ffffff', '#000000'] },
];

// Degradado CSS para la barra de temperatura y las muestras del popup.
// 'to top' deja el color frío abajo y el caliente arriba, como la barra del visor.
export const gradientePaleta = (colores: string[], direccion: 'to top' | 'to right' = 'to top') =>
  `linear-gradient(${direccion}, ${colores.join(', ')})`;