# Backend API para Tablero de Retos

API REST en Flask para gestionar retos con categorías, niveles de dificultad y estados.

## Estructura
backend/
├── app.py # Aplicación principal (endpoints)
├── database.py # Configuración de DB y modelos
└── models.py # Modelos de datos (SQLAlchemy)

## Requisitos
- Python 3.8+
- PostgreSQL
- Librerías: `flask`, `flask-sqlalchemy`, `python-dotenv`

## Configuración rápida
1. Crear archivo `.env`:

DB_NAME=retos_db
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432

## ¿Cómo correr la aplicación?

Instala las dependencias en un entorno virtual (opcional, pero recomendado):

python -m venv venv

source venv/bin/activate  # en Linux/Mac

venv\Scripts\activate     # en Windows

## Instalar dependencias: 

pip install -r requirements.txt

## Ejecutar:

python app.py

