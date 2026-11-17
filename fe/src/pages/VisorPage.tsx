import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useGaleria } from '../context/GaleriaContext';
import NavLateral from '../components/NavLateral';
import { TablaParametros, TablaInfoImagen } from '../components/TablasPropiedades';
import { aplanarImagenes } from '../utils/arbolCarpetas';
import { formatearTemperatura, TEMP_REFLEJADA_POR_DEFECTO } from '../utils/temperaturas';
import {
  guardarPuntosMedicion,
  obtenerImagenConPaleta,
  actualizarTemperaturaReflejada,
} from '../api/ImagenesTermograficas';
import type { PuntoAGuardar } from '../api/ImagenesTermograficas';
import type { PuntoMedicionGuardado } from '../types/galeria';
import { PALETAS, PALETA_POR_DEFECTO, gradientePaleta } from '../utils/paletas';
import type { IdPaleta } from '../utils/paletas';
import '../styles/styles.css';
import '../styles/dashboard.css';
import '../styles/visor.css';
import '../styles/modal.css';
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

type Dimensiones = { ancho: number; alto: number };
type ImagenVisor = ReturnType<typeof aplanarImagenes>[number];

// Colores de los marcadores que señalan el píxel más frío y el más caliente de una zona
const COLOR_MIN = '#4dabf7';
const COLOR_MAX = '#ff4d4f';
const COLOR_POR_DEFECTO = '#39d353';

// Convierte un porcentaje (0-100) de la imagen renderizada a un píxel de la imagen original
const porcentajeAPixel = (pct: number, total: number) =>
  Math.min(total - 1, Math.max(0, Math.round((pct / 100) * total)));

// Convierte las anotaciones de pantalla (%) en el payload que espera el backend.
// Punto → SP#, rectángulo → R#, círculo → C# (los dos últimos viajan como 'region'
// con su caja delimitadora; la etiqueta es lo que los distingue).
const construirPuntos = (anotaciones: Anotacion[], dims: Dimensiones | null): PuntoAGuardar[] => {
  const puntos: PuntoAGuardar[] = [];
  let nPunto = 0;
  let nRect = 0;
  let nCirc = 0;

  anotaciones.forEach((a) => {
    if (a.tipo === 'punto') {
      nPunto += 1;
      const punto: PuntoAGuardar = {
        etiqueta: `SP${nPunto}`,
        tipo: 'punto',
        valorTemp: 0, // provisional; el backend lo recalcula si manda x/y y la imagen es DJI
        color: a.color,
      };
      if (dims) {
        punto.x = porcentajeAPixel(a.xInicio, dims.ancho);
        punto.y = porcentajeAPixel(a.yInicio, dims.alto);
      }
      puntos.push(punto);
      return;
    }

    const esRect = a.tipo === 'rectangulo';
    if (esRect) nRect += 1;
    else nCirc += 1;

    // Sin las dimensiones reales de la imagen no se pueden calcular los píxeles
    if (!dims) return;

    puntos.push({
      etiqueta: esRect ? `R${nRect}` : `C${nCirc}`,
      tipo: 'region',
      valorTemp: 0,
      color: a.color,
      x1: porcentajeAPixel(Math.min(a.xInicio, a.xFin), dims.ancho),
      y1: porcentajeAPixel(Math.min(a.yInicio, a.yFin), dims.alto),
      x2: porcentajeAPixel(Math.max(a.xInicio, a.xFin), dims.ancho),
      y2: porcentajeAPixel(Math.max(a.yInicio, a.yFin), dims.alto),
    });
  });

  return puntos;
};

