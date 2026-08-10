# HU-013 — Exportación de resultados

<!--
  ¿Qué? Historia de usuario que describe la exportación de resultados de análisis en formatos compatibles.
  ¿Para qué? Permitir compartir o archivar los resultados fuera del sistema.
  ¿Impacto? Cierra el módulo de Reportes ofreciendo portabilidad de los datos generados por HU-011 y HU-012.
-->

---

## Identificación

| Campo            | Valor                        |
| ---------------- | -------------------------------|
| **ID**           | HU-013                         |
| **Título**       | Exportación de resultados      |
| **Módulo**       | Reportes                       |
| **Prioridad**    | Por definir                    |
| **Estado**       | Por definir                    |
| **RF asociados** | Por definir                    |

---

## Historia

**Como** usuario,
**quiero** exportar los resultados del análisis en formatos compatibles,
**para** compartirlos o archivarlos.

---

## Criterios de aceptación

### CA-013.1 — Formatos de exportación disponibles

- **Dado que** tengo resultados de un análisis,
- **cuando** solicito exportarlos,
- **entonces** el sistema debe permitirme elegir entre formato PDF o Excel.

### CA-013.2 — Contenido completo del archivo exportado

- **Dado que** exporté los resultados,
- **cuando** abro el archivo generado,
- **entonces** debe contener todos los datos del análisis correspondiente.

### CA-013.3 — Descarga sin errores

- **Dado que** inicié la exportación,
- **cuando** el proceso finaliza,
- **entonces** la descarga debe completarse correctamente sin errores.
