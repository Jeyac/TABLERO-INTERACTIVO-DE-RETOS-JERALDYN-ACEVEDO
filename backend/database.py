# Importaciones necesarias para la configuración de la base de datos
from flask_sqlalchemy import SQLAlchemy  # ORM para interactuar con la base de datos
from flask import Flask  # Clase principal de Flask
from flask_cors import CORS  # Para manejar CORS (permite peticiones entre dominios)
from dotenv import load_dotenv  # Para cargar variables de entorno desde .env
import os  # Para acceder a variables del sistema

# Creamos una instancia de SQLAlchemy sin asociarla a una aplicación todavía
db = SQLAlchemy()

# Función para inicializar y configurar la aplicación Flask con la base de datos
def init_app(app: Flask):
    # Cargar variables de entorno desde el archivo .env
    load_dotenv()

    # Obtener credenciales y configuración de la base de datos desde variables de entorno
    DB_NAME = os.getenv("DB_NAME")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")

    # Configurar la URI de conexión a PostgreSQL usando las credenciales
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    # Desactivar seguimiento de modificaciones para mejor rendimiento
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Asociar la base de datos con la aplicación Flask
    db.init_app(app)
    # Habilitar CORS para la aplicación
    CORS(app)

    # Crear tablas y datos iniciales dentro del contexto de la aplicación
    with app.app_context():
        # Importar modelos para que SQLAlchemy los reconozca
        from models import Categoria, NivelDificultad, Estado
        
        # Crear todas las tablas definidas en los modelos
        db.create_all()

        # Precargar categorías iniciales si la tabla está vacía
        if not Categoria.query.first():
            categorias_iniciales = [Categoria(nombre=c) for c in ["Salud", "Educación", "Negocios", "Arte"]]
            db.session.add_all(categorias_iniciales)

        # Precargar niveles de dificultad iniciales si la tabla está vacía
        if not NivelDificultad.query.first():
            dificultades_iniciales = [NivelDificultad(nombre=d) for d in ["Bajo", "Medio", "Alto"]]
            db.session.add_all(dificultades_iniciales)

        # Precargar estados iniciales si la tabla está vacía
        if not Estado.query.first():
            estados_iniciales = [Estado(nombre=e) for e in ["Pendiente", "En proceso", "Completado"]]
            db.session.add_all(estados_iniciales)

        # Guardar todos los cambios en la base de datos
        db.session.commit()
