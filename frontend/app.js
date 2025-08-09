const API_URL = "http://localhost:5000"; // URL base de la API del backend (servidor Flask en este caso)

document.addEventListener("DOMContentLoaded", () => {
    cargarDificultades();
    cargarEstados();
    listarRetos();
    cargarDificultadesFiltro();
    cargarCategoriasFiltro();
});

// Crear reto
async function crearReto() {
    const titulo = document.getElementById("titulo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const categoriaNombre = document.getElementById("categoriaNombre").value.trim();
    const id_dificultad = document.getElementById("dificultadSelect").value;
    const id_estado = document.getElementById("estadoSelect").value;

    if (!titulo || !descripcion || !categoriaNombre || !id_dificultad || !id_estado) {
        return mostrarNotificacion("Por favor completa todos los campos", "error");
    }

    try {
        // Crear categoría si no existe
        let id_categoria;
        const resCat = await fetch(`${API_URL}/categorias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: categoriaNombre })
        });
        
        if (resCat.ok) {
            const nuevaCat = await resCat.json();
            id_categoria = nuevaCat.id_categoria;
        } else {
            const cats = await (await fetch(`${API_URL}/categorias`)).json();
            const catExistente = cats.find(c => c.nombre.toLowerCase() === categoriaNombre.toLowerCase());
            if (catExistente) {
                id_categoria = catExistente.id_categoria;
            } else {
                return mostrarNotificacion("No se pudo obtener ni crear la categoría", "error");
            }
        }

        // Crear reto
        const res = await fetch(`${API_URL}/retos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                titulo,
                descripcion,
                id_categoria,
                id_dificultad,
                id_estado
            })
        });

        if (res.ok) {
            mostrarNotificacion("Reto creado exitosamente", "success");
            document.getElementById("titulo").value = "";
            document.getElementById("descripcion").value = "";
            document.getElementById("categoriaNombre").value = "";
            listarRetos();
        } else {
            const err = await res.json();
            mostrarNotificacion(err.error || "Error creando reto", "error");
        }
    } catch (error) {
        mostrarNotificacion("Error de conexión con el servidor", "error");
        console.error("Error:", error);
    }
}

// Listar retos (sin filtros)
async function listarRetos() {
    try {
        const res = await fetch(`${API_URL}/retos`);
        if (!res.ok) throw new Error("Error al obtener retos");
        const data = await res.json();
        mostrarRetos(data);
        
        // Limpiar filtros
        document.getElementById("filtroCategoria").value = "";
        document.getElementById("filtroDificultad").value = "";
        
    } catch (error) {
        mostrarNotificacion(error.message, "error");
        console.error("Error:", error);
    }
}

// Mostrar retos en el DOM
function mostrarRetos(data) {
    const lista = document.getElementById("retosLista");
    lista.innerHTML = "";
    
    if (data.length === 0) {
        lista.innerHTML = `<div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>No hay retos disponibles. ¡Crea tu primer reto!</p>
        </div>`;
        actualizarEstadisticas(0);
        return;
    }
    
    data.forEach(r => {
        const div = document.createElement("div");
        div.classList.add("reto");
        
        // Determinar clase CSS según estado
        let estadoClass = "";
        let estadoNombre = r.estado.nombre.toLowerCase();
        
        if (estadoNombre === "pendiente") estadoClass = "estado-pendiente";
        if (estadoNombre === "en proceso") estadoClass = "estado-en-proceso";
        if (estadoNombre === "completado") estadoClass = "estado-completado";
        
        div.innerHTML = `
            <strong>${r.titulo}</strong>
            <p>${r.descripcion}</p>
            <div class="reto-meta">
                <span><i class="fas fa-tag"></i> ${r.categoria.nombre}</span>
                <span><i class="fas fa-bolt"></i> ${r.dificultad.nombre}</span>
                <span class="${estadoClass}"><i class="fas fa-circle"></i> ${r.estado.nombre}</span>
            </div>
            <div class="reto-actions">
                <select class="estado-select" onchange="cambiarEstado(${r.id_reto}, this.value)">
                    <option value="1" ${estadoNombre === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="2" ${estadoNombre === 'en proceso' ? 'selected' : ''}>En proceso</option>
                    <option value="3" ${estadoNombre === 'completado' ? 'selected' : ''}>Completado</option>
                </select>
                <button onclick="eliminarReto(${r.id_reto})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        `;
        lista.appendChild(div);
    });
    
    actualizarEstadisticas(data.length);
}

