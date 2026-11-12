import React from "react";
import { formatearTemperatura } from "../utils/temperaturas";

interface TablaParametrosProps {
  imagen: any;
  onCambiarTempReflejada?: (valor: number) => void;
  debajoDelCuadro?: React.ReactNode;
}

export const TablaParametros: React.FC<TablaParametrosProps> = ({
  imagen,
  onCambiarTempReflejada,
  debajoDelCuadro,
}) => {
  const temperaturaMax = Number(imagen?.temperaturaMax ?? 0);
  const temperaturaMin = Number(imagen?.temperaturaMin ?? 0);

  const deltaTemp =
    imagen?.temperaturaMax != null && imagen?.temperaturaMin != null
      ? temperaturaMax - temperaturaMin
      : 0;

  const tempReflejadaActual = Number(imagen?.parametros?.tempReflejada ?? 20);

  return (
    <>
      {/* Telemetría rápida */}
      <div className="info-imagen">
        <div>
          <span className="texto-suave">Máx.</span>
          <strong>{formatearTemperatura(temperaturaMax)}°C</strong>
        </div>

        <div>
          <span className="texto-suave">Mín.</span>
          <strong>{formatearTemperatura(temperaturaMin)}°C</strong>
        </div>

        <div>
          <span className="texto-suave">ΔTemp</span>
          <strong>{formatearTemperatura(deltaTemp)}°C</strong>
        </div>
      </div>

      {debajoDelCuadro}

      {/* Tabla de Parámetros */}
      <div className="contenedor-seccion-tecnica">
        <div className="encabezado-seccion-tecnica">
          <i className="fa-solid fa-sliders"></i>
          <span>PARÁMETROS</span>
        </div>

        <table className="tabla-datos-tecnicos">
          <tbody>
            <tr>
              <th scope="row">Distancia</th>
              <td>{imagen?.parametros?.distancia ? `${imagen.parametros.distancia} m` : "—"}</td>
            </tr>
            <tr>
              <th scope="row">Humedad</th>
              <td>{imagen?.parametros?.humedad ? `${imagen.parametros.humedad} %` : "—"}</td>
            </tr>
            <tr>
              <th scope="row">Emisividad</th>
              <td className="valor-mono">{imagen?.parametros?.emisividad ?? "—"}</td>
            </tr>
            <tr>
              <th scope="row">Temp. reflejada</th>
              <td>
                {onCambiarTempReflejada ? (
                  <div className="stepper-temp-reflejada">
                    <button
                      type="button"
                      className="btn-stepper"
                      onClick={() => onCambiarTempReflejada(tempReflejadaActual - 1)}
                      title="Disminuir 1°C"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="input-stepper"
                      value={tempReflejadaActual}
                      onChange={(e) => onCambiarTempReflejada(Number(e.target.value))}
                    />
                    <span className="unidad-stepper">°C</span>
                    <button
                      type="button"
                      className="btn-stepper"
                      onClick={() => onCambiarTempReflejada(tempReflejadaActual + 1)}
                      title="Aumentar 1°C"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <span className="valor-destacado">{tempReflejadaActual}°C</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

interface TablaInfoImagenProps {
  imagen: any;
}

export const TablaInfoImagen: React.FC<TablaInfoImagenProps> = ({ imagen }) => {
  const info = imagen?.infoImagen ?? {};

  return (
    <div className="contenedor-seccion-tecnica">
      <div className="encabezado-seccion-tecnica">
        <i className="fa-solid fa-circle-info"></i>
        <span>INFORMACIÓN DE LA IMAGEN</span>
      </div>

      <table className="tabla-datos-tecnicos">
        <tbody>
          <tr>
            <th scope="row">Modelo</th>
            <td><strong className="valor-destacado">{info.modelo ?? "M3T"}</strong></td>
          </tr>
          <tr>
            <th scope="row">N.º de serie</th>
            <td className="valor-mono">{info.numeroSerie ?? "—"}</td>
          </tr>
          <tr>
            <th scope="row">Distancia focal</th>
            <td>{info.distanciaFocal ?? "9.1 mm"}</td>
          </tr>
          <tr>
            <th scope="row">Apertura</th>
            <td>{info.apertura ?? "f/1"}</td>
          </tr>
          <tr>
            <th scope="row">Dimensiones</th>
            <td className="valor-mono">
              {info.ancho && info.alto ? `${info.ancho} × ${info.alto} px` : "640 × 512 px"}
            </td>
          </tr>
          <tr>
            <th scope="row">Fecha</th>
            <td className="valor-fecha">
              {info.modificado
                ? new Date(info.modificado).toLocaleString()
                : (info.creado ? new Date(info.creado).toLocaleString() : "—")}
            </td>
          </tr>
          <tr>
            <th scope="row">Coordenadas</th>
            <td className="valor-mono valor-coordenadas">
              {info.coordenadas ?? "—"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
 