import React, { useMemo, useRef } from 'react';
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
  const { carpetas, carpetaActivaId, crearCarpeta, seleccionarCarpeta, agregarImagenes, seleccionarImagen } =
    useGaleria();

  const inputCarpetaRef = useRef<HTMLInputElement>(null);

  const carpetaActiva = useMemo(
    () => carpetas.find((c) => c.id === carpetaActivaId) ?? carpetas[0],
    [carpetas, carpetaActivaId]
  );

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

            <button className="boton-seleccion" type="button">
              {t('dashboard.seleccionarTodo')}
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
                    <button
                      className="miniatura"
                      type="button"
                      key={img.id}
                      onClick={() => handleAbrirImagen(img.id)}
                    >
                      <img src={img.urlPrevia} alt={img.archivo.name} />
                      <p className="nombre-imagen">{img.archivo.name}</p>
                    </button>
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