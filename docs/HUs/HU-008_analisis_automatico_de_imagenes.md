# HU-008 — Análisis automático de imágenes

<!--
  ¿Qué? Historia de usuario que describe la extracción automática de metadatos y temperaturas al cargar una imagen.
  ¿Para qué? Obtener temperaturas globales y propiedades radiométricas/EXIF sin intervención manual.
  ¿Impacto? Automatiza la lectura inicial de las capturas DJI R-JPEG y alimenta tanto al explorador como al visor.
-->

---

## Identificación

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **ID**           | HU-008                             |
| **Título**       | Análisis automático de imágenes    |
| **Módulo**       | Análisis y Medición                |
| **Prioridad**    | Alta                               |
| **Estado**       | Implementado                       |
| **RF asociados** | RF004                              |

---

## Historia

**Como** usuario,
**quiero** que el sistema procese automáticamente los metadatos y datos térmicos de las imágenes al cargarlas,
**para** obtener sus temperaturas mínima/máxima e información de cámara sin intervención manual.

---

## Criterios de aceptación

### CA-008.1 — Extracción automática al subir la imagen

- **Dado que** subo una imagen térmica en `/dashboard`,
- **cuando** se ejecuta `POST /api/v1/imagenes/upload`,
- **entonces** `thermal_extractor.py` extrae automáticamente dimensiones, formato, fecha, modelo de cámara, número de serie, distancia focal, apertura y coordenadas GPS sin requerir acción adicional.

### CA-008.2 — Cálculo radiométrico automático para DJI R-JPEG

- **Dado que** la imagen cargada es un archivo R-JPEG compatible de dron DJI,
- **cuando** finaliza la carga en el backend,
- **entonces** el **DJI Thermal SDK v1.4** calcula automáticamente la matriz de temperaturas con los parámetros por defecto (`distancia=25.0 m`, `humedad=70.0%`, `emisividad=0.98`, `temp_reflejada=23.0 °C`) y guarda `temp_min` y `temp_max` en MySQL.

### CA-008.3 — Degradación controlada ante imágenes sin datos radiométricos

- **Dado que** cargo una imagen que no es R-JPEG de DJI (por ejemplo, un PNG o JPEG estándar),
- **cuando** el backend procesa el archivo,
- **entonces** conserva los metadatos disponibles y permite continuar la visualización y anotación visual sin interrumpir la carga.