// Reconstruye una anotación de pantalla a partir de un punto guardado en la BD
const puntoGuardadoAAnotacion = (
  p: PuntoMedicionGuardado,
  dims: Dimensiones
): { numero: number; anotacion: Anotacion } | null => {
  const pctX = (v: number) => (v / dims.ancho) * 100;
  const pctY = (v: number) => (v / dims.alto) * 100;
  const color = p.color ?? COLOR_POR_DEFECTO;
  const numero = Number(p.etiqueta.replace(/\D/g, '')) || 0;
  const id = `anot-guardada-${p.id ?? p.etiqueta}`;

  if (p.tipo !== 'region') {
    if (p.x == null || p.y == null) return null;
    return {
      numero,
      anotacion: {
        id,
        tipo: 'punto',
        xInicio: pctX(p.x),
        yInicio: pctY(p.y),
        xFin: pctX(p.x),
        yFin: pctY(p.y),
        color,
        valorTemp: p.valorTemp,
      },
    };
  }

  if (p.x1 == null || p.y1 == null || p.x2 == null || p.y2 == null) return null;

  const resumen: ResumenZona | undefined =
    p.valorMin != null && p.valorAvg != null && p.valorMax != null
      ? {
          min: p.valorMin,
          avg: p.valorAvg,
          max: p.valorMax,
          posMin: p.posMin
            ? { x: ((p.posMin.x + 0.5) / dims.ancho) * 100, y: ((p.posMin.y + 0.5) / dims.alto) * 100 }
            : null,
          posMax: p.posMax
            ? { x: ((p.posMax.x + 0.5) / dims.ancho) * 100, y: ((p.posMax.y + 0.5) / dims.alto) * 100 }
            : null,
        }
      : undefined;

  return {
    numero,
    anotacion: {
      id,
      tipo: p.etiqueta.startsWith('C') ? 'circulo' : 'rectangulo',
      xInicio: pctX(p.x1),
      yInicio: pctY(p.y1),
      xFin: pctX(p.x2),
      yFin: pctY(p.y2),
      color,
      resumen,
    },
  };
};

// Las notas (clave/valor) se guardan como JSON en imagen_termografica.observaciones
const serializarObservaciones = (filas: FilaEditable[]) =>
  JSON.stringify(
    filas
      .filter((f) => f.clave.trim() || f.valor.trim())
      .map(({ clave, valor }) => ({ clave, valor }))
  );

const parsearObservaciones = (texto?: string): FilaEditable[] => {
  if (!texto) return [];
  try {
    const datos = JSON.parse(texto);
    if (Array.isArray(datos)) {
      return datos.map((f, i) => ({
        id: `nota-${Date.now()}-${i}`,
        clave: String(f?.clave ?? ''),
        valor: String(f?.valor ?? ''),
      }));
    }
  } catch {
    // texto plano anterior al formato JSON
  }
  return [{ id: `nota-${Date.now()}-0`, clave: '', valor: texto }];
};

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
  } else {
    // círculo
    ctx.beginPath();
    ctx.ellipse(x1 + w / 2, y1 + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.globalAlpha = 0.15;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.stroke();
  }

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
  const { carpetas, imagenSeleccionadaId, seleccionarImagen, registrarReporte, actualizarImagen } = useGaleria();
  const [avisoPendiente, setAvisoPendiente] = useState(false);
  const [avisoGuardado, setAvisoGuardado] = useState(false);

  const [edicionActiva, setEdicionActiva] = useState(false);
  const [menuExportarAbierto, setMenuExportarAbierto] = useState(false);
  const [herramienta, setHerramienta] = useState<Herramienta>('ninguna');
  const [colorSeleccionado, setColorSeleccionado] = useState(COLOR_POR_DEFECTO);
  const [anotacionesPorImagen, setAnotacionesPorImagen] = useState<Record<string, Anotacion[]>>({});
  const [dibujando, setDibujando] = useState<Anotacion | null>(null);
  const [notasPorImagen, setNotasPorImagen] = useState<Record<string, FilaEditable[]>>({});
  const [, setGuardandoPuntos] = useState(false);
  const [errorGuardadoPuntos, setErrorGuardadoPuntos] = useState<string | null>(null);
  // Imágenes con cambios sin guardar (un guardado que falló o notas editadas)
  const [imagenesConCambios, setImagenesConCambios] = useState<Set<string>>(new Set());
  const [guardandoTodo, setGuardandoTodo] = useState(false);
  // Imágenes cuyo contenido ya se cargó desde la BD (evita pisar lo que el usuario edita)
  const hidratadasRef = useRef<Set<string>>(new Set());
  const cambiosRef = useRef(false);
  // Temperatura reflejada elegida por imagen: se ve al instante en el panel y se
  // envía al backend (con una pequeña espera) para recalcular las mediciones.
  const [tempReflejadaPorImagen, setTempReflejadaPorImagen] = useState<Record<string, number>>({});
  // Máx/Mín de la imagen completa recalculados por el backend al cambiar la temp. reflejada
  const [temperaturasPorImagen, setTemperaturasPorImagen] = useState<Record<string, { min: number; max: number }>>({});
  // Un temporizador por imagen para esperar a que el usuario termine de pulsar +/-
  const temporizadoresTempRef = useRef<Record<string, number>>({});
  // Paleta térmica elegida por imagen y caché de las imágenes ya generadas por el backend
  const [menuPaletaAbierto, setMenuPaletaAbierto] = useState(false);
  const [paletaPorImagen, setPaletaPorImagen] = useState<Record<string, IdPaleta>>({});
  const [urlPaletaPorImagen, setUrlPaletaPorImagen] = useState<Record<string, string>>({}); // clave: `${idImagen}:${paleta}`
  const contadorRef = useRef(0);
  const inputColorRef = useRef<HTMLInputElement>(null);
  const contenedorImagenRef = useRef<HTMLDivElement>(null);
  const menuExportarRef = useRef<HTMLDivElement>(null);
  const menuPaletaRef = useRef<HTMLDivElement>(null);
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

  // Cierra el popup de paletas al hacer clic en cualquier otra parte
  useEffect(() => {
    if (!menuPaletaAbierto) return;
    const handleClickFuera = (e: MouseEvent) => {
      if (menuPaletaRef.current && !menuPaletaRef.current.contains(e.target as Node)) {
        setMenuPaletaAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, [menuPaletaAbierto]);

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

  // Iron Red es la paleta que ya trae la foto de DJI, así que usa la imagen original;
  // las demás las genera el backend a partir de las temperaturas reales.
  const paletaActiva: IdPaleta = imagenActiva
    ? paletaPorImagen[imagenActiva.id] ?? PALETA_POR_DEFECTO
    : PALETA_POR_DEFECTO;
  const coloresPaletaActiva = PALETAS.find((p) => p.id === paletaActiva)?.colores ?? [];
  const urlImagenActiva = imagenActiva
    ? paletaActiva === PALETA_POR_DEFECTO
      ? imagenActiva.urlPrevia
      : urlPaletaPorImagen[`${imagenActiva.id}:${paletaActiva}`] ?? imagenActiva.urlPrevia
    : '';

  const handleSeleccionarPaleta = async (id: IdPaleta) => {
    if (!imagenActiva) return;
    const idImagen = imagenActiva.id;
    const idBackend = imagenActiva.idBackend;
    const clave = `${idImagen}:${id}`;

    setPaletaPorImagen((prev) => ({ ...prev, [idImagen]: id }));
    setMenuPaletaAbierto(false);

    if (id === PALETA_POR_DEFECTO || urlPaletaPorImagen[clave] || !idBackend) return;
    try {
      const url = await obtenerImagenConPaleta(idBackend, id);
      setUrlPaletaPorImagen((prev) => ({ ...prev, [clave]: url }));
    } catch {
      // Si el backend no pudo generarla, se vuelve a la paleta original
      setPaletaPorImagen((prev) => ({ ...prev, [idImagen]: PALETA_POR_DEFECTO }));
      setErrorGuardadoPuntos('No se pudo aplicar la paleta');
    }
  };

  // Imagen que se le pasa al panel de propiedades. La temp. reflejada sale, por orden, de:
  // 1) lo que el usuario cambió con +/-, 2) lo guardado en el backend, 3) el valor por
  // defecto que usa el backend. Así el panel muestra siempre el valor con el que se calcula.
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
    dims: Dimensiones | null
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

  // ---------- Guardado, recuperación y alerta al salir ----------
  const hayCambios = imagenesConCambios.size > 0;
  cambiosRef.current = hayCambios;

  const marcarCambios = (id: string) =>
    setImagenesConCambios((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  const limpiarCambios = (id: string) =>
    setImagenesConCambios((prev) => {
      if (!prev.has(id)) return prev;
      const siguiente = new Set(prev);
      siguiente.delete(id);
      return siguiente;
    });

  // Guarda en el backend puntos + colores + observaciones de una imagen y copia lo
  // devuelto al contexto, para que al salir y volver al visor se muestre lo guardado.
  // La imagen queda marcada "con cambios" hasta que el guardado termina bien.
  const guardarImagen = async (
    img: ImagenVisor,
    anots: Anotacion[],
    filas: FilaEditable[],
    permitirVacio = false
  ): Promise<boolean> => {
    if (!img.idBackend) return false;
    const ancho = img.infoImagen?.ancho;
    const alto = img.infoImagen?.alto;
    const dims = ancho && alto ? { ancho, alto } : null;

    const puntos = construirPuntos(anots, dims);
    if (puntos.length === 0 && !permitirVacio) return false;
    // Hay figuras pero no se pudieron convertir a píxeles (faltan las dimensiones):
    // no se envía una lista vacía para no borrar lo que ya está guardado.
    if (puntos.length === 0 && anots.length > 0) return false;

    marcarCambios(img.id);
    const respuesta = await guardarPuntosMedicion(img.idBackend, puntos, serializarObservaciones(filas));
    aplicarPuntosGuardados(img.id, respuesta.puntos, dims);
    actualizarImagen(img.id, { puntos: respuesta.puntos, observaciones: respuesta.observaciones });
    limpiarCambios(img.id);
    return true;
  };

  const guardarTodo = async (idsExtra: string[] = []): Promise<boolean> => {
    const ids = Array.from(new Set([...imagenesConCambios, ...idsExtra]));
    if (ids.length === 0) return true;

    setGuardandoTodo(true);
    setErrorGuardadoPuntos(null);
    let ok = true;
    for (const id of ids) {
      const img = todasLasImagenes.find((i) => i.id === id);
      if (!img) {
        limpiarCambios(id);
        continue;
      }
      try {
        const guardada = await guardarImagen(img, anotacionesPorImagen[id] ?? [], notasPorImagen[id] ?? [], true);
        if (!guardada) ok = false;
      } catch {
        ok = false;
      }
    }
    setGuardandoTodo(false);
    if (!ok) setErrorGuardadoPuntos('No se pudieron guardar los cambios');
    return ok;
  };

  const handleGuardar = async () => {
    const ok = await guardarTodo(imagenActiva?.idBackend ? [imagenActiva.id] : []);
    if (ok) {
      setAvisoGuardado(true);
      window.setTimeout(() => setAvisoGuardado(false), 3000);
    }
  };

  // Al entrar: reconstruye anotaciones y notas desde lo que hay en la BD (vía el contexto)
  useEffect(() => {
    const nuevasAnotaciones: Record<string, Anotacion[]> = {};
    const nuevasNotas: Record<string, FilaEditable[]> = {};

    todasLasImagenes.forEach((img) => {
      if (!img.idBackend || hidratadasRef.current.has(img.id)) return;
      const ancho = img.infoImagen?.ancho;
      const alto = img.infoImagen?.alto;
      const puntos = img.puntos ?? [];
      if (puntos.length > 0 && !(ancho && alto)) return; // espera a tener las dimensiones
      hidratadasRef.current.add(img.id);

      if (puntos.length > 0 && ancho && alto) {
        nuevasAnotaciones[img.id] = puntos
          .map((p) => puntoGuardadoAAnotacion(p, { ancho, alto }))
          .filter((x): x is NonNullable<typeof x> => x !== null)
          .sort((a, b) => a.numero - b.numero)
          .map((x) => x.anotacion);
      }
      if (img.observaciones) nuevasNotas[img.id] = parsearObservaciones(img.observaciones);
    });

    if (Object.keys(nuevasAnotaciones).length > 0) {
      setAnotacionesPorImagen((prev) => {
        const siguiente = { ...prev };
        Object.entries(nuevasAnotaciones).forEach(([id, lista]) => {
          if (siguiente[id] === undefined) siguiente[id] = lista;
        });
        return siguiente;
      });
    }
    if (Object.keys(nuevasNotas).length > 0) {
      setNotasPorImagen((prev) => {
        const siguiente = { ...prev };
        Object.entries(nuevasNotas).forEach(([id, filas]) => {
          if (siguiente[id] === undefined) siguiente[id] = filas;
        });
        return siguiente;
      });
    }
  }, [todasLasImagenes]);

  // Cerrar o recargar la pestaña con cambios sin guardar
  useEffect(() => {
    if (!hayCambios) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hayCambios]);

  // Navegar a otra página dentro de la app con cambios sin guardar.
  // Para que la alerta salga SIEMPRE al salir del visor (recordando el PDF), cambia
  // `cambiosRef.current &&` por `true &&`.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      cambiosRef.current && currentLocation.pathname !== nextLocation.pathname
  );

  const handleModalGuardar = async () => {
    const ok = await guardarTodo();
    if (ok && blocker.state === 'blocked') blocker.proceed();
  };
  const handleModalSalir = () => {
    if (blocker.state === 'blocked') blocker.proceed();
  };
  const handleModalCancelar = () => {
    if (blocker.state === 'blocked') blocker.reset();
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
    // y círculos con el nuevo valor, y la escala (máx/mín) de la imagen completa.
    window.clearTimeout(temporizadoresTempRef.current[idImagenActiva]);
    temporizadoresTempRef.current[idImagenActiva] = window.setTimeout(async () => {
      try {
        const respuesta = await actualizarTemperaturaReflejada(idBackend, valor);
        aplicarPuntosGuardados(idImagenActiva, respuesta.puntos, dims);
        // Se copia al contexto para que al volver al visor se vea el valor actualizado
        actualizarImagen(idImagenActiva, {
          parametros: respuesta.parametros,
          puntos: respuesta.puntos,
          ...(respuesta.temperaturaMin != null &&
            respuesta.temperaturaMax != null && {
              temperaturaMin: respuesta.temperaturaMin,
              temperaturaMax: respuesta.temperaturaMax,
            }),
        });
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

  // Autoguardado al terminar un punto / rectángulo / círculo: envía TODAS las mediciones
  // actuales de la imagen (el endpoint reemplaza la lista completa), junto con colores y notas.
  // No hace nada si la imagen todavía no terminó de subirse (idBackend ausente).
  const sincronizarMediciones = async (anotacionesActuales: Anotacion[]) => {
    if (!imagenActiva) return;
    setGuardandoPuntos(true);
    setErrorGuardadoPuntos(null);
    try {
      await guardarImagen(imagenActiva, anotacionesActuales, notas);
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
    // Se exporta con la paleta que el usuario tiene elegida en pantalla
    img.src = urlImagenActiva;
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

  // Borra las figuras y lo avisa al backend, para que no reaparezcan al volver al visor
  const borrarAnotaciones = () => {
    if (!imagenActiva) return;
    setAnotacionesPorImagen((prev) => ({ ...prev, [imagenActiva.id]: [] }));
    if (!imagenActiva.idBackend) return;
    guardarImagen(imagenActiva, [], notas, true).catch(() =>
      setErrorGuardadoPuntos('No se pudieron guardar los cambios')
    );
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
      if (prev) {
        setHerramienta('ninguna'); // al cerrar la barra, se sale del modo dibujo
        setMenuPaletaAbierto(false);
      }
      return !prev;
    });
    setMenuExportarAbierto(false);
  };

  // Tabla editable de observaciones (Remarks), independiente por imagen.
  // Cada edición marca la imagen como "con cambios" hasta que se guarde.
  const agregarFilaNota = () => {
    if (!imagenActiva) return;
    const nueva: FilaEditable = { id: `nota-${Date.now()}`, clave: '', valor: '' };
    setNotasPorImagen((prev) => ({ ...prev, [imagenActiva.id]: [...(prev[imagenActiva.id] ?? []), nueva] }));
    if (imagenActiva.idBackend) marcarCambios(imagenActiva.id);
  };

  const actualizarFilaNota = (id: string, campo: 'clave' | 'valor', texto: string) => {
    if (!imagenActiva) return;
    setNotasPorImagen((prev) => ({
      ...prev,
      [imagenActiva.id]: (prev[imagenActiva.id] ?? []).map((f) => (f.id === id ? { ...f, [campo]: texto } : f)),
    }));
    if (imagenActiva.idBackend) marcarCambios(imagenActiva.id);
  };

  const eliminarFilaNota = (id: string) => {
    if (!imagenActiva) return;
    setNotasPorImagen((prev) => ({
      ...prev,
      [imagenActiva.id]: (prev[imagenActiva.id] ?? []).filter((f) => f.id !== id),
    }));
    if (imagenActiva.idBackend) marcarCambios(imagenActiva.id);
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
                    {/* Barra superior: nombre + fecha, guardar, borrar mediciones, editar y exportar */}
                    <div className="barra-superior-visor">
                      <div className="barra-superior-info">
                        <span className="barra-superior-nombre">{imagenActiva.archivo.name}</span>
                        <span className="texto-suave">{new Date(imagenActiva.fecha).toLocaleString()}</span>
                      </div>

                      <div className="barra-superior-acciones">
                        <button
                          type="button"
                          className="boton-superior-visor"
                          title="Guardar"
                          onClick={handleGuardar}
                          disabled={guardandoTodo}
                        >
                          <i className="fa-solid fa-floppy-disk"></i> {guardandoTodo ? 'Guardando…' : 'Guardar'}
                        </button>

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

                    {avisoGuardado && (
                      <p className="aviso-pendiente aviso-pendiente-superior">
                        <i className="fa-solid fa-circle-check" style={{ color: '#1a7a43', fontSize: '13px' }}></i>
                        Cambios guardados
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

                          {/* Paleta térmica: cambia los colores de la imagen y de la barra de temperatura */}
                          <div className="paleta-visor" ref={menuPaletaRef}>
                            <button
                              type="button"
                              className={menuPaletaAbierto ? 'boton-herramienta boton-herramienta-activa' : 'boton-herramienta'}
                              title="Paleta"
                              onClick={() => setMenuPaletaAbierto((prev) => !prev)}
                            >
                              <i className="fa-solid fa-swatchbook"></i>
                            </button>

                            {menuPaletaAbierto && (
                              <div className="menu-paleta">
                                <div className="menu-paleta-titulo">Paleta</div>
                                {PALETAS.map((p) => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    className={p.id === paletaActiva ? 'menu-paleta-opcion menu-paleta-opcion-activa' : 'menu-paleta-opcion'}
                                    onClick={() => handleSeleccionarPaleta(p.id)}
                                  >
                                    <span className="menu-paleta-muestra" style={{ background: gradientePaleta(p.colores) }} />
                                    {p.nombre}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

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
                            src={urlImagenActiva}
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
                          <span className="temp-max">
                            {formatearTemperatura(temperaturasPorImagen[imagenActiva.id]?.max ?? imagenActiva.temperaturaMax)}°C
                          </span>
                          <div
                            className="gradiente-temperatura"
                            style={{ background: gradientePaleta(coloresPaletaActiva) }}
                          ></div>
                          <span className="temp-min">
                            {formatearTemperatura(temperaturasPorImagen[imagenActiva.id]?.min ?? imagenActiva.temperaturaMin)}°C
                          </span>
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

                  {/* Parameters e Image Info. El cuadro Máx/Mín/ΔTemp lo dibuja TablaParametros;
                      la lista de puntos de medición se inyecta justo debajo con debajoDelCuadro. */}
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

                              // Rectángulo o círculo: tarjeta con Máx / Mín / ΔTemp de la zona.
                              // ΔTemp = Máx − Mín. Mientras el backend responde (o si la
                              // imagen no es DJI) los valores se ven como "—".
                              const esRect = a.tipo === 'rectangulo';
                              const numeroZona = esRect ? numerosRectangulo.get(a.id) : numerosCirculo.get(a.id);
                              const deltaTemp = a.resumen
                                ? Number((a.resumen.max - a.resumen.min).toFixed(1))
                                : undefined;

                              return (
                                <div key={a.id} className="zona-medicion">
                                  <div className="zona-medicion-titulo">
                                    <span className="punto-medicion-color" style={{ backgroundColor: a.color }} />
                                    <span className="punto-medicion-etiqueta">
                                      {esRect ? 'R' : 'C'}
                                      {numeroZona}
                                    </span>
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

      {/* Alerta al salir del visor con cambios sin guardar */}
      {blocker.state === 'blocked' && (
        <div className="modal-salir-overlay">
          <div className="modal-salir-caja" role="dialog" aria-modal="true">
            <h4>Tienes cambios sin guardar</h4>
            <p>Si ya terminaste, recuerda generar el PDF del informe antes de salir.</p>
            {errorGuardadoPuntos && <p className="modal-salir-error">{errorGuardadoPuntos}</p>}
            <div className="modal-salir-acciones">
              <button type="button" onClick={handleModalCancelar} disabled={guardandoTodo}>
                Cancelar
              </button>
              <button
                type="button"
                className="modal-salir-peligro"
                onClick={handleModalSalir}
                disabled={guardandoTodo}
              >
                Salir sin guardar
              </button>
              <button
                type="button"
                className="modal-salir-primario"
                onClick={handleModalGuardar}
                disabled={guardandoTodo}
              >
                {guardandoTodo ? 'Guardando…' : 'Guardar y salir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">{t('footer.texto')}</footer>
    </>
  );
};

export default VisorPage;