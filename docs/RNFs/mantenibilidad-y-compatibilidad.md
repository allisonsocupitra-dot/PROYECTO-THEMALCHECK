# Requisitos No Funcionales - Mantenibilidad y Compatibilidad

## RNF003 - Compatibilidad de navegadores y plataformas
- **ID:** RNF003
- **Descripción:** El cliente web debe funcionar correctamente en navegadores modernos (Chrome, Firefox y Edge) sin plugins adicionales, y el backend debe operar en los entornos soportados por el DJI Thermal SDK.
- **Estado actual:** Implementado
- **Priorización:** Alta
- **Detalle técnico:**
  - Frontend basado en estándares web (React 19, TypeScript, SVG, Canvas HTML5), con respaldo automático de descarga clásica (`<a download>`) cuando el navegador no soporta `showSaveFilePicker` (ej. Firefox).
  - Backend compatible con **Windows y Linux (x64 y x86)** mediante los binarios empaquetados en `be/src/services/dji_sdk_plugins/dji_thermal_sdk_v1.4_20220929/` (`libdirp.dll` / `libdirp.so`). macOS no está soportado para extracción radiométrica DJI.
- **Criterio de cumplimiento:** La plataforma web es accesible y funcional en Chrome, Firefox y Edge, y el backend procesa imágenes R-JPEG de DJI en Windows y Linux x64/x86.

---

## RNF006 - Mantenibilidad y arquitectura modular
- **ID:** RNF006
- **Descripción:** El código fuente debe mantener una separación clara de responsabilidades entre interfaz, estado, consumo de API, endpoints, esquemas, modelos y servicios.
- **Estado actual:** Implementado
- **Priorización:** Media
- **Detalle técnico:**
  - **Frontend (`fe/src/`):** organizado en `api/`, `components/`, `context/`, `hooks/`, `i18n/`, `pages/`, `styles/`, `types/` y `utils/`. Tipado estricto con TypeScript (`tsc -b`) y linting con ESLint.
  - **Backend (`be/`):** organizado en `api/v1/endpoints/` (submódulo `visor/` separado por responsabilidad: `imagen.py`, `paletas.py`, `parametros.py`, `puntos.py`, `circulos.py`, `matriz.py`, `exportar.py`, `comun.py`), `src/models/`, `src/schemas/`, `src/services/` y migraciones con Alembic (`be/migrations/`).
  - *Nota técnica:* Actualmente no existe suite de pruebas automatizadas ni pipeline CI/CD configurado en el repositorio.
- **Criterio de cumplimiento:** Las funcionalidades están modularizadas por dominio, permitiendo modificar herramientas del visor, paletas o exportadores sin afectar otros módulos.
