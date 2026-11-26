# Requisitos No Funcionales - Seguridad y Acceso

## RNF001 - Seguridad y control de acceso por roles
- **ID:** RNF001
- **Descripción:** El sistema debe proteger credenciales y restringir el acceso a las vistas según el rol del usuario (`Técnico` o `Administrador`), previendo comunicación cifrada mediante HTTPS en entornos productivos.
- **Estado actual:** Parcialmente implementado
- **Priorización:** Alta
- **Detalle técnico:**
  - Contraseñas de usuarios y clave de administración cifradas con `bcrypt` (`passlib`).
  - Control de acceso por rol en el login y protección de rutas en frontend mediante `ProtectedRoute.tsx` (ej. `/admin` exclusivo para rol `admin`, con validación adicional de `ClaveAdminModal`).
  - *Brechas actuales identificadas:* La sesión se guarda en `sessionStorage` sin validar tokens JWT en los endpoints privados del backend, CORS tiene `allow_origins=["*"]` para desarrollo local y el enlace de recuperación no valida token firmado con expiración.
- **Criterio de cumplimiento:** Las contraseñas se almacenan con hash seguro y las rutas de frontend validan autenticación y rol; para despliegue en producción debe habilitarse HTTPS, restringir CORS y validar JWT en las rutas de la API.

---

## RNF007 - Usabilidad e internacionalización
- **ID:** RNF007
- **Descripción:** La interfaz debe ser intuitiva, clara y utilizable por técnicos sin capacitación extensa, integrando convenciones estándar de software termográfico (como DJI Thermal).
- **Estado actual:** Implementado
- **Priorización:** Alta
- **Detalle técnico:**
  - Flujo guiado en tres vistas principales: Explorador (`/dashboard`), Visor (`/visor`) y Reportes (`/reportes`), más `/admin` para administradores.
  - Etiquetado familiar (`SP#`, `R#`, `C#`, marcadores azul/rojo para mín/máx, `ΔTemp`, 10 paletas estándar DJI, barra de escala interactiva) y soporte bilingüe Español/Inglés (`LanguageContext`).
  - Prevención de pérdida de trabajo mediante autoguardado al dibujar marcas y modal de advertencia de cambios sin guardar al salir del visor (`useBlocker` + `beforeunload`).
- **Criterio de cumplimiento:** Un usuario técnico puede cargar imágenes, realizar mediciones, cambiar paletas y exportar reportes en PDF/DOCX/PNG desde su primer acceso.
