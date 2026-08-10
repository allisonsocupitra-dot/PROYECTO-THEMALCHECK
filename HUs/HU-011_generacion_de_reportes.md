# HU-011 — Generación de reportes

<!--
  ¿Qué? Historia de usuario que describe la generación de un reporte con los resultados de un análisis térmico.
  ¿Para qué? Conservar un registro formal y consultable de la evaluación realizada.
  ¿Impacto? Es el punto de entrada del módulo de Reportes — depende de que exista un análisis finalizado (módulo Análisis y Alertas).
-->

---

## Identificación

| Campo            | Valor                     |
| ---------------- | -----------------------------|
| **ID**           | HU-011                       |
| **Título**       | Generación de reportes       |
| **Módulo**       | Reportes                     |
| **Prioridad**    | Por definir                  |
| **Estado**       | Por definir                  |
| **RF asociados** | Por definir                  |

---

## Historia

**Como** usuario,
**quiero** generar un reporte con los resultados del análisis térmico,
**para** conservar un registro de la evaluación realizada.

---

## Criterios de aceptación

### CA-011.1 — Generación del reporte

- **Dado que** finalicé un análisis térmico,
- **cuando** solicito generar un reporte,
- **entonces** el sistema debe generar un reporte con los resultados obtenidos.

### CA-011.2 — Descarga en formato PDF

- **Dado que** se generó el reporte,
- **cuando** lo descargo,
- **entonces** debe entregarse en formato PDF.

### CA-011.3 — Contenido relevante del reporte

- **Dado que** descargué el reporte,
- **cuando** reviso su contenido,
- **entonces** debe incluir la información relevante del análisis realizado.
