# HU-006 — Cambio de paleta de color y rango térmico

<!--
  ¿Qué? Historia de usuario que describe el cambio de paleta cromática y el ajuste dinámico del rango térmico en el visor.
  ¿Para qué? Facilitar la interpretación de gradientes y contrastes térmicos sobre imágenes radiométricas DJI.
  ¿Impacto? Mejora el análisis visual en tiempo real sin modificar el archivo R-JPEG original en disco.
-->

---

## Identificación

| Campo            | Valor                                         |
| ---------------- | --------------------------------------------- |
| **ID**           | HU-006                                        |
| **Título**       | Cambio de paleta de color y rango térmico     |
| **Módulo**       | Gestión de Imágenes                           |
| **Prioridad**    | Media                                         |
| **Estado**       | Implementado                                  |
| **RF asociados** | RF012                                         |

---

## Historia

**Como** usuario,
**quiero** cambiar la paleta de color térmica y ajustar el rango de temperaturas en la barra de escala,
**para** resaltar mejor las diferencias térmicas de la escena analizada.

---

## Criterios de aceptación

### CA-006.1 — Selección entre las 10 paletas disponibles

- **Dado que** estoy en `/visor` con el modo edición activo,
- **cuando** abro el selector de paleta térmica,
- **entonces** el sistema ofrece las 10 paletas disponibles (`White Hot`, `Fulgurite`, `Iron Red`, `Hot Iron`, `Medical`, `Arctic`, `Rainbow 1`, `Rainbow 2`, `Tint` y `Black Hot`) con su muestra de gradiente.

### CA-006.2 — Renderizado de la paleta desde matriz real

- **Dado que** selecciono una paleta distinta a `Iron Red` en una imagen R-JPEG de DJI,
- **cuando** confirmo la selección,
- **entonces** el backend (`GET /api/v1/imagenes/{id}/paleta`) genera la imagen PNG con la nueva paleta usando la matriz térmica actual y la barra de temperatura actualiza su gradiente sin recargar la página.

### CA-006.3 — Ajuste interactivo del rango térmico en la barra de escala

- **Dado que** visualizo la imagen junto a `BarraRangoTermico`,
- **cuando** arrastro las manijas de temperatura máxima o mínima (con separación mínima de `0.5 °C`),
- **entonces** el cliente obtiene la matriz `float32` (`GET /api/v1/imagenes/{id}/matriz`) una sola vez y recolorea la imagen en tiempo real mostrando en gris las zonas fuera del rango; con doble clic sobre la barra se restablece el rango completo.
