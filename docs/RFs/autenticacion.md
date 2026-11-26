# Requisitos Funcionales - Autenticación y Acceso

## RF001 - Inicio de sesión y control por rol
- **ID:** RF001
- **Nombre:** Inicio de sesión y control por rol
- **Estado actual:** Implementado
- **Descripción funcional:** El sistema permite a los usuarios autenticarse mediante correo electrónico, contraseña y selección de rol (`Técnico` o `Administrador`). Si el rol elegido es `Administrador`, solicita adicionalmente una clave de administración.
- **Detalle técnico:** Implementado en `LoginPage.tsx`, `ClaveAdminModal.tsx`, `AuthContext.tsx` y `POST /api/v1/auth/login` (`be/api/v1/endpoints/auth.py`). Valida credenciales contra el hash `bcrypt` en la tabla `usuario`, verifica coincidencia con el rol en `rol` y valida la clave maestra contra `clave_admin`. La sesión se almacena en `sessionStorage` (`themalcheck_usuario`). *(Nota: actualmente el login retorna los datos de usuario sin emitir token JWT para autorización de endpoints).*
- **Entradas:** Correo electrónico, contraseña, rol (`tecnico` | `admin`) y clave de administración (solo rol `admin`).
- **Salidas:** Datos del usuario autenticado, modal de confirmación y redirección a `/dashboard`; o mensaje de error específico (credenciales inválidas, rol incorrecto o clave de administración inválida).
- **Prioridad:** Alta
- **Criterios de aceptación:** Un usuario con correo, contraseña y rol válidos (más clave admin si corresponde) accede a `/dashboard`; ante credenciales, rol o clave erróneas, el sistema muestra un mensaje claro de error.

---

## RF002 - Recuperación y restablecimiento de contraseña
- **ID:** RF002
- **Nombre:** Recuperación y restablecimiento de contraseña
- **Estado actual:** Implementado (con observación técnica)
- **Descripción funcional:** El sistema permite solicitar la recuperación de acceso mediante el correo registrado y definir una nueva contraseña desde el enlace enviado por correo electrónico.
- **Detalle técnico:** Implementado en `RecuperarPage.tsx`, `RestablecerPage.tsx`, `POST /api/v1/recuperacion/recuperar` y `PUT /api/v1/recuperacion/restablecer` (`be/api/v1/endpoints/recuperacion.py`, `be/src/core/recuperacion.py`). Verifica que el correo exista en MySQL y envía un correo HTML vía SMTP (`smtplib`) con el enlace `{FRONTEND_URL}/restablecer-contrasena?correo={destinatario}`. *(Observación: aunque `security.py` y `config.py` definen utilidades para tokens JWT de recuperación con expiración, el flujo activo actualmente opera con el correo en query param sin validación ni expiración de token).*
- **Entradas:** Correo electrónico registrado; nueva contraseña y confirmación.
- **Salidas:** Envío de correo de recuperación y confirmación de actualización de contraseña con hash `bcrypt`.
- **Prioridad:** Alta
- **Criterios de aceptación:** Un correo registrado recibe el enlace de recuperación y permite actualizar la contraseña; si el correo no existe, la API responde HTTP 404.

---

## RF015 - Cierre de sesión seguro
- **ID:** RF015
- **Nombre:** Cierre de sesión seguro
- **Estado actual:** Implementado
- **Descripción funcional:** El sistema permite cerrar la sesión activa desde cualquier vista autenticada y limpiar los datos de sesión almacenados en el navegador.
- **Detalle técnico:** Implementado en `NavLateral.tsx` y `logout()` de `AuthContext.tsx`. Limpia el estado del usuario, remueve la clave `themalcheck_usuario` de `sessionStorage`, reinicia el estado en `GaleriaContext` y redirige a `/`. Las rutas `/dashboard`, `/visor`, `/reportes` y `/admin` están protegidas por `ProtectedRoute.tsx`.
- **Entradas:** Clic en el botón de cierre de sesión en la barra lateral.
- **Salidas:** Redirección a la página de inicio (`/`) y bloqueo de acceso posterior a rutas protegidas sin nueva autenticación.
- **Prioridad:** Alta
- **Criterios de aceptación:** Tras cerrar sesión, el usuario no puede acceder a vistas protegidas sin volver a iniciar sesión.

---

## RF016 - Registro de cuentas de usuario
- **ID:** RF016
- **Nombre:** Registro de cuentas de usuario
- **Estado actual:** Implementado (incorporado respecto al diseño inicial)
- **Descripción funcional:** El sistema permite registrar nuevos usuarios indicando rol (`Técnico` o `Administrador`), nombre, apellido, correo electrónico y contraseña con confirmación.
- **Detalle técnico:** Implementado en `RegisterPage.tsx` (`/registro`) y `POST /api/v1/auth/register` (`be/api/v1/endpoints/auth.py`). Valida unicidad de correo electrónico (HTTP 400 si ya existe), asigna el rol correspondiente desde la tabla `rol` y almacena la contraseña cifrada con `bcrypt`.
- **Entradas:** Rol, nombre, apellido, correo electrónico, contraseña y confirmación.
- **Salidas:** Creación de usuario en MySQL (HTTP 201), modal de confirmación y redirección a `/login`.
- **Prioridad:** Alta
- **Criterios de aceptación:** El usuario puede crear una cuenta nueva con correo único y confirmación de contraseña coincidente, quedando habilitado para iniciar sesión.
