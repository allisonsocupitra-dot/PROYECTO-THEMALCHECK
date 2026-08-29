import React, { useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useGaleria } from '../context/GaleriaContext';
import NavLateral from '../components/NavLateral';
import { formatearTemperatura } from '../utils/temperaturas';
import '../styles/styles.css';
import '../styles/dashboard.css';
import '../styles/visor.css';

type Herramienta = 'ninguna' | 'punto' | 'rectangulo' | 'circulo' | 'linea';

interface Anotacion {
  id: string;
  tipo: Exclude<Herramienta, 'ninguna'>;
  xInicio: number; // porcentaje respecto al ancho de la imagen renderizada
  yInicio: number; // porcentaje respecto al alto de la imagen renderizada
  xFin: number;
  yFin: number;
  color: string;
}

const VisorPage: React.FC = () => {
  const { usuario } = useAuth();
  const { t } = useLanguage();
  const { carpetas, imagenSeleccionadaId, seleccionarImagen } = useGaleria();
  const [avisoPendiente, setAvisoPendiente] = useState(false);

  const [herramienta, setHerramienta] = useState<Herramienta>('ninguna');
  const [colorSeleccionado, setColorSeleccionado] = useState('#39d353');
  const [anotacionesPorImagen, setAnotacionesPorImagen] = useState<Record<string, Anotacion[]>>({});
  const [dibujando, setDibujando] = useState<Anotacion | null>(null);
  const contadorRef = useRef(0);
  const inputColorRef = useRef<HTMLInputElement>(null);

  // Aplanamos todas las carpetas para tener una sola lista de imágenes cargadas
  const todasLasImagenes = useMemo(
    () => carpetas.flatMap((c) => c.imagenes.map((img) => ({ ...img, carpeta: c.nombre }))),
    [carpetas]
  );

  const imagenActiva = useMemo(() => {
    if (imagenSeleccionadaId) {
      const encontrada = todasLasImagenes.find((img) => img.id === imagenSeleccionadaId);
      if (encontrada) return encontrada;
    }
    return todasLasImagenes[0] ?? null;
  }, [todasLasImagenes, imagenSeleccionadaId]);

  const anotaciones = imagenActiva ? anotacionesPorImagen[imagenActiva.id] ?? [] : [];

  const handleExportarImagen = () => {
    if (!imagenActiva) return;
    const enlace = document.createElement('a');
    enlace.href = imagenActiva.urlPrevia;
    enlace.download = imagenActiva.archivo.name;
    enlace.click();
  };

  const mostrarAvisoPendiente = () => {
    setAvisoPendiente(true);
    window.setTimeout(() => setAvisoPendiente(false), 2500);
  };

  // Todas las coordenadas se guardan en % relativos a la imagen renderizada,
  // así el dibujo se mantiene alineado sin importar el tamaño de pantalla
  const obtenerPosicionRelativa = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
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
    const { x, y } = obtenerPosicionRelativa(e);
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dibujando) return;
    const { x, y } = obtenerPosicionRelativa(e);
    setDibujando({ ...dibujando, xFin: x, yFin: y });
  };

  const finalizarDibujo = () => {
    if (!dibujando) return;
    agregarAnotacion(dibujando);
    setDibujando(null);
  };

  // Dibuja únicamente la forma elegida, con el color elegido; no hay ninguna temperatura asociada
  const renderAnotacion = (a: Anotacion) => {
    const x1 = Math.min(a.xInicio, a.xFin);
    const y1 = Math.min(a.yInicio, a.yFin);
    const ancho = Math.abs(a.xFin - a.xInicio);
    const alto = Math.abs(a.yFin - a.yInicio);

    if (a.tipo === 'punto') {
      return <circle key={a.id} cx={a.xInicio} cy={a.yInicio} r="1.1" fill={a.color} stroke="#fff" strokeWidth="0.3" />;
    }

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

    if (a.tipo === 'circulo') {
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
    }

    // línea
    return <line key={a.id} x1={a.xInicio} y1={a.yInicio} x2={a.xFin} y2={a.yFin} stroke={a.color} strokeWidth="0.5" />;
  };

  const esHerramientaActiva = (h: Herramienta) =>
    herramienta === h ? 'boton-herramienta boton-herramienta-activa' : 'boton-herramienta';

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
                        className={esHerramientaActiva('linea')}
                        title={t('visor.herramienta.linea')}
                        onClick={() => setHerramienta('linea')}
                      >
                        <i className="fa-solid fa-slash"></i>
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

                    <div className="contenedor-imagen-visor">
                      <div
                        className={`lienzo-imagen-visor ${herramienta !== 'ninguna' ? 'lienzo-dibujando' : ''}`}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={finalizarDibujo}
                        onMouseLeave={() => setDibujando(null)}
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
                ) : (
                  <p className="texto-suave mensaje-vacio">{t('visor.sinSeleccion')}</p>
                )}
              </div>

              {imagenActiva && (
                <aside className="visor-panel">
                  <h4>{imagenActiva.archivo.name}</h4>
                  <p className="texto-suave">{imagenActiva.carpeta}</p>

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

                  <div className="grupo-exportar">
                    <button type="button" className="boton-exportar-visor" onClick={mostrarAvisoPendiente}>
                      <i className="fa-solid fa-file-pdf"></i> {t('visor.exportarPdf')}
                    </button>
                    <button type="button" className="boton-exportar-visor" onClick={mostrarAvisoPendiente}>
                      <i className="fa-solid fa-file-word"></i> {t('visor.exportarDoc')}
                    </button>
                    <button type="button" className="boton-exportar-visor" onClick={handleExportarImagen}>
                      <i className="fa-solid fa-image"></i> {t('visor.exportarImagen')}
                    </button>

                    {avisoPendiente && <p className="aviso-pendiente">{t('visor.pendienteBackend')}</p>}
                  </div>
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