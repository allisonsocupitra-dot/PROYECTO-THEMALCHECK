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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);

    try {
      await solicitarRecuperacion(correo);
    } catch {
      // No distinguimos el error al usuario: por seguridad, nunca revelamos si el correo existe o no
    } finally {
      setCargando(false);
      setEnviado(true);
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