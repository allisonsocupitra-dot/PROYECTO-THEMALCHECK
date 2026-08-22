import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { Rol } from '../types/auth';
import logo from '../assets/img/Themalcheck-logo.svg';
import '../styles/styles.css';
import '../styles/login.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registrar } = useAuth();
  const { t } = useLanguage();

  const [rol, setRol] = useState<Rol>('tecnico');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (contraseña !== confirmacion) {
      setError(t('register.errorPasswords'));
      return;
    }

    const resultado = registrar(nombre, apellido, correo, contraseña, rol);

    if (!resultado.ok) {
      setError(t('register.errorExiste'));
      return;
    }

    navigate('/');
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
          <form onSubmit={handleSubmit}>
            <h2>{t('register.titulo')}</h2>

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
              <i className="uil uil-user"></i>
              <input
                type="text"
                placeholder={t('register.nombre.placeholder')}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="input-box">
              <i className="uil uil-user"></i>
              <input
                type="text"
                placeholder={t('register.apellido.placeholder')}
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
              />
            </div>

            <div className="input-box">
              <i className="uil uil-envelope"></i>
              <input
                type="text"
                inputMode="email"
                placeholder={t('register.correo.placeholder')}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="input-box">
              <i className="uil uil-lock"></i>
              <input
                type="password"
                placeholder={t('register.contrasena.placeholder')}
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
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

            <button type="submit">{t('register.boton')}</button>

            <div className="enlace-registro">
              <p>
                {t('register.yaTienes')} <Link to="/auth">{t('register.inicia')}</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <footer className="footer">{t('footer.texto')}</footer>
    </>
  );
};

export default RegisterPage;