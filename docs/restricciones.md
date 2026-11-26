# Restricciones del Proyecto - ThermalCheck

## Restricciones generales
- El sistema debe ejecutarse como una plataforma web accesible desde navegadores modernos.
- El proyecto está enfocado en la gestión, visualización y análisis radiométrico de imágenes termográficas (especialmente capturas R-JPEG de drones DJI como M3T, M30T, H20T) orientadas a inspecciones térmicas y de estructuras eléctricas.
- El proyecto está orientado a un entorno académico y de demostración funcional, priorizando claridad operativa, trazabilidad de mediciones y generación formal de reportes.

## Restricciones técnicas
- El frontend está construido con **React 19, TypeScript y Vite**, con soporte bilingüe (Español / Inglés).
- El backend está implementado en **Python con FastAPI**, utilizando **SQLAlchemy + PyMySQL** sobre **MySQL** y migraciones con **Alembic**.
- El procesamiento radiométrico real (matriz de temperaturas, puntos, regiones y paletas) depende de las librerías nativas del **DJI Thermal SDK v1.4** (`libdirp.dll` / `libdirp.so`), disponibles únicamente para sistemas **Windows y Linux (x64 y x86)**; no es compatible de forma nativa con macOS.
- En el selector de carga se aceptan archivos de imagen estándar (`image/*`), pero el cálculo radiométrico de matriz térmica, recalculo de temperatura reflejada y cambio de paletas requieren imágenes en formato **R-JPEG de DJI** (con soporte básico de lectura EXIF mediante `Pillow` y `ExifRead` para otras imágenes).
- En entorno de desarrollo local el frontend opera en `http://localhost:5173` y la API en `http://localhost:8000`; para despliegue en producción la comunicación cliente-servidor debe realizarse mediante **HTTPS**.
- El servicio de recuperación de contraseña requiere configuración de credenciales SMTP válidas (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`) en el archivo `.env` del backend.
- Se recomienda una resolución mínima de pantalla de **1280×720** y al menos **4 GB de RAM** para la manipulación fluida de matrices térmicas en el navegador (`Canvas` y `Float32Array`).

## Restricciones de rendimiento
- El cálculo de la matriz térmica de una imagen R-JPEG se realiza bajo demanda y utiliza caché en memoria en el backend (`_CACHE` de hasta 10 entradas en `matriz.py`) y caché por sesión en el frontend (`useRangoTermico`) para evitar recálculos repetitivos.
- Al ajustar la temperatura reflejada en el visor, se aplica un retardo de espera (*debounce* de 500 ms) antes de enviar la petición al backend para evitar saturación de llamadas consecutivas.

## Restricciones de seguridad
- El acceso a las vistas operativas (`/dashboard`, `/visor`, `/reportes`, `/admin`) está restringido mediante rutas protegidas en el frontend (`ProtectedRoute`) y diferencia los roles **Técnico** y **Administrador**.
- El inicio de sesión como **Administrador** exige adicionalmente una **clave de administración** almacenada con hash `bcrypt` en la tabla `clave_admin`.
- Las contraseñas de usuario se almacenan cifradas con `bcrypt` (`passlib`).
- *Estado actual pendiente de endurecimiento:* La sesión en frontend se persiste actualmente en `sessionStorage` sin emisión ni validación de token JWT en las cabeceras de todos los endpoints de API, y el enlace de restablecimiento de contraseña utiliza el parámetro `correo` en la URL sin expiración activa en el endpoint.

## Restricciones de negocio y organización
- El alcance del proyecto evoluciona según las prioridades y tiempos definidos por el equipo de desarrollo de la ficha de formación.
- Ciertas capacidades planeadas originalmente (comparación simultánea lado a lado, detección automática de fallas eléctricas, alertas automáticas de riesgo térmico y exportación a Excel) permanecen fuera de la versión instalada actual o en estado parcial/pendiente.

## Dependencias reales instaladas
- **Navegadores modernos:** Google Chrome, Mozilla Firefox y Microsoft Edge (uso de APIs web estándar y `showSaveFilePicker` cuando está disponible).
- **Frontend (`fe/`):** React 19.2, React Router DOM 7.18, TypeScript 6.0, Vite 8.2, TailwindCSS 4.3, Axios.
- **Backend (`be/`):** FastAPI, Uvicorn, SQLAlchemy 2.0, PyMySQL, Alembic, Passlib + Bcrypt, Python-Jose, Pillow, ExifRead, NumPy, ReportLab, WeasyPrint, python-docx.
- **Procesamiento Térmico:** DJI Thermal SDK v1.4 (`be/src/services/dji_sdk_plugins/dji_thermal_sdk_v1.4_20220929/`).
- **Base de datos y almacenamiento:** MySQL (`bd/base_de_datos.sql`) y almacenamiento local en disco (`be/uploads/termograficas/` y `be/uploads/informes_pdf/`).
