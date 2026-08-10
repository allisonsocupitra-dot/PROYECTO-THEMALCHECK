# HU-006 — Cambio de paleta de color

<!--
  ¿Qué? Historia de usuario que describe el cambio de paleta de color en la visualización de una imagen térmica.
  ¿Para qué? Facilitar una mejor interpretación de las variaciones térmicas mediante distintas paletas visuales.
  ¿Impacto? Complementa a HU-005 (visualización) mejorando la lectura de datos térmicos sin alterar la imagen fuente.
-->

---

## Identificación

| Campo            | Valor                          |
| ---------------- | ---------------------------------|
| **ID**           | HU-006                           |
| **Título**       | Cambio de paleta de color        |
| **Módulo**       | Gestión de Imágenes              |
| **Prioridad**    | Por definir                      |
| **Estado**       | Por definir                      |
| **RF asociados** | Por definir                      |

---

## Historia

**Como** usuario,
**quiero** cambiar la paleta de visualización de la imagen,
**para** interpretar mejor las variaciones térmicas.

---

## Criterios de aceptación

### CA-006.1 — Selección entre paletas disponibles

- **Dado que** estoy visualizando una imagen térmica,
- **cuando** accedo a las opciones de paleta,
- **entonces** debo poder seleccionar entre diferentes paletas de color disponibles.

### CA-006.2 — Actualización en tiempo real

- **Dado que** selecciono una nueva paleta de color,
- **cuando** confirmo el cambio,
- **entonces** la imagen debe actualizarse en tiempo real con la nueva paleta.

### CA-006.3 — Aplicación correcta de la paleta

- **Dado que** cambié la paleta de visualización,
- **cuando** reviso la imagen resultante,
- **entonces** la paleta seleccionada debe aplicarse correctamente sobre todo el contenido visualizado.
