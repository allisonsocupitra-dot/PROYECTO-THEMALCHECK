# Requisitos No Funcionales - Rendimiento y Disponibilidad

## RNF002 - Capacidad de almacenamiento
- **ID:** RNF002
- **Descripción:** El sistema debe soportar el almacenamiento persistente de imágenes térmicas, mediciones e informes PDF generados por múltiples usuarios.
- **Estado actual:** Implementado (almacenamiento local + MySQL)
- **Priorización:** Alta
- **Detalle técnico:** Las imágenes originales se almacenan en disco (`be/uploads/termograficas/` con identificador UUID para evitar colisiones) y los informes PDF generados en `be/uploads/informes_pdf/`, manteniendo metadatos, carpetas, puntos de medición y referencias en MySQL (`imagen_termografica`, `punto_medicion`, `informe`). Para volúmenes de 10.000+ imágenes en producción se recomienda migrar almacenamiento de archivos a un servicio de objetos (ej. S3/MinIO).
- **Criterio de cumplimiento:** Cada carga de imagen y exportación PDF persiste correctamente su archivo y su registro relacional en MySQL, pudiendo consultarse y eliminarse sin colisiones de nombre.

---

## RNF004 - Disponibilidad y tolerancia a fallos en carga/SDK
- **ID:** RNF004
- **Descripción:** El sistema debe mantener operación continua en sus funciones principales y degradar de forma controlada cuando una imagen no contenga datos radiométricos compatibles.
- **Estado actual:** Parcialmente implementado
- **Priorización:** Alta
- **Detalle técnico:** El sistema está preparado para ejecución continua con FastAPI/Uvicorn y Vite/React. En `thermal_extractor.py` y `comun.py`, si una imagen no es R-JPEG de DJI o falla el SDK, la subida y el guardado de puntos no se bloquean: se conservan los metadatos básicos (`Pillow`/`ExifRead`) y se registra advertencia en logs. *(No hay configurado monitoreo externo ni SLA automático de 99% en el entorno local actual).*
- **Criterio de cumplimiento:** La caída o incompatibilidad del extractor radiométrico en un archivo puntual no detiene el servidor ni impide cargar o visualizar otras imágenes.

---

## RNF005 - Escalabilidad y eficiencia en cálculo térmico
- **ID:** RNF005
- **Descripción:** El sistema debe optimizar el recálculo y renderizado de matrices térmicas para evitar degradación al ajustar rangos, paletas o parámetros ambientales.
- **Estado actual:** Implementado a nivel de aplicación
- **Priorización:** Media
- **Detalle técnico:**
  - Caché en memoria LRU simple en el backend (`_CACHE` de 10 matrices en `matriz.py`) indexada por `(id_imagen, distancia_m, humedad, emisividad, temp_reflejada)`.
  - Caché de matrices `Float32Array` en el cliente (`useRangoTermico.ts`) y renderizado mediante `requestAnimationFrame` en `Canvas` HTML5.
  - *Debounce* de 500 ms al modificar la temperatura reflejada en `VisorPage.tsx`.
- **Criterio de cumplimiento:** El ajuste de rango térmico con las manijas de la barra se renderiza de manera fluida en el navegador sin re-consultar la matriz al backend en cada movimiento.

---

## RNF008 - Carga rápida e interactividad
- **ID:** RNF008
- **Descripción:** La interfaz web debe cargar rápidamente y responder de forma fluida durante la navegación por carpetas, zoom y edición en el visor.
- **Estado actual:** Implementado
- **Priorización:** Alta
- **Detalle técnico:** Frontend empaquetado con Vite + React 19; las transformaciones de zoom (100%–800%) y desplazamiento se ejecutan vía CSS `transform` (`ZoomImagen.tsx`) sin re-renderizar la capa de imagen, y las anotaciones SVG usan coordenadas porcentuales relativas.
- **Criterio de cumplimiento:** La carga inicial de la aplicación web y la interacción de zoom/dibujo en el visor responden de forma inmediata en condiciones normales de red local.
