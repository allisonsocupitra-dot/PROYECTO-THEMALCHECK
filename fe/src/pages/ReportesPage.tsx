import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useGaleria } from '../context/GaleriaContext';
import NavLateral from '../components/NavLateral';
import '../styles/styles.css';
import '../styles/dashboard.css';
import '../styles/admin.css';

const MisReportesPage: React.FC = () => {
  const { usuario } = useAuth();
  const { t } = useLanguage();
  const { reportes } = useGaleria();

  return (
    <>
      <div className="explorador">
        <NavLateral />

        <div className="explorador-contenido">
          <header className="explorador-header explorador-header-simple">
            <h3>
              {t('reportes.titulo')} {usuario ? `— ${usuario.nombre}` : ''}
            </h3>
          </header>

          <div className="panel-mis-reportes">
            {reportes.length === 0 ? (
              <p className="texto-suave mensaje-vacio">{t('reportes.vacio')}</p>
            ) : (
              <div className="panel-registros">
                <table className="tabla-registros">
                  <thead>
                    <tr>
                      <th>{t('admin.registros.tabla.imagen')}</th>
                      <th>{t('reportes.carpeta')}</th>
                      <th>{t('reportes.formato')}</th>
                      <th>{t('admin.registros.tabla.fecha')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportes.map((r) => (
                      <tr key={r.id}>
                        <td>{r.nombreImagen}</td>
                        <td>{r.carpeta}</td>
                        <td>{r.formato}</td>
                        <td>{new Date(r.fecha).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="footer">{t('footer.texto')}</footer>
    </>
  );
};

export default MisReportesPage;