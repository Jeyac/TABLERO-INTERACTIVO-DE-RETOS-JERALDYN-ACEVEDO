from database import db  # Importa la instancia de SQLAlchemy

# Modelo para la tabla de categorías
class Categoria(db.Model):
    __tablename__ = "categoria"  # Nombre de la tabla en la base de datos
    
    # Columnas de la tabla
    id_categoria = db.Column(db.Integer, primary_key=True)  # Llave primaria
    nombre = db.Column(db.String(50), nullable=False, unique=True)  # Nombre único y obligatorio

    # Convierte el objeto a diccionario para JSON
    def to_dict(self):
        return {"id_categoria": self.id_categoria, "nombre": self.nombre}


# Modelo para los niveles de dificultad
class NivelDificultad(db.Model):
    __tablename__ = "niveldificultad"  # Nombre de la tabla
    
    # Columnas
    id_dificultad = db.Column(db.Integer, primary_key=True)  # ID único
    nombre = db.Column(db.String(20), nullable=False, unique=True)  # Nombre del nivel

    def to_dict(self):
        return {"id_dificultad": self.id_dificultad, "nombre": self.nombre}


# Modelo para los estados de los retos
class Estado(db.Model):
    __tablename__ = "estado"  # Nombre de la tabla
    
    # Columnas
    id_estado = db.Column(db.Integer, primary_key=True)  # ID único
    nombre = db.Column(db.String(20), nullable=False, unique=True)  # Nombre del estado

    def to_dict(self):
        return {"id_estado": self.id_estado, "nombre": self.nombre}


# Modelo principal para los retos
class Reto(db.Model):
    __tablename__ = "reto"  # Nombre de la tabla
    
    # Columnas básicas
    id_reto = db.Column(db.Integer, primary_key=True)  # ID único
    titulo = db.Column(db.String(100), nullable=False)  # Título obligatorio
    descripcion = db.Column(db.Text, nullable=False)  # Descripción obligatoria

    # Claves foráneas (relaciones con otras tablas)
    id_categoria = db.Column(db.Integer, db.ForeignKey("categoria.id_categoria"), nullable=False)
    id_dificultad = db.Column(db.Integer, db.ForeignKey("niveldificultad.id_dificultad"), nullable=False)
    id_estado = db.Column(db.Integer, db.ForeignKey("estado.id_estado"), nullable=False)

    # Relaciones ORM para acceder fácilmente a los objetos relacionados
    categoria = db.relationship("Categoria")  # Relación con Categoria
    dificultad = db.relationship("NivelDificultad")  # Relación con NivelDificultad
    estado = db.relationship("Estado")  # Relación con Estado

    # Convierte el reto y sus relaciones a diccionario
    def to_dict(self):
        return {
            "id_reto": self.id_reto,
            "titulo": self.titulo,
            "descripcion": self.descripcion,
            "categoria": self.categoria.to_dict(),  # Incluye datos de categoría
            "dificultad": self.dificultad.to_dict(),  # Incluye datos de dificultad
            "estado": self.estado.to_dict()  # Incluye datos de estado
        }