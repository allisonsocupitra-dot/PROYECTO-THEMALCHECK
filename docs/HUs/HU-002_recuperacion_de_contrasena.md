# HU-002 — Recuperación de contraseña

<!--
  ¿Qué? Historia de usuario que describe la solicitud y restablecimiento de contraseña vía correo electrónico.
  ¿Para qué? Permitir que un usuario registrado recupere el acceso a su cuenta si olvida su contraseña.
  ¿Impacto? Evita bloqueos permanentes de acceso sin intervención manual de soporte.
-->

---

## Identificación

| Campo            | Valor                                         |
| ---------------- | --------------------------------------------- |
| **ID**           | HU-002                                        |
| **Título**       | Recuperación de contraseña                    |
| **Módulo**       | Autenticación y Acceso                        |
| **Prioridad**    | Alta                                          |
| **Estado**       | Implementado (con observación técnica)        |
| **RF asociados** | RF002                                         |

---

## Historia

**Como** usuario registrado,
**quiero** solicitar un enlace de recuperación de contraseña a mi correo electrónico,
**para** establecer una nueva contraseña y recuperar el acceso a ThermalCheck.

---

## Criterios de aceptación

### CA-002.1 — Validación de correo registrado y envío por SMTP

- **Dado que** olvidé mi contraseña y accedo a `/recuperar`,
- **cuando** ingreso un correo electrónico existente en la base de datos y envío la solicitud (`POST /api/v1/recuperacion/recuperar`),
- **entonces** el sistema envía un correo vía SMTP con el enlace hacia `/restablecer-contrasena?correo=<correo>` y muestra una confirmación de envío.

### CA-002.2 — Manejo de correo no registrado o fallo de correo

- **Dado que** solicito la recuperación en `/recuperar`,
- **cuando** el correo ingresado no existe en la base de datos o falla el servidor SMTP,
- **entonces** el sistema responde con un mensaje de error claro (`El correo no está registrado en el sistema.` o error de envío) sin procesar el restablecimiento.

### CA-002.3 — Restablecimiento y actualización de contraseña

- **Dado que** accedo al enlace `/restablecer-contrasena?correo=<correo>`,
- **cuando** ingreso una nueva contraseña y su confirmación coincidente (`PUT /api/v1/recuperacion/restablecer`),
- **entonces** el sistema actualiza la contraseña cifrada con `bcrypt` en MySQL, muestra confirmación y me permite volver al inicio de sesión.

> **Observación del estado actual:** Aunque `security.py` y `config.py` incluyen utilidades para tokens JWT de recuperación con expiración (`TOKEN_EXPIRACION_MINUTOS = 30`), el flujo conectado actualmente en el backend y frontend usa el parámetro `?correo=` en la URL sin validar token ni límite de tiempo. Adicionalmente, `RecuperarPage.tsx` y `RestablecerPage.tsx` enlazan de regreso a `/auth`, mientras la ruta activa de inicio de sesión en `App.tsx` es `/login`.
