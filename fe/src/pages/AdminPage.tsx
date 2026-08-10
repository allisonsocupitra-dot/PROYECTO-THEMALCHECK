import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { mockUsers } from '../api/mockUsers';
import { mockRegistros } from '../api/mockRegistros';
import logo from '../assets/img/logo.png';
import '../styles/styles.css';
import '../styles/dashboard.css';
import '../styles/admin.css';

const AdminPage: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState('');
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<string | null>(null);

  const tecnicos = useMemo(() => mockUsers.filter((u) => u.rol === 'tecnico'), []);

  const tecnicosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return tecnicos;
    return tecnicos.filter(
      (t) => t.nombre.toLowerCase().includes(termino) || t.correo.toLowerCase().includes(termino)
    );
  }, [busqueda, tecnicos]);

  const registrosDelSeleccionado = useMemo(() => {
    if (!usuarioSeleccionadoId) return [];
    return mockRegistros.filter((r) => r.usuarioId === usuarioSeleccionadoId);
  }, [usuarioSeleccionadoId]);

  const usuarioSeleccionado = tecnicos.find((t) => t.id === usuarioSeleccionadoId);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <div className="explorador">
        <nav className="nav-lateral">
          <div>
            <img src={logo} alt="Logo ThemalCheck" className="logo" />
          </div>

          <i className="fa-solid fa-users" title="Usuarios"></i>

          <div className="logout">
            <button className="boton-logout" type="button" onClick={handleLogout} title="Cerrar sesión">
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>
        </nav>

        <div className="explorador-contenido">
          <header className="explorador-header">
            <h3>Panel de administración {usuario ? `— ${usuario.nombre}` : ''}</h3>
          </header>

          <section className="panel-admin">
            <div className="panel-busqueda">
              <div className="input-box input-box-admin">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Buscar técnico por nombre o correo"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <table className="tabla-usuarios">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Registros</th>
                  </tr>
                </thead>
                <tbody>
                  {tecnicosFiltrados.map((t) => (
                    <tr
                      key={t.id}
                      className={t.id === usuarioSeleccionadoId ? 'fila-seleccionada' : ''}
                      onClick={() => setUsuarioSeleccionadoId(t.id)}
                    >
                      <td>{t.nombre}</td>
                      <td>{t.correo}</td>
                      <td>{mockRegistros.filter((r) => r.usuarioId === t.id).length}</td>
                    </tr>
                  ))}

                  {tecnicosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={3} className="texto-suave">
                        No se encontraron técnicos con ese criterio
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="panel-registros">
              <h4>
                {usuarioSeleccionado
                  ? `Registros de ${usuarioSeleccionado.nombre}`
                  : 'Selecciona un técnico para ver sus registros'}
              </h4>

              {usuarioSeleccionado && (
                <table className="tabla-registros">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Fecha</th>
                      <th>Temp. máx</th>
                      <th>Temp. mín</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosDelSeleccionado.map((r) => (
                      <tr key={r.id}>
                        <td>{r.nombreImagen}</td>
                        <td>{new Date(r.fecha).toLocaleDateString()}</td>
                        <td>{r.temperaturaMax}°C</td>
                        <td>{r.temperaturaMin}°C</td>
                        <td>
                          <span className={`estado estado-${r.estado.toLowerCase()}`}>
                            {r.estado}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {registrosDelSeleccionado.length === 0 && (
                      <tr>
                        <td colSpan={5} className="texto-suave">
                          Este técnico no tiene registros aún
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>

      <footer className="footer">
        ThemalCheck — Análisis Termográfico | Proyecto SENA — Análisis y Desarrollo de Software | 2026
      </footer>
    </>
  );
};

export default AdminPage;