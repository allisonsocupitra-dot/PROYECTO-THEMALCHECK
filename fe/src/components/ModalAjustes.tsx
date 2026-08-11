import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/modal.css';

interface ModalAjustesProps {
  abierto: boolean;
  onCerrar: () => void;
}

const ModalAjustes: React.FC<ModalAjustesProps> = ({ abierto, onCerrar }) => {
  const { idioma, cambiarIdioma, t } = useLanguage();

  if (!abierto) return null;

  return (
    <div className="overlay-modal" onClick={onCerrar}>
      <div className="panel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-encabezado">
          <h3>{t('nav.ajustes')}</h3>
          <button className="modal-cerrar" type="button" onClick={onCerrar} aria-label={t('ajustes.cerrar')}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-cuerpo">
          <h4>{t('ajustes.idioma.titulo')}</h4>
          <p className="texto-suave">{t('ajustes.idioma.descripcion')}</p>

          <div className="selector-idioma">
            <button
              type="button"
              className={idioma === 'es' ? 'boton-idioma boton-idioma-activo' : 'boton-idioma'}
              onClick={() => cambiarIdioma('es')}
            >
              Español
            </button>
            <button
              type="button"
              className={idioma === 'en' ? 'boton-idioma boton-idioma-activo' : 'boton-idioma'}
              onClick={() => cambiarIdioma('en')}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAjustes;