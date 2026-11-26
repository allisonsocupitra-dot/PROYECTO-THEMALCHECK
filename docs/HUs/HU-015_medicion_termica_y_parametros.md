# HU-015 — Medición térmica manual, notas y ajuste de temperatura reflejada

<!--
  ¿Qué? Historia de usuario que describe las herramientas de medición en el visor (puntos, rectángulos, círculos), observaciones y recálculo radiométrico.
  ¿Para qué? Permitir mediciones precisas por píxel o región y ajustar condiciones ambientales como la temperatura reflejada.
  ¿Impacto? Constituye la funcionalidad analítica principal del visor termográfico instalado actualmente.
-->

---

## Identificación

| Campo            | Valor                                                    |
| ---------------- | -------------------------------------------------------- |
| **ID**           | HU-015                                                   |
| **Título**       | Medición térmica, notas y ajuste de temperatura reflejada |
| **Módulo**       | Análisis y Medición                                      |
| **Prioridad**    | Alta                                                     |
| **Estado**       | Implementado                                             |
| **RF asociados** | RF017, RF003                                             |

---

## Historia

**Como** técnico termográfico,
**quiero** marcar puntos, rectángulos y círculos sobre la imagen, escribir observaciones y ajustar la temperatura reflejada,
**para** obtener mediciones radiométricas exactas y conservar mi análisis guardado.

---

## Criterios de aceptación

### CA-015.1 — Herramientas de medición y color personalizado

- **Dado que** activo el botón `Editar` en `/visor`,
- **cuando** dibujo puntos (`SP#`), rectángulos (`R#`) o círculos (`C#`) con un color seleccionado,
- **entonces** el sistema envía las coordenadas reales en píxeles a `PUT /api/v1/imagenes/{id}/puntos`, calcula la temperatura del punto o `Mín`/`Prom`/`Máx`/`ΔTemp` (con marcadores `pos_min`/`pos_max` en regiones) usando el DJI Thermal SDK y actualiza la lista de mediciones en el panel derecho.

### CA-015.2 — Borrado individual, limpieza total y persistencia de notas

- **Dado que** tengo figuras y observaciones escritas en una imagen,
- **cuando** uso la herramienta borrador sobre una marca, presiono `Limpiar todo` o guardo manualmente con `Guardar`,
- **entonces** las figuras y el texto libre de observaciones se sincronizan con la base de datos y persisten entre sesiones.

### CA-015.3 — Recálculo automático al ajustar temperatura reflejada

- **Dado que** visualizo la tabla `PARÁMETROS` (donde `Distancia`, `Humedad` y `Emisividad` son de solo lectura en la UI actual) y modifico `Temp. reflejada` con los botones `+/-` o el campo numérico,
- **cuando** transcurren 500 ms sin nuevos cambios,
- **entonces** el sistema llama a `PUT /api/v1/imagenes/{id}/parametros`, recalcula `temp_min` y `temp_max` globales junto con todas las mediciones (`SP#`, `R#`, `C#`) ya trazadas, y reinicia la caché de rango térmico.

### CA-015.4 — Protección contra pérdida de cambios al salir del visor

- **Dado que** realicé modificaciones sin guardar en observaciones o anotaciones,
- **cuando** intento navegar a otra ruta de la aplicación o cerrar la pestaña,
- **entonces** el sistema muestra una alerta de confirmación (`Guardar y salir`, `Salir sin guardar` o `Cancelar`) y recuerda generar el PDF del informe antes de salir.
