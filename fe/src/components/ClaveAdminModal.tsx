import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/modal.css';

interface ClaveAdminModalProps {
  abierto: boolean;
  error?: string;
  cargando?: boolean;
  onConfirmar: (clave: string) => void;
  onCancelar: () => void;
}

const ClaveAdminModal: React.FC<ClaveAdminModalProps> = ({
  abierto,
  error,
  cargando,
  onConfirmar,
  onCancelar,
}) => {
  const [clave, setClave] = useState('');

  // Limpia la clave escrita cada vez que el modal se cierra
  useEffect(() => {
    if (!abierto) setClave('');
  }, [abierto]);

  if (!abierto) return null;

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmar(clave);
  };

  return createPortal(
    <div className="overlay-modal">
      <form className="panel-modal panel-clave slide-up" onSubmit={enviar}>
        <i className="fa-solid fa-lock icono-clave"></i>
        <h3>Clave de administración</h3>
        <p className="texto-suave">Ingresa la clave para continuar con el inicio de sesión.</p>

        <input
          type="password"
          className="input-clave"
          placeholder="Clave"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          autoFocus
          required
        />

        {error && <p className="clave-error">{error}</p>}

        <div className="clave-acciones">
          <button type="button" className="clave-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="submit" className="clave-continuar" disabled={cargando}>
            {cargando ? <span className="loader"></span> : 'Continuar'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};

export default ClaveAdminModal;