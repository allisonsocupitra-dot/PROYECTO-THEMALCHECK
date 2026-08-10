# HU-010 — Generación de alertas

<!--
  ¿Qué? Historia de usuario que describe la generación de alertas visuales ante patrones térmicos peligrosos.
  ¿Para qué? Permitir que el usuario tome acciones preventivas oportunas ante riesgos detectados.
  ¿Impacto? Es el cierre del flujo de análisis — traduce una detección técnica (HU-009) en una acción comprensible y accionable para el usuario.
-->

---

## Identificación

| Campo            | Valor                  |
| ---------------- | ------------------------ |
| **ID**           | HU-010                   |
| **Título**       | Generación de alertas    |
| **Módulo**       | Análisis y Alertas       |
| **Prioridad**    | Por definir               |
| **Estado**       | Por definir               |
| **RF asociados** | Por definir               |

---

## Historia

**Como** usuario,
**quiero** recibir alertas visuales cuando se detecten patrones térmicos peligrosos,
**para** tomar acciones preventivas oportunas.

---

## Criterios de aceptación

### CA-010.1 — Alerta ante anomalía crítica

- **Dado que** el sistema detecta un patrón térmico crítico,
- **cuando** finaliza el análisis de la imagen,
- **entonces** debe mostrarse una alerta visual indicando la anomalía detectada.

### CA-010.2 — Alerta previa al cierre del análisis

- **Dado que** se generó una alerta por una anomalía crítica,
- **cuando** el análisis aún está en curso,
- **entonces** la alerta debe presentarse antes de que el proceso de análisis se cierre.

### CA-010.3 — Visibilidad y comprensibilidad de la notificación

- **Dado que** recibo una alerta generada por el sistema,
- **cuando** esta se muestra en pantalla,
- **entonces** debe ser visible y fácil de comprender para el usuario.
