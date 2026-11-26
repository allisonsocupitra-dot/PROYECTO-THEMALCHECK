# HU-005 — Visualización de imágenes térmicas

<!--
  ¿Qué? Historia de usuario que describe la inspección visual de imágenes en el explorador y en el visor interactivo.
  ¿Para qué? Permitir revisar cada captura con zoom, escala térmica, metadatos y pestañas por carpeta.
  ¿Impacto? Habilita la inspección visual y sirve de base para las mediciones, cambio de paleta y exportación.
-->

---

## Identificación

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **ID**           | HU-005                             |
| **Título**       | Visualización de imágenes térmicas |
| **Módulo**       | Gestión de Imágenes                |
| **Prioridad**    | Alta                               |
| **Estado**       | Implementado                       |
| **RF asociados** | RF003, RF014                       |

---

## Historia

**Como** usuario,
**quiero** visualizar las imágenes térmicas cargadas tanto en vista previa como en el visor interactivo con zoom y metadatos,
**para** inspeccionar en detalle los equipos antes y durante la toma de mediciones.

---

## Criterios de aceptación

### CA-005.1 — Vista previa rápida en el explorador (`/dashboard`)

- **Dado que** cargué imágenes en una carpeta,
- **cuando** selecciono una miniatura con un clic,
- **entonces** el panel lateral derecho muestra la imagen en vista previa junto con su fecha, tabla de `PARÁMETROS` y tabla de `INFORMACIÓN DE LA IMAGEN`.

### CA-005.2 — Apertura en el visor (`/visor`) y navegación por pestañas

- **Dado que** hago doble clic sobre una miniatura o presiono el botón de abrir en el visor,
- **cuando** accedo a `/visor`,
- **entonces** se muestran en la barra superior las pestañas de todas las imágenes pertenecientes a la misma carpeta activa para alternar entre ellas sin perder su estado.

### CA-005.3 — Zoom interactivo y conservación de proporción

- **Dado que** estoy inspeccionando una imagen en `/visor`,
- **cuando** uso la rueda del mouse o los controles de zoom (`Acercar`, `Alejar`, `Restablecer`) entre `100%` y `800%` y arrastro la imagen ampliada,
- **entonces** la imagen conserva su proporción original, se amplía hacia el cursor y mantiene alineadas las anotaciones y la barra de escala térmica.
