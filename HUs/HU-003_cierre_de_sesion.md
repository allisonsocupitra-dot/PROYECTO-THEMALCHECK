# HU-003 — Cierre del proceso

<!--
  ¿Qué? Historia de usuario que describe el cierre seguro del proceso activo.
  ¿Para qué? Evitar que el estado de trabajo permanezca activo innecesariamente.
  ¿Impacto? Permite finalizar correctamente el proceso en curso.
-->

---

## Identificación

| Campo            | Valor                 |
| ---------------- | --------------------- |
| **ID**           | HU-003                |
| **Título**       | Cierre del proceso    |
| **Módulo**       | Gestión del sistema   |
| **Prioridad**    | Por definir           |
| **Estado**       | Por definir           |
| **RF asociados** | Por definir           |

---

## Historia

**Como** usuario,
**quiero** finalizar el proceso activo,
**para** evitar que permanezca abierto innecesariamente.

---

## Criterios de aceptación

### CA-003.1 — Finalización del proceso activo

- **Dado que** tengo un proceso activo,
- **cuando** ejecuto la acción de finalizar,
- **entonces** el sistema debe finalizar dicho proceso.

### CA-003.2 — Confirmación de finalización

- **Dado que** solicito finalizar el proceso,
- **cuando** se completa la acción,
- **entonces** el sistema debe confirmar que el proceso ha finalizado.

### CA-003.3 — No persistencia del proceso finalizado

- **Dado que** finalicé el proceso,
- **cuando** el sistema procesa el cierre,
- **entonces** no debe conservarse el estado activo del proceso finalizado.
