# HU-007 — Comparación simultánea de imágenes

<!--
  ¿Qué? Historia de usuario que describe la comparación simultánea lado a lado de dos imágenes térmicas.
  ¿Para qué? Detectar diferencias de temperatura entre distintos periodos o estados de un mismo equipo.
  ¿Impacto? Funcionalidad planificada para ampliar la capacidad analítica del visor; actualmente no implementada.
-->

---

## Identificación

| Campo            | Valor                            |
| ---------------- | -------------------------------- |
| **ID**           | HU-007                           |
| **Título**       | Comparación simultánea de imágenes |
| **Módulo**       | Gestión de Imágenes              |
| **Prioridad**    | Media                            |
| **Estado**       | Pendiente (No implementado)      |
| **RF asociados** | RF013                            |

---

## Historia

**Como** analista o técnico,
**quiero** comparar dos imágenes térmicas del mismo equipo simultáneamente lado a lado,
**para** detectar diferencias de temperatura entre periodos o estados operativos.

---

## Criterios de aceptación

> **Estado actual en el proyecto instalado:** Esta funcionalidad aún no se encuentra implementada. Actualmente el visor (`VisorPage.tsx`) muestra una sola imagen a la vez y permite alternar entre imágenes de la carpeta mediante pestañas superiores.

### CA-007.1 — Carga simultánea de dos imágenes *(Pendiente)*

- **Dado que** quiero comparar dos imágenes térmicas,
- **cuando** active el modo comparación en el visor,
- **entonces** el sistema deberá permitir seleccionar dos imágenes y visualizarlas simultáneamente.

### CA-007.2 — Visualización lado a lado sin deformación *(Pendiente)*

- **Dado que** seleccioné dos imágenes para comparar,
- **cuando** se muestren en pantalla,
- **entonces** deberán presentarse lado a lado conservando su proporción y escala térmica independiente o sincronizada.

### CA-007.3 — Rendimiento durante la comparación *(Pendiente)*

- **Dado que** estoy comparando dos imágenes térmicas,
- **cuando** realice la inspección visual o ajuste zoom/paletas,
- **entonces** el rendimiento general de la interfaz deberá mantenerse fluido.
