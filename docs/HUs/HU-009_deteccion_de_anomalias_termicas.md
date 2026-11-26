# HU-009 — Detección de anomalías térmicas

<!--
  ¿Qué? Historia de usuario que describe la identificación de extremos térmicos y anomalías en imágenes.
  ¿Para qué? Apoyar la detección temprana de posibles fallas eléctricas mediante marcadores de temperatura crítica.
  ¿Impacto? Actualmente implementado como detección asistida de puntos extremos dentro de regiones y aislamiento por rango térmico.
-->

---

## Identificación

| Campo            | Valor                                         |
| ---------------- | --------------------------------------------- |
| **ID**           | HU-009                                        |
| **Título**       | Detección de anomalías térmicas               |
| **Módulo**       | Análisis y Alertas                            |
| **Prioridad**    | Alta                                          |
| **Estado**       | Parcialmente implementado                     |
| **RF asociados** | RF006, RF017                                  |

---

## Historia

**Como** técnico o analista,
**quiero** identificar automáticamente los puntos más calientes y fríos y aislar rangos de temperatura en la imagen,
**para** detectar posibles fallas o anomalías térmicas en equipos eléctricos.

---

## Criterios de aceptación

### CA-009.1 — Resaltado automático de extremos térmicos en regiones medidas

- **Dado que** trazo un rectángulo (`R#`) o círculo (`C#`) sobre una imagen R-JPEG de DJI en el visor,
- **cuando** el backend calcula la región mediante `comun.py` / `circulos.py`,
- **entonces** el sistema identifica y resalta automáticamente sobre la imagen el píxel de temperatura máxima (marcador rojo) y mínima (marcador azul) con sus valores en `°C`, además del diferencial `ΔTemp` (`Máx − Mín`).

### CA-009.2 — Aislamiento visual de temperaturas mediante rango térmico

- **Dado que** estoy analizando una imagen R-JPEG en el visor,
- **cuando** ajusto las manijas de `BarraRangoTermico`,
- **entonces** las zonas fuera del umbral seleccionado se muestran en escala de grises permitiendo destacar visualmente las áreas más calientes o anómalas.

### CA-009.3 — Detección autónoma sin intervención manual *(Pendiente)*

- **Dado que** se carga una imagen térmica,
- **cuando** el sistema la analiza automáticamente,
- **entonces** deberá detectar y marcar zonas anómalas sin requerir que el usuario dibuje regiones manualmente *(funcionalidad pendiente para futura iteración)*.
