# Documentación del Proyecto — ThermalCheck

Este directorio contiene la documentación funcional, no funcional, restricciones e historias de usuario actualizadas conforme al **estado real del proyecto instalado** (`fe/` en React + TypeScript + Vite, `be/` en Python + FastAPI + DJI Thermal SDK v1.4, y `bd/` en MySQL).

---

## Estructura de la documentación

- [Restricciones del Proyecto](./restricciones.md)
- **Requisitos Funcionales (`RFs/`)**
  - [Autenticación y Acceso](./RFs/autenticacion.md) (`RF001`, `RF002`, `RF015`, `RF016`)
  - [Gestión de Imágenes](./RFs/gestion-de-imagenes.md) (`RF003`, `RF005`, `RF012`, `RF013`)
  - [Análisis, Medición y Alertas](./RFs/analisis-y-alertas.md) (`RF004`, `RF006`, `RF007`, `RF017`)
  - [Reportes, Exportación y Gestión](./RFs/reportes-y-gestion.md) (`RF008`, `RF009`, `RF010`, `RF011`, `RF014`, `RF018`)
- **Requisitos No Funcionales (`RNFs/`)**
  - [Seguridad y Acceso](./RNFs/seguridad-y-acceso.md) (`RNF001`, `RNF007`)
  - [Rendimiento y Disponibilidad](./RNFs/rendimiento-y-disponibilidad.md) (`RNF002`, `RNF004`, `RNF005`, `RNF008`)
  - [Mantenibilidad y Compatibilidad](./RNFs/mantenibilidad-y-compatibilidad.md) (`RNF003`, `RNF006`)

---

## Resumen del estado de las Historias de Usuario (`HUs/`)

| ID | Título | Módulo | Prioridad | RF asociados | Estado actual | Archivo |
| --- | --- | --- | --- | --- | --- | --- |
| **HU-001** | Inicio de sesión seguro | Autenticación y Acceso | Alta | RF001, RF014 | Implementado | [HU-001](./HUs/HU-001_inicio_de_sesion_seguro.md) |
| **HU-002** | Recuperación de contraseña | Autenticación y Acceso | Alta | RF002 | Implementado (con observación técnica) | [HU-002](./HUs/HU-002_recuperacion_de_contrasena.md) |
| **HU-003** | Cierre de sesión | Autenticación y Acceso | Alta | RF015 | Implementado | [HU-003](./HUs/HU-003_cierre_de_sesion.md) |
| **HU-004** | Carga de imágenes y carpetas térmicas | Gestión de Imágenes | Alta | RF005, RF004 | Implementado | [HU-004](./HUs/HU-004_carga_de_imagenes_termicas.md) |
| **HU-005** | Visualización de imágenes térmicas | Gestión de Imágenes | Alta | RF003, RF014 | Implementado | [HU-005](./HUs/HU-005_visualizacion_de_imagenes.md) |
| **HU-006** | Cambio de paleta de color y rango térmico | Gestión de Imágenes | Media | RF012 | Implementado | [HU-006](./HUs/HU-006_cambio_de_paleta_de_color.md) |
| **HU-007** | Comparación simultánea de imágenes | Gestión de Imágenes | Media | RF013 | Pendiente (No implementado) | [HU-007](./HUs/HU-007_comparacion_de_imagenes.md) |
| **HU-008** | Análisis automático de imágenes | Análisis y Medición | Alta | RF004 | Implementado | [HU-008](./HUs/HU-008_analisis_automatico_de_imagenes.md) |
| **HU-009** | Detección de anomalías térmicas | Análisis y Alertas | Alta | RF006, RF017 | Parcialmente implementado | [HU-009](./HUs/HU-009_deteccion_de_anomalias_termicas.md) |
| **HU-010** | Generación de alertas térmicas | Análisis y Alertas | Alta | RF007 | Pendiente (No implementado) | [HU-010](./HUs/HU-010_generacion_de_alertas.md) |
| **HU-011** | Generación de reportes PDF | Reportes | Alta | RF008 | Implementado | [HU-011](./HUs/HU-011_generacion_de_reportes.md) |
| **HU-012** | Consulta de historial de análisis y reportes | Reportes | Media | RF009, RF010 | Parcialmente implementado | [HU-012](./HUs/HU-012_consulta_de_historial_de_analisis.md) |
| **HU-013** | Exportación de resultados | Reportes | Media | RF011 | Implementado (PDF, DOCX y PNG) | [HU-013](./HUs/HU-013_exportacion_de_resultados.md) |
| **HU-014** | Registro de usuarios | Autenticación y Acceso | Alta | RF016, RF010 | Implementado | [HU-014](./HUs/HU-014_registro_de_usuarios.md) |
| **HU-015** | Medición térmica, notas y temp. reflejada | Análisis y Medición | Alta | RF017, RF003 | Implementado | [HU-015](./HUs/HU-015_medicion_termica_y_parametros.md) |
| **HU-016** | Panel de administración y ajustes de idioma | Administración y Configuración | Media | RF010, RF009, RF018 | Implementado (CRUD usuarios pendiente) | [HU-016](./HUs/HU-016_panel_administracion_y_ajustes.md) |
