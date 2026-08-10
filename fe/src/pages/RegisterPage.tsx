import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import logo from '../assets/img/logo.png';
import '../styles/styles.css';
import '../styles/login.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registrar } = useAuth();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (contraseña !== confirmacion) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const resultado = registrar(nombre, correo, contraseña);

    if (!resultado.ok) {
      setError(resultado.mensaje ?? 'No se pudo completar el registro');
      return;
    }

    // Los registros públicos siempre quedan como técnico; se pide iniciar sesión después
    navigate('/');
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
            <h2>Registro</h2>

            {error && <p className="mensaje-error">{error}</p>}

            <div className="input-box">
              <i className="uil uil-user"></i>
              <input
                type="text"
                placeholder="Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

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
                placeholder="Crear contraseña"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
              />
            </div>

            <div className="input-box">
              <i className="uil uil-lock"></i>
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                required
              />
            </div>

            <button type="submit">Registrarse</button>

            <div className="enlace-registro">
              <p>¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link></p>
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

export default RegisterPage;