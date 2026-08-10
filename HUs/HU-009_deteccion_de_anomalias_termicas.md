# HU-009 — Detección de anomalías térmicas

<!--
  ¿Qué? Historia de usuario que describe la identificación de zonas con temperaturas fuera del rango normal.
  ¿Para qué? Permitir la detección temprana de posibles fallas eléctricas a partir de patrones térmicos.
  ¿Impacto? Es el núcleo analítico del sistema — depende del análisis automático (HU-008) y alimenta la generación de alertas (HU-010).
-->

---

## Identificación

| Campo            | Valor                             |
| ---------------- | ---------------------------------- |
| **ID**           | HU-009                             |
| **Título**       | Detección de anomalías térmicas    |
| **Módulo**       | Análisis y Alertas                 |
| **Prioridad**    | Por definir                        |
| **Estado**       | Por definir                        |
| **RF asociados** | Por definir                        |

---

## Historia

**Como** usuario,
**quiero** que el sistema identifique zonas con temperaturas fuera del rango normal,
**para** detectar posibles fallas eléctricas.

---

## Criterios de aceptación

### CA-009.1 — Resaltado visual de zonas anómalas

- **Dado que** el sistema ha analizado una imagen térmica,
- **cuando** se detectan temperaturas fuera del rango normal,
- **entonces** las zonas anómalas deben resaltarse visualmente sobre la imagen.

### CA-009.2 — Detección automática sin intervención manual

- **Dado que** cargué una imagen térmica,
- **cuando** el sistema procesa dicha imagen,
- **entonces** la detección de anomalías debe ejecutarse automáticamente, sin que yo deba iniciarla manualmente.

### CA-009.3 — Presentación clara de resultados

- **Dado que** se han detectado anomalías térmicas en la imagen,
- **cuando** reviso los resultados del análisis,
- **entonces** estos deben presentarse de forma clara y comprensible para facilitar mi revisión.
