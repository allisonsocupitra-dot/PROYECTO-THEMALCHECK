import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { listarTecnicos } from '../api/Usuarios';
import { obtenerRegistrosPorTecnico } from '../api/Registros';
import type { RegistroAnalisis } from '../api/Registros';
import type { Usuario } from '../types/auth';
import NavLateral from '../components/NavLateral';
import '../styles/styles.css';
import '../styles/dashboard.css';
import '../styles/admin.css';

const AdminPage: React.FC = () => {
  const { usuario } = useAuth();
  const { t } = useLanguage();

  const [busqueda, setBusqueda] = useState('');
  const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
  const [cargandoTecnicos, setCargandoTecnicos] = useState(false);
  const [errorTecnicos, setErrorTecnicos] = useState(false);

  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<string | null>(null);
  const [registros, setRegistros] = useState<RegistroAnalisis[]>([]);
  const [cargandoRegistros, setCargandoRegistros] = useState(false);

  // Vuelve a pedir la lista de técnicos cada vez que cambia el texto buscado
  useEffect(() => {
    let cancelado = false;
    setCargandoTecnicos(true);
    setErrorTecnicos(false);

    listarTecnicos(busqueda)
      .then((resultado) => {
        if (!cancelado) setTecnicos(resultado);
      })
      .catch(() => {
        if (!cancelado) setErrorTecnicos(true);
      })
      .finally(() => {
        if (!cancelado) setCargandoTecnicos(false);
      });

    return () => {
      cancelado = true;
    };
  }, [busqueda]);

  // Pide los registros del técnico seleccionado
  useEffect(() => {
    if (!usuarioSeleccionadoId) {
      setRegistros([]);
      return;
    }

    let cancelado = false;
    setCargandoRegistros(true);

    obtenerRegistrosPorTecnico(usuarioSeleccionadoId)
      .then((resultado) => {
        if (!cancelado) setRegistros(resultado);
      })
      .catch(() => {
        if (!cancelado) setRegistros([]);
      })
      .finally(() => {
        if (!cancelado) setCargandoRegistros(false);
      });

    return () => {
      cancelado = true;
    };
  }, [usuarioSeleccionadoId]);

  const usuarioSeleccionado = useMemo(
    () => tecnicos.find((t2) => t2.id === usuarioSeleccionadoId),
    [tecnicos, usuarioSeleccionadoId]
  );

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
                  {cargandoTecnicos && (
                    <tr>
                      <td colSpan={3} className="texto-suave">
                        {t('admin.cargando')}
                      </td>
                    </tr>
                  )}

                  {!cargandoTecnicos && errorTecnicos && (
                    <tr>
                      <td colSpan={3} className="texto-suave">
                        {t('admin.error')}
                      </td>
                    </tr>
                  )}

                  {!cargandoTecnicos && !errorTecnicos && tecnicos.length === 0 && (
                    <tr>
                      <td colSpan={3} className="texto-suave">
                        {t('admin.tabla.vacio')}
                      </td>
                    </tr>
                  )}

                  {!cargandoTecnicos &&
                    !errorTecnicos &&
                    tecnicos.map((t2) => (
                      <tr
                        key={t2.id}
                        className={t2.id === usuarioSeleccionadoId ? 'fila-seleccionada' : ''}
                        onClick={() => setUsuarioSeleccionadoId(t2.id)}
                      >
                        <td>
                          {t2.nombre} {t2.apellido}
                        </td>
                        <td>{t2.correo}</td>
                        <td>{t2.id === usuarioSeleccionadoId ? registros.length : '—'}</td>
                      </tr>
                    ))}
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
                    {cargandoRegistros && (
                      <tr>
                        <td colSpan={5} className="texto-suave">
                          {t('admin.cargando')}
                        </td>
                      </tr>
                    )}

                    {!cargandoRegistros && registros.length === 0 && (
                      <tr>
                        <td colSpan={5} className="texto-suave">
                          {t('admin.registros.vacio')}
                        </td>
                      </tr>
                    )}

                    {!cargandoRegistros &&
                      registros.map((r) => (
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

export default AdminPage;