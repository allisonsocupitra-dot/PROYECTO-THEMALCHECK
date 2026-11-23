import React, { useRef } from 'react';
import { formatearTemperatura } from '../utils/temperaturas';

const SEPARACION_MINIMA = 0.5; // °C que deben quedar siempre entre las dos manijas

interface Props {
  limiteMin?: number | null;
  limiteMax?: number | null;
  tMin: number;
  tMax: number;
  gradiente: string;
  onCambiarRango: (min: number, max: number) => void;
  onRestablecer: () => void;
}

const BarraRangoTermico: React.FC<Props> = ({
  limiteMin,
  limiteMax,
  tMin,
  tMax,
  gradiente,
  onCambiarRango,
  onRestablecer,
}) => {
  const pistaRef = useRef<HTMLDivElement>(null);

  const habilitada =
    Number.isFinite(limiteMin) && Number.isFinite(limiteMax) && (limiteMax as number) > (limiteMin as number);
  const lMin = limiteMin as number;
  const lMax = limiteMax as number;

  const texto = (v: number) => (Number.isFinite(v) ? `${formatearTemperatura(v)}°C` : '—');

  // Posición vertical (0 % = arriba = máx, 100 % = abajo = mín)
  const desdeArriba = (t: number) => ((lMax - t) / (lMax - lMin)) * 100;

  const iniciar = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const mover = (cual: 'min' | 'max') => (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId) || !pistaRef.current) return;
    const caja = pistaRef.current.getBoundingClientRect();
    const fraccion = Math.min(1, Math.max(0, 1 - (e.clientY - caja.top) / caja.height));
    const crudo = lMin + fraccion * (lMax - lMin);
    const valor = fraccion >= 1 || fraccion <= 0 ? crudo : Math.round(crudo * 10) / 10;

    if (cual === 'max') onCambiarRango(tMin, Math.min(lMax, Math.max(valor, tMin + SEPARACION_MINIMA)));
    else onCambiarRango(Math.max(lMin, Math.min(valor, tMax - SEPARACION_MINIMA)), tMax);
  };

  const soltar = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="barra-temperatura">
      <span className="temp-max">{texto(tMax)}</span>

      <div
        className="pista-rango"
        ref={pistaRef}
        onDoubleClick={habilitada ? onRestablecer : undefined}
        title={habilitada ? 'Arrastra las manijas para ajustar el rango · doble clic para restablecer' : undefined}
      >
        <div className="rango-gradiente" style={{ background: gradiente }} />

        {habilitada && (
          <>
            {/* Zonas fuera del rango: se ven grises, como en la herramienta de DJI */}
            <div className="rango-gris" style={{ top: 0, height: `${desdeArriba(tMax)}%` }} />
            <div className="rango-gris" style={{ bottom: 0, height: `${100 - desdeArriba(tMin)}%` }} />

            <div
              className="manija-rango manija-rango-max"
              style={{ top: `${desdeArriba(tMax)}%` }}
              onPointerDown={iniciar}
              onPointerMove={mover('max')}
              onPointerUp={soltar}
              onPointerCancel={soltar}
            />
            <div
              className="manija-rango manija-rango-min"
              style={{ top: `${desdeArriba(tMin)}%` }}
              onPointerDown={iniciar}
              onPointerMove={mover('min')}
              onPointerUp={soltar}
              onPointerCancel={soltar}
            />
          </>
        )}
      </div>

      <span className="temp-min">{texto(tMin)}</span>
    </div>
  );
};

export default BarraRangoTermico;