import React from 'react';
import type { Carpeta } from '../types/galeria';

interface ArbolCarpetasProps {
  carpetas: Carpeta[];
  carpetaActivaId: string;
  expandidas: Set<string>;
  nivel?: number;
  onSeleccionar: (id: string) => void;
  onAlternarExpandir: (id: string) => void;
  onEliminar: (e: React.MouseEvent, id: string) => void;
  tituloEliminar: string;
}

// Cuenta cuántas imágenes tiene una carpeta contando también sus subcarpetas,
// para que el número que se ve junto al nombre incluya todo lo que hay dentro.
const contarImagenes = (c: Carpeta): number =>
  c.imagenes.length + c.subcarpetas.reduce((acc, hija) => acc + contarImagenes(hija), 0);

const ArbolCarpetas: React.FC<ArbolCarpetasProps> = ({
  carpetas,
  carpetaActivaId,
  expandidas,
  nivel = 0,
  onSeleccionar,
  onAlternarExpandir,
  onEliminar,
  tituloEliminar,
}) => {
  return (
    <ul className="lista-carpetas-items" style={nivel > 0 ? { marginLeft: 14 } : undefined}>
      {carpetas.map((c) => {
        const tieneHijas = c.subcarpetas.length > 0;
        const expandida = expandidas.has(c.id);

        return (
          <li key={c.id}>
            <button
              type="button"
              className={c.id === carpetaActivaId ? 'item-carpeta item-carpeta-activa' : 'item-carpeta'}
              onClick={() => onSeleccionar(c.id)}
            >
              <span
                role="button"
                tabIndex={tieneHijas ? 0 : -1}
                className={`chevron-carpeta ${tieneHijas ? '' : 'chevron-carpeta-oculto'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (tieneHijas) onAlternarExpandir(c.id);
                }}
                onKeyDown={(e) => {
                  if (tieneHijas && (e.key === 'Enter' || e.key === ' ')) {
                    e.stopPropagation();
                    onAlternarExpandir(c.id);
                  }
                }}
              >
                {tieneHijas && <i className={`fa-solid fa-chevron-${expandida ? 'down' : 'right'}`}></i>}
              </span>

              <i className={`fa-solid ${expandida && tieneHijas ? 'fa-folder-open' : 'fa-folder'}`}></i>
              <span className="nombre-carpeta-arbol">{c.nombre}</span>
              <span className="item-carpeta-contador">{contarImagenes(c)}</span>
              <span
                role="button"
                tabIndex={0}
                className="boton-eliminar-carpeta"
                title={tituloEliminar}
                onClick={(e) => onEliminar(e, c.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onEliminar(e as unknown as React.MouseEvent, c.id);
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </span>
            </button>

            {tieneHijas && expandida && (
              <ArbolCarpetas
                carpetas={c.subcarpetas}
                carpetaActivaId={carpetaActivaId}
                expandidas={expandidas}
                nivel={nivel + 1}
                onSeleccionar={onSeleccionar}
                onAlternarExpandir={onAlternarExpandir}
                onEliminar={onEliminar}
                tituloEliminar={tituloEliminar}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default ArbolCarpetas;
