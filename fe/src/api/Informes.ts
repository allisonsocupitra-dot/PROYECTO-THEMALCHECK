// src/api/Informes.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface PuntoPdf {
  etiqueta: string; // SP1, R1, C1...
  tipo: 'punto' | 'region';
  valor?: number | null; // solo puntos
  valor_max?: number | null; // solo zonas (rectángulo / círculo)
  valor_min?: number | null;
  valor_avg?: number | null;
}

export interface ExportarInformePayload {
  nombre_archivo: string;
  nivel_riesgo: string;
  observaciones?: string;
  estado: string;
  id_usuario: number;

  // Datos para armar el reporte (PDF / DOC) con el formato de DJI Thermal
  fecha?: string;
  imagen_base64?: string; // imagen con paleta, rango y marcas, tal como se ve en pantalla
  puntos: PuntoPdf[];
  parametros: Record<string, string>;
  info_imagen: Record<string, string>;
  escala?: {
    temp_min: number | null;
    temp_max: number | null;
    colores: string[];
  };
}

async function exportar(ruta: string, payload: ExportarInformePayload, nombreFormato: string): Promise<Blob> {
  const token = localStorage.getItem('token'); // ajusta según cómo guardes el token de auth

  const response = await fetch(`${API_BASE_URL}/api/v1/informes/${ruta}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // El backend responde { detail: "..." }; se muestra tal cual en el visor
    let detalle = '';
    try {
      const error = await response.json();
      detalle = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail);
    } catch {
      detalle = await response.text().catch(() => '');
    }
    throw new Error(detalle || `Error al exportar el ${nombreFormato} (${response.status})`);
  }

  return response.blob();
}

// PDF: además de generarlo, el backend lo guarda y registra el informe en la BD
export const exportarInforme = (payload: ExportarInformePayload): Promise<Blob> =>
  exportar('exportar', payload, 'informe');

// DOC (Word): solo genera y devuelve el archivo
export const exportarInformeDoc = (payload: ExportarInformePayload): Promise<Blob> =>
  exportar('exportar-doc', payload, 'DOC');