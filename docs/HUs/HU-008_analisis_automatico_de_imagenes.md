# HU-008 — Análisis automático de imágenes

<!--
  ¿Qué? Historia de usuario que describe el análisis automático de imágenes térmicas cargadas por el usuario.
  ¿Para qué? Eliminar la necesidad de intervención manual para obtener resultados de análisis.
  ¿Impacto? Es el punto de entrada del módulo de análisis — sin este proceso automático, no hay resultados que evaluar ni anomalías que detectar.
-->

---

## Identificación

| Campo            | Valor                            |
| ---------------- | --------------------------------- |
| **ID**           | HU-008                            |
| **Título**       | Análisis automático de imágenes   |
| **Módulo**       | Análisis y Alertas                |
| **Prioridad**    | Por definir                       |
| **Estado**       | Por definir                       |
| **RF asociados** | Por definir                       |

---

## Historia

**Como** usuario,
**quiero** que el sistema analice automáticamente las imágenes térmicas cargadas,
**para** obtener resultados sin intervención manual.

---

## Criterios de aceptación

### CA-008.1 — Ejecución automática del análisis

- **Dado que** cargo una imagen térmica válida,
- **cuando** la carga se completa,
- **entonces** el sistema debe iniciar el análisis automáticamente, sin requerir ninguna acción adicional de mi parte.

### CA-008.2 — Visualización de resultados en la interfaz

- **Dado que** el análisis de la imagen ha finalizado,
- **cuando** accedo a la interfaz de resultados,
- **entonces** debo ver los resultados del análisis presentados claramente en pantalla.

### CA-008.3 — Sin configuración adicional requerida

- **Dado que** voy a analizar una imagen térmica,
- **cuando** inicio el proceso de carga,
- **entonces** no debo necesitar configurar parámetros adicionales para que el análisis comience.
