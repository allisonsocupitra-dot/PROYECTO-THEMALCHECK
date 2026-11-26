# HU-016 — Panel de administración y configuración de idioma

<!--
  ¿Qué? Historia de usuario que describe la consulta administrativa de técnicos e informes, y la configuración de idioma.
  ¿Para qué? Permitir al Administrador supervisar la actividad de los técnicos y a cualquier usuario elegir el idioma de la interfaz.
  ¿Impacto? Completa la cobertura funcional de las vistas /admin y ModalAjustes del sistema actual.
-->

---

## Identificación

| Campo            | Valor                                              |
| ---------------- | -------------------------------------------------- |
| **ID**           | HU-016                                             |
| **Título**       | Panel de administración y configuración de idioma  |
| **Módulo**       | Administración y Configuración                     |
| **Prioridad**    | Media                                              |
| **Estado**       | Implementado (gestión CRUD de usuarios pendiente)  |
| **RF asociados** | RF010, RF009, RF018                                |

---

## Historia

**Como** Administrador o usuario de ThermalCheck,
**quiero** consultar y buscar técnicos con sus informes PDF desde el panel de administración, y cambiar el idioma de la interfaz desde ajustes,
**para** supervisar las inspecciones realizadas y operar la plataforma en Español o Inglés.

---

## Criterios de aceptación

### CA-016.1 — Búsqueda de técnicos y conteo de informes

- **Dado que** inicié sesión como `Administrador` y accedo a `/admin`,
- **cuando** visualizo el panel o escribo un nombre o correo en el buscador,
- **entonces** `GET /api/v1/informes/tecnicos` lista únicamente a los usuarios con rol `Técnico` filtrados y muestra su total de informes registrados.

### CA-016.2 — Consulta y descarga de informes de un técnico

- **Dado que** selecciono un técnico en la tabla de `/admin`,
- **cuando** el sistema consulta `GET /api/v1/informes/tecnicos/{id_usuario}/informes`,
- **entonces** muestra la tabla de sus informes PDF (nombre de archivo, fecha de generación, estado) y permite descargar cada archivo directamente desde `/uploads/...`.

### CA-016.3 — Cambio de idioma en Modal de Ajustes

- **Dado que** estoy autenticado en cualquier vista con `NavLateral`,
- **cuando** abro el botón de ajustes (engranaje) y selecciono `Español` o `English` en `ModalAjustes`,
- **entonces** `LanguageContext` persiste la preferencia en `sessionStorage` (`themalcheck_idioma`) y la interfaz actualiza inmediatamente todos sus textos traducidos sin perder la sesión ni los datos cargados.
