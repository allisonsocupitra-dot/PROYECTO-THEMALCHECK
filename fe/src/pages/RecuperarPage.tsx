import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { solicitarRecuperacion } from '../api/Recuperacion';
import logo from '../assets/img/Themalcheck-logo.svg';
import '../styles/styles.css';
import '../styles/login.css';

const RecuperarPage: React.FC = () => {
  const { t } = useLanguage();

  const [correo, setCorreo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      await solicitarRecuperacion(correo);
      setEnviado(true);
    } catch (err: any) {
      // El backend filtra si el correo existe en la BD y devuelve el mensaje aquí
      setError(err.message || 'No se pudo procesar la solicitud.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <header className="auth-header">
        <Link className="auth-brand" to="/" aria-label="ThemalCheck">
          <img src={logo} alt="" />
          <span>ThemalCheck</span>
        </Link>
        <p>{t('login.subtitulo')}</p>
      </header>

      <div className="login">
        <div className="login-container titleThemalCheck slide-up">
          {enviado ? (
            <div className="mensaje-recuperacion">
              <i className="fa-solid fa-envelope-circle-check recuperar-icono"></i>
              <h2>{t('recuperar.enviadoTitulo')}</h2>
              <p className="texto-suave texto-centrado">{t('recuperar.enviadoMensaje')}</p>
              <Link to="/auth" className="enlace-volver-login">
                {t('recuperar.volverLogin')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2>{t('recuperar.titulo')}</h2>
              <p className="texto-suave texto-centrado recuperar-descripcion">{t('recuperar.descripcion')}</p>

              <div className="input-box">
                <i className="uil uil-envelope"></i>
                <input
                  type="email"
                  inputMode="email"
                  placeholder={t('login.correo.placeholder')}
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>

              {error && <p className="texto-error texto-centrado">{error}</p>}

              <button type="submit" disabled={cargando}>
                {cargando ? <span className="loader"></span> : t('recuperar.boton')}
              </button>

              <div className="enlace-registro">
                <p>
                  <Link to="/auth">{t('recuperar.volverLogin')}</Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      <footer className="footer">{t('footer.texto')}</footer>
    </>
  );
};

export default RecuperarPage;