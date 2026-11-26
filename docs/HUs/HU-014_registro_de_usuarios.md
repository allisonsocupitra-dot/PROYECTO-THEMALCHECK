# HU-014 — Registro de usuarios

<!--
  ¿Qué? Historia de usuario que describe el registro de nuevas cuentas con rol Técnico o Administrador.
  ¿Para qué? Permitir que nuevos usuarios creen su cuenta en la plataforma de forma autónoma.
  ¿Impacto? Habilita el alta de técnicos y administradores que luego operan en el explorador, visor y panel admin.
-->

---

## Identificación

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **ID**           | HU-014                             |
| **Título**       | Registro de usuarios               |
| **Módulo**       | Autenticación y Acceso             |
| **Prioridad**    | Alta                               |
| **Estado**       | Implementado                       |
| **RF asociados** | RF016, RF010                       |

---

## Historia

**Como** nuevo usuario (Técnico o Administrador),
**quiero** registrar una cuenta con mis datos personales, correo, contraseña y rol,
**para** poder iniciar sesión y utilizar ThermalCheck.

---

## Criterios de aceptación

### CA-014.1 — Registro con datos válidos y selección de rol

- **Dado que** accedo a `/registro`,
- **cuando** selecciono un rol (`Técnico` o `Administrador`), completo nombre, apellido, correo y contraseñas coincidentes,
- **entonces** el backend (`POST /api/v1/auth/register`) crea la cuenta en MySQL con contraseña cifrada (`bcrypt`), muestra el modal de confirmación y redirige a `/login`.

### CA-014.2 — Validación de contraseñas no coincidentes

- **Dado que** diligencio el formulario de registro,
- **cuando** la contraseña y su confirmación no coinciden,
- **entonces** el sistema detiene el envío en el cliente y muestra un mensaje de error claro.

### CA-014.3 — Prevención de correos duplicados

- **Dado que** intento registrar un correo que ya existe en la base de datos,
- **cuando** envío la solicitud al backend,
- **entonces** la API responde HTTP 400 (`El correo ya está registrado`) y la interfaz muestra el error correspondiente.
