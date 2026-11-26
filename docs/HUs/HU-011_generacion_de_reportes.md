# HU-011 — Generación de reportes PDF

<!--
  ¿Qué? Historia de usuario que describe la generación, almacenamiento y descarga de un reporte PDF formal desde el visor.
  ¿Para qué? Conservar un registro estructurado de la inspección termográfica con imagen anotada, mediciones y metadatos.
  ¿Impacto? Formaliza los resultados de /visor y alimenta el registro histórico de informes en MySQL.
-->

---

## Identificación

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **ID**           | HU-011                             |
| **Título**       | Generación de reportes PDF         |
| **Módulo**       | Reportes                           |
| **Prioridad**    | Alta                               |
| **Estado**       | Implementado                       |
| **RF asociados** | RF008                              |

---

## Historia

**Como** técnico o analista,
**quiero** generar un reporte en formato PDF con la imagen anotada, mediciones, parámetros y observaciones,
**para** conservar un registro formal de la inspección realizada.

---

## Criterios de aceptación

### CA-011.1 — Guardado previo y generación del PDF

- **Dado que** estoy inspeccionando una imagen en `/visor`,
- **cuando** selecciono `Exportar > PDF`,
- **entonces** el sistema guarda primero los puntos y observaciones pendientes, compone la imagen con su paleta, rango térmico y marcas en canvas, y llama a `POST /api/v1/informes/exportar`.

### CA-011.2 — Estructura técnica del documento PDF

- **Dado que** el backend genera el archivo mediante `pdf_export.py` (ReportLab),
- **cuando** abro el PDF descargado,
- **entonces** incluye encabezado con logotipo y nombre de archivo, imagen térmica anotada con barra de escala, fecha y las secciones `Measurements` (`SP#`, `R#`, `C#`), `Parameters`, `Image Info` y `Remarks`.

### CA-011.3 — Persistencia del informe en servidor y base de datos

- **Dado que** el PDF se generó exitosamente,
- **cuando** finaliza la petición,
- **entonces** el archivo `.pdf` queda almacenado en `be/uploads/informes_pdf/`, el informe se registra en la tabla `informe` de MySQL y aparece en la vista `"Mis reportes"` de la sesión actual.
