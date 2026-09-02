import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  listarTecnicosConInformes,
  listarInformesPorTecnico,
  descargarInforme,
} from '../api/Busqueda';
import type { TecnicoConInformes, Informe } from '../api/Busqueda';
import NavLateral from '../components/NavLateral';
import '../styles/styles.css';
import '../styles/dashboard.css';
import '../styles/admin.css';
 
const AdminPage: React.FC = () => {
  const { usuario } = useAuth();
  const { t } = useLanguage();
 
  const [busqueda, setBusqueda] = useState('');
  const [tecnicos, setTecnicos] = useState<TecnicoConInformes[]>([]);
  const [cargandoTecnicos, setCargandoTecnicos] = useState(false);
  const [errorTecnicos, setErrorTecnicos] = useState(false);
 
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<number | null>(null);
  const [informes, setInformes] = useState<Informe[]>([]);
  const [cargandoInformes, setCargandoInformes] = useState(false);
 
  // Vuelve a pedir la lista de técnicos cada vez que cambia el texto buscado
  useEffect(() => {
    let cancelado = false;
    setCargandoTecnicos(true);
    setErrorTecnicos(false);
 
    listarTecnicosConInformes(busqueda || undefined)
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
 
  // Pide los informes del técnico seleccionado
  useEffect(() => {
    if (!usuarioSeleccionadoId) {
      setInformes([]);
      return;
    }
 
    let cancelado = false;
    setCargandoInformes(true);
 
    listarInformesPorTecnico(usuarioSeleccionadoId)
      .then((resultado) => {
        if (!cancelado) setInformes(resultado);
      })
      .catch(() => {
        if (!cancelado) setInformes([]);
      })
      .finally(() => {
        if (!cancelado) setCargandoInformes(false);
      });
 
    return () => {
      cancelado = true;
    };
  }, [usuarioSeleccionadoId]);
 
  const usuarioSeleccionado = useMemo(
    () => tecnicos.find((t2) => t2.id_usuario === usuarioSeleccionadoId),
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
                        key={t2.id_usuario}
                        className={t2.id_usuario === usuarioSeleccionadoId ? 'fila-seleccionada' : ''}
                        onClick={() => setUsuarioSeleccionadoId(t2.id_usuario)}
                      >
                        <td>{t2.nombre_usuario}</td>
                        <td>{t2.correo_usuario}</td>
                        <td>{t2.total_registros}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
 
            <div className="panel-registros">
              <h4>
                {usuarioSeleccionado
                  ? `${t('admin.registros.titulo')} ${usuarioSeleccionado.nombre_usuario}`
                  : t('admin.registros.seleccion')}
              </h4>
 
              {usuarioSeleccionado && (
                <table className="tabla-registros">
                  <thead>
                    <tr>
                      <th>{t('admin.registros.tabla.imagen')}</th>
                      <th>{t('admin.registros.tabla.fecha')}</th>
                      <th>{t('admin.registros.tabla.estado')}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargandoInformes && (
                      <tr>
                        <td colSpan={4} className="texto-suave">
                          {t('admin.cargando')}
                        </td>
                      </tr>
                    )}
 
                    {!cargandoInformes && informes.length === 0 && (
                      <tr>
                        <td colSpan={4} className="texto-suave">
                          {t('admin.registros.vacio')}
                        </td>
                      </tr>
                    )}
 
                    {!cargandoInformes &&
                      informes.map((inf) => (
                        <tr key={inf.id_informe}>
                          <td>{inf.nombre_archivo}</td>
                          <td>
                            {inf.fecha_generacion
                              ? new Date(inf.fecha_generacion).toLocaleDateString()
                              : '—'}
                          </td>
                          <td>
                            {inf.estado ? (
                              <span className={`estado estado-${inf.estado.toLowerCase()}`}>
                                {t(`estado.${inf.estado.toLowerCase()}`)}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="boton-descargar-informe"
                              title={t('admin.registros.descargar')}
                              onClick={() => descargarInforme(inf)}
                            >
                              <i className="fa-solid fa-download"></i>
                            </button>
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
 