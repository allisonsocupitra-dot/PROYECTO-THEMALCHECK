import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { Rol } from '../types/auth';
import ModalConfirmacion from '../components/ModalConfirmacion';
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
  const [cargando, setCargando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (contraseña !== confirmacion) {
      setError(t('register.errorPasswords'));
      return;
    }

    setCargando(true);
    const resultado = await registrar(nombre, apellido, correo, contraseña, rol);
    setCargando(false);

    if (!resultado.ok) {
      setError(resultado.codigo === 'correoExistente' ? t('register.errorExiste') : t('register.errorGenerico'));
      return;
    }

    // Registro exitoso: mostramos la confirmación y solo entonces mandamos al login
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
                type="email"
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

            <button type="submit" disabled={cargando}>
              {cargando ? <span className="loader"></span> : t('register.boton')}
            </button>

            <div className="enlace-registro">
              <p>
                {t('register.yaTienes')} <Link to="/auth">{t('register.inicia')}</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <ModalConfirmacion
        abierto={mostrarConfirmacion}
        titulo={t('confirmacion.registroTitulo')}
        mensaje={t('confirmacion.registroMensaje')}
        onContinuar={() => navigate('/auth')}
      />

      <footer className="footer">{t('footer.texto')}</footer>
    </>
  );
};

export default RegisterPage;