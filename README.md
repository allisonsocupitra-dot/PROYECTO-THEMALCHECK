# ThermalCheck

ThermalCheck es una plataforma web diseñada para la carga, análisis y generación automática de reportes a partir de imágenes termográficas. El sistema facilita la inspección de anomalías al extraer los metadatos de las imágenes, permitiendo a los técnicos en campo visualizar puntos críticos, ajustar parámetros térmicos y exportar informes consolidados.

## Stack Tecnológico

- **Frontend:** React, TypeScript, Vite
- **Backend:** Python, FastAPI
- **Base de Datos:** MySQL

## Requisitos Previos

- Node.js (v18 o superior) y gestor de paquetes `pnpm`.
- Python (3.9 o superior).
- MySQL Server ejecutándose localmente o en un servidor externo.

## Instalación y Ejecución

### 1. Configuración de la Base de Datos
1. Crear una base de datos en MySQL.
2. Ejecutar las migraciones o el script de creación de tablas incluido en el proyecto.

### 2. Backend (FastAPI)
1. Navegar al directorio del backend: `cd be`
2. Crear un entorno virtual: `python -m venv venv`
3. Activar el entorno virtual: 
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Instalar las dependencias: `pip install -r requirements.txt`
5. Configurar las variables de entorno en un archivo `.env` (credenciales de BD, puertos).
6. Iniciar el servidor: `uvicorn src.main:app --reload`
*La API estará disponible en `http://localhost:8000` y su documentación en `http://localhost:8000/docs`.*

### 3. Frontend (React + Vite)
1. Navegar al directorio del frontend: `cd fe`
2. Instalar las dependencias: `pnpm install`
3. Configurar la variable `VITE_API_URL` en un archivo `.env` apuntando al backend local.
4. Iniciar el servidor de desarrollo: `pnpm run dev`
*La aplicación estará disponible en `http://localhost:5173`.*