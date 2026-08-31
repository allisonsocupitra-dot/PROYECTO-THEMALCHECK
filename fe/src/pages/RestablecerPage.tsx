import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { restablecerContrasena } from '../api/Recuperacion';
import ModalConfirmacion from '../components/ModalConfirmacion';
import logo from '../assets/img/Themalcheck-logo.svg';
import '../styles/styles.css';
import '../styles/login.css';

// Esta página se abre desde el enlace que llega al correo:
// {URL_FRONTEND}/restablecer?correo=XXXX
const RestablecerPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [parametros] = useSearchParams();
  const correo = parametros.get('correo') ?? '';

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!correo) {
      setError(t('recuperar.tokenInvalido'));
      return;
    }

    if (nuevaContrasena !== confirmacion) {
      setError(t('register.errorPasswords'));
      return;
    }

    setCargando(true);
    try {
      await restablecerContrasena(correo, nuevaContrasena);
      setMostrarConfirmacion(true);
    } catch (err: any) {
      // El backend filtra si el correo existe en la BD y devuelve el mensaje aquí
      setError(err.message || t('recuperar.tokenInvalido'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <header className="auth-header">
        <Link className="auth-brand" to="/" aria-label="ThermalCheck">
          <img src={logo} alt="" />
          <span>ThermalCheck</span>
        </Link>
        <p>{t('login.subtitulo')}</p>
      </header>

      <div className="login">
        <div className="login-container titleThemalCheck slide-up">
          {!correo && <p className="mensaje-error">{t('recuperar.tokenInvalido')}</p>}

          <form onSubmit={handleSubmit}>
            <h2>{t('recuperar.restablecerTitulo')}</h2>

            {error && <p className="mensaje-error">{error}</p>}

            <div className="input-box">
              <i className="uil uil-lock"></i>
              <input
                type="password"
                placeholder={t('register.contrasena.placeholder')}
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                required
              />
            </div>

            <div className="input-box">
              <i className="uil uil-lock"></i>
              <input
                type="password"
                placeholder={t('register.confirmar.placeholder')}
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={cargando || !correo}>
              {cargando ? <span className="loader"></span> : t('recuperar.restablecerBoton')}
            </button>
          </form>
        </div>
      </div>

      <ModalConfirmacion
        abierto={mostrarConfirmacion}
        titulo={t('recuperar.exitoTitulo')}
        mensaje={t('recuperar.exitoMensaje')}
        onContinuar={() => navigate('/auth')}
      />

      <footer className="footer">{t('footer.texto')}</footer>
    </>
  );
};

export default RestablecerPage;