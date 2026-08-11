import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useGaleria } from '../context/GaleriaContext';
import NavLateral from '../components/NavLateral';
import ImageUploader from '../components/ImageUploader';
import '../styles/styles.css';
import '../styles/dashboard.css';

const DashboardPage: React.FC = () => {
  const { usuario } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { carpetas, carpetaActivaId, crearCarpeta, seleccionarCarpeta, agregarImagenes, seleccionarImagen } =
    useGaleria();

  const [mostrarFormCarpeta, setMostrarFormCarpeta] = useState(false);
  const [nombreCarpeta, setNombreCarpeta] = useState('');

  const carpetaActiva = useMemo(
    () => carpetas.find((c) => c.id === carpetaActivaId) ?? carpetas[0],
    [carpetas, carpetaActivaId]
  );

  const handleCrearCarpeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCarpeta.trim()) return;
    crearCarpeta(nombreCarpeta);
    setNombreCarpeta('');
    setMostrarFormCarpeta(false);
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
              {mostrarFormCarpeta ? (
                <form className="form-nueva-carpeta" onSubmit={handleCrearCarpeta}>
                  <input
                    type="text"
                    autoFocus
                    placeholder={t('carpetas.nombrePlaceholder')}
                    value={nombreCarpeta}
                    onChange={(e) => setNombreCarpeta(e.target.value)}
                  />
                  <div className="form-nueva-carpeta-botones">
                    <button type="submit" className="btn-carpeta-confirmar">
                      {t('carpetas.crear')}
                    </button>
                    <button
                      type="button"
                      className="btn-carpeta-cancelar"
                      onClick={() => {
                        setMostrarFormCarpeta(false);
                        setNombreCarpeta('');
                      }}
                    >
                      {t('carpetas.cancelar')}
                    </button>
                  </div>
                </form>
              ) : (
                <button className="btn-nueva-carpeta" type="button" onClick={() => setMostrarFormCarpeta(true)}>
                  <i className="fa-solid fa-folder-plus"></i> {t('carpetas.nueva')}
                </button>
              )}

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

              <ImageUploader onArchivosSeleccionados={handleArchivos} />

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