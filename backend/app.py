# Importamos las librerías necesarias
from flask import Flask, request, jsonify  # Flask para el servidor web
from flask_cors import CORS  # Para permitir peticiones entre dominios
from database import init_app, db  # Configuración de la base de datos
from models import Reto, Categoria, NivelDificultad, Estado  # Nuestros modelos de datos

# Creamos la aplicación Flask
app = Flask(__name__)
init_app(app)  # Inicializamos la base de datos
CORS(app)  # Habilitamos CORS para el frontend

# Ruta principal - Solo para verificar que el API funciona
@app.route("/", methods=["GET"])
def home():
    return jsonify({"mensaje": "API de Retos corriendo correctamente"}), 200

# Crear un nuevo reto
@app.route("/retos", methods=["POST"])
def crear_reto():
    # Obtenemos los datos del cuerpo de la petición
    data = request.get_json() or {}
    
    # Validamos que tengamos todos los campos requeridos
    required = ["titulo", "descripcion", "id_categoria", "id_dificultad"]
    for k in required:
        if not data.get(k):
            return jsonify({"error": f"{k} es requerido"}), 400

    # Verificamos que la dificultad sea válida
    dificultad = NivelDificultad.query.get(data["id_dificultad"])
    if not dificultad or dificultad.nombre not in ["Bajo", "Medio", "Alto"]:
        return jsonify({"error": "Dificultad inválida"}), 400

    # Si no se especifica estado, usamos "Pendiente" por defecto
    if not data.get("id_estado"):
        pendiente = Estado.query.filter_by(nombre="Pendiente").first()
        data["id_estado"] = pendiente.id_estado if pendiente else None

    # Validamos que el estado sea correcto
    estado_obj = Estado.query.get(data["id_estado"])
    if not estado_obj or estado_obj.nombre not in ["Pendiente", "En proceso", "Completado"]:
        return jsonify({"error": "Estado inválido"}), 400

    # Creamos el nuevo reto en la base de datos
    nuevo = Reto(
        titulo=data["titulo"],
        descripcion=data["descripcion"],
        id_categoria=data["id_categoria"],
        id_dificultad=data["id_dificultad"],
        id_estado=data["id_estado"]
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify(nuevo.to_dict()), 201  # Devolvemos el reto creado

# Obtener lista de retos (con filtros opcionales)
@app.route("/retos", methods=["GET"])
def listar_retos():
    # Obtenemos parámetros de filtro si existen
    categoria_id = request.args.get("categoria", type=int)
    dificultad_id = request.args.get("dificultad", type=int)

    # Preparamos la consulta base
    query = Reto.query
    
    # Aplicamos filtros si fueron proporcionados
    if categoria_id:
        query = query.filter_by(id_categoria=categoria_id)
    if dificultad_id:
        query = query.filter_by(id_dificultad=dificultad_id)

    # Ejecutamos la consulta y devolvemos resultados
    retos = query.all()
    return jsonify([r.to_dict() for r in retos])

# Obtener todas las categorías
@app.route("/categorias", methods=["GET"])
def listar_categorias():
    categorias = Categoria.query.all()
    return jsonify([c.to_dict() for c in categorias])

# Obtener todos los niveles de dificultad
@app.route("/dificultades", methods=["GET"])
def listar_dificultades():
    dificultades = NivelDificultad.query.all()
    return jsonify([d.to_dict() for d in dificultades])

# Obtener todos los estados posibles
@app.route("/estados", methods=["GET"])
def listar_estados():
    estados = Estado.query.all()
    return jsonify([e.to_dict() for e in estados])

# Actualizar el estado de un reto específico
@app.route("/retos/<int:id_reto>/estado", methods=["PATCH"])
def actualizar_estado(id_reto):
    data = request.get_json() or {}
    nuevo_estado_id = data.get("id_estado")

    # Validamos que nos hayan enviado el nuevo estado
    if not nuevo_estado_id:
        return jsonify({"error": "id_estado es requerido"}), 400

    # Buscamos el reto a actualizar
    reto = Reto.query.get(id_reto)
    if not reto:
        return jsonify({"error": "Reto no encontrado"}), 404

    # Verificamos que el nuevo estado exista
    estado_obj = Estado.query.get(nuevo_estado_id)
    if not estado_obj:
        return jsonify({"error": "Estado inválido"}), 400

    # Actualizamos y guardamos
    reto.id_estado = nuevo_estado_id
    db.session.commit()
    return jsonify(reto.to_dict())

# Eliminar un reto
@app.route("/retos/<int:id_reto>", methods=["DELETE"])
def eliminar_reto(id_reto):
    # Buscamos el reto
    reto = Reto.query.get(id_reto)
    if not reto:
        return jsonify({"error": "Reto no encontrado"}), 404

    # Lo eliminamos y guardamos cambios
    db.session.delete(reto)
    db.session.commit()
    return jsonify({"mensaje": f"Reto {id_reto} eliminado correctamente"})

# Crear una nueva categoría
@app.route("/categorias", methods=["POST"])
def crear_categoria():
    data = request.get_json() or {}
    nombre = data.get("nombre")
    
    # Validamos que nos hayan enviado el nombre
    if not nombre:
        return jsonify({"error": "nombre es requerido"}), 400
    
    # Verificamos que no exista ya esa categoría
    if Categoria.query.filter_by(nombre=nombre).first():
        return jsonify({"error": "La categoría ya existe"}), 400
    
    # Creamos y guardamos la nueva categoría
    nueva = Categoria(nombre=nombre)
    db.session.add(nueva)
    db.session.commit()
    return jsonify(nueva.to_dict()), 201

# Iniciamos la aplicación si se ejecuta este archivo directamente
if __name__ == "__main__":
    app.run(debug=True)  # debug=True para desarrollo