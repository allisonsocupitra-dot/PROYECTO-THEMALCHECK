import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useGaleria } from '../context/GaleriaContext';
import NavLateral from '../components/NavLateral';
import { TablaParametros, TablaInfoImagen } from '../components/TablasPropiedades';
import { aplanarImagenes } from '../utils/arbolCarpetas';
import { formatearTemperatura } from '../utils/temperaturas';
import { guardarPuntosMedicion, actualizarTemperaturaReflejada } from '../api/ImagenesTermograficas';
import type { PuntoMedicionGuardado } from '../types/galeria';
import type { PuntoAGuardar } from '../api/ImagenesTermograficas';
import '../styles/styles.css';
import '../styles/dashboard.css';
import '../styles/visor.css';
import { exportarInforme } from '../api/Informes'; // ajusta la ruta según dónde la tengas

type Herramienta = 'ninguna' | 'punto' | 'rectangulo' | 'circulo';

// Resultado de medir una zona (rectángulo). Las posiciones están en % de la
// imagen renderizada, igual que el resto de las coordenadas de las anotaciones.
interface ResumenZona {
  min: number;
  avg: number;
  max: number;
  posMin: { x: number; y: number } | null;
  posMax: { x: number; y: number } | null;
}

interface Anotacion {
  id: string;
  tipo: Exclude<Herramienta, 'ninguna'>;
  xInicio: number; // porcentaje respecto al ancho de la imagen renderizada
  yInicio: number; // porcentaje respecto al alto de la imagen renderizada
  xFin: number;
  yFin: number;
  color: string;
  valorTemp?: number; // solo aplica a puntos; llega del backend al guardar
  resumen?: ResumenZona; // aplica a rectángulos y círculos; llega del backend al guardar
}

interface FilaEditable {
  id: string;
  clave: string;
  valor: string;
}

// Colores de los marcadores que señalan el píxel más frío y el más caliente de una zona
const COLOR_MIN = '#4dabf7';
const COLOR_MAX = '#ff4d4f';

// Temperatura reflejada que usa el backend cuando la imagen no tiene una guardada
// (debe coincidir con TEMP_REFLEJADA_DEFECTO en be/.../visor/comun.py)
const TEMP_REFLEJADA_POR_DEFECTO = 23;

// Convierte un porcentaje (0-100) de la imagen renderizada a un píxel de la imagen original
const porcentajeAPixel = (pct: number, total: number) =>
  Math.min(total - 1, Math.max(0, Math.round((pct / 100) * total)));

// Marcador (círculo + punto + temperatura) para el píxel más frío / más caliente de una zona,
// dibujado en el canvas de exportación
const dibujarMarcadorEnCanvas = (
  ctx: CanvasRenderingContext2D,
  xPct: number,
  yPct: number,
  color: string,
  texto: string,
  ancho: number,
  alto: number
) => {
  const cx = (xPct / 100) * ancho;
  const cy = (yPct / 100) * alto;
  const radio = Math.max(5, ancho * 0.009);
  const tamFuente = Math.max(12, ancho * 0.02);
  const aLaIzquierda = xPct > 80;

  ctx.save();
  ctx.lineWidth = Math.max(1.5, ancho * 0.002);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.arc(cx, cy, radio, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1.5, radio * 0.25), 0, Math.PI * 2);
  ctx.fill();

  ctx.font = `bold ${tamFuente}px sans-serif`;
  ctx.textAlign = aLaIzquierda ? 'right' : 'left';
  const tx = cx + (aLaIzquierda ? -radio * 1.4 : radio * 1.4);
  const ty = cy - radio * 1.2;
  ctx.lineWidth = Math.max(2, tamFuente * 0.18);
  ctx.strokeStyle = '#000';
  ctx.strokeText(texto, tx, ty);
  ctx.fillStyle = color;
  ctx.fillText(texto, tx, ty);
  ctx.restore();
};

