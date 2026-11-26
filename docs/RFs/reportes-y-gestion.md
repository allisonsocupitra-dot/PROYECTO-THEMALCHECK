# Requisitos Funcionales - Reportes, Exportación y Gestión

## RF008 - Generación de reportes PDF
- **ID:** RF008
- **Nombre:** Generación de reportes PDF
- **Estado actual:** Implementado
- **Descripción funcional:** El sistema genera un reporte formal en formato PDF con los resultados del análisis térmico de la imagen activa, lo almacena en el servidor y registra el informe en la base de datos.
- **Detalle técnico:** Implementado en `VisorPage.tsx` (`handleExportarReporte('PDF')`), `POST /api/v1/informes/exportar` (`be/api/v1/endpoints/informe.py`) y `be/src/services/pdf_export.py` (ReportLab). Incluye: logotipo y nombre de archivo, imagen térmica anotada con paleta/rango y marcas SVG renderizadas en canvas, barra de escala con temperaturas min/max, fecha, tabla `Measurements` (`SP#`, `R#`, `C#`), `Parameters` (Distance, Humidity, Emissivity, Reflected Temp), `Image Info` (Model, Serial Number, Focal Length, F-Number, Width, Height, Modified, Coordinates) y `Remarks`. Guarda el archivo en `be/uploads/informes_pdf/` y crea el registro en la tabla `informe`.
- **Entradas:** Imagen compuesta en base64, escala térmica, mediciones, parámetros, metadatos, observaciones e `id_usuario`.
- **Salidas:** Descarga del archivo `.pdf`, almacenamiento en disco del servidor y registro en MySQL.
- **Prioridad:** Alta
- **Criterios de aceptación:** El reporte PDF se genera con el formato técnico establecido, se descarga correctamente en el navegador y queda registrado en el servidor.

---

## RF009 - Consulta de historial de análisis y reportes
- **ID:** RF009
- **Nombre:** Consulta de historial de análisis y reportes
- **Estado actual:** Parcialmente implementado
- **Descripción funcional:** Permite consultar los análisis e informes generados por los usuarios según su rol.
- **Detalle técnico:** Actualmente opera de dos maneras:
  1. **Historial persistido de imágenes/análisis por usuario:** Al iniciar sesión, `GaleriaContext` consulta `GET /api/v1/imagenes/usuario/{id_usuario}` y restaura las carpetas, imágenes, mediciones (`punto_medicion`) y observaciones guardadas en BD.
  2. **Vista "Mis reportes" (`/reportes`, `ReportesPage.tsx`):** Lista los reportes exportados (PDF y DOC) generados **durante la sesión actual** en memoria (`GaleriaContext`), mostrando imagen, carpeta, formato y fecha. *(Pendiente: consultar desde BD los informes históricos del propio técnico al recargar).*
  3. **Panel de Administración (`/admin`, `AdminPage.tsx`):** Permite al Administrador consultar desde BD todos los informes PDF persistidos por cada técnico (`GET /api/v1/informes/tecnicos/{id_usuario}/informes`) con fecha, estado y botón de descarga directa.
- **Entradas:** Usuario autenticado (técnico en sesión o administrador seleccionando un técnico).
- **Salidas:** Lista de reportes de sesión en `/reportes` o historial persistido de informes PDF por técnico en `/admin`.
- **Prioridad:** Media
- **Criterios de aceptación:** El administrador puede consultar y descargar el historial persistido de informes PDF de cualquier técnico; el técnico conserva sus imágenes y mediciones en BD y visualiza en `/reportes` los reportes exportados en su sesión activa.

---

## RF010 - Gestión de usuarios y consulta de técnicos
- **ID:** RF010
- **Nombre:** Gestión de usuarios y consulta de técnicos
- **Estado actual:** Parcialmente implementado
- **Descripción funcional:** Diferenciar cuentas por rol (`Técnico` y `Administrador`) y permitir al Administrador consultar y filtrar la lista de técnicos registrados.
- **Detalle técnico:** El sistema cuenta con registro de usuarios con selección de rol (`POST /api/v1/auth/register`), validación de rol en login y clave de administración para administradores. En `/admin` (`AdminPage.tsx` + `GET /api/v1/informes/tecnicos`), el Administrador puede listar y buscar técnicos por nombre o correo y ver el conteo total de informes de cada uno. *(Pendiente: CRUD desde el panel admin para editar datos, cambiar roles o eliminar cuentas de usuario).*
- **Entradas:** Datos de registro o texto de búsqueda en el panel de administración.
- **Salidas:** Cuentas creadas con rol asignado y listado filtrado de técnicos con su cantidad de informes.
- **Prioridad:** Alta
- **Criterios de aceptación:** Solo los usuarios con rol `Administrador` acceden a `/admin` para buscar técnicos y revisar sus informes; la edición y eliminación directa de usuarios desde UI queda pendiente.

