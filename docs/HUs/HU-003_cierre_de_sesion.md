# HU-003 — Cierre de sesión

<!--
  ¿Qué? Historia de usuario que describe el cierre seguro de la sesión activa del usuario.
  ¿Para qué? Evitar que la sesión permanezca abierta en el navegador tras finalizar el trabajo.
  ¿Impacto? Protege la cuenta del usuario y limpia el estado de galería y sesión en el cliente.
-->

---

## Identificación

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **ID**           | HU-003                             |
| **Título**       | Cierre de sesión                   |
| **Módulo**       | Autenticación y Acceso             |
| **Prioridad**    | Alta                               |
| **Estado**       | Implementado                       |
| **RF asociados** | RF015                              |

---

## Historia

**Como** usuario autenticado,
**quiero** cerrar mi sesión desde la barra de navegación lateral,
**para** finalizar mi jornada de trabajo de manera segura y proteger el acceso a mis imágenes e informes.

---

## Criterios de aceptación

### CA-003.1 — Ejecución del cierre de sesión

- **Dado que** tengo una sesión iniciada en `/dashboard`, `/visor`, `/reportes` o `/admin`,
- **cuando** hago clic en el botón de salida en la barra lateral (`NavLateral`),
- **entonces** el sistema ejecuta `logout()`, limpia el usuario en `AuthContext` y redirige a la página de inicio (`/`).

### CA-003.2 — Eliminación de datos de sesión en el navegador

- **Dado que** cerré sesión,
- **cuando** el sistema procesa el cierre,
- **entonces** elimina la entrada `themalcheck_usuario` de `sessionStorage` y reinicia el estado en memoria de carpetas, imágenes seleccionadas y reportes de sesión en `GaleriaContext`.

### CA-003.3 — Bloqueo de rutas protegidas tras cerrar sesión

- **Dado que** mi sesión fue cerrada,
- **cuando** intento navegar directamente a `/dashboard`, `/visor`, `/reportes` o `/admin`,
- **entonces** `ProtectedRoute` bloquea el acceso y me redirige a `/login`.
