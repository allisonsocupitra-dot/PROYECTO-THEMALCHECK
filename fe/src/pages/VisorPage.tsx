import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useGaleria } from '../context/GaleriaContext';
import NavLateral from '../components/NavLateral';
import { formatearTemperatura } from '../utils/temperaturas';
import '../styles/styles.css';
import '../styles/dashboard.css';
import '../styles/visor.css';

const VisorPage: React.FC = () => {
  const { usuario } = useAuth();
  const { t } = useLanguage();
  const { carpetas, imagenSeleccionadaId, seleccionarImagen } = useGaleria();
  const [avisoPendiente, setAvisoPendiente] = useState(false);

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
                  <div className="contenedor-imagen-visor">
                    <img src={imagenActiva.urlPrevia} alt={imagenActiva.archivo.name} />

                    <div className="barra-temperatura">
                      <span className="temp-max">{formatearTemperatura(imagenActiva.temperaturaMax)}°C</span>
                      <div className="gradiente-temperatura"></div>
                      <span className="temp-min">{formatearTemperatura(imagenActiva.temperaturaMin)}°C</span>
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