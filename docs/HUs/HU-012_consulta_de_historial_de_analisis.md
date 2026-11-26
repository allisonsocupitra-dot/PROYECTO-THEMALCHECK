# HU-012 — Consulta de historial de análisis y reportes

<!--
  ¿Qué? Historia de usuario que describe la consulta de imágenes analizadas e informes generados anteriormente.
  ¿Para qué? Permitir revisar resultados previos tanto por el técnico como por el administrador.
  ¿Impacto? Garantiza trazabilidad de imágenes/mediciones y acceso a los informes PDF almacenados en el sistema.
-->

---

## Identificación

| Campo            | Valor                                         |
| ---------------- | --------------------------------------------- |
| **ID**           | HU-012                                        |
| **Título**       | Consulta de historial de análisis y reportes  |
| **Módulo**       | Reportes                                      |
| **Prioridad**    | Media                                         |
| **Estado**       | Parcialmente implementado                     |
| **RF asociados** | RF009, RF010                                  |

---

## Historia

**Como** usuario (Técnico o Administrador),
**quiero** consultar las imágenes analizadas y los reportes generados previamente,
**para** revisar resultados anteriores y descargar los documentos cuando los necesite.

---

## Criterios de aceptación

### CA-012.1 — Restauración de imágenes, mediciones y notas guardadas

- **Dado que** subí imágenes y guardé mediciones/observaciones en sesiones anteriores,
- **cuando** inicio sesión nuevamente,
- **entonces** el sistema restaura automáticamente mis carpetas, imágenes, puntos de medición y notas desde MySQL (`GET /api/v1/imagenes/usuario/{id_usuario}`).

### CA-012.2 — Vista "Mis reportes" (`/reportes`) para la sesión activa

- **Dado que** exporté reportes en PDF o DOC durante mi sesión actual,
- **cuando** accedo a `/reportes`,
- **entonces** veo una tabla con el nombre de imagen, carpeta, formato (`PDF` o `DOC`) y fecha de generación de los reportes de la sesión. *(Nota: al recargar la página, esta tabla en memoria se reinicia porque aún no consulta la tabla `informe` del técnico desde BD).*

### CA-012.3 — Historial persistido por técnico en el Panel Admin (`/admin`)

- **Dado que** inicio sesión con rol `Administrador` y accedo a `/admin`,
- **cuando** busco y selecciono un técnico en la lista (`GET /api/v1/informes/tecnicos`),
- **entonces** el sistema muestra todos los informes PDF persistidos en MySQL para ese técnico (`GET /api/v1/informes/tecnicos/{id}/informes`) con nombre de archivo, fecha, estado y botón para descargar el PDF desde el servidor.
