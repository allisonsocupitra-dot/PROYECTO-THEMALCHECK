import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { ImagenCargada } from '../types/galeria';

const VALOR_VACIO = '—';

// Tabla "Parameters": parámetros de captura térmica (distancia, humedad, emisividad...).
// Los valores reales los completará el backend de análisis; mientras tanto se
// muestra un guion para dejar la estructura lista para esa integración.
export const TablaParametros: React.FC<{ imagen: ImagenCargada }> = ({ imagen }) => {
  const { t } = useLanguage();
  const p = imagen.parametros ?? {};

  return (
    <>
      <h5 className="visor-panel-subtitulo">{t('visor.parametros.titulo')}</h5>
      <table className="tabla-propiedades">
        <tbody>
          <tr>
            <th>{t('visor.parametros.distancia')}</th>
            <td>{p.distancia ?? VALOR_VACIO}</td>
          </tr>
          <tr>
            <th>{t('visor.parametros.humedad')}</th>
            <td>{p.humedad ?? VALOR_VACIO}</td>
          </tr>
          <tr>
            <th>{t('visor.parametros.emisividad')}</th>
            <td>{p.emisividad ?? VALOR_VACIO}</td>
          </tr>
          <tr>
            <th>{t('visor.parametros.tempReflejada')}</th>
            <td>{p.temperaturaReflejada ?? VALOR_VACIO}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

// Tabla "Image Info": metadatos EXIF / de cámara. Igual que arriba, a la espera
// del backend de análisis que lea el archivo real.
export const TablaInfoImagen: React.FC<{ imagen: ImagenCargada }> = ({ imagen }) => {
  const { t } = useLanguage();
  const info = imagen.infoImagen ?? {};

  return (
    <>
      <h5 className="visor-panel-subtitulo">{t('visor.propiedades.titulo')}</h5>
      <table className="tabla-propiedades">
        <tbody>
          <tr>
            <th>{t('visor.propiedades.modelo')}</th>
            <td>{info.modelo ?? VALOR_VACIO}</td>
          </tr>
          <tr>
            <th>{t('visor.propiedades.numeroSerie')}</th>
            <td>{info.numeroSerie ?? VALOR_VACIO}</td>
          </tr>
          <tr>
            <th>{t('visor.propiedades.distanciaFocal')}</th>
            <td>{info.distanciaFocal ?? VALOR_VACIO}</td>
          </tr>
          <tr>
            <th>{t('visor.propiedades.apertura')}</th>
            <td>{info.apertura ?? VALOR_VACIO}</td>
          </tr>
          <tr>
            <th>{t('visor.propiedades.ancho')}</th>
            <td>{info.ancho ?? VALOR_VACIO}</td>
          </tr>
          <tr>
            <th>{t('visor.propiedades.alto')}</th>
            <td>{info.alto ?? VALOR_VACIO}</td>
          </tr>
          <tr>
            <th>{t('visor.propiedades.creado')}</th>
            <td>{new Date(imagen.fecha).toLocaleString()}</td>
          </tr>
          <tr>
            <th>{t('visor.propiedades.modificado')}</th>
            <td>{info.modificado ?? VALOR_VACIO}</td>
          </tr>
          <tr>
            <th>{t('visor.propiedades.coordenadas')}</th>
            <td>{info.coordenadas ?? VALOR_VACIO}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
