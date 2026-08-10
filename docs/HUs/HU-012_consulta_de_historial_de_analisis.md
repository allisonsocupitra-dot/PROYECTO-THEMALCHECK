# HU-012 — Consulta de historial de análisis

<!--
  ¿Qué? Historia de usuario que describe la consulta de análisis realizados anteriormente por el usuario.
  ¿Para qué? Permitir la revisión de resultados previos y la comparación de tendencias a lo largo del tiempo.
  ¿Impacto? Extiende el valor de HU-011 al convertir reportes puntuales en un registro histórico consultable.
-->

---

## Identificación

| Campo            | Valor                                  |
| ---------------- | ------------------------------------------|
| **ID**           | HU-012                                    |
| **Título**       | Consulta de historial de análisis         |
| **Módulo**       | Reportes                                  |
| **Prioridad**    | Por definir                               |
| **Estado**       | Por definir                               |
| **RF asociados** | Por definir                               |

---

## Historia

**Como** usuario,
**quiero** consultar los análisis realizados anteriormente,
**para** revisar resultados previos y comparar tendencias.

---

## Criterios de aceptación

### CA-012.1 — Almacenamiento del historial por usuario

- **Dado que** realizo análisis en el sistema,
- **cuando** estos finalizan,
- **entonces** deben almacenarse en un historial asociado a mi usuario.

### CA-012.2 — Visualización de fecha, estado y resultado

- **Dado que** accedo a mi historial de análisis,
- **cuando** reviso un registro,
- **entonces** debo ver la fecha, el estado y el resultado de dicho análisis.

### CA-012.3 — Identificación rápida de evaluaciones anteriores

- **Dado que** consulto mi historial,
- **cuando** busco una evaluación previa,
- **entonces** debo poder identificarla de forma rápida dentro de la lista.
