# Requisitos Funcionales - Gestión de Imágenes

## RF003 - Visualización térmica
- ID: RF003
- Nombre: Visualización térmica
- Descripción funcional: El sistema debe mostrar las imágenes térmicas cargadas por el usuario en la interfaz principal.
- Detalle técnico: Debe renderizar la imagen con la paleta activa y soportar la visualización en tiempo real tras la carga del archivo.
- Entradas: archivo de imagen térmica.
- Salidas: representación visual en pantalla.
- Prioridad: Alta
- Criterios de aceptación: La imagen se muestra correctamente sin demora visible tras la carga.

## RF005 - Carga de imágenes
- ID: RF005
- Nombre: Carga de imágenes
- Descripción funcional: El sistema debe permitir al usuario cargar imágenes térmicas en formatos compatibles.
- Detalle técnico: Debe validar la extensión y el contenido del archivo antes de almacenarlo o procesarlo.
- Entradas: archivo en formato JPEG, PNG o TIFF.
- Salidas: confirmación de carga y visualización del archivo.
- Prioridad: Alta
- Criterios de aceptación: El archivo se sube, se valida y se muestra correctamente en pantalla.

## RF012 - Filtros de visualización
- ID: RF012
- Nombre: Filtros de visualización
- Descripción funcional: El sistema debe ofrecer diferentes paletas de color para interpretar las imágenes térmicas.
- Detalle técnico: La interfaz debe permitir seleccionar una paleta y aplicarla al renderizado de la imagen sin recargar la página.
- Entradas: selección del usuario.
- Salidas: actualización visual inmediata de la imagen.
- Prioridad: Media
- Criterios de aceptación: Al cambiar la paleta, la imagen se actualiza en tiempo real.

## RF013 - Comparación de imágenes
- ID: RF013
- Nombre: Comparación de imágenes
- Descripción funcional: El sistema debe permitir comparar dos imágenes térmicas del mismo equipo en pantalla simultánea.
- Detalle técnico: Debe soportar la carga y el renderizado simultáneo de dos imágenes sin distorsión ni pérdida de rendimiento significativa.
- Entradas: dos archivos de imagen.
- Salidas: vista comparativa lado a lado.
- Prioridad: Media
- Criterios de aceptación: Ambas imágenes se muestran correctamente una junto a la otra.
