import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { obtenerMatrizTermica } from '../api/MatrizTermica';
import { crearTablaColores, pintarMatrizConRango } from '../utils/rangoTermico';

interface Opciones {
  idImagen?: string;
  idBackend?: number | null;
  ancho?: number | null;
  alto?: number | null;
  limiteMin?: number | null;
  limiteMax?: number | null;
  colores: readonly string[];
}

const TOLERANCIA = 0.05;

export const useRangoTermico = ({
  idImagen,
  idBackend,
  ancho,
  alto,
  limiteMin,
  limiteMax,
  colores,
}: Opciones) => {
  // Rango elegido por imagen (cada imagen conserva el suyo al cambiar de pestaña)
  const [rangos, setRangos] = useState<Record<string, { min: number; max: number }>>({});
  // Imagen recoloreada, con el id de la imagen a la que pertenece (así nunca se
  // muestra la de otra pestaña mientras se repinta)
  const [resultado, setResultado] = useState<{ id: string; url: string | null } | null>(null);
  const [version, setVersion] = useState(0);
  const matrices = useRef(new Map<string, Float32Array>());
  const enCarga = useRef(new Set<string>());

  const limitesValidos =
    Number.isFinite(limiteMin) && Number.isFinite(limiteMax) && (limiteMax as number) > (limiteMin as number);
  const lMin = limiteMin as number;
  const lMax = limiteMax as number;

  const rango = idImagen ? rangos[idImagen] : undefined;
  const tMin = limitesValidos ? Math.max(lMin, rango?.min ?? lMin) : NaN;
  const tMax = limitesValidos ? Math.min(lMax, rango?.max ?? lMax) : NaN;
  const rangoActivo = limitesValidos && (tMin > lMin + TOLERANCIA || tMax < lMax - TOLERANCIA);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tabla = useMemo(() => crearTablaColores(colores), [colores.join('|')]);

  const cambiarRango = useCallback(
    (min: number, max: number) => {
      if (!idImagen) return;
      setRangos((prev) => ({ ...prev, [idImagen]: { min, max } }));
    },
    [idImagen]
  );

  const restablecer = useCallback(() => {
    if (!idImagen) return;
    setRangos((prev) => {
      if (!(idImagen in prev)) return prev;
      const siguiente = { ...prev };
      delete siguiente[idImagen];
      return siguiente;
    });
  }, [idImagen]);

  // Se usa cuando cambia la temp. reflejada: la matriz y la escala ya no son las mismas
  const reiniciar = useCallback((id: string) => {
    matrices.current.delete(id);
    setRangos((prev) => {
      if (!(id in prev)) return prev;
      const siguiente = { ...prev };
      delete siguiente[id];
      return siguiente;
    });
  }, []);

  useEffect(() => {
    if (!idImagen || !idBackend || !rangoActivo || !ancho || !alto || colores.length === 0) {
      setResultado(null);
      return;
    }

    // Constantes ya validadas: así TypeScript las ve como string/number dentro de los callbacks
    const id: string = idImagen;
    const idApi: number = idBackend;
    const w: number = ancho;
    const h: number = alto;

    const matriz = matrices.current.get(id);

    if (!matriz) {
      // Primera vez que se usa el rango en esta imagen: se pide la matriz una sola vez
      if (!enCarga.current.has(id)) {
        enCarga.current.add(id);
        obtenerMatrizTermica(idApi)
          .then((m) => {
            if (m.length !== w * h) {
              throw new Error(`La matriz trae ${m.length} valores y se esperaban ${w * h}`);
            }
            matrices.current.set(id, m);
          })
          .catch((err) => {
            console.error('Rango térmico:', err);
            restablecer(); // si falla (p. ej. imagen no DJI), la barra vuelve al rango completo
          })
          .finally(() => {
            enCarga.current.delete(id);
            setVersion((v) => v + 1);
          });
      }
      return;
    }

    let cancelado = false;
    const cuadro = requestAnimationFrame(() => {
      if (!cancelado) {
        setResultado({ id, url: pintarMatrizConRango(matriz, w, h, tMin, tMax, tabla) });
      }
    });
    return () => {
      cancelado = true;
      cancelAnimationFrame(cuadro);
    };
  }, [idImagen, idBackend, rangoActivo, tMin, tMax, ancho, alto, tabla, version, colores.length, restablecer]);

  return {
    tMin,
    tMax,
    rangoActivo,
    urlRango: rangoActivo && resultado && resultado.id === idImagen ? resultado.url : null,
    cambiarRango,
    restablecer,
    reiniciar,
  };
};