// Dibuja una anotación sobre un canvas usando las mismas coordenadas porcentuales
// que se usan para mostrarla en pantalla, para que la imagen exportada quede idéntica
const dibujarAnotacionEnCanvas = (ctx: CanvasRenderingContext2D, a: Anotacion, ancho: number, alto: number) => {
  const px = (v: number) => (v / 100) * ancho;
  const py = (v: number) => (v / 100) * alto;
  const grosor = Math.max(2, ancho * 0.004);

  ctx.lineWidth = grosor;
  ctx.strokeStyle = a.color;
  ctx.fillStyle = a.color;

  if (a.tipo === 'punto') {
    const cx = px(a.xInicio);
    const cy = py(a.yInicio);
    const radio = Math.max(6, ancho * 0.012);
    const hueco = radio * 0.55;
    const largoTick = radio * 1.6;

    ctx.lineWidth = Math.max(1.5, ancho * 0.0022);
    ctx.beginPath();
    ctx.arc(cx, cy, radio, 0, Math.PI * 2);
    ctx.stroke();

    [
      [cx - largoTick, cy, cx - hueco, cy],
      [cx + hueco, cy, cx + largoTick, cy],
      [cx, cy - largoTick, cx, cy - hueco],
      [cx, cy + hueco, cx, cy + largoTick],
    ].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1.5, radio * 0.18), 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const x1 = px(Math.min(a.xInicio, a.xFin));
  const y1 = py(Math.min(a.yInicio, a.yFin));
  const w = px(Math.abs(a.xFin - a.xInicio));
  const h = py(Math.abs(a.yFin - a.yInicio));

  if (a.tipo === 'rectangulo') {
    ctx.globalAlpha = 0.15;
    ctx.fillRect(x1, y1, w, h);
    ctx.globalAlpha = 1;
    ctx.strokeRect(x1, y1, w, h);

    // Marcadores del píxel más frío y más caliente, con su temperatura
    if (a.resumen?.posMin) {
      dibujarMarcadorEnCanvas(
        ctx, a.resumen.posMin.x, a.resumen.posMin.y, COLOR_MIN,
        `${formatearTemperatura(a.resumen.min)}°C`, ancho, alto
      );
    }
    if (a.resumen?.posMax) {
      dibujarMarcadorEnCanvas(
        ctx, a.resumen.posMax.x, a.resumen.posMax.y, COLOR_MAX,
        `${formatearTemperatura(a.resumen.max)}°C`, ancho, alto
      );
    }
    return;
  }

  // círculo
  ctx.beginPath();
  ctx.ellipse(x1 + w / 2, y1 + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.globalAlpha = 0.15;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.stroke();

  // Marcadores del píxel más frío y más caliente, con su temperatura
  if (a.resumen?.posMin) {
    dibujarMarcadorEnCanvas(
      ctx, a.resumen.posMin.x, a.resumen.posMin.y, COLOR_MIN,
      `${formatearTemperatura(a.resumen.min)}°C`, ancho, alto
    );
  }
  if (a.resumen?.posMax) {
    dibujarMarcadorEnCanvas(
      ctx, a.resumen.posMax.x, a.resumen.posMax.y, COLOR_MAX,
      `${formatearTemperatura(a.resumen.max)}°C`, ancho, alto
    );
  }
};

const VisorPage: React.FC = () => {
  const { usuario } = useAuth();
  const { t } = useLanguage();
  const { carpetas, imagenSeleccionadaId, seleccionarImagen, registrarReporte } = useGaleria();
  const [avisoPendiente, setAvisoPendiente] = useState(false);

  const [edicionActiva, setEdicionActiva] = useState(false);
  const [menuExportarAbierto, setMenuExportarAbierto] = useState(false);
  const [herramienta, setHerramienta] = useState<Herramienta>('ninguna');
  const [colorSeleccionado, setColorSeleccionado] = useState('#39d353');
  const [anotacionesPorImagen, setAnotacionesPorImagen] = useState<Record<string, Anotacion[]>>({});
  const [dibujando, setDibujando] = useState<Anotacion | null>(null);
  const [notasPorImagen, setNotasPorImagen] = useState<Record<string, FilaEditable[]>>({});
  // Estado de guardado de puntos de medición contra el backend (no afecta el
  // diseño existente; queda disponible por si se quiere mostrar un indicador).
  const [, setGuardandoPuntos] = useState(false);
  const [, setErrorGuardadoPuntos] = useState<string | null>(null);
  // Override local de la temperatura reflejada por imagen, mientras se conecta
  // el guardado real de este parámetro contra el backend.
  const [tempReflejadaPorImagen, setTempReflejadaPorImagen] = useState<Record<string, number>>({});
  // Máx/Mín de la imagen completa recalculados por el backend al cambiar la temp. reflejada
  const [temperaturasPorImagen, setTemperaturasPorImagen] = useState<Record<string, { min: number; max: number }>>({});
  // Un temporizador por imagen para esperar a que el usuario termine de pulsar +/-
  const temporizadoresTempRef = useRef<Record<string, number>>({});
  const contadorRef = useRef(0);
  const inputColorRef = useRef<HTMLInputElement>(null);
  const contenedorImagenRef = useRef<HTMLDivElement>(null);
  const menuExportarRef = useRef<HTMLDivElement>(null);
  // Copia síncrona del trazo en curso: así, al soltar el clic, se lee el valor
  // final sin ejecutar efectos secundarios (agregar/guardar) dentro de un setState.
  const dibujandoRef = useRef<Anotacion | null>(null);

  // Cierra el menú desplegable de exportar al hacer clic en cualquier otra parte
  useEffect(() => {
    if (!menuExportarAbierto) return;
    const handleClickFuera = (e: MouseEvent) => {
      if (menuExportarRef.current && !menuExportarRef.current.contains(e.target as Node)) {
        setMenuExportarAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, [menuExportarAbierto]);

  // Aplanamos todo el árbol de carpetas (incluidas las subcarpetas) para tener
  // una sola lista de imágenes cargadas, con la ruta completa de cada una.
  const todasLasImagenes = useMemo(() => aplanarImagenes(carpetas), [carpetas]);

  const imagenActiva = useMemo(() => {
    if (imagenSeleccionadaId) {
      const encontrada = todasLasImagenes.find((img) => img.id === imagenSeleccionadaId);
      if (encontrada) return encontrada;
    }
    return todasLasImagenes[0] ?? null;
  }, [todasLasImagenes, imagenSeleccionadaId]);

  const anotaciones = imagenActiva ? anotacionesPorImagen[imagenActiva.id] ?? [] : [];
  const notas = imagenActiva ? notasPorImagen[imagenActiva.id] ?? [] : [];

  // Imagen que se le pasa al panel de propiedades, con el override local de
  // tempReflejada aplicado (si el usuario ya la cambió con los botones +/-).
  const imagenParaPanel = useMemo(() => {
    if (!imagenActiva) return null;
    const parametrosBackend = (imagenActiva as any).parametros ?? {};
    const guardadaEnBackend = Number(parametrosBackend.temperaturaReflejada);
    const tempReflejada =
      tempReflejadaPorImagen[imagenActiva.id] ??
      (Number.isFinite(guardadaEnBackend) && parametrosBackend.temperaturaReflejada !== undefined
        ? guardadaEnBackend
        : TEMP_REFLEJADA_POR_DEFECTO);
    return {
      ...imagenActiva,
      parametros: { ...parametrosBackend, tempReflejada },
    };
  }, [imagenActiva, tempReflejadaPorImagen]);

  // Pasa a las anotaciones de una imagen los valores que devuelve el backend. Se empareja
  // por etiqueta (SP1, R1, C1...) y no por posición, así cada herramienta se actualiza
  // por separado y no importa en qué orden devuelva el backend los registros.
  const aplicarPuntosGuardados = (
    idImagenActiva: string,
    puntosGuardados: PuntoMedicionGuardado[],
    dims: { ancho: number; alto: number } | null
  ) => {
    const guardadosPorEtiqueta = new Map(puntosGuardados.map((p) => [p.etiqueta, p]));
    setAnotacionesPorImagen((prev) => {
      const actuales = prev[idImagenActiva] ?? [];
      let contadorPunto = 0;
      let contadorRect = 0;
      let contadorCirc = 0;
      const actualizadas = actuales.map((a) => {
        if (a.tipo === 'punto') {
          contadorPunto += 1;
          const guardado = guardadosPorEtiqueta.get(`SP${contadorPunto}`);
          return guardado ? { ...a, valorTemp: guardado.valorTemp } : a;
        }

        if (a.tipo === 'rectangulo' || a.tipo === 'circulo') {
          // Cada herramienta tiene su propia numeración (R1, R2... / C1, C2...)
          // para que no se mezclen entre sí.
          let etiqueta: string;
          if (a.tipo === 'rectangulo') {
            contadorRect += 1;
            etiqueta = `R${contadorRect}`;
          } else {
            contadorCirc += 1;
            etiqueta = `C${contadorCirc}`;
          }
          const guardado = guardadosPorEtiqueta.get(etiqueta);
          if (
            !dims ||
            !guardado ||
            guardado.valorMin == null ||
            guardado.valorAvg == null ||
            guardado.valorMax == null
          ) {
            return a;
          }
          // posMin / posMax llegan en píxeles de la imagen original; se pasan a %
          // (al centro del píxel) para dibujarlos sobre la capa de anotaciones.
          const resumen: ResumenZona = {
            min: guardado.valorMin,
            avg: guardado.valorAvg,
            max: guardado.valorMax,
            posMin: guardado.posMin
              ? {
                  x: ((guardado.posMin.x + 0.5) / dims.ancho) * 100,
                  y: ((guardado.posMin.y + 0.5) / dims.alto) * 100,
                }
              : null,
            posMax: guardado.posMax
              ? {
                  x: ((guardado.posMax.x + 0.5) / dims.ancho) * 100,
                  y: ((guardado.posMax.y + 0.5) / dims.alto) * 100,
                }
              : null,
          };
          return { ...a, resumen };
        }

        return a;
      });
      return { ...prev, [idImagenActiva]: actualizadas };
    });
  };

  const handleCambiarTempReflejada = (valor: number) => {
    if (!imagenActiva) return;
    const idImagenActiva = imagenActiva.id;
    const idBackend = imagenActiva.idBackend;
    const anchoReal = imagenActiva.infoImagen?.ancho;
    const altoReal = imagenActiva.infoImagen?.alto;
    const dims = anchoReal && altoReal ? { ancho: anchoReal, alto: altoReal } : null;

    // El valor se ve de inmediato en el panel...
    setTempReflejadaPorImagen((prev) => ({ ...prev, [idImagenActiva]: valor }));

    if (!idBackend || Number.isNaN(valor)) return;

    // ...y se manda al backend cuando el usuario deja de pulsar +/- (0,5 s), para no
    // hacer una petición por cada clic. El backend recalcula todos los puntos, rectángulos
    // y círculos con el nuevo valor y los devuelve.
    window.clearTimeout(temporizadoresTempRef.current[idImagenActiva]);
    temporizadoresTempRef.current[idImagenActiva] = window.setTimeout(async () => {
      try {
        const respuesta = await actualizarTemperaturaReflejada(idBackend, valor);
        aplicarPuntosGuardados(idImagenActiva, respuesta.puntos, dims);
        if (respuesta.temperaturaMin != null && respuesta.temperaturaMax != null) {
          setTemperaturasPorImagen((prev) => ({
            ...prev,
            [idImagenActiva]: { min: respuesta.temperaturaMin as number, max: respuesta.temperaturaMax as number },
          }));
        }
      } catch {
        setErrorGuardadoPuntos('No se pudo actualizar la temperatura reflejada');
      }
    }, 500);
  };

  const handleExportarReporte = async (formato: 'PDF' | 'DOC') => {
    if (!imagenActiva) return;
    setMenuExportarAbierto(false);

    if (formato === 'PDF') {
      try {
        const pdfBlob = await exportarInforme({
          nombre_archivo: imagenActiva.archivo.name.replace(/\.[^/.]+$/, ''),
          nivel_riesgo: 'TODO', // TODO: conectar con el campo real cuando exista en el visor
          observaciones: notas.map((n) => `${n.clave}: ${n.valor}`).join('; ') || undefined,
          estado: 'TODO', // TODO: conectar con el campo real
          id_usuario: usuario?.id ? Number(usuario.id) : 0, // ajusta el campo según cómo guardes el id en AuthContext
        });

        if ('showSaveFilePicker' in window) {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: `${imagenActiva.archivo.name.replace(/\.[^/.]+$/, '')}.pdf`,
            types: [{ description: 'Archivo PDF', accept: { 'application/pdf': ['.pdf'] } }],
          });
          const writable = await handle.createWritable();
          await writable.write(pdfBlob);
          await writable.close();
        } else {
          const url = URL.createObjectURL(pdfBlob);
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = `${imagenActiva.archivo.name.replace(/\.[^/.]+$/, '')}.pdf`;
          enlace.click();
          URL.revokeObjectURL(url);
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Error exportando el informe PDF:', err);
        }
        return; // no marcamos como registrado si falló o el usuario canceló
      }
    }

    registrarReporte(imagenActiva.archivo.name, imagenActiva.carpeta, formato);
    setAvisoPendiente(true);
    window.setTimeout(() => setAvisoPendiente(false), 3000);
  };

  // Envía al backend TODAS las mediciones actuales de la imagen activa (puntos SP# y
  // rectángulos R#), porque el endpoint reemplaza la lista completa cada vez. Convierte
  // las coordenadas de % (pantalla) a píxeles de la imagen original, y guarda en cada
  // anotación lo que el backend devuelve: la temperatura del punto, o el mín / prom / máx
  // del rectángulo con la posición de su píxel más frío y más caliente.
  // No hace nada si la imagen todavía no terminó de subirse (idBackend ausente).
  const sincronizarMediciones = async (anotacionesActuales: Anotacion[]) => {
    if (!imagenActiva || !imagenActiva.idBackend) return;

    const idBackend = imagenActiva.idBackend;
    const idImagenActiva = imagenActiva.id;
    const anchoReal = imagenActiva.infoImagen?.ancho;
    const altoReal = imagenActiva.infoImagen?.alto;
    const dims = anchoReal && altoReal ? { ancho: anchoReal, alto: altoReal } : null;

    const puntos: PuntoAGuardar[] = [];
    let nPunto = 0;
    let nRect = 0;
    let nCirc = 0;
    anotacionesActuales.forEach((a) => {
      if (a.tipo === 'punto') {
        nPunto += 1;
        const punto: PuntoAGuardar = {
          etiqueta: `SP${nPunto}`,
          tipo: 'punto',
          valorTemp: 0, // valor provisional; el backend lo recalcula si manda x/y y la imagen es DJI
        };
        if (dims) {
          punto.x = porcentajeAPixel(a.xInicio, dims.ancho);
          punto.y = porcentajeAPixel(a.yInicio, dims.alto);
        }
        puntos.push(punto);
      } else if (a.tipo === 'rectangulo') {
        nRect += 1;
        // Sin las dimensiones reales de la imagen no se pueden calcular los píxeles
        if (dims) {
          puntos.push({
            etiqueta: `R${nRect}`,
            tipo: 'region',
            valorTemp: 0,
            x1: porcentajeAPixel(Math.min(a.xInicio, a.xFin), dims.ancho),
            y1: porcentajeAPixel(Math.min(a.yInicio, a.yFin), dims.alto),
            x2: porcentajeAPixel(Math.max(a.xInicio, a.xFin), dims.ancho),
            y2: porcentajeAPixel(Math.max(a.yInicio, a.yFin), dims.alto),
          });
        }
      } else if (a.tipo === 'circulo') {
        nCirc += 1;
        // El backend solo conoce 'punto' y 'region'. El círculo se envía como 'region'
        // con su caja delimitadora (x1,y1,x2,y2), igual que el rectángulo; lo que lo
        // distingue es la etiqueta (C1, C2...), así la numeración es independiente.
        if (dims) {
          puntos.push({
            etiqueta: `C${nCirc}`,
            tipo: 'region',
            valorTemp: 0,
            x1: porcentajeAPixel(Math.min(a.xInicio, a.xFin), dims.ancho),
            y1: porcentajeAPixel(Math.min(a.yInicio, a.yFin), dims.alto),
            x2: porcentajeAPixel(Math.max(a.xInicio, a.xFin), dims.ancho),
            y2: porcentajeAPixel(Math.max(a.yInicio, a.yFin), dims.alto),
          });
        }
      }
    });

    if (puntos.length === 0) return;

    setGuardandoPuntos(true);
    setErrorGuardadoPuntos(null);
    try {
      const respuesta = await guardarPuntosMedicion(idBackend, puntos);

      aplicarPuntosGuardados(idImagenActiva, respuesta.puntos, dims);
    } catch {
      setErrorGuardadoPuntos('No se pudieron guardar los puntos de medición');
    } finally {
      setGuardandoPuntos(false);
    }
  };

  // Compone la imagen original + las figuras marcadas en un canvas y descarga el resultado,
  // así las anotaciones quedan fijas en el archivo exportado
  const handleExportarImagen = () => {
    if (!imagenActiva) return;
    setMenuExportarAbierto(false);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      anotaciones.forEach((a) => dibujarAnotacionEnCanvas(ctx, a, canvas.width, canvas.height));

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `marcada-${imagenActiva.archivo.name}`;
        enlace.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = imagenActiva.urlPrevia;
  };

  // Todas las coordenadas se guardan en % relativos a la imagen renderizada,
  // así el dibujo se mantiene alineado sin importar el tamaño de pantalla
  const obtenerPosicionRelativa = (clientX: number, clientY: number) => {
    const el = contenedorImagenRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    return { x, y };
  };

  const agregarAnotacion = (anotacion: Anotacion) => {
    if (!imagenActiva) return;
    setAnotacionesPorImagen((prev) => ({
      ...prev,
      [imagenActiva.id]: [...(prev[imagenActiva.id] ?? []), anotacion],
    }));
  };

  const borrarAnotaciones = () => {
    if (!imagenActiva) return;
    setAnotacionesPorImagen((prev) => ({ ...prev, [imagenActiva.id]: [] }));
  };

  // Se llama una sola vez cuando se suelta el clic y el trazo queda terminado.
  // Los rectángulos y los círculos se mandan al backend para medir su temperatura.
  const finalizarTrazo = (trazo: Anotacion) => {
    agregarAnotacion(trazo);
    if ((trazo.tipo === 'rectangulo' || trazo.tipo === 'circulo') && imagenActiva) {
      const actuales = anotacionesPorImagen[imagenActiva.id] ?? [];
      sincronizarMediciones([...actuales, trazo]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (herramienta === 'ninguna' || !imagenActiva) return;
    const { x, y } = obtenerPosicionRelativa(e.clientX, e.clientY);
    contadorRef.current += 1;

    if (herramienta === 'punto') {
      const nuevaAnotacion: Anotacion = {
        id: `anot-${contadorRef.current}`,
        tipo: 'punto',
        xInicio: x,
        yInicio: y,
        xFin: x,
        yFin: y,
        color: colorSeleccionado,
      };
      agregarAnotacion(nuevaAnotacion);
      sincronizarMediciones([...anotaciones, nuevaAnotacion]);
      return;
    }

    const nuevoTrazo: Anotacion = {
      id: `anot-${contadorRef.current}`,
      tipo: herramienta,
      xInicio: x,
      yInicio: y,
      xFin: x,
      yFin: y,
      color: colorSeleccionado,
    };
    dibujandoRef.current = nuevoTrazo;
    setDibujando(nuevoTrazo);
  };

  // Mientras se arrastra, escuchamos el mousemove/mouseup en toda la ventana
  // (no solo dentro del recuadro de la imagen). Antes, si el cursor salía del
  // contenedor mientras se dibujaba, la figura se cancelaba sin guardarse;
  // ahora el trazo se sigue viendo y se confirma con soltar el clic en cualquier parte.
  useEffect(() => {
    if (!dibujando) return;

    const handleMove = (e: MouseEvent) => {
      const actual = dibujandoRef.current;
      if (!actual) return;
      const { x, y } = obtenerPosicionRelativa(e.clientX, e.clientY);
      const actualizado = { ...actual, xFin: x, yFin: y };
      dibujandoRef.current = actualizado;
      setDibujando(actualizado);
    };

    const handleUp = () => {
      const terminado = dibujandoRef.current;
      dibujandoRef.current = null;
      setDibujando(null);
      if (terminado) finalizarTrazo(terminado);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    // Solo nos interesa reaccionar a cuándo empieza/termina un trazo, no a cada
    // actualización de sus coordenadas mientras se arrastra.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dibujando !== null]);

  // Numera únicamente los puntos termográficos (SP1, SP2, ...), en el orden en que se agregaron
  const numerosPunto = useMemo(() => {
    const mapa = new Map<string, number>();
    let contador = 0;
    anotaciones.forEach((a) => {
      if (a.tipo === 'punto') {
        contador += 1;
        mapa.set(a.id, contador);
      }
    });
    return mapa;
  }, [anotaciones]);

  // Igual que arriba, pero para los rectángulos (R1, R2, ...)
  const numerosRectangulo = useMemo(() => {
    const mapa = new Map<string, number>();
    let contador = 0;
    anotaciones.forEach((a) => {
      if (a.tipo === 'rectangulo') {
        contador += 1;
        mapa.set(a.id, contador);
      }
    });
    return mapa;
  }, [anotaciones]);

  // Igual que arriba, pero para los círculos (C1, C2, ...)
  const numerosCirculo = useMemo(() => {
    const mapa = new Map<string, number>();
    let contador = 0;
    anotaciones.forEach((a) => {
      if (a.tipo === 'circulo') {
        contador += 1;
        mapa.set(a.id, contador);
      }
    });
    return mapa;
  }, [anotaciones]);

  // Marcador del píxel más frío / más caliente de una zona: círculo + punto + temperatura
  const renderMarcadorZona = (key: string, x: number, y: number, color: string, texto: string) => {
    const aLaIzquierda = x > 80; // cerca del borde derecho el texto se escribe hacia la izquierda
    return (
      <g key={key}>
        <circle cx={x} cy={y} r="1.1" fill="none" stroke={color} strokeWidth="0.35" />
        <circle cx={x} cy={y} r="0.35" fill={color} />
        <text
          x={aLaIzquierda ? x - 1.8 : x + 1.8}
          y={y - 1.4}
          fontSize="2.2"
          fontWeight="bold"
          textAnchor={aLaIzquierda ? 'end' : 'start'}
          fill={color}
          stroke="#000"
          strokeWidth="0.12"
          paintOrder="stroke"
        >
          {texto}
        </text>
      </g>
    );
  };

  // Dibuja la forma elegida, con el color elegido; el punto se ve como una
  // mira termográfica (círculo + marcas en cruz) con su etiqueta SP#
  const renderAnotacion = (a: Anotacion) => {
    if (a.tipo === 'punto') {
      const numero = numerosPunto.get(a.id);
      return (
        <g key={a.id}>
          <circle cx={a.xInicio} cy={a.yInicio} r="1.6" fill="none" stroke={a.color} strokeWidth="0.35" />
          <line x1={a.xInicio - 2.6} y1={a.yInicio} x2={a.xInicio - 1.1} y2={a.yInicio} stroke={a.color} strokeWidth="0.35" />
          <line x1={a.xInicio + 1.1} y1={a.yInicio} x2={a.xInicio + 2.6} y2={a.yInicio} stroke={a.color} strokeWidth="0.35" />
          <line x1={a.xInicio} y1={a.yInicio - 2.6} x2={a.xInicio} y2={a.yInicio - 1.1} stroke={a.color} strokeWidth="0.35" />
          <line x1={a.xInicio} y1={a.yInicio + 1.1} x2={a.xInicio} y2={a.yInicio + 2.6} stroke={a.color} strokeWidth="0.35" />
          <circle cx={a.xInicio} cy={a.yInicio} r="0.4" fill={a.color} />
          {numero && (
            <text
              x={a.xInicio + 2.1}
              y={a.yInicio - 1.9}
              fontSize="2.4"
              fill={a.color}
              stroke="#000"
              strokeWidth="0.12"
              paintOrder="stroke"
            >
              {`SP${numero}`}
            </text>
          )}
        </g>
      );
    }

    const x1 = Math.min(a.xInicio, a.xFin);
    const y1 = Math.min(a.yInicio, a.yFin);
    const ancho = Math.abs(a.xFin - a.xInicio);
    const alto = Math.abs(a.yFin - a.yInicio);

    if (a.tipo === 'rectangulo') {
      return (
        <g key={a.id}>
          <rect
            x={x1}
            y={y1}
            width={ancho}
            height={alto}
            className="forma-anotacion"
            stroke={a.color}
            fill={a.color}
          />
          {a.resumen?.posMin &&
            renderMarcadorZona(
              `${a.id}-min`, a.resumen.posMin.x, a.resumen.posMin.y, COLOR_MIN,
              `${formatearTemperatura(a.resumen.min)}°C`
            )}
          {a.resumen?.posMax &&
            renderMarcadorZona(
              `${a.id}-max`, a.resumen.posMax.x, a.resumen.posMax.y, COLOR_MAX,
              `${formatearTemperatura(a.resumen.max)}°C`
            )}
        </g>
      );
    }

    // círculo
    return (
      <g key={a.id}>
        <ellipse
          cx={x1 + ancho / 2}
          cy={y1 + alto / 2}
          rx={ancho / 2}
          ry={alto / 2}
          className="forma-anotacion"
          stroke={a.color}
          fill={a.color}
        />
        {a.resumen?.posMin &&
          renderMarcadorZona(
            `${a.id}-min`, a.resumen.posMin.x, a.resumen.posMin.y, COLOR_MIN,
            `${formatearTemperatura(a.resumen.min)}°C`
          )}
        {a.resumen?.posMax &&
          renderMarcadorZona(
            `${a.id}-max`, a.resumen.posMax.x, a.resumen.posMax.y, COLOR_MAX,
            `${formatearTemperatura(a.resumen.max)}°C`
          )}
      </g>
    );
  };

  const esHerramientaActiva = (h: Herramienta) =>
    herramienta === h ? 'boton-herramienta boton-herramienta-activa' : 'boton-herramienta';

  const alternarEdicion = () => {
    setEdicionActiva((prev) => {
      if (prev) setHerramienta('ninguna'); // al cerrar la barra, se sale del modo dibujo
      return !prev;
    });
    setMenuExportarAbierto(false);
  };

  // Tabla editable de observaciones (Remarks), independiente por imagen
  const agregarFilaNota = () => {
    if (!imagenActiva) return;
    const nueva: FilaEditable = { id: `nota-${Date.now()}`, clave: '', valor: '' };
    setNotasPorImagen((prev) => ({ ...prev, [imagenActiva.id]: [...(prev[imagenActiva.id] ?? []), nueva] }));
  };

  const actualizarFilaNota = (id: string, campo: 'clave' | 'valor', texto: string) => {
    if (!imagenActiva) return;
    setNotasPorImagen((prev) => ({
      ...prev,
      [imagenActiva.id]: (prev[imagenActiva.id] ?? []).map((f) => (f.id === id ? { ...f, [campo]: texto } : f)),
    }));
  };

  const eliminarFilaNota = (id: string) => {
    if (!imagenActiva) return;
    setNotasPorImagen((prev) => ({
      ...prev,
      [imagenActiva.id]: (prev[imagenActiva.id] ?? []).filter((f) => f.id !== id),
    }));
  };

  const formatearGrados = (valor?: number) => (valor !== undefined ? `${formatearTemperatura(valor)}°C` : '—');

  return (
    <>
      <div className="explorador">
        <NavLateral />

        <div className="explorador-contenido">
          <header className="explorador-header explorador-header-simple">
            <h3>
              {t('nav.visor')} {usuario ? `— ${usuario.nombre}` : ''}
            </h3>
          </header>

          {todasLasImagenes.length === 0 ? (
            <p className="texto-suave mensaje-vacio">{t('visor.vacio')}</p>
          ) : (
            <div className="visor-layout">
              <div className="visor-principal">
                <div className="pestanas-imagenes">
                  {todasLasImagenes.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      className={img.id === imagenActiva?.id ? 'pestana pestana-activa' : 'pestana'}
                      onClick={() => seleccionarImagen(img.id)}
                    >
                      {img.archivo.name}
                    </button>
                  ))}
                </div>

                {imagenActiva ? (
                  <div className="area-edicion-visor">
                    {/* Barra superior: nombre + fecha, borrar mediciones, editar y exportar */}
                    <div className="barra-superior-visor">
                      <div className="barra-superior-info">
                        <span className="barra-superior-nombre">{imagenActiva.archivo.name}</span>
                        <span className="texto-suave">{new Date(imagenActiva.fecha).toLocaleString()}</span>
                      </div>

                      <div className="barra-superior-acciones">
                        <button
                          type="button"
                          className="boton-superior-visor"
                          title={t('visor.limpiarTodo')}
                          onClick={borrarAnotaciones}
                        >
                          <i className="fa-solid fa-broom"></i> {t('visor.limpiarTodo')}
                        </button>

                        <button
                          type="button"
                          className={edicionActiva ? 'boton-superior-visor boton-superior-activo' : 'boton-superior-visor'}
                          title={t('visor.editar')}
                          onClick={alternarEdicion}
                        >
                          <i className="fa-solid fa-pen"></i> {t('visor.editar')}
                        </button>

                        <div className="menu-exportar-visor" ref={menuExportarRef}>
                          <button
                            type="button"
                            className="boton-superior-visor"
                            title={t('visor.exportar')}
                            onClick={() => setMenuExportarAbierto((prev) => !prev)}
                          >
                            <i className="fa-solid fa-file-export"></i> {t('visor.exportar')}
                            <i className={`fa-solid fa-chevron-down menu-exportar-flecha ${menuExportarAbierto ? 'rotado' : ''}`}></i>
                          </button>

                          {menuExportarAbierto && (
                            <div className="menu-exportar-opciones">
                              <button type="button" onClick={() => handleExportarReporte('PDF')}>
                                <i className="fa-solid fa-file-pdf"></i> {t('visor.exportarPdf')}
                              </button>
                              <button type="button" onClick={() => handleExportarReporte('DOC')}>
                                <i className="fa-solid fa-file-word"></i> {t('visor.exportarDoc')}
                              </button>
                              <button type="button" onClick={handleExportarImagen}>
                                <i className="fa-solid fa-image"></i> {t('visor.exportarImagen')}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {avisoPendiente && (
                      <p className="aviso-pendiente aviso-pendiente-superior">
                        <i className="fa-solid fa-circle-check" style={{ color: '#1a7a43', fontSize: '13px' }}></i>
                        {t('visor.reporteRegistrado')}
                      </p>
                    )}

                    <div className="area-imagen-y-herramientas">
                      {edicionActiva && (
                        <aside className="barra-herramientas-visor">
                          <button
                            type="button"
                            className={esHerramientaActiva('ninguna')}
                            title={t('visor.herramienta.seleccionar')}
                            onClick={() => setHerramienta('ninguna')}
                          >
                            <i className="fa-solid fa-arrow-pointer"></i>
                          </button>
                          <button
                            type="button"
                            className={esHerramientaActiva('punto')}
                            title={t('visor.herramienta.punto')}
                            onClick={() => setHerramienta('punto')}
                          >
                            <i className="fa-solid fa-crosshairs"></i>
                          </button>
                          <button
                            type="button"
                            className={esHerramientaActiva('rectangulo')}
                            title={t('visor.herramienta.rectangulo')}
                            onClick={() => setHerramienta('rectangulo')}
                          >
                            <i className="fa-regular fa-square"></i>
                          </button>
                          <button
                            type="button"
                            className={esHerramientaActiva('circulo')}
                            title={t('visor.herramienta.circulo')}
                            onClick={() => setHerramienta('circulo')}
                          >
                            <i className="fa-regular fa-circle"></i>
                          </button>

                          <button
                            type="button"
                            className="boton-herramienta boton-color"
                            title={t('visor.herramienta.color')}
                            onClick={() => inputColorRef.current?.click()}
                          >
                            <i className="fa-solid fa-palette"></i>
                            <span className="muestra-color" style={{ backgroundColor: colorSeleccionado }}></span>
                          </button>
                          <input
                            ref={inputColorRef}
                            type="color"
                            value={colorSeleccionado}
                            onChange={(e) => setColorSeleccionado(e.target.value)}
                            className="input-color-oculto"
                          />

                          <button
                            type="button"
                            className="boton-herramienta boton-herramienta-borrar"
                            title={t('visor.herramienta.borrarTodo')}
                            onClick={borrarAnotaciones}
                          >
                            <i className="fa-solid fa-broom"></i>
                          </button>
                        </aside>
                      )}

                      <div className="contenedor-imagen-visor">
                        <div
                          ref={contenedorImagenRef}
                          className={`lienzo-imagen-visor ${herramienta !== 'ninguna' ? 'lienzo-dibujando' : ''}`}
                          onMouseDown={handleMouseDown}
                        >
                          <img
                            src={imagenActiva.urlPrevia}
                            alt={imagenActiva.archivo.name}
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                          />

                          <svg className="capa-anotaciones" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {anotaciones.map((a) => renderAnotacion(a))}
                            {dibujando && renderAnotacion(dibujando)}
                          </svg>
                        </div>

                        <div className="barra-temperatura">
                          <span className="temp-max">{formatearTemperatura(temperaturasPorImagen[imagenActiva.id]?.max ?? imagenActiva.temperaturaMax)}°C</span>
                          <div className="gradiente-temperatura"></div>
                          <span className="temp-min">{formatearTemperatura(temperaturasPorImagen[imagenActiva.id]?.min ?? imagenActiva.temperaturaMin)}°C</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="texto-suave mensaje-vacio">{t('visor.sinSeleccion')}</p>
                )}
              </div>

              {imagenActiva && (
                <aside className="visor-panel">
                  <h4>{imagenActiva.archivo.name}</h4>
                  <p className="texto-suave">{imagenActiva.rutaCompleta}</p>

                  {/* Parameters e Image Info: la lectura real llegará con el
                      backend de análisis; por ahora se muestran vacíos ("—").
                      El cuadro Máx/Mín/ΔTemp lo dibuja TablaParametros; la lista
                      de puntos de medición se inyecta justo debajo con debajoDelCuadro. */}
                  <TablaParametros
                    imagen={imagenParaPanel}
                    onCambiarTempReflejada={handleCambiarTempReflejada}
                    debajoDelCuadro={
                      anotaciones.length > 0 ? (
                        <div className="puntos-medicion">
                          <h5 className="visor-panel-subtitulo">{t('visor.puntos.titulo')}</h5>
                          <div className="lista-puntos-medicion">
                            {anotaciones.map((a) => {
                              if (a.tipo === 'punto') {
                                return (
                                  <div key={a.id} className="punto-medicion-item">
                                    <span className="punto-medicion-color" style={{ backgroundColor: a.color }} />
                                    <span className="punto-medicion-etiqueta">SP{numerosPunto.get(a.id)}</span>
                                    <span className="punto-medicion-valor">
                                      {a.valorTemp !== undefined ? `${formatearTemperatura(a.valorTemp)}°C` : '—'}
                                    </span>
                                  </div>
                                );
                              }

                              // Rectángulo: tarjeta con Máx / Mín / ΔTemp de la zona.
                              // ΔTemp = Máx − Mín. Mientras el backend responde (o si la
                              // imagen no es DJI) los valores se ven como "—".
                              if (a.tipo === 'rectangulo') {
                                const deltaTemp = a.resumen
                                  ? Number((a.resumen.max - a.resumen.min).toFixed(1))
                                  : undefined;

                                return (
                                  <div key={a.id} className="zona-medicion">
                                    <div className="zona-medicion-titulo">
                                      <span className="punto-medicion-color" style={{ backgroundColor: a.color }} />
                                      <span className="punto-medicion-etiqueta">R{numerosRectangulo.get(a.id)}</span>
                                    </div>
                                    <div className="zona-medicion-valores">
                                      <div className="zona-medicion-dato">
                                        <span>Máx.</span>
                                        <strong>{formatearGrados(a.resumen?.max)}</strong>
                                      </div>
                                      <div className="zona-medicion-dato">
                                        <span>Mín.</span>
                                        <strong>{formatearGrados(a.resumen?.min)}</strong>
                                      </div>
                                      <div className="zona-medicion-dato">
                                        <span>ΔTemp</span>
                                        <strong>{formatearGrados(deltaTemp)}</strong>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              // Círculo: tarjeta con Máx / Mín / ΔTemp, igual que el rectángulo
                              // pero con su propia numeración (C1, C2...).
                              const deltaTempCirculo = a.resumen
                                ? Number((a.resumen.max - a.resumen.min).toFixed(1))
                                : undefined;

                              return (
                                <div key={a.id} className="zona-medicion">
                                  <div className="zona-medicion-titulo">
                                    <span className="punto-medicion-color" style={{ backgroundColor: a.color }} />
                                    <span className="punto-medicion-etiqueta">C{numerosCirculo.get(a.id)}</span>
                                  </div>
                                  <div className="zona-medicion-valores">
                                    <div className="zona-medicion-dato">
                                      <span>Máx.</span>
                                      <strong>{formatearGrados(a.resumen?.max)}</strong>
                                    </div>
                                    <div className="zona-medicion-dato">
                                      <span>Mín.</span>
                                      <strong>{formatearGrados(a.resumen?.min)}</strong>
                                    </div>
                                    <div className="zona-medicion-dato">
                                      <span>ΔTemp</span>
                                      <strong>{formatearGrados(deltaTempCirculo)}</strong>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : undefined
                    }
                  />
                  <TablaInfoImagen imagen={imagenParaPanel} />

                  {/* Remarks: tabla editable clave/valor, independiente por imagen */}
                  <div className="tabla-editable-header">
                    <h5 className="visor-panel-subtitulo">{t('visor.notas.titulo')}</h5>
                    <button type="button" className="boton-agregar-fila" onClick={agregarFilaNota} title={t('visor.notas.agregar')}>
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>

                  <table className="tabla-editable">
                    <thead>
                      <tr>
                        <th>{t('visor.notas.clave')}</th>
                        <th>{t('visor.notas.valor')}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {notas.map((fila) => (
                        <tr key={fila.id}>
                          <td>
                            <input
                              type="text"
                              value={fila.clave}
                              onChange={(e) => actualizarFilaNota(fila.id, 'clave', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={fila.valor}
                              onChange={(e) => actualizarFilaNota(fila.id, 'valor', e.target.value)}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="boton-quitar-fila"
                              onClick={() => eliminarFilaNota(fila.id)}
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {notas.length === 0 && (
                        <tr>
                          <td colSpan={3} className="texto-suave">
                            {t('visor.notas.vacio')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </aside>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="footer">{t('footer.texto')}</footer>
    </>
  );
};

export default VisorPage;