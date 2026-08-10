import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import logo from '../assets/img/logo.png';
import '../styles/styles.css';
import '../styles/login.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

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

    // El AuthContext ya sabe qué rol tiene el usuario; lo volvemos a leer
    // desde sessionStorage para decidir a qué panel enviarlo.
    const guardado = sessionStorage.getItem('themalcheck_usuario');
    const usuario = guardado ? JSON.parse(guardado) : null;

    navigate(usuario?.rol === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <>
      <header className="login-header">
        <img className="logo" src={logo} alt="ThemalCheck Logo" />
        <div className='titleThemalCheck'>
          <h2>ThemalCheck</h2>
          <p>Análisis de imágenes termográficas</p>
        </div>
      </header>

      <div className="login">
        <div className="login-container titleThemalCheck">
          <form onSubmit={handleSubmit}>
            <h2>Iniciar Sesión</h2>

            {error && <p className="mensaje-error">{error}</p>}

            <div className="input-box">
              <i className="uil uil-envelope"></i>
              <input
                type="email"
                placeholder="Ingrese el correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="input-box">
              <i className="uil uil-lock"></i>
              <input
                type="password"
                placeholder="Ingrese la contraseña"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
              />
            </div>

            <button type="submit">Iniciar sesión</button>

            <div className="enlace-registro">
              <p>¿No tienes una cuenta? <Link to="/register">Regístrate</Link></p>
            </div>
          </form>
        </div>
      </div>

      <footer className="footer">
        ThemalCheck — Análisis Termográfico | Proyecto SENA — Análisis y Desarrollo de Software | 2026
      </footer>
    </>
  );
};

export default LoginPage;