# Historias de Usuario - Autenticación

## HU-01: Inicio de sesión seguro
- Como usuario registrado, quiero iniciar sesión con mi correo y contraseña, para acceder al sistema de forma segura y personalizada.

### Criterios de aceptación
1. El sistema permite el acceso únicamente con credenciales válidas.
2. Si las credenciales son incorrectas, muestra un mensaje de error claro.
3. El usuario autenticado puede ingresar al panel principal del sistema.

## HU-02: Recuperación de contraseña
- Como usuario que olvidó su contraseña, quiero recibir un enlace de recuperación en mi correo registrado, para restablecer el acceso a mi cuenta.

### Criterios de aceptación
1. El sistema envía un enlace de recuperación al correo registrado.
2. El enlace permite restablecer la contraseña en un tiempo máximo de 5 minutos.
3. La nueva contraseña queda activa inmediatamente tras su actualización.

## HU-03: Cierre de sesión
- Como usuario autenticado, quiero cerrar sesión de manera segura, para proteger la información de mi sesión activa.

### Criterios de aceptación
1. El sistema finaliza la sesión activa al ejecutar el cierre de sesión.
2. El usuario debe autenticarse nuevamente para volver a ingresar.
3. No se conserva información de sesión después del cierre.
