# HU-005 — Visualización de imágenes

<!--
  ¿Qué? Historia de usuario que describe la visualización en pantalla de una imagen térmica cargada.
  ¿Para qué? Permitir la inspección visual del contenido antes de ejecutar el análisis automático.
  ¿Impacto? Depende de HU-004 (carga de imágenes) y es prerrequisito visual para HU-006 (cambio de paleta) y HU-007 (comparación).
-->

---

## Identificación

| Campo            | Valor                        |
| ---------------- | -------------------------------|
| **ID**           | HU-005                         |
| **Título**       | Visualización de imágenes      |
| **Módulo**       | Gestión de Imágenes            |
| **Prioridad**    | Por definir                    |
| **Estado**       | Por definir                    |
| **RF asociados** | Por definir                    |

---

## Historia

**Como** usuario,
**quiero** ver la imagen térmica cargada en pantalla,
**para** inspeccionar visualmente el contenido antes del análisis.

---

## Criterios de aceptación

### CA-005.1 — Renderizado sin demora

- **Dado que** cargué una imagen térmica,
- **cuando** esta se muestra en pantalla,
- **entonces** debe renderizarse sin demora visible.

### CA-005.2 — Conservación de calidad y proporción

- **Dado que** la imagen se está visualizando,
- **cuando** la observo en la interfaz,
- **entonces** debe conservar la calidad y proporción original de la imagen.

### CA-005.3 — Visualización completa en la interfaz principal

- **Dado que** la imagen fue cargada,
- **cuando** accedo a la interfaz principal,
- **entonces** debo poder observar la imagen completa sin recortes.
