import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useGaleria } from '../context/GaleriaContext';
import NavLateral from '../components/NavLateral';
import ImageUploader from '../components/ImageUploader';
import ArbolCarpetas from '../components/ArbolCarpetas';
import { TablaParametros, TablaInfoImagen } from '../components/TablasPropiedades';
import { buscarAncestros, buscarCarpetaPorId, buscarRutaCarpeta } from '../utils/arbolCarpetas';
import '../styles/styles.css';
import '../styles/dashboard.css';

// Atributos no estándar que abren el selector de carpetas del sistema operativo
const atributosCarpeta = {
  webkitdirectory: 'true',
  directory: 'true',
} as unknown as React.InputHTMLAttributes<HTMLInputElement>;

const DashboardPage: React.FC = () => {
  const { usuario } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    carpetas,
    carpetaActivaId,
    seleccionarCarpeta,
    agregarImagenes,
    cargarCarpetaDesdeArchivos,
    imagenSeleccionadaId,
    seleccionarImagen,
    eliminarImagenes,
    eliminarCarpeta,
  } = useGaleria();

  const inputCarpetaRef = useRef<HTMLInputElement>(null);
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());

  const carpetaActiva = useMemo(
    () => buscarCarpetaPorId(carpetas, carpetaActivaId) ?? carpetas[0],
    [carpetas, carpetaActivaId]
  );

  const rutaCarpetaActiva = useMemo(
    () => buscarRutaCarpeta(carpetas, carpetaActiva.id) ?? [carpetaActiva.nombre],
    [carpetas, carpetaActiva]
  );

  // La imagen mostrada en el panel derecho: la seleccionada globalmente, si
  // pertenece a la carpeta que se está viendo ahora mismo.
  const imagenPanel = useMemo(
    () => carpetaActiva.imagenes.find((img) => img.id === imagenSeleccionadaId) ?? null,
    [carpetaActiva, imagenSeleccionadaId]
  );

  // La selección (checkboxes) es por carpeta: si cambias de carpeta o se borran imágenes, se limpia
  useEffect(() => {
    setSeleccionadas(new Set());
  }, [carpetaActivaId]);

  // Al activar una carpeta, nos aseguramos de que todos sus ancestros estén
  // expandidos en el árbol, para que quede visible dentro de "Mis carpetas".
  useEffect(() => {
    const ancestros = buscarAncestros(carpetas, carpetaActivaId);
    if (ancestros && ancestros.length > 0) {
      setExpandidas((prev) => new Set([...prev, ...ancestros]));
    }
  }, [carpetas, carpetaActivaId]);

  const todasSeleccionadas =
    carpetaActiva.imagenes.length > 0 && carpetaActiva.imagenes.every((img) => seleccionadas.has(img.id));

  const alternarSeleccionTodo = () => {
    if (todasSeleccionadas) {
      setSeleccionadas(new Set());
    } else {
      setSeleccionadas(new Set(carpetaActiva.imagenes.map((img) => img.id)));
    }
  };

  const alternarSeleccionImagen = (id: string) => {
    setSeleccionadas((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
  };

  const alternarExpandir = (id: string) => {
    setExpandidas((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
  };

  const handleEliminarSeleccionadas = () => {
    if (seleccionadas.size === 0) return;
    if (!window.confirm(t('carpetas.confirmarEliminarImagenes'))) return;
    eliminarImagenes(carpetaActiva.id, Array.from(seleccionadas));
    setSeleccionadas(new Set());
  };

  const handleEliminarImagen = (id: string) => {
    if (!window.confirm(t('carpetas.confirmarEliminarImagen'))) return;
    eliminarImagenes(carpetaActiva.id, [id]);
  };

  const handleEliminarCarpeta = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm(t('carpetas.confirmarEliminarCarpeta'))) return;
    eliminarCarpeta(id);
  };

  // Abre el selector de carpetas del computador. Si dentro trae subcarpetas
  // con imágenes, se reconstruye ese mismo árbol en "Mis carpetas".
  const handleCargarCarpeta = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = e.target.files;
    if (!archivos || archivos.length === 0) return;

    cargarCarpetaDesdeArchivos(Array.from(archivos), t('carpetas.nombrePorDefecto'));

    if (inputCarpetaRef.current) inputCarpetaRef.current.value = '';
  };

  const handleArchivos = (archivos: File[]) => {
    agregarImagenes(carpetaActiva.id, archivos);
  };

  // Un clic normal en la miniatura solo la selecciona y muestra su
  // información en el panel derecho; abrir el editor es una acción aparte.
  const handleSeleccionarImagen = (imagenId: string) => {
    seleccionarImagen(imagenId);
  };

  const handleAbrirImagen = (imagenId: string) => {
    seleccionarImagen(imagenId);
    navigate('/visor');
  };

  return (
    <>
      <div className="explorador">
        <NavLateral />

        <div className="explorador-contenido">
          <header className="explorador-header">
            <h3>{t('nav.explorador')} {usuario ? `— ${usuario.nombre}` : ''}</h3>

            <span className="texto-suave">
              ({carpetaActiva.imagenes.length} {t('carpetas.items')})
            </span>

            {seleccionadas.size > 0 && (
              <button className="boton-eliminar-seleccion" type="button" onClick={handleEliminarSeleccionadas}>
                <i className="fa-solid fa-trash"></i> {t('carpetas.eliminarSeleccion')} ({seleccionadas.size})
              </button>
            )}

            <button
              className="boton-seleccion"
              type="button"
              onClick={alternarSeleccionTodo}
              disabled={carpetaActiva.imagenes.length === 0}
            >
              {todasSeleccionadas ? t('dashboard.deseleccionarTodo') : t('dashboard.seleccionarTodo')}
            </button>
          </header>

          <section className="panel-carpetas">
            <aside className="lista-carpetas">
              <button className="btn-nueva-carpeta" type="button" onClick={() => inputCarpetaRef.current?.click()}>
                <i className="fa-solid fa-folder-plus"></i> {t('carpetas.subirCarpeta')}
              </button>

              <input
                ref={inputCarpetaRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleCargarCarpeta}
                {...atributosCarpeta}
              />

              <div className="carga-lateral">
                <ImageUploader onArchivosSeleccionados={handleArchivos} />
              </div>

              <h5 className="visor-panel-subtitulo titulo-mis-carpetas">{t('carpetas.miscarpetas')}</h5>

              <ArbolCarpetas
                carpetas={carpetas}
                carpetaActivaId={carpetaActivaId}
                expandidas={expandidas}
                onSeleccionar={seleccionarCarpeta}
                onAlternarExpandir={alternarExpandir}
                onEliminar={handleEliminarCarpeta}
                tituloEliminar={t('carpetas.eliminarCarpeta')}
              />
            </aside>

            <div className="contenido-carpeta">
              <div className="breadcrumb-carpeta">
                <i className="fa-solid fa-folder-open"></i>
                <span>{rutaCarpetaActiva.join(' / ')}</span>
                <span className="texto-suave">
                  — {carpetaActiva.imagenes.length} {t('carpetas.items')}
                </span>
              </div>

              {carpetaActiva.imagenes.length > 0 && (
                <section className="miniaturas-grid">
                  {carpetaActiva.imagenes.map((img) => (
                    <div
                      className={
                        img.id === imagenSeleccionadaId ? 'miniatura miniatura-vista' : 'miniatura'
                      }
                      key={img.id}
                    >
                      <label className="casilla-miniatura" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={seleccionadas.has(img.id)}
                          onChange={() => alternarSeleccionImagen(img.id)}
                        />
                      </label>

                      <button
                        type="button"
                        className="boton-eliminar-imagen"
                        title={t('carpetas.eliminarImagen')}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEliminarImagen(img.id);
                        }}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>

                      <button
                        type="button"
                        className="boton-abrir-imagen"
                        title={t('carpetas.abrirEnVisor')}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAbrirImagen(img.id);
                        }}
                      >
                        <i className="fa-solid fa-expand"></i>
                      </button>

                      <button
                        type="button"
                        className="area-clic-miniatura"
                        onClick={() => handleSeleccionarImagen(img.id)}
                        onDoubleClick={() => handleAbrirImagen(img.id)}
                      >
                        <img src={img.urlPrevia} alt={img.archivo.name} />
                        <p className="nombre-imagen">{img.archivo.name}</p>
                      </button>
                    </div>
                  ))}
                </section>
              )}
            </div>

            <aside className="panel-info-imagen">
              {imagenPanel ? (
                <>
                  <div className="preview-imagen-panel">
                    <img src={imagenPanel.urlPrevia} alt={imagenPanel.archivo.name} />
                  </div>
                  <h4 className="nombre-imagen-panel">{imagenPanel.archivo.name}</h4>
                  <p className="texto-suave">{new Date(imagenPanel.fecha).toLocaleString()}</p>

                  <TablaParametros imagen={imagenPanel} />
                  <TablaInfoImagen imagen={imagenPanel} />

                  <button
                    type="button"
                    className="boton-exportar-visor"
                    onClick={() => handleAbrirImagen(imagenPanel.id)}
                  >
                    <i className="fa-solid fa-expand"></i> {t('carpetas.abrirEnVisor')}
                  </button>
                </>
              ) : (
                <p className="texto-suave mensaje-panel-vacio">{t('carpetas.panel.sinSeleccion')}</p>
              )}
            </aside>
          </section>
        </div>
      </div>

      <footer className="footer">{t('footer.texto')}</footer>
    </>
  );
};

export default DashboardPage;
