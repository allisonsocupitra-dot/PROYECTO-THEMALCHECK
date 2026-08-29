import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { Rol } from '../types/auth';
import ModalConfirmacion from '../components/ModalConfirmacion';
import logo from '../assets/img/Themalcheck-logo.svg';
import '../styles/styles.css';
import '../styles/login.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [rol, setRol] = useState<Rol>('tecnico');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const resultado = await login(correo, contraseña, rol);

    setCargando(false);

    if (!resultado.ok) {
      if (resultado.codigo === 'rol' && resultado.rolReal) {
        const rolReal = resultado.rolReal === 'admin' ? t('register.rol.admin') : t('register.rol.tecnico');
        setError(`${t('login.errorRol')} ${rolReal}`);
      } else {
        setError(t('login.errorCredenciales'));
      }
      return;
    }

    // El login fue exitoso: mostramos la confirmación y solo entonces vamos al explorador
    setMostrarConfirmacion(true);
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
          <form onSubmit={handleSubmit}>
            <h2>{t('login.titulo')}</h2>

            {error && <p className="mensaje-error">{error}</p>}

            <div className="selector-rol-inline">
              <button
                type="button"
                className={rol === 'tecnico' ? 'boton-rol-inline boton-rol-inline-activo' : 'boton-rol-inline'}
                onClick={() => setRol('tecnico')}
              >
                <i className="fa-solid fa-screwdriver-wrench"></i> {t('register.rol.tecnico')}
              </button>
              <button
                type="button"
                className={rol === 'admin' ? 'boton-rol-inline boton-rol-inline-activo' : 'boton-rol-inline'}
                onClick={() => setRol('admin')}
              >
                <i className="fa-solid fa-user-shield"></i> {t('register.rol.admin')}
              </button>
            </div>

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

            <div className="enlace-olvide">
              <Link to="/recuperar">{t('login.olvideContrasena')}</Link>
            </div>

            <button type="submit" disabled={cargando}>
              {cargando ? <span className="loader"></span> : t('login.boton')}
            </button>

            <div className="enlace-registro">
              <p>
                {t('login.sinCuenta')} <Link to="/register">{t('login.registrate')}</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <ModalConfirmacion
        abierto={mostrarConfirmacion}
        titulo={t('confirmacion.loginTitulo')}
        mensaje={t('confirmacion.loginMensaje')}
        onContinuar={() => navigate('/dashboard')}
      />

      <footer className="footer">{t('footer.texto')}</footer>
    </>
  );
};

export default LoginPage;