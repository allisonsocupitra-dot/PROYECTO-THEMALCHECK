# HU-007 — Herramientas de interacción e inspección en el visor térmico

<!--
  ¿Qué? Historia de usuario que se enfoca en la correcta funcionalidad de las herramientas del visor de imágenes térmicas.
  ¿Para qué? Detectar de forma precisa temperatura entre distintos puntos de medición.
  ¿Impacto? Funcionalidad planificada para ampliar la capacidad analítica del visor.
-->

---

## Identificación

| Campo            | Valor                                                        |
| ---------------- | -------------------------------------------------------------|
| **ID**           | HU-007                                                       |
| **Título**       | Herramientas de interacción e inspección en el visor térmico |
| **Módulo**       | Visor Térmico                                                |
| **Prioridad**    | Alta                                                         |
| **Estado**       | Implementado                                                 |
| **RF asociados** | RF013                                                        |

---

## Historia

**Como** técnico de inspección,
**quiero** utilizar herramientas de acercamiento (zoom), desplazamiento (pan), 
lectura puntual de temperatura y restablecimiento de vista en el visor térmico,
**para** examinar con precisión áreas específicas de interés en la imagen.

---

## Criterios de aceptación

> **Estado actual en el proyecto instalado:** Esta funcionalidad se encuentra implementada en su totalidad, cumpliendo con cada uno de los criterios de aceptación.

### CA-007.1 — Acercamiento y alejamiento (Zoom):

- **Dado que** visualizo una imagen térmica cargada en el visor,
- **cuando** utilizo los botones de zoom o la rueda del ratón,
- **entonces** la imagen se amplía o reduce en un rango del 50 % al 400 % 
manteniendo la nitidez y centrándose en el punto de interés.

### CA-007.2 — Desplazamiento (Pan): 

- **Dado que** la imagen tiene un nivel de zoom superior al 100 %, 
- **cuando** arrastro el cursor sobre el área de visualización, 
- **entonces** la imagen se desplaza suavemente (< 100 ms de respuesta) 
dentro de sus límites sin salirse del visor.

### CA-007.3 — Lectura puntual de temperatura: 

- **Dado que** activo la herramienta de inspección puntual y ubico el cursor 
sobre cualquier píxel de la imagen térmica, 
- **cuando** el sistema consulta los datos radiométricos, 
- **entonces** muestra un indicador flotante con la temperatura exacta en °C 
y las coordenadas (X, Y) del punto.

### CA-007.4 — Restablecimiento de vista: 

- **Dado que** modifiqué el nivel de zoom o la posición de la imagen,  
- **cuando** selecciono 'Restablecer vista',
- **entonces** el visor devuelve la imagen a su escala original ajustada a 
pantalla (100 %) y centrada en un máximo de 1 segundo.
