# HU-004 — Carga de imágenes y carpetas térmicas

<!--
  ¿Qué? Historia de usuario que describe la carga de imágenes individuales o carpetas completas al sistema.
  ¿Para qué? Incorporar las capturas termográficas al explorador y ejecutar su extracción automática en backend.
  ¿Impacto? Es el punto de entrada del módulo de Gestión de Imágenes — persiste archivos, carpetas y metadatos por usuario.
-->

---

## Identificación

| Campo            | Valor                                         |
| ---------------- | --------------------------------------------- |
| **ID**           | HU-004                                        |
| **Título**       | Carga de imágenes y carpetas térmicas         |
| **Módulo**       | Gestión de Imágenes                           |
| **Prioridad**    | Alta                                          |
| **Estado**       | Implementado                                  |
| **RF asociados** | RF005, RF004                                  |

---

## Historia

**Como** técnico o usuario del sistema,
**quiero** cargar imágenes térmicas individuales o carpetas completas conservando su jerarquía,
**para** organizar mis inspecciones y analizarlas automáticamente en ThermalCheck.

---

## Criterios de aceptación

### CA-004.1 — Carga individual y múltiple mediante arrastrar/soltar o selector

- **Dado que** estoy en el explorador (`/dashboard`),
- **cuando** arrastro o selecciono uno o varios archivos de imagen (`image/*`) en `ImageUploader`,
- **entonces** las imágenes se agregan a la carpeta activa, muestran el indicador `"Analizando"` mientras se envían a `POST /api/v1/imagenes/upload` y quedan almacenadas en `be/uploads/termograficas/` y MySQL.

### CA-004.2 — Carga de carpetas completas con estructura jerárquica

- **Dado que** necesito subir una inspección organizada en directorios,
- **cuando** uso el botón de subir carpeta (`webkitdirectory`),
- **entonces** el sistema filtra las imágenes válidas, reconstruye automáticamente el árbol de carpetas y subcarpetas en `"Mis carpetas"` y guarda cada imagen asociada a su ruta de carpeta.

### CA-004.3 — Persistencia por usuario y manejo de errores

- **Dado que** cargué imágenes en mi cuenta,
- **cuando** cierro sesión o recargo la aplicación y vuelvo a ingresar,
- **entonces** las carpetas e imágenes se restauran desde `GET /api/v1/imagenes/usuario/{id_usuario}`; si alguna carga falla, se muestra una insignia `"Error"` en la miniatura sin bloquear el resto.

### CA-004.4 — Eliminación de imágenes y carpetas

- **Dado que** tengo imágenes o carpetas cargadas en el explorador,
- **cuando** elimino una imagen, una selección múltiple o una carpeta completa previa confirmación,
- **entonces** el sistema las retira de la vista y las elimina del servidor mediante `DELETE /api/v1/imagenes/{id_imagen}`.
