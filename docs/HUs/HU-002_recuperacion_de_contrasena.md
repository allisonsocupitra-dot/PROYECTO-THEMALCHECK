# HU-002 — Recuperación de acceso

<!--
  ¿Qué? Historia de usuario que describe el proceso de recuperación de acceso.
  ¿Para qué? Permitir que un usuario recupere el acceso al sistema cuando lo pierde.
  ¿Impacto? Evita que una pérdida de acceso se convierta en una interrupción permanente.
-->

---

## Identificación

| Campo            | Valor                     |
| ---------------- | ------------------------- |
| **ID**           | HU-002                    |
| **Título**       | Recuperación de acceso    |
| **Módulo**       | Gestión del sistema       |
| **Prioridad**    | Por definir               |
| **Estado**       | Por definir               |
| **RF asociados** | Por definir               |

---

## Historia

**Como** usuario,
**quiero** recuperar el acceso al sistema,
**para** continuar utilizando sus funcionalidades.

---

## Criterios de aceptación

### CA-002.1 — Solicitud de recuperación

- **Dado que** no puedo acceder al sistema,
- **cuando** solicito la recuperación,
- **entonces** el sistema debe iniciar el proceso de recuperación.

### CA-002.2 — Vigencia del proceso

- **Dado que** inicié el proceso de recuperación,
- **cuando** intento utilizarlo,
- **entonces** debe permitirme completar la recuperación únicamente dentro de un plazo máximo de 5 minutos desde su inicio.

### CA-002.3 — Recuperación inmediata del acceso

- **Dado que** completé el proceso de recuperación,
- **cuando** finalizo el proceso,
- **entonces** debo poder continuar utilizando el sistema.
