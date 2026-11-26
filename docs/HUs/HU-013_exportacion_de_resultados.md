# HU-013 — Exportación de resultados

<!--
  ¿Qué? Historia de usuario que describe la exportación de resultados del visor en múltiples formatos descargables.
  ¿Para qué? Permitir compartir, editar o archivar los resultados de la inspección fuera de la plataforma.
  ¿Impacto? Cierra el flujo del visor ofreciendo portabilidad en PDF, Word (.docx) e imagen PNG anotada.
-->

---

## Identificación

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **ID**           | HU-013                             |
| **Título**       | Exportación de resultados          |
| **Módulo**       | Reportes                           |
| **Prioridad**    | Media                              |
| **Estado**       | Implementado (PDF, DOCX y PNG)     |
| **RF asociados** | RF011                              |

---

## Historia

**Como** usuario del visor,
**quiero** exportar los resultados de mi análisis en formato PDF, Word (`.docx`) o imagen PNG anotada,
**para** compartirlos, editarlos en documentos externos o archivarlos.

---

## Criterios de aceptación

### CA-013.1 — Opciones de exportación disponibles en el visor

- **Dado que** tengo una imagen abierta en `/visor`,
- **cuando** abro el menú desplegable `Exportar`,
- **entonces** el sistema me permite elegir entre `PDF`, `DOC` (Word `.docx`) e `Imagen` (`.png`).

### CA-013.2 — Exportación en Word (`.docx`) e Imagen (`.png`)

- **Dado que** selecciono `DOC` o `Imagen`,
- **cuando** finaliza la exportación,
- **entonces**:
  - `DOC` genera un documento `.docx` (`POST /api/v1/informes/exportar-doc` con `python-docx`) con el mismo diseño técnico y tablas que el PDF, sin crear registro en BD.
  - `Imagen` genera y descarga `marcada-<nombre>.png` desde el navegador con la paleta, rango térmico y figuras dibujadas fijadas sobre la imagen.

### CA-013.3 — Descarga segura mediante diálogo o descarga directa

- **Dado que** selecciono cualquier formato de exportación (`PDF`, `DOC` o `Imagen`),
- **cuando** se completa el proceso sin errores,
- **entonces** el archivo se guarda mediante `showSaveFilePicker` (si el navegador lo soporta) o descarga directa del navegador; si ocurre un fallo, el visor muestra un mensaje de error claro sin cerrar la vista.

> **Nota sobre alcance:** La exportación a Excel mencionada en el planteamiento inicial no fue implementada en la versión instalada; en su lugar se implementaron Word (`.docx`) e imagen PNG anotada.
