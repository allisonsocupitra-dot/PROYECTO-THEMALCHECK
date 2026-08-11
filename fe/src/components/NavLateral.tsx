import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ModalAjustes from './ModalAjustes';
import logo from '../assets/img/logo.png';

const NavLateral: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [mostrarAjustes, setMostrarAjustes] = useState(false);

  const esActivo = (ruta: string) => location.pathname === ruta;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="nav-lateral">
      <div>
        <img src={logo} alt="Logo ThemalCheck" className="logo" />
      </div>

      <Link to="/dashboard" className={esActivo('/dashboard') ? 'nav-activo' : ''} title={t('nav.explorador')}>
        <i className="fa-regular fa-folder"></i>
      </Link>

      <Link to="/visor" className={esActivo('/visor') ? 'nav-activo' : ''} title={t('nav.visor')}>
        <i className="fa-regular fa-file"></i>
      </Link>

      {usuario?.rol === 'admin' && (
        <Link
          to="/admin/reportes"
          className={esActivo('/admin/reportes') ? 'nav-activo' : ''}
          title={t('nav.reportes')}
        >
          <i className="fa-solid fa-users"></i>
        </Link>
      )}

      {/* Ajustes ya no navega a otra página: abre una ventana emergente */}
      <button
        className="boton-nav-lateral"
        type="button"
        onClick={() => setMostrarAjustes(true)}
        title={t('nav.ajustes')}
      >
        <i className="fa-solid fa-gear"></i>
      </button>

      <div className="logout">
        <button className="boton-logout" type="button" onClick={handleLogout} title={t('nav.salir')}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
      </div>

      <ModalAjustes abierto={mostrarAjustes} onCerrar={() => setMostrarAjustes(false)} />
    </nav>
  );
};

export default NavLateral;