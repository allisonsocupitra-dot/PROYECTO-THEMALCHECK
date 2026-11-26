# HU-010 — Generación de alertas térmicas

<!--
  ¿Qué? Historia de usuario que describe la generación de alertas ante patrones térmicos peligrosos.
  ¿Para qué? Permitir al usuario identificar niveles de riesgo térmico y tomar acciones preventivas oportunas.
  ¿Impacto? Funcionalidad planificada pendiente de implementación; actualmente solo existen avisos operativos de UI.
-->

---

## Identificación

| Campo            | Valor                            |
| ---------------- | -------------------------------- |
| **ID**           | HU-010                           |
| **Título**       | Generación de alertas térmicas   |
| **Módulo**       | Análisis y Alertas               |
| **Prioridad**    | Alta                             |
| **Estado**       | Pendiente (No implementado)      |
| **RF asociados** | RF007                            |

---

## Historia

**Como** usuario,
**quiero** recibir alertas visuales clasificadas por severidad cuando se detecten temperaturas o diferenciales térmicos peligrosos,
**para** tomar acciones preventivas oportunas y registrar el nivel de riesgo real en el informe.

---

## Criterios de aceptación

> **Estado actual en el proyecto instalado:** No existe aún un módulo de alertas de riesgo térmico ni clasificación automática de severidad; al exportar un informe PDF desde `VisorPage.tsx`, los campos `nivel_riesgo` y `estado` envían actualmente el valor provisional `'TODO'`. El visor sí cuenta con avisos operativos de guardado, exportación y bloqueo al salir con cambios pendientes.

### CA-010.1 — Alerta ante anomalía crítica *(Pendiente)*

- **Dado que** el análisis detecta temperaturas o un `ΔTemp` superior al umbral crítico configurado,
- **cuando** finaliza la evaluación de la imagen o medición,
- **entonces** deberá mostrarse una alerta visual indicando el nivel de severidad (`Bajo`, `Medio`, `Crítico`).

### CA-010.2 — Registro del nivel de riesgo y estado en el informe *(Pendiente)*

- **Dado que** se evaluó el nivel de riesgo de la imagen en el visor,
- **cuando** genero el reporte PDF,
- **entonces** los campos `nivel_riesgo` y `estado` deberán persistirse en la tabla `informe` con el valor real en lugar del marcador provisional `'TODO'`.

### CA-010.3 — Visibilidad de la alerta antes de cerrar el visor *(Pendiente)*

- **Dado que** se generó una alerta térmica en la imagen activa,
- **cuando** el usuario trabaja en `/visor`,
- **entonces** la alerta deberá ser visible y comprensible antes de salir o exportar el análisis.
