// Convierte los colores de una paleta (de frío a caliente) en una tabla de 256 colores RGBA.
// Se apoya en un degradado de canvas, así funciona con cualquier formato CSS (#hex, rgb(), etc.).
export const crearTablaColores = (colores: readonly string[]): Uint8ClampedArray => {
  const lienzo = document.createElement('canvas');
  lienzo.width = 256;
  lienzo.height = 1;
  const ctx = lienzo.getContext('2d')!;
  const degradado = ctx.createLinearGradient(0, 0, 256, 0);
  colores.forEach((color, i) => {
    degradado.addColorStop(colores.length === 1 ? 0 : i / (colores.length - 1), color);
  });
  ctx.fillStyle = degradado;
  ctx.fillRect(0, 0, 256, 1);
  return ctx.getImageData(0, 0, 256, 1).data;
};

// Pinta la matriz usando SOLO el rango [tMin, tMax]:
//  - por debajo de tMin  → primer color de la paleta
//  - por encima de tMax  → último color de la paleta
//  - entre ambos         → la paleta completa repartida en ese rango
export const pintarMatrizConRango = (
  temperaturas: Float32Array,
  ancho: number,
  alto: number,
  tMin: number,
  tMax: number,
  tabla: Uint8ClampedArray
): string | null => {
  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext('2d');
  if (!ctx) return null;

  const imagen = ctx.createImageData(ancho, alto);
  const datos = imagen.data;
  const rango = Math.max(tMax - tMin, 0.01);

  for (let i = 0; i < temperaturas.length; i++) {
    let n = (temperaturas[i] - tMin) / rango;
    n = n < 0 ? 0 : n > 1 ? 1 : n;
    const k = Math.round(n * 255) * 4;
    const p = i * 4;
    datos[p] = tabla[k];
    datos[p + 1] = tabla[k + 1];
    datos[p + 2] = tabla[k + 2];
    datos[p + 3] = 255;
  }

  ctx.putImageData(imagen, 0, 0);
  return lienzo.toDataURL('image/png');
};