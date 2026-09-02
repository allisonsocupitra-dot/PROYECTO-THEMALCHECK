import React from "react";
import { formatearTemperatura } from "../utils/temperaturas";
 
interface TablaParametrosProps {
  imagen: any;
  onCambiarTempReflejada: (valor: number) => void;
  // Contenido opcional que se renderiza justo debajo del cuadro Máx/Mín/ΔTemp
  // y antes de la sección de Parámetros (ej. la lista de puntos de medición).
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
 
  return (
    <>
      {/* Cuadro superior */}
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
 
      {/* Parámetros */}
      <div className="visor-panel-seccion">
        <h5>PARÁMETROS</h5>
 
        <div className="fila-parametro">
          <span>Distancia</span>
          <span>{imagen?.parametros?.distancia ?? "—"}</span>
        </div>
 
        <div className="fila-parametro">
          <span>Humedad</span>
          <span>{imagen?.parametros?.humedad ?? "—"}</span>
        </div>
 
        <div className="fila-parametro">
          <span>Emisividad</span>
          <span>{imagen?.parametros?.emisividad ?? "—"}</span>
        </div>
 
        <div className="temp-reflejada">
          <label>Temp. reflejada</label>
 
          <div className="temp-reflejada-control">
            <button
              onClick={() =>
                onCambiarTempReflejada(
                  Number(imagen?.parametros?.tempReflejada ?? 20) - 1
                )
              }
            >
              −
            </button>
 
            <input
              type="number"
              value={imagen?.parametros?.tempReflejada ?? 20}
              onChange={(e) =>
                onCambiarTempReflejada(Number(e.target.value))
              }
            />
 
            <button
              onClick={() =>
                onCambiarTempReflejada(
                  Number(imagen?.parametros?.tempReflejada ?? 20) + 1
                )
              }
            >
              +
            </button>
          </div>
        </div>
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
    <div className="visor-panel-seccion">
      <h5>INFORMACIÓN DE LA IMAGEN</h5>
 
      <div className="fila-parametro">
        <span>Modelo</span>
        <span>{info.modelo ?? "M3T"}</span>
      </div>
 
      <div className="fila-parametro">
        <span>Número de serie</span>
        <span>{info.numeroSerie ?? "—"}</span>
      </div>
 
      <div className="fila-parametro">
        <span>Distancia focal</span>
        <span>{info.distanciaFocal ?? "9.1 mm"}</span>
      </div>
 
      <div className="fila-parametro">
        <span>Apertura</span>
        <span>{info.apertura ?? "f/1"}</span>
      </div>
 
      <div className="fila-parametro">
        <span>Ancho</span>
        <span>{info.ancho ?? 640}</span>
      </div>
 
      <div className="fila-parametro">
        <span>Alto</span>
        <span>{info.alto ?? 512}</span>
      </div>
 
      <div className="fila-parametro">
        <span>Creado</span>
        <span>{info.creado ?? "—"}</span>
      </div>
 
      <div className="fila-parametro">
        <span>Modificado</span>
        <span>{info.modificado ?? "—"}</span>
      </div>
 
      <div className="fila-parametro">
        <span>Coordenadas</span>
        <span>{info.coordenadas ?? "—"}</span>
      </div>
    </div>
  );
};
 