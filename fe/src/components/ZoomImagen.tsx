import React, { useCallback, useEffect, useRef, useState } from 'react';

const ESCALA_MIN = 1;
const ESCALA_MAX = 8;
const PASO_BOTON = 1.25;

interface Vista {
  escala: number;
  x: number; // desplazamiento horizontal en px
  y: number; // desplazamiento vertical en px
}

const VISTA_INICIAL: Vista = { escala: 1, x: 0, y: 0 };

interface Props {
  children: React.ReactNode;
  /** Cuando cambia (por ejemplo al abrir otra imagen) el zoom vuelve al 100 %. */
  reiniciarCon?: string;
  /** Si es true, se puede arrastrar para mover la imagen ampliada. */
  desplazable?: boolean;
}

// Envuelve la imagen (con sus anotaciones) y le agrega zoom con la rueda del mouse,
// botones +/−/restablecer y arrastre para moverla. Como el zoom es un transform CSS,
// getBoundingClientRect() de la imagen ya devuelve su caja ampliada, así que las
// coordenadas de las mediciones (en %) siguen alineadas sin tocar nada más.
const ZoomImagen: React.FC<Props> = ({ children, reiniciarCon, desplazable = true }) => {
  const [vista, setVista] = useState<Vista>(VISTA_INICIAL);
  const [moviendo, setMoviendo] = useState(false);
  const vistaRef = useRef<Vista>(vista);
  vistaRef.current = vista;
  const viewportRef = useRef<HTMLDivElement>(null);
  const contenidoRef = useRef<HTMLDivElement>(null);

  // Evita que la imagen se pueda sacar por completo del recuadro
  const limitar = useCallback((v: Vista): Vista => {
    if (v.escala <= ESCALA_MIN) return VISTA_INICIAL;
    const el = contenidoRef.current;
    const maxX = el ? (el.offsetWidth * v.escala) / 2 : 0;
    const maxY = el ? (el.offsetHeight * v.escala) / 2 : 0;
    return {
      escala: v.escala,
      x: Math.min(maxX, Math.max(-maxX, v.x)),
      y: Math.min(maxY, Math.max(-maxY, v.y)),
    };
  }, []);

  // Cambia la escala manteniendo fijo el punto de la pantalla (clientX, clientY):
  // así la rueda hace zoom hacia donde está el cursor.
  const zoomEn = useCallback(
    (nuevaEscala: number, clientX: number, clientY: number) => {
      const actual = vistaRef.current;
      const escala = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, nuevaEscala));
      if (escala === actual.escala) return;

      const contenido = contenidoRef.current;
      if (!contenido) return;
      const caja = contenido.getBoundingClientRect(); // caja ya ampliada
      const centroX = caja.left + caja.width / 2;
      const centroY = caja.top + caja.height / 2;
      const factor = escala / actual.escala;

      setVista(
        limitar({
          escala,
          x: actual.x + (clientX - centroX) * (1 - factor),
          y: actual.y + (clientY - centroY) * (1 - factor),
        })
      );
    },
    [limitar]
  );

  // Al abrir otra imagen, el zoom vuelve al 100 %
  useEffect(() => {
    setVista(VISTA_INICIAL);
  }, [reiniciarCon]);

  // Rueda del mouse: listener nativo no pasivo para poder evitar el scroll de la página
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0015);
      zoomEn(vistaRef.current.escala * factor, e.clientX, e.clientY);
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [zoomEn]);

  // Arrastrar para mover la imagen ampliada (solo cuando hay zoom y la herramienta lo permite)
  const iniciarMovimiento = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!desplazable || e.button !== 0 || vistaRef.current.escala <= ESCALA_MIN) return;
    e.preventDefault();

    const inicio = {
      x: e.clientX,
      y: e.clientY,
      vx: vistaRef.current.x,
      vy: vistaRef.current.y,
    };
    setMoviendo(true);

    const mover = (ev: MouseEvent) => {
      setVista(
        limitar({
          escala: vistaRef.current.escala,
          x: inicio.vx + (ev.clientX - inicio.x),
          y: inicio.vy + (ev.clientY - inicio.y),
        })
      );
    };
    const soltar = () => {
      setMoviendo(false);
      window.removeEventListener('mousemove', mover);
      window.removeEventListener('mouseup', soltar);
    };
    window.addEventListener('mousemove', mover);
    window.addEventListener('mouseup', soltar);
  };

  // Los botones hacen zoom hacia el centro del recuadro
  const zoomDesdeCentro = (factor: number) => {
    const caja = viewportRef.current?.getBoundingClientRect();
    if (!caja) return;
    zoomEn(vistaRef.current.escala * factor, caja.left + caja.width / 2, caja.top + caja.height / 2);
  };

  const puedeMover = desplazable && vista.escala > ESCALA_MIN;

  return (
    <div
      ref={viewportRef}
      className="zoom-viewport"
      onMouseDown={iniciarMovimiento}
      style={{ cursor: puedeMover ? (moviendo ? 'grabbing' : 'grab') : undefined }}
    >
      <div
        ref={contenidoRef}
        className="zoom-contenido"
        style={{
          transform: `translate(${vista.x}px, ${vista.y}px) scale(${vista.escala})`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>

      <div className="controles-zoom" onMouseDown={(e) => e.stopPropagation()}>
        <button
          type="button"
          title="Alejar"
          onClick={() => zoomDesdeCentro(1 / PASO_BOTON)}
          disabled={vista.escala <= ESCALA_MIN}
        >
          <i className="fa-solid fa-magnifying-glass-minus"></i>
        </button>
        <span className="controles-zoom-valor">{Math.round(vista.escala * 100)}%</span>
        <button
          type="button"
          title="Acercar"
          onClick={() => zoomDesdeCentro(PASO_BOTON)}
          disabled={vista.escala >= ESCALA_MAX}
        >
          <i className="fa-solid fa-magnifying-glass-plus"></i>
        </button>
        <button
          type="button"
          title="Restablecer zoom"
          onClick={() => setVista(VISTA_INICIAL)}
          disabled={vista.escala === ESCALA_MIN}
        >
          <i className="fa-solid fa-expand"></i>
        </button>
      </div>
    </div>
  );
};

export default ZoomImagen;