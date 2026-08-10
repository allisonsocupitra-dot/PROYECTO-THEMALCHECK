import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import ImageUploader, { type ImagenCargada } from '../components/ImageUploader';
import logo from '../assets/img/logo.png';
import '../styles/styles.css';
import '../styles/dashboard.css';

const DashboardPage: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [imagenes, setImagenes] = useState<ImagenCargada[]>([]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleImagenesCargadas = (nuevas: ImagenCargada[]) => {
    setImagenes((prev) => [...nuevas, ...prev]);
  };

  return (
    <>
      <div className="explorador">
        <nav className="nav-lateral">
          <div>
            <img src={logo} alt="Logo ThemalCheck" className="logo" />
          </div>

          <Link to="/dashboard">
            <i className="fa-regular fa-folder"></i>
          </Link>

          <Link to="/visor">
            <i className="fa-regular fa-file"></i>
          </Link>

          <Link to="/configuracion">
            <i className="fa-solid fa-gear"></i>
          </Link>

          <div className="logout">
            {/* Antes era un <Link> a "/"; ahora cierra la sesión de verdad antes de redirigir */}
            <button className="boton-logout" type="button" onClick={handleLogout} title="Cerrar sesión">
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>
        </nav>

        <div className="explorador-contenido">
          <header className="explorador-header">
            <h3>Explorador de imágenes {usuario ? `— ${usuario.nombre}` : ''}</h3>

            <button className="boton-exportar" type="button" title="Exportar reporte por lotes">
              <i className="fa-solid fa-file-export"></i> Exportar reporte
            </button>

            <button className="boton-edicion" type="button" title="Edición por lotes">
              <i className="fa-solid fa-gear"></i> Edición por lotes
            </button>

            <span className="texto-suave">({imagenes.length} elementos cargados)</span>

            <button className="boton-seleccion" type="button">
              Seleccionar todo
            </button>
          </header>

          <section className="seccion-carga">
            <ImageUploader onImagenesCargadas={handleImagenesCargadas} />
          </section>

          {imagenes.length > 0 && (
            <section className="galeria-imagenes">
              {imagenes.map((img) => (
                <div className="tarjeta-imagen" key={img.id}>
                  <img src={img.urlPrevia} alt={img.archivo.name} />
                  <p className="nombre-imagen">{img.archivo.name}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>

      <footer className="footer">
        ThemalCheck — Análisis Termográfico | Proyecto SENA — Análisis y Desarrollo de Software | 2026
      </footer>
    </>
  );
};

export default DashboardPage;