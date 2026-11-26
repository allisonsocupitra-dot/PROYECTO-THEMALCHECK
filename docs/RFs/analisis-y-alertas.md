# Requisitos Funcionales - Análisis, Medición y Alertas

## RF004 - Análisis térmico automático al cargar imagen
- **ID:** RF004
- **Nombre:** Análisis térmico automático al cargar imagen
- **Estado actual:** Implementado
- **Descripción funcional:** El sistema extrae automáticamente los metadatos de cada imagen al cargarla y, cuando corresponde a un R-JPEG de DJI, calcula de forma automática su matriz radiométrica real de temperaturas mínima y máxima sin intervención manual.
- **Detalle técnico:** Implementado en `be/src/services/thermal_extractor.py` y `be/src/services/dji_thermal_sdk.py`, invocado automáticamente por `POST /api/v1/imagenes/upload`. Usa `Pillow` (ancho, alto, formato), `ExifRead` (fecha, modelo de cámara, número de serie, distancia focal, apertura f, coordenadas GPS y JSON embebido si existe) y el **DJI Thermal SDK v1.4** (`libdirp`) con parámetros ambientales por defecto (`distancia_m=25.0`, `humedad=70.0`, `emisividad=0.98`, `temp_reflejada=23.0`) para obtener `temp_min` y `temp_max`.
- **Entradas:** Archivo de imagen térmica válido.
- **Salidas:** Registro con metadatos extraídos, parámetros ambientales y rango térmico (`temp_min`, `temp_max`) visibles en el explorador y en el visor.
- **Prioridad:** Alta
- **Criterios de aceptación:** Tras subir una imagen R-JPEG de DJI, el sistema calcula automáticamente sus temperaturas mínima/máxima y extrae sus metadatos EXIF sin requerir configuración previa del usuario.

---

## RF017 - Medición térmica puntual/regional y recálculo de temperatura reflejada
- **ID:** RF017
- **Nombre:** Medición térmica puntual/regional y recálculo de temperatura reflejada
- **Estado actual:** Implementado (incorporado en el visor actual)
- **Descripción funcional:** El sistema permite al usuario dibujar anotaciones de medición sobre la imagen en el visor (puntos `SP#`, rectángulos `R#` y círculos/elipses `C#`, eligiendo color), calcular sus temperaturas reales mediante el SDK, agregar observaciones y ajustar la temperatura reflejada recalculando toda la imagen y sus mediciones.
- **Detalle técnico:** Implementado en `VisorPage.tsx`, `TablaParametros.tsx`, `PUT /api/v1/imagenes/{id_imagen}/puntos`, `PUT /api/v1/imagenes/{id_imagen}/parametros` y `be/api/v1/endpoints/visor/circulos.py` + `comun.py`.
  - Puntos (`SP#`): miden temperatura exacta del píxel (`temperatura_en_punto`).
  - Rectángulos (`R#`) y Círculos (`C#`): calculan `valor_min`, `valor_avg`, `valor_max`, `ΔTemp` (`Máx − Mín`) y coordenadas del píxel más frío y más caliente (`pos_min`, `pos_max`), dibujados con marcadores azul y rojo.
  - Guardado automático al crear/borrar figuras, botón manual **Guardar**, y bloqueo de navegación (`useBlocker`) si existen cambios pendientes en notas o figuras.
  - En la tabla `PARÁMETROS` (`TablasPropiedades.tsx`), `Distancia`, `Humedad` y `Emisividad` se muestran en solo lectura; `Temp. reflejada` es el parámetro editable desde la interfaz (con debounce de 500 ms), aunque `PUT /api/v1/imagenes/{id_imagen}/parametros` soporta recibir los cuatro campos.
- **Entradas:** Trazos sobre la imagen, color de marca, texto de observaciones y ajuste de temperatura reflejada (°C).
- **Salidas:** Temperaturas calculadas en °C persistidas en `punto_medicion` y actualización inmediata del panel lateral y la imagen.
- **Prioridad:** Alta
- **Criterios de aceptación:** Cada punto y región dibujado obtiene su medición radiométrica real en imágenes DJI, persiste en MySQL junto con su color y observaciones, y se recalcula al modificar la temperatura reflejada.

---

## RF006 - Detección de anomalías térmicas
- **ID:** RF006
- **Nombre:** Detección de anomalías térmicas
- **Estado actual:** Parcialmente implementado (medición asistida de extremos térmicos)
- **Descripción funcional:** Identificar y resaltar zonas con temperaturas críticas o fuera de rango para apoyar el diagnóstico de posibles fallas eléctricas.
- **Detalle técnico:** En el estado actual del proyecto, el sistema **no ejecuta detección automática de fallas ni segmentación autónoma por reglas o modelos de IA**. Lo implementado actualmente como apoyo a la detección de puntos calientes es:
  1. Identificación y marcado visual automático del píxel de **temperatura máxima (rojo)** y **mínima (azul)** dentro de cada región `R#` o `C#` trazada por el técnico (`pos_max`, `pos_min`).
  2. Cálculo del diferencial térmico **`ΔTemp` (`Máx − Mín`)** por región.
  3. Ajuste interactivo de la **barra de rango térmico** (`BarraRangoTermico`) para aislar visualmente (dejando en escala de grises el resto) las zonas dentro de un umbral de temperatura específico.
- **Entradas:** Imagen térmica analizada y regiones/rangos definidos por el usuario.
- **Salidas:** Marcadores visuales de temperatura máxima/mínima en cada región, `ΔTemp` y resaltado por rango térmico. *(Pendiente: detección autónoma de anomalías sin trazado manual).*
- **Prioridad:** Alta
- **Criterios de aceptación:** Dentro de cualquier región analizada se resaltan automáticamente los puntos más caliente y más frío con sus valores; la detección autónoma sin selección de región queda planificada para una fase posterior.

---

## RF007 - Generación de alertas de riesgo térmico
- **ID:** RF007
- **Nombre:** Generación de alertas de riesgo térmico
- **Estado actual:** Pendiente (No implementado)
- **Descripción funcional:** Clasificar automáticamente la severidad de una anomalía térmica (por ejemplo, nivel de riesgo bajo/medio/crítico) y emitir alertas visuales o notificaciones cuando se superen umbrales peligrosos.
- **Detalle técnico:** Actualmente no existe un motor de evaluación de umbrales ni alertas visuales de riesgo térmico; en `VisorPage.tsx` los campos `nivel_riesgo` y `estado` enviados al exportar PDF todavía utilizan el valor provisional `'TODO'`. El sistema sí presenta avisos operativos de interfaz (confirmación de guardado, confirmación de reporte registrado, advertencia de cambios sin guardar al salir del visor y errores de operación).
- **Entradas:** Resultado del análisis térmico y umbrales de riesgo configurados.
- **Salidas:** Clasificación real de `nivel_riesgo`/`estado` y alerta visual visible antes de cerrar el análisis (pendiente de implementación).
- **Prioridad:** Alta (pendiente de desarrollo)
- **Criterios de aceptación:** El sistema deberá evaluar umbrales de temperatura, asignar `nivel_riesgo` real y mostrar una alerta comprensible en pantalla antes de finalizar la inspección.
