# HU-007 — Comparación de imágenes

<!--
  ¿Qué? Historia de usuario que describe la comparación simultánea de dos imágenes térmicas del mismo equipo.
  ¿Para qué? Detectar diferencias de temperatura entre distintos periodos o estados de un equipo.
  ¿Impacto? Cierra el módulo de Gestión de Imágenes con una funcionalidad analítica de alto valor para el rol de analista.
-->

---

## Identificación

| Campo            | Valor                       |
| ---------------- | ------------------------------|
| **ID**           | HU-007                        |
| **Título**       | Comparación de imágenes       |
| **Módulo**       | Gestión de Imágenes           |
| **Prioridad**    | Por definir                   |
| **Estado**       | Por definir                   |
| **RF asociados** | Por definir                   |

---

## Historia

**Como** analista,
**quiero** comparar dos imágenes térmicas del mismo equipo,
**para** detectar diferencias de temperatura entre periodos o estados.

---

## Criterios de aceptación

### CA-007.1 — Carga simultánea de dos imágenes

- **Dado que** quiero comparar dos imágenes térmicas,
- **cuando** las cargo en el sistema,
- **entonces** este debe permitir la visualización simultánea de ambas.

### CA-007.2 — Visualización lado a lado sin deformación

- **Dado que** cargué dos imágenes para comparar,
- **cuando** se muestran en pantalla,
- **entonces** deben presentarse lado a lado sin deformación ni pérdida de calidad.

### CA-007.3 — Rendimiento durante la comparación

- **Dado que** estoy comparando dos imágenes térmicas,
- **cuando** realizo la inspección visual,
- **entonces** el rendimiento general del sistema no debe verse afectado.
