# Requisitos Funcionales - Análisis y Alertas

## RF004 - Análisis automático
- ID: RF004
- Nombre: Análisis automático
- Descripción funcional: El sistema debe analizar automáticamente los datos térmicos de las imágenes cargadas.
- Detalle técnico: El proceso debe ejecutarse de forma automática tras la validación exitosa del archivo y debe exponer los resultados en la interfaz.
- Entradas: imagen térmica válida.
- Salidas: resultados del análisis y zonas detectadas.
- Prioridad: Alta
- Criterios de aceptación: El análisis se ejecuta sin intervención manual del usuario y presenta resultados en pantalla.

## RF006 - Detección de anomalías
- ID: RF006
- Nombre: Detección de anomalías
- Descripción funcional: El sistema debe identificar zonas con temperaturas fuera del rango normal definido.
- Detalle técnico: Debe aplicar reglas o criterios de detección térmica y marcar visualmente las zonas anómalas.
- Entradas: resultado del análisis térmico.
- Salidas: zonas resaltadas en la imagen.
- Prioridad: Alta
- Criterios de aceptación: Las zonas anómalas se resaltan visualmente en la imagen analizada.

## RF007 - Generación de alertas
- ID: RF007
- Nombre: Generación de alertas
- Descripción funcional: El sistema debe generar alertas visuales cuando detecte patrones térmicos peligrosos.
- Detalle técnico: Debe clasificar la severidad de la anomalía y mostrar una alerta comprensible para el usuario.
- Entradas: resultado del análisis y umbral de riesgo.
- Salidas: alerta visual y/o notificación del sistema.
- Prioridad: Alta
- Criterios de aceptación: El sistema muestra la alerta antes de que el usuario cierre el análisis.
