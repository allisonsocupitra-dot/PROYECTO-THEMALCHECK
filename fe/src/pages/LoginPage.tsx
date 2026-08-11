import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/img/logo.png';
import '../styles/styles.css';
import '../styles/login.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const resultado = login(correo, contraseña);

    if (!resultado.ok) {
      setError(resultado.mensaje ?? 'No se pudo iniciar sesión');
      return;
    }

    // Técnicos y administradores comparten el mismo explorador;
    // la diferencia de permisos se refleja en la barra lateral, no en la ruta de entrada.
    navigate('/dashboard');
  };

  return (
    <>
      <header className="login-header">
        <img className="logo" src={logo} alt="ThemalCheck Logo" />
        <div className="titleThemalCheck">
          <h2 className='margin-title'>ThemalCheck</h2>
          <p>{t('login.subtitulo')}</p>
        </div>
      </header>

      <div className="login">
        <div className="login-container titleThemalCheck">
          <form onSubmit={handleSubmit}>
            <h2>{t('login.titulo')}</h2>

            {error && <p className="mensaje-error">{error}</p>}

            <div className="input-box">
              <i className="uil uil-envelope"></i>
              <input
                type="email"
                placeholder={t('login.correo.placeholder')}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="input-box">
              <i className="uil uil-lock"></i>
              <input
                type="password"
                placeholder={t('login.contrasena.placeholder')}
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
              />
            </div>

            <button type="submit">{t('login.boton')}</button>

            <div className="enlace-registro">
              <p>
                {t('login.sinCuenta')} <Link to="/register">{t('login.registrate')}</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <footer className="footer">{t('footer.texto')}</footer>
    </>
  );
};

export default LoginPage;