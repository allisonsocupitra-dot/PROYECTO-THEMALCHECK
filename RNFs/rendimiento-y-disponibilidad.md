# Requisitos No Funcionales - Rendimiento y Disponibilidad

## RNF002 - Capacidad
- ID: RNF002
- Descripción: El sistema debe soportar el almacenamiento de al menos 10.000 imágenes térmicas y sus reportes asociados.
- Priorización: Alta
- Detalle técnico: La solución debe contemplar almacenamiento escalable y organización de archivos o registros para soportar crecimiento futuro.
- Criterio de cumplimiento: El sistema puede gestionar un volumen significativo de imágenes sin degradación crítica.

## RNF004 - Disponibilidad
- ID: RNF004
- Descripción: El sistema debe estar disponible el 99% del tiempo, con mantenimiento planeado fuera del horario laboral.
- Priorización: Alta
- Detalle técnico: Debe contemplar monitoreo, respaldo y estrategias de recuperación ante fallas.
- Criterio de cumplimiento: El sistema mantiene operación continua y recupera servicios en caso de interrupciones.

## RNF005 - Escalabilidad
- ID: RNF005
- Descripción: El sistema debe soportar el crecimiento progresivo de usuarios e imágenes sin degradar el rendimiento.
- Priorización: Media
- Detalle técnico: Debe diseñarse para crecer horizontal o verticalmente según demanda.
- Criterio de cumplimiento: El sistema mantiene respuesta aceptable ante aumento de carga.

## RNF008 - Carga rápida
- ID: RNF008
- Descripción: El sistema debe cargar completamente en menos de 3 segundos bajo condiciones normales de uso.
- Priorización: Alta
- Detalle técnico: Debe optimizar recursos de frontend, carga de datos y procesamiento inicial.
- Criterio de cumplimiento: El tiempo de carga inicial se mantiene dentro del límite establecido.
