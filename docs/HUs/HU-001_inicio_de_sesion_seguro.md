# HU-001 — Inicio de sesión seguro

<!--
  ¿Qué? Historia de usuario que describe la autenticación por correo, contraseña, rol y clave de administración.
  ¿Para qué? Permitir el acceso seguro al sistema diferenciando entre Técnico y Administrador.
  ¿Impacto? Es la puerta de entrada operativa a ThermalCheck y habilita el acceso a rutas protegidas según el rol.
-->

---

## Identificación

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **ID**           | HU-001                             |
| **Título**       | Inicio de sesión seguro            |
| **Módulo**       | Autenticación y Acceso             |
| **Prioridad**    | Alta                               |
| **Estado**       | Implementado                       |
| **RF asociados** | RF001, RF014                       |

---

## Historia

**Como** usuario registrado (Técnico o Administrador),
**quiero** iniciar sesión con mi correo, contraseña y rol correspondiente,
**para** acceder de forma segura a las funcionalidades habilitadas para mi perfil en ThermalCheck.

---

## Criterios de aceptación

### CA-001.1 — Acceso de Técnico con credenciales válidas

- **Dado que** soy un usuario registrado con rol `Técnico`,
- **cuando** ingreso mi correo electrónico y contraseña válidos en `/login` y selecciono el rol Técnico,
- **entonces** el sistema valida mis credenciales contra el backend (`POST /api/v1/auth/login`), muestra la confirmación de acceso y me redirige al explorador (`/dashboard`).

### CA-001.2 — Validación adicional para Administrador

- **Dado que** selecciono el rol `Administrador` al iniciar sesión,
- **cuando** envío el formulario,
- **entonces** el sistema abre un modal (`ClaveAdminModal`) solicitando la clave de administración y solo permite el acceso si coincide con el hash registrado en `clave_admin`.

### CA-001.3 — Rechazo de credenciales, rol o clave incorrecta

- **Dado que** intento iniciar sesión en `/login`,
- **cuando** ingreso correo o contraseña erróneos, selecciono un rol distinto al registrado en mi cuenta o ingreso una clave de administración incorrecta,
- **entonces** el sistema rechaza el acceso y muestra un mensaje de error claro indicando el motivo (credenciales incorrectas, rol real de la cuenta o clave de administración inválida).

### CA-001.4 — Persistencia de sesión y protección de rutas

- **Dado que** inicié sesión correctamente,
- **cuando** navego hacia `/dashboard`, `/visor`, `/reportes` o `/admin`,
- **entonces** el sistema conserva mi sesión activa en `sessionStorage` (`themalcheck_usuario`) y `ProtectedRoute` redirige a `/login` si no hay sesión o a `/dashboard` si un usuario `Técnico` intenta acceder a `/admin`.
