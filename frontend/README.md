## Frontend del Tablero Interactivo de Retos (HTML, CSS y JavaScript)
Este proyecto corresponde a la parte visual del sistema de gestión de retos, el cual se comunica con un backend desarrollado en Flask y conectado a PostgreSQL.

El frontend es completamente independiente, compuesto únicamente por archivos HTML, CSS y JavaScript, y consume la API REST del backend mediante peticiones HTTP usando fetch().

## Características del Proyecto
Independiente del backend (no sirve archivos desde Flask, todo es manejado localmente o en un servidor web).

Interfaz simple e intuitiva para la gestión de retos.

Consumo de API REST del backend en Flask.

## Funciones implementadas:

Listar retos.

Agregar un reto.

Editar un reto.

Eliminar un reto.

Filtrar retos por categoría y dificultad.

Diseño adaptable (responsive) para diferentes tamaños de pantalla.

## Instrucciones de Uso
1. Clonar el repositorio del frontend

git clone https://github.com/Jeyac/TABLERO-INTERACTIVO-DE-RETOS-JERALDYN-ACEVEDO.git

2. Configuración de conexión al backend
En el archivo app.js, ubicar la constante con la URL base de la API y ajustarla a la dirección donde se encuentre ejecutando el backend, por ejemplo:

const API_URL = "http://127.0.0.1:5000";

3. Ejecutar el frontend

Opción 1: Abrir el archivo index.html directamente en el navegador.

Opción 2: Servirlo con un servidor web local (recomendado para evitar problemas de CORS):

# Usando Python

python -m http.server 5500

# Luego abrir en el navegador:

http://127.0.0.1:5500

## Requisitos

Navegador moderno (Chrome, Firefox, Edge, etc.).

Backend corriendo en Flask y PostgreSQL.

## Jéraldyn Roxana Acevedo Jácome