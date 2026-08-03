# Restricciones del Proyecto - ThemalCheck

## Restricciones generales
- El sistema debe desarrollarse como una plataforma web accesible desde navegadores modernos.
- El alcance inicial se enfoca en análisis de imágenes térmicas de estructuras eléctricas.
- El proyecto está orientado a un entorno académico y de demostración, por lo que debe priorizar viabilidad y claridad funcional.

## Restricciones técnicas
- El sistema requiere conexión a internet para acceso y uso de servicios web.
- Se debe soportar un mínimo de 4 GB de RAM y resolución de pantalla de 1280x720 o superior.
- Los formatos de imagen admitidos inicialmente son JPEG, PNG y TIFF.
- La comunicación cliente-servidor debe realizarse mediante HTTPS.
- Las alertas críticas pueden integrarse con correo electrónico mediante SMTP.

## Restricciones de rendimiento
- El tiempo de carga inicial del sistema debe mantenerse por debajo de 3 segundos en condiciones normales.
- El análisis debe ejecutarse sin intervención manual y debe responder en un tiempo razonable para la experiencia del usuario.

## Restricciones de seguridad
- El acceso debe estar protegido mediante autenticación y autorización por roles.
- Los datos de sesión deben manejarse de forma segura y suscribirse a políticas de privacidad y protección de información.

## Restricciones de negocio y organización
- El proyecto depende de la disponibilidad del equipo de desarrollo y de los recursos definidos para la ficha de formación.
- El alcance de funcionalidades puede ajustarse según prioridades, tiempos de entrega y disponibilidad de infraestructura.

## Dependencias previstas
- Navegadores modernos: Chrome, Firefox y Edge.
- Framework web para backend, como Node.js o Python/Django.
- Librerías de procesamiento de imágenes, como OpenCV o equivalentes.
- Servicio de correo para recuperación de contraseñas y alertas.
- Almacenamiento persistente para imágenes, reportes y registros históricos.
