// src/api/Informes.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ExportarInformePayload {
  nombre_archivo: string;
  nivel_riesgo: string;
  observaciones?: string;
  estado: string;
  id_usuario: number;
}

export async function exportarInforme(payload: ExportarInformePayload): Promise<Blob> {
  const token = localStorage.getItem('token'); // ajusta según cómo guardes el token de auth

  const response = await fetch(`${API_BASE_URL}/api/v1/informes/exportar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detalle = await response.text().catch(() => '');
    throw new Error(`Error al exportar el informe: ${response.status} ${detalle}`);
  }

  return response.blob();
}