# Requisitos Funcionales - Autenticación

## RF001 - Inicio de sesión
- ID: RF001
- Nombre: Inicio de sesión
- Descripción funcional: El sistema debe permitir a los usuarios autenticarse con usuario y contraseña de forma segura.
- Detalle técnico: El módulo debe validar credenciales, gestionar sesiones activas y restringir el acceso a áreas protegidas hasta la autenticación exitosa.
- Entradas: correo electrónico o nombre de usuario, contraseña.
- Salidas: acceso autorizado o mensaje de error por credenciales inválidas.
- Prioridad: Alta
- Criterios de aceptación: Un usuario con credenciales válidas ingresa al sistema y un usuario con credenciales inválidas recibe un mensaje claro de error.

## RF002 - Recuperación de contraseña
- ID: RF002
- Nombre: Recuperación de contraseña
- Descripción funcional: El sistema debe permitir recuperar el acceso a la cuenta mediante un enlace de restablecimiento enviado al correo registrado.
- Detalle técnico: El flujo debe generar un token temporal, enviarlo por correo electrónico y validar su vigencia antes de permitir la actualización de la contraseña.
- Entradas: correo registrado del usuario.
- Salidas: enlace de recuperación y confirmación de cambio de contraseña.
- Prioridad: Alta
- Criterios de aceptación: El usuario recibe el correo de recuperación y puede restablecer la contraseña en menos de 5 minutos.

## RF015 - Cierre de sesión seguro
- ID: RF015
- Nombre: Cierre de sesión seguro
- Descripción funcional: El sistema debe permitir cerrar la sesión activa y eliminar los datos asociados a ella.
- Detalle técnico: El módulo debe invalidar la sesión actual, eliminar tokens o cookies de autenticación y redirigir al usuario a la vista de acceso.
- Entradas: acción de cierre de sesión del usuario.
- Salidas: redirección a la pantalla de inicio de sesión y cierre efectivo de la sesión.
- Prioridad: Alta
- Criterios de aceptación: Tras cerrar sesión, el usuario no puede volver a acceder sin autenticarse nuevamente.
