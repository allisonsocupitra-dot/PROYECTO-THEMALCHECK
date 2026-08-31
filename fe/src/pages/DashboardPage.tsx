import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useGaleria } from '../context/GaleriaContext';
import NavLateral from '../components/NavLateral';
import ImageUploader from '../components/ImageUploader';
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
    crearCarpeta,
    seleccionarCarpeta,
    agregarImagenes,
    seleccionarImagen,
    eliminarImagenes,
    eliminarCarpeta,
  } = useGaleria();

  const inputCarpetaRef = useRef<HTMLInputElement>(null);
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());

  const carpetaActiva = useMemo(
    () => carpetas.find((c) => c.id === carpetaActivaId) ?? carpetas[0],
    [carpetas, carpetaActivaId]
  );

  // La selección es por carpeta: si cambias de carpeta o se borran imágenes, se limpia
  useEffect(() => {
    setSeleccionadas(new Set());
  }, [carpetaActivaId]);

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

  // Reemplaza a "crear carpeta": abre el selector de carpetas del computador,
  // crea una carpeta con el mismo nombre y le carga todas las imágenes que encuentre dentro
  const handleCargarCarpeta = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = e.target.files;
    if (!archivos || archivos.length === 0) return;

    const validos = Array.from(archivos).filter((a) => a.type.startsWith('image/'));
    if (validos.length === 0) return;

    const primerArchivo = validos[0] as File & { webkitRelativePath?: string };
    const nombreCarpeta = primerArchivo.webkitRelativePath
      ? primerArchivo.webkitRelativePath.split('/')[0]
      : t('carpetas.nombrePorDefecto');

    const idNuevaCarpeta = crearCarpeta(nombreCarpeta);
    agregarImagenes(idNuevaCarpeta, validos);

    if (inputCarpetaRef.current) inputCarpetaRef.current.value = '';
  };

  const handleArchivos = (archivos: File[]) => {
    agregarImagenes(carpetaActiva.id, archivos);
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

              <ul className="lista-carpetas-items">
                {carpetas.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={c.id === carpetaActivaId ? 'item-carpeta item-carpeta-activa' : 'item-carpeta'}
                      onClick={() => seleccionarCarpeta(c.id)}
                    >
                      <i className="fa-solid fa-folder"></i>
                      <span>{c.nombre}</span>
                      <span className="item-carpeta-contador">{c.imagenes.length}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        className="boton-eliminar-carpeta"
                        title={t('carpetas.eliminarCarpeta')}
                        onClick={(e) => handleEliminarCarpeta(e, c.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') handleEliminarCarpeta(e as unknown as React.MouseEvent, c.id);
                        }}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="contenido-carpeta">
              <div className="breadcrumb-carpeta">
                <i className="fa-solid fa-folder-open"></i>
                <span>{carpetaActiva.nombre}</span>
                <span className="texto-suave">
                  — {carpetaActiva.imagenes.length} {t('carpetas.items')}
                </span>
              </div>

              {carpetaActiva.imagenes.length > 0 && (
                <section className="miniaturas-grid">
                  {carpetaActiva.imagenes.map((img) => (
                    <div className={seleccionadas.has(img.id) ? 'miniatura miniatura-seleccionada' : 'miniatura'} key={img.id}>
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

                      <button type="button" className="area-clic-miniatura" onClick={() => handleAbrirImagen(img.id)}>
                        <img src={img.urlPrevia} alt={img.archivo.name} />
                        <p className="nombre-imagen">{img.archivo.name}</p>
                      </button>
                    </div>
                  ))}
                </section>
              )}
            </div>
          </section>
        </div>
      </div>

      <footer className="footer">{t('footer.texto')}</footer>
    </>
  );
};

export default DashboardPage;