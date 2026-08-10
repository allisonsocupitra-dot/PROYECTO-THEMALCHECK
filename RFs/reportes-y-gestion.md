# Requisitos Funcionales - Reportes y Gestión

## RF008 - Generación de reportes
- ID: RF008
- Nombre: Generación de reportes
- Descripción funcional: El sistema debe producir un reporte con los resultados del análisis térmico de cada sesión.
- Detalle técnico: Debe consolidar los datos del análisis en un documento estructurado y exportarlo en formato PDF.
- Entradas: resultados del análisis y metadata de sesión.
- Salidas: archivo PDF de reporte.
- Prioridad: Alta
- Criterios de aceptación: El reporte se genera correctamente y puede descargarse en formato PDF.

## RF009 - Historial de análisis
- ID: RF009
- Nombre: Historial de análisis
- Descripción funcional: El sistema debe almacenar un registro histórico de los análisis realizados por cada usuario.
- Detalle técnico: Debe registrar fecha, resultado, usuario y estado del análisis para consulta posterior.
- Entradas: análisis ejecutado.
- Salidas: historial consultable por usuario.
- Prioridad: Media
- Criterios de aceptación: El usuario puede consultar análisis anteriores con su fecha y resultado.

## RF010 - Gestión de usuarios
- ID: RF010
- Nombre: Gestión de usuarios
- Descripción funcional: El sistema debe permitir crear, editar y eliminar cuentas con roles diferenciados.
- Detalle técnico: Debe gestionar permisos por rol y aplicar los cambios de forma inmediata.
- Entradas: datos del usuario y rol asignado.
- Salidas: cuenta creada, actualizada o eliminada.
- Prioridad: Alta
- Criterios de aceptación: Los cambios de rol y datos de usuario se aplican de inmediato sin errores.

## RF011 - Exportación de datos
- ID: RF011
- Nombre: Exportación de datos
- Descripción funcional: El sistema debe permitir exportar los resultados del análisis en formatos PDF o Excel.
- Detalle técnico: Debe generar archivos compatibles y asegurar que el contenido exportado incluya todos los datos relevantes.
- Entradas: resultados del análisis.
- Salidas: archivo descargable en PDF o Excel.
- Prioridad: Media
- Criterios de aceptación: El archivo exportado se descarga correctamente con todos los datos del análisis.

## RF014 - Panel de control
- ID: RF014
- Nombre: Panel de control
- Descripción funcional: El sistema debe presentar un dashboard con resumen de análisis recientes, alertas activas y estadísticas de uso.
- Detalle técnico: Debe consolidar métricas del sistema y mostrarlas de forma actualizada en la interfaz.
- Entradas: datos de análisis, usuarios y alertas.
- Salidas: panel de control visual con métricas relevantes.
- Prioridad: Alta
- Criterios de aceptación: El panel carga correctamente y muestra información actualizada del sistema.
