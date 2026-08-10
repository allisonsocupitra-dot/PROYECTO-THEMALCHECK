# HU-004 — Carga de imágenes térmicas

<!--
  ¿Qué? Historia de usuario que describe la carga de imágenes térmicas en formatos compatibles.
  ¿Para qué? Habilitar la entrada de datos visuales que alimentan el análisis automático posterior.
  ¿Impacto? Es el punto de entrada del módulo de Gestión de Imágenes — sin carga válida no hay imagen que visualizar, analizar ni comparar.
-->

---

## Identificación

| Campo            | Valor                         |
| ---------------- | -------------------------------|
| **ID**           | HU-004                         |
| **Título**       | Carga de imágenes térmicas     |
| **Módulo**       | Gestión de Imágenes            |
| **Prioridad**    | Por definir                    |
| **Estado**       | Por definir                    |
| **RF asociados** | Por definir                    |

---

## Historia

**Como** técnico o usuario del sistema,
**quiero** subir imágenes térmicas en formatos compatibles,
**para** analizarlas automáticamente.

---

## Criterios de aceptación

### CA-004.1 — Formatos compatibles

- **Dado que** voy a cargar una imagen térmica,
- **cuando** selecciono un archivo en formato JPEG, PNG o TIFF,
- **entonces** el sistema debe aceptar la carga.

### CA-004.2 — Carga y visualización correcta

- **Dado que** cargué una imagen en un formato válido,
- **cuando** la carga finaliza,
- **entonces** la imagen debe mostrarse correctamente en la interfaz.

### CA-004.3 — Manejo de formato no compatible

- **Dado que** intento cargar un archivo en un formato no soportado,
- **cuando** el sistema procesa la carga,
- **entonces** debe informarme el error de forma clara.