---

## RF011 - Exportación de resultados (PDF, Word y PNG)
- **ID:** RF011
- **Nombre:** Exportación de resultados (PDF, Word y PNG)
- **Estado actual:** Implementado (con formatos PDF, DOCX y PNG)
- **Descripción funcional:** El sistema permite exportar los resultados del análisis térmico desde el visor en tres formatos descargables: documento PDF, documento Word (`.docx`) e imagen PNG anotada.
- **Detalle técnico:** Implementado en `VisorPage.tsx` (menú desplegable **Exportar**):
  - **PDF:** `POST /api/v1/informes/exportar` (genera, guarda en servidor y registra en BD).
  - **DOC (`.docx`):** `POST /api/v1/informes/exportar-doc` (`be/src/services/docx_export.py` con `python-docx`; mismo diseño y tablas que el PDF, sin crear registro en BD).
  - **Imagen (`.png`):** Composición en `Canvas` en el navegador (`marcada-<nombre>.png`) que fija la paleta, rango térmico y anotaciones dibujadas.
  *(Nota: el formato Excel previsto originalmente no fue implementado; se priorizaron `.docx` y `.png`).*
- **Entradas:** Selección del formato de exportación (`PDF`, `DOC` o `Imagen`) en el visor.
- **Salidas:** Descarga directa o mediante diálogo "Guardar como" (`showSaveFilePicker`) del archivo generado.
- **Prioridad:** Media
- **Criterios de aceptación:** Los archivos `.pdf`, `.docx` y `.png` se generan y descargan sin errores conservando la imagen anotada y los datos del análisis.

---

## RF014 - Panel de control / Explorador de archivos termográficos
- **ID:** RF014
- **Nombre:** Panel de control / Explorador de archivos termográficos
- **Estado actual:** Implementado (adaptado como Explorador de Imágenes y Carpetas)
- **Descripción funcional:** Presentar la vista principal tras iniciar sesión (`/dashboard`) para organizar carpetas termográficas, subir imágenes, inspeccionar rápidamente sus metadatos y abrirlas en el visor.
- **Detalle técnico:** Implementado en `DashboardPage.tsx`. Aunque originalmente se planteó como un dashboard de estadísticas globales y alertas activas, en la versión instalada funciona como un **Explorador termográfico** con árbol jerárquico de carpetas ("Mis carpetas"), breadcrumb de ruta, cuadrícula de miniaturas con selección múltiple y borrado, y panel derecho con vista previa y tablas de Parámetros e Información de la imagen.
- **Entradas:** Interacción del usuario con carpetas, carga de archivos/carpetas y selección de miniaturas.
- **Salidas:** Navegación organizada de proyectos/carpetas e inspección rápida previa al visor.
- **Prioridad:** Alta
- **Criterios de aceptación:** Al iniciar sesión, el usuario accede al explorador `/dashboard`, visualiza sus carpetas e imágenes restauradas y puede cargar, inspeccionar o abrir imágenes en `/visor`.

---

## RF018 - Configuración de idioma de la interfaz
- **ID:** RF018
- **Nombre:** Configuración de idioma de la interfaz
- **Estado actual:** Implementado (incorporado en la versión actual)
- **Descripción funcional:** El sistema permite alternar el idioma de la interfaz entre Español e Inglés desde el modal de ajustes en la barra lateral de navegación.
- **Detalle técnico:** Implementado en `ModalAjustes.tsx`, `LanguageContext.tsx` (persiste la selección en `sessionStorage` bajo `themalcheck_idioma`) y `fe/src/i18n/translations.ts`.
- **Entradas:** Selección de idioma (`Español` / `English`).
- **Salidas:** Actualización inmediata de los textos traducidos de la aplicación.
- **Prioridad:** Baja
- **Criterios de aceptación:** El usuario puede cambiar el idioma entre Español e Inglés desde Ajustes y la interfaz refleja el cambio inmediatamente.
