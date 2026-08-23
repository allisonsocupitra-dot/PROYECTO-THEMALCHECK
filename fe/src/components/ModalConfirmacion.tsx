import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/modal.css';

interface ModalConfirmacionProps {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  onContinuar: () => void;
}

const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({ abierto, titulo, mensaje, onContinuar }) => {
  const { t } = useLanguage();

  // Avanza solo después de un momento; el clic en "Continuar" o en el fondo también lo dispara
  useEffect(() => {
    if (!abierto) return;
    const temporizador = window.setTimeout(onContinuar, 1800);
    return () => window.clearTimeout(temporizador);
  }, [abierto, onContinuar]);

  if (!abierto) return null;

  return (
    <div className="overlay-modal" onClick={onContinuar}>
      <div className="panel-modal panel-confirmacion slide-up" onClick={(e) => e.stopPropagation()}>
        <i className="fa-solid fa-circle-check icono-confirmacion"></i>
        <h3>{titulo}</h3>
        <p className="texto-suave">{mensaje}</p>
        <button type="button" onClick={onContinuar}>
          {t('confirmacion.continuar')}
        </button>
      </div>
    </div>
  );
};

export default ModalConfirmacion;