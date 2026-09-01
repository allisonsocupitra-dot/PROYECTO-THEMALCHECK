import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useGaleria } from '../context/GaleriaContext';
import NavLateral from '../components/NavLateral';
import { TablaParametros, TablaInfoImagen } from '../components/TablasPropiedades';
import { aplanarImagenes } from '../utils/arbolCarpetas';
import { formatearTemperatura } from '../utils/temperaturas';
import '../styles/styles.css';
import '../styles/dashboard.css';
import '../styles/visor.css';

type Herramienta = 'ninguna' | 'punto' | 'rectangulo' | 'circulo';

interface Anotacion {
  id: string;
  tipo: Exclude<Herramienta, 'ninguna'>;
  xInicio: number; // porcentaje respecto al ancho de la imagen renderizada
  yInicio: number; // porcentaje respecto al alto de la imagen renderizada
  xFin: number;
  yFin: number;
  color: string;
}

interface FilaEditable {
  id: string;
  clave: string;
  valor: string;
}

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
    return;
  }

  // círculo
  ctx.beginPath();
  ctx.ellipse(x1 + w / 2, y1 + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.globalAlpha = 0.15;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.stroke();
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
  const contadorRef = useRef(0);
  const inputColorRef = useRef<HTMLInputElement>(null);
  const contenedorImagenRef = useRef<HTMLDivElement>(null);

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

  const handleExportarReporte = (formato: 'PDF' | 'DOC') => {
    if (!imagenActiva) return;
    setMenuExportarAbierto(false);
    registrarReporte(imagenActiva.archivo.name, imagenActiva.carpeta, formato);
    setAvisoPendiente(true);
    window.setTimeout(() => setAvisoPendiente(false), 3000);
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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (herramienta === 'ninguna' || !imagenActiva) return;
    const { x, y } = obtenerPosicionRelativa(e.clientX, e.clientY);
    contadorRef.current += 1;

    if (herramienta === 'punto') {
      agregarAnotacion({
        id: `anot-${contadorRef.current}`,
        tipo: 'punto',
        xInicio: x,
        yInicio: y,
        xFin: x,
        yFin: y,
        color: colorSeleccionado,
      });
      return;
    }

    setDibujando({
      id: `anot-${contadorRef.current}`,
      tipo: herramienta,
      xInicio: x,
      yInicio: y,
      xFin: x,
      yFin: y,
      color: colorSeleccionado,
    });
  };

  // Mientras se arrastra, escuchamos el mousemove/mouseup en toda la ventana
  // (no solo dentro del recuadro de la imagen). Antes, si el cursor salía del
  // contenedor mientras se dibujaba, la figura se cancelaba sin guardarse;
  // ahora el trazo se sigue viendo y se confirma con soltar el clic en cualquier parte.
  useEffect(() => {
    if (!dibujando) return;

    const handleMove = (e: MouseEvent) => {
      const { x, y } = obtenerPosicionRelativa(e.clientX, e.clientY);
      setDibujando((prev) => (prev ? { ...prev, xFin: x, yFin: y } : prev));
    };

    const handleUp = () => {
      setDibujando((prev) => {
        if (prev) agregarAnotacion(prev);
        return null;
      });
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
        <rect
          key={a.id}
          x={x1}
          y={y1}
          width={ancho}
          height={alto}
          className="forma-anotacion"
          stroke={a.color}
          fill={a.color}
        />
      );
    }

    // círculo
    return (
      <ellipse
        key={a.id}
        cx={x1 + ancho / 2}
        cy={y1 + alto / 2}
        rx={ancho / 2}
        ry={alto / 2}
        className="forma-anotacion"
        stroke={a.color}
        fill={a.color}
      />
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

                        <div className="menu-exportar-visor">
                          <button
                            type="button"
                            className="boton-superior-visor"
                            title={t('visor.exportar')}
                            onClick={() => setMenuExportarAbierto((prev) => !prev)}
                          >
                            <i className="fa-solid fa-file-export"></i> {t('visor.exportar')}
                            <i className="fa-solid fa-chevron-down menu-exportar-flecha"></i>
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

                    {avisoPendiente && <p className="aviso-pendiente aviso-pendiente-superior">{t('visor.reporteRegistrado')}</p>}

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
                          <img src={imagenActiva.urlPrevia} alt={imagenActiva.archivo.name} />

                          <svg className="capa-anotaciones" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {anotaciones.map((a) => renderAnotacion(a))}
                            {dibujando && renderAnotacion(dibujando)}
                          </svg>
                        </div>

                        <div className="barra-temperatura">
                          <span className="temp-max">{formatearTemperatura(imagenActiva.temperaturaMax)}°C</span>
                          <div className="gradiente-temperatura"></div>
                          <span className="temp-min">{formatearTemperatura(imagenActiva.temperaturaMin)}°C</span>
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

                  <div className="info-imagen">
                    <div>
                      <span className="texto-suave">{t('visor.tempMax')}</span>
                      <strong>{formatearTemperatura(imagenActiva.temperaturaMax)}°C</strong>
                    </div>
                    <div>
                      <span className="texto-suave">{t('visor.tempMin')}</span>
                      <strong>{formatearTemperatura(imagenActiva.temperaturaMin)}°C</strong>
                    </div>
                  </div>

                  {/* Parameters e Image Info: la lectura real llegará con el
                      backend de análisis; por ahora se muestran vacíos ("—") */}
                  <TablaParametros imagen={imagenActiva} />
                  <TablaInfoImagen imagen={imagenActiva} />

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
