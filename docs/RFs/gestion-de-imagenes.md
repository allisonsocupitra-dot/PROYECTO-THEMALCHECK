# Requisitos Funcionales - Gestión de Imágenes

## RF003 - Visualización térmica y exploración en visor
- **ID:** RF003
- **Nombre:** Visualización térmica y exploración en visor
- **Estado actual:** Implementado
- **Descripción funcional:** El sistema muestra las imágenes térmicas cargadas tanto en el explorador principal (miniaturas y panel de vista previa) como en un visor interactivo con zoom, barra de escala térmica, herramientas de medición y panel de propiedades técnicas.
- **Detalle técnico:** Implementado en `DashboardPage.tsx`, `VisorPage.tsx`, `ZoomImagen.tsx`, `BarraRangoTermico.tsx` y `TablasPropiedades.tsx`. El visor agrupa por pestañas las imágenes de la carpeta activa, soporta zoom de 100% a 800% (rueda del mouse, botones y arrastre con cursor) manteniendo alineadas las anotaciones porcentuales en capa SVG, y muestra parámetros ambientales y metadatos EXIF/cámara.
- **Entradas:** Imagen seleccionada en el explorador o desde las pestañas del visor.
- **Salidas:** Renderizado interactivo de la imagen con escala térmica, controles de zoom, anotaciones y ficha técnica.
- **Prioridad:** Alta
- **Criterios de aceptación:** La imagen se renderiza manteniendo su proporción original, permite hacer zoom sin desalinear las marcas y muestra sus metadatos y parámetros asociados.

---

## RF005 - Carga de imágenes y carpetas térmicas
- **ID:** RF005
- **Nombre:** Carga de imágenes y carpetas térmicas
- **Estado actual:** Implementado
- **Descripción funcional:** El sistema permite cargar imágenes individuales (arrastrar y soltar o selector de archivos) y carpetas completas conservando su jerarquía de subcarpetas, así como listar, seleccionar y eliminar imágenes o carpetas del usuario.
- **Detalle técnico:** Implementado en `ImageUploader.tsx`, `DashboardPage.tsx`, `GaleriaContext.tsx` y los endpoints `POST /api/v1/imagenes/upload`, `GET /api/v1/imagenes/usuario/{id_usuario}` y `DELETE /api/v1/imagenes/{id_imagen}` (`be/api/v1/endpoints/visor/imagen.py`). En frontend filtra archivos `image/*` y soporta `webkitdirectory` para reconstruir árboles de carpetas; en backend guarda los archivos con UUID en `be/uploads/termograficas/` y persiste metadatos, usuario y ruta de carpeta en MySQL (`imagen_termografica`).
- **Entradas:** Uno o varios archivos de imagen (`image/*`, idealmente R-JPEG de DJI) o carpeta del sistema operativo.
- **Salidas:** Registro persistido en BD, reconstrucción del árbol de carpetas al iniciar sesión y visualización inmediata en la cuadrícula de miniaturas.
- **Prioridad:** Alta
- **Criterios de aceptación:** Las imágenes y carpetas se cargan, se almacenan asociadas al usuario, muestran indicador de procesamiento y permanecen disponibles al recargar o volver a iniciar sesión.

---

## RF012 - Paletas de color y ajuste de rango térmico
- **ID:** RF012
- **Nombre:** Paletas de color y ajuste de rango térmico
- **Estado actual:** Implementado
- **Descripción funcional:** El sistema permite cambiar la paleta de color aplicada sobre la imagen térmica y ajustar dinámicamente el rango de temperaturas mínimo/máximo visible mediante una barra de escala interactiva.
- **Detalle técnico:** Implementado en `VisorPage.tsx`, `utils/paletas.ts`, `useRangoTermico.ts`, `BarraRangoTermico.tsx`, `GET /api/v1/imagenes/{id_imagen}/paleta` (`be/api/v1/endpoints/visor/paletas.py`, `be/src/services/paletas.py`) y `GET /api/v1/imagenes/{id_imagen}/matriz` (`be/api/v1/endpoints/visor/matriz.py`). Dispone de **10 paletas**: `White Hot`, `Fulgurite`, `Iron Red` (por defecto), `Hot Iron`, `Medical`, `Arctic`, `Rainbow 1`, `Rainbow 2`, `Tint` y `Black Hot`. Para R-JPEG de DJI, el backend re-renderiza la imagen en PNG con la paleta o entrega la matriz `float32` para recoloreo en tiempo real en el cliente.
- **Entradas:** Selección de paleta desde el menú de edición y desplazamiento de manijas mín/máx en la barra térmica (doble clic para restablecer).
- **Salidas:** Actualización visual inmediata de la imagen y de la barra de escala sin recargar la página.
- **Prioridad:** Media
- **Criterios de aceptación:** Al cambiar entre las 10 paletas o deslizar las manijas de rango térmico en una imagen R-JPEG de DJI, la imagen y su barra de gradiente se actualizan de forma coherente y en tiempo real.

---

## RF013 - Comparación simultánea de imágenes
- **ID:** RF013
- **Nombre:** Comparación simultánea de imágenes
- **Estado actual:** Pendiente (No implementado en la versión actual)
- **Descripción funcional:** Permitir comparar dos imágenes térmicas lado a lado en pantalla de manera simultánea para contrastar temperaturas entre periodos o estados de un equipo.
- **Detalle técnico:** En la versión instalada actual, `VisorPage.tsx` muestra una única imagen activa a la vez y permite alternar rápidamente entre las imágenes de la misma carpeta mediante pestañas superiores. No existe aún una vista dividida o dual lado a lado.
- **Entradas:** Dos imágenes térmicas seleccionadas para comparación.
- **Salidas:** Vista comparativa simultánea lado a lado.
- **Prioridad:** Media (en backlog para futura iteración)
- **Criterios de aceptación:** El usuario podrá abrir dos imágenes simultáneamente en vista dividida sin deformación ni degradación de rendimiento (pendiente de desarrollo).