// Actualizar estadísticas
function actualizarEstadisticas(total) {
    const statsElement = document.getElementById("stats");
    if (statsElement) {
        statsElement.innerHTML = `Mostrando ${total} ${total === 1 ? 'reto' : 'retos'}`;
    }
}

// Filtrar retos por categoría y dificultad
async function filtrarRetos() {
    const categoria = document.getElementById("filtroCategoria").value.trim();
    const dificultad = document.getElementById("filtroDificultad").value;

    try {
        let url = `${API_URL}/retos?`;
        if (categoria) {
            const cats = await (await fetch(`${API_URL}/categorias`)).json();
            const catObj = cats.find(c => c.nombre.toLowerCase() === categoria.toLowerCase());
            if (catObj) url += `categoria=${catObj.id_categoria}&`;
            else {
                mostrarNotificacion("Categoría no encontrada", "error");
                return;
            }
        }
        if (dificultad) {
            url += `dificultad=${dificultad}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al filtrar retos");
        const data = await res.json();
        mostrarRetos(data);
    } catch (error) {
        mostrarNotificacion(error.message, "error");
        console.error("Error:", error);
    }
}

// Cambiar estado del reto
async function cambiarEstado(id, idEstado) {
    try {
        if (!idEstado) {
            const nuevoEstado = prompt("Nuevo estado (Pendiente, En proceso, Completado):");
            if (!nuevoEstado) return;

            const estados = await (await fetch(`${API_URL}/estados`)).json();
            const estadoObj = estados.find(e => e.nombre.toLowerCase() === nuevoEstado.toLowerCase());
            if (!estadoObj) return mostrarNotificacion("Estado inválido", "error");
            idEstado = estadoObj.id_estado;
        }

        const res = await fetch(`${API_URL}/retos/${id}/estado`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_estado: idEstado })
        });

        if (res.ok) {
            mostrarNotificacion("Estado actualizado correctamente", "success");
            listarRetos();
        } else {
            throw new Error("Error al cambiar estado");
        }
    } catch (error) {
        mostrarNotificacion(error.message, "error");
        console.error("Error:", error);
    }
}

// Eliminar reto
async function eliminarReto(id) {
    try {
        if (!confirm("¿Seguro que quieres eliminar este reto?")) return;
        
        const res = await fetch(`${API_URL}/retos/${id}`, { 
            method: "DELETE" 
        });
        
        if (res.ok) {
            mostrarNotificacion("Reto eliminado correctamente", "success");
            listarRetos();
        } else {
            throw new Error("Error al eliminar reto");
        }
    } catch (error) {
        mostrarNotificacion(error.message, "error");
        console.error("Error:", error);
    }
}

// Cargar dificultades en select
async function cargarDificultades() {
    try {
        const res = await fetch(`${API_URL}/dificultades`);
        if (!res.ok) throw new Error("Error al cargar dificultades");
        const data = await res.json();
        const select = document.getElementById("dificultadSelect");
        
        data.forEach(d => {
            select.innerHTML += `<option value="${d.id_dificultad}">${d.nombre}</option>`;
        });
    } catch (error) {
        mostrarNotificacion(error.message, "error");
        console.error("Error:", error);
    }
}

// Cargar dificultades para filtro
async function cargarDificultadesFiltro() {
    try {
        const res = await fetch(`${API_URL}/dificultades`);
        if (!res.ok) throw new Error("Error al cargar dificultades");
        const data = await res.json();
        const select = document.getElementById("filtroDificultad");
        
        data.forEach(d => {
            select.innerHTML += `<option value="${d.id_dificultad}">${d.nombre}</option>`;
        });
    } catch (error) {
        mostrarNotificacion(error.message, "error");
        console.error("Error:", error);
    }
}

// Cargar estados en select
async function cargarEstados() {
    try {
        const res = await fetch(`${API_URL}/estados`);
        if (!res.ok) throw new Error("Error al cargar estados");
        const data = await res.json();
        const select = document.getElementById("estadoSelect");
        
        data.forEach(e => {
            select.innerHTML += `<option value="${e.id_estado}">${e.nombre}</option>`;
        });
    } catch (error) {
        mostrarNotificacion(error.message, "error");
        console.error("Error:", error);
    }
}

// Cargar categorías para filtro
async function cargarCategoriasFiltro() {
    try {
        const res = await fetch(`${API_URL}/categorias`);
        if (!res.ok) throw new Error("Error al cargar categorías");
        // Podrías implementarse autocompletado
    } catch (error) {
        console.error("Error al cargar categorías:", error);
    }
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo) {
    const notification = document.createElement("div");
    notification.className = `notification ${tipo}`;
    notification.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${mensaje}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add("show");
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}