import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { mockUsers } from '../api/mockUsers';
import { mockRegistros } from '../api/mockRegistros';
import NavLateral from '../components/NavLateral';
import '../styles/styles.css';
import '../styles/dashboard.css';
import '../styles/admin.css';

const AdminReportsPage: React.FC = () => {
  const { usuario } = useAuth();
  const { t } = useLanguage();

  const [busqueda, setBusqueda] = useState('');
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<string | null>(null);

  const tecnicos = useMemo(() => mockUsers.filter((u) => u.rol === 'tecnico'), []);

  const tecnicosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return tecnicos;
    return tecnicos.filter(
      (t2) =>
        `${t2.nombre} ${t2.apellido}`.toLowerCase().includes(termino) ||
        t2.correo.toLowerCase().includes(termino)
    );
  }, [busqueda, tecnicos]);

  const registrosDelSeleccionado = useMemo(() => {
    if (!usuarioSeleccionadoId) return [];
    return mockRegistros.filter((r) => r.usuarioId === usuarioSeleccionadoId);
  }, [usuarioSeleccionadoId]);

  const usuarioSeleccionado = tecnicos.find((t2) => t2.id === usuarioSeleccionadoId);

  return (
    <>
      <div className="explorador">
        <NavLateral />

        <div className="explorador-contenido">
          <header className="explorador-header explorador-header-simple">
            <h3>
              {t('admin.titulo')} {usuario ? `— ${usuario.nombre}` : ''}
            </h3>
          </header>

          <section className="panel-admin">
            <div className="panel-busqueda">
              <div className="input-box input-box-admin">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder={t('admin.buscar.placeholder')}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <table className="tabla-usuarios">
                <thead>
                  <tr>
                    <th>{t('admin.tabla.nombre')}</th>
                    <th>{t('admin.tabla.correo')}</th>
                    <th>{t('admin.tabla.registros')}</th>
                  </tr>
                </thead>
                <tbody>
                  {tecnicosFiltrados.map((t2) => (
                    <tr
                      key={t2.id}
                      className={t2.id === usuarioSeleccionadoId ? 'fila-seleccionada' : ''}
                      onClick={() => setUsuarioSeleccionadoId(t2.id)}
                    >
                      <td>{t2.nombre} {t2.apellido}</td>
                      <td>{t2.correo}</td>
                      <td>{mockRegistros.filter((r) => r.usuarioId === t2.id).length}</td>
                    </tr>
                  ))}

                  {tecnicosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={3} className="texto-suave">
                        {t('admin.tabla.vacio')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="panel-registros">
              <h4>
                {usuarioSeleccionado
                  ? `${t('admin.registros.titulo')} ${usuarioSeleccionado.nombre} ${usuarioSeleccionado.apellido}`
                  : t('admin.registros.seleccion')}
              </h4>

              {usuarioSeleccionado && (
                <table className="tabla-registros">
                  <thead>
                    <tr>
                      <th>{t('admin.registros.tabla.imagen')}</th>
                      <th>{t('admin.registros.tabla.fecha')}</th>
                      <th>{t('admin.registros.tabla.tempMax')}</th>
                      <th>{t('admin.registros.tabla.tempMin')}</th>
                      <th>{t('admin.registros.tabla.estado')}</th>
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
                            {t(`estado.${r.estado.toLowerCase()}`)}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {registrosDelSeleccionado.length === 0 && (
                      <tr>
                        <td colSpan={5} className="texto-suave">
                          {t('admin.registros.vacio')}
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

      <footer className="footer">{t('footer.texto')}</footer>
    </>
  );
};

export default AdminReportsPage;