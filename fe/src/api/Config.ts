// La URL del backend se define por variable de entorno para no quemarla en el código.

export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';