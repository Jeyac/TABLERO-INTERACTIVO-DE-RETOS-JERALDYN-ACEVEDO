const API_URL = "http://localhost:5000";
let todosLosRetos = [];
let retosFiltrados = [];

document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        cargarDificultadesFiltro(),
        cargarCategorias(),
        cargarRetosIniciales()
    ]);
});

async function cargarRetosIniciales() {
    try {
        const response = await fetch(`${API_URL}/retos`);
        if (!response.ok) throw new Error("Error al cargar retos");
        todosLosRetos = await response.json();
        retosFiltrados = [...todosLosRetos];
        mostrarRetos();
    } catch (error) {
        mostrarNotificacion(error.message, "error");
        console.error("Error:", error);
    }
}

async function cargarCategorias() {
    try {
        const response = await fetch(`${API_URL}/categorias`);
        if (!response.ok) throw new Error("Error al cargar categorías");
        const categorias = await response.json();
        
        const datalist = document.getElementById("categoriasList");
        datalist.innerHTML = categorias.map(c => 
            `<option value="${c.nombre}">${c.nombre}</option>`
        ).join("");
    } catch (error) {
        console.error("Error:", error);
    }
}

async function cargarDificultadesFiltro() {
    try {
        const response = await fetch(`${API_URL}/dificultades`);
        if (!response.ok) throw new Error("Error al cargar dificultades");
        const dificultades = await response.json();
        
        const select = document.getElementById("filtroDificultad");
        select.innerHTML = '<option value="">Todas las dificultades</option>' + 
            dificultades.map(d => `<option value="${d.id_dificultad}">${d.nombre}</option>`).join("");
    } catch (error) {
        console.error("Error:", error);
    }
}

function mostrarRetos() {
    const lista = document.getElementById("retosLista");
    lista.innerHTML = "";

    if (retosFiltrados.length === 0) {
        lista.innerHTML = `<div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>No hay retos disponibles.</p>
        </div>`;
        document.getElementById("totalRetos").textContent = "0";
        return;
    }

    document.getElementById("totalRetos").textContent = retosFiltrados.length;

    retosFiltrados.forEach(reto => {
        const estadoNombre = reto.estado.nombre.toLowerCase();
        const estadoClass = `estado-${estadoNombre.replace(" ", "-")}`;
        
        const retoElement = document.createElement("div");
        retoElement.className = "reto";
        retoElement.dataset.id = reto.id_reto;
        retoElement.innerHTML = `
            <div class="reto-header">
                <h3>${reto.titulo}</h3>
            </div>
            <p>${reto.descripcion}</p>
            <div class="reto-meta">
                <span><i class="fas fa-tag"></i> ${reto.categoria.nombre}</span>
                <span><i class="fas fa-bolt"></i> ${reto.dificultad.nombre}</span>
                <span class="${estadoClass}" id="estado-${reto.id_reto}">
                    <i class="fas fa-circle"></i> ${reto.estado.nombre}
                </span>
            </div>
            <div class="reto-actions">
                <select class="estado-select" onchange="cambiarEstado(${reto.id_reto}, this.value)">
                    <option value="1" ${reto.estado.id_estado === 1 ? 'selected' : ''}>Pendiente</option>
                    <option value="2" ${reto.estado.id_estado === 2 ? 'selected' : ''}>En proceso</option>
                    <option value="3" ${reto.estado.id_estado === 3 ? 'selected' : ''}>Completado</option>
                </select>
                <button class="btn-eliminar" onclick="eliminarReto(${reto.id_reto})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        `;
        lista.appendChild(retoElement);
    });
}

async function cambiarEstado(id, idEstado) {
    try {
        // Actualización optimista (cambia primero la interfaz)
        const estadoElement = document.getElementById(`estado-${id}`);
        if (estadoElement) {
            const nuevoEstado = idEstado === "1" ? "Pendiente" : 
                              idEstado === "2" ? "En proceso" : "Completado";
            estadoElement.className = `estado-${nuevoEstado.toLowerCase().replace(" ", "-")}`;
            estadoElement.innerHTML = `<i class="fas fa-circle"></i> ${nuevoEstado}`;
        }

        // Actualización en el servidor
        const response = await fetch(`${API_URL}/retos/${id}/estado`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_estado: idEstado })
        });

        if (!response.ok) throw new Error("Error al cambiar estado");

        // Actualizar datos locales
        const reto = todosLosRetos.find(r => r.id_reto === id);
        if (reto) {
            reto.estado.id_estado = parseInt(idEstado);
            reto.estado.nombre = idEstado === "1" ? "Pendiente" : 
                                 idEstado === "2" ? "En proceso" : "Completado";
        }

    } catch (error) {
        mostrarNotificacion(error.message, "error");
        console.error("Error:", error);
        // Recargar para sincronizar
        cargarRetosIniciales();
    }
}

async function eliminarReto(id) {
    if (!confirm("¿Seguro que quieres eliminar este reto?")) return;

    try {
        const retoElement = document.querySelector(`.reto[data-id="${id}"]`);
        if (retoElement) {
            retoElement.style.opacity = "0.5";
            retoElement.querySelector(".btn-eliminar").disabled = true;
        }

        const response = await fetch(`${API_URL}/retos/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("Error al eliminar reto");

        // Eliminar localmente
        todosLosRetos = todosLosRetos.filter(r => r.id_reto !== id);
        retosFiltrados = retosFiltrados.filter(r => r.id_reto !== id);
        
        if (retoElement) {
            retoElement.remove();
            document.getElementById("totalRetos").textContent = retosFiltrados.length;
        }

        mostrarNotificacion("Reto eliminado correctamente", "success");

    } catch (error) {
        mostrarNotificacion(error.message, "error");
        console.error("Error:", error);
    }
}

function filtrarRetos() {
    const categoria = document.getElementById("filtroCategoria").value.trim().toLowerCase();
    const dificultad = document.getElementById("filtroDificultad").value;

    retosFiltrados = todosLosRetos.filter(reto => {
        const cumpleCategoria = !categoria || 
            reto.categoria.nombre.toLowerCase().includes(categoria);
        const cumpleDificultad = !dificultad || 
            reto.dificultad.id_dificultad.toString() === dificultad;
        
        return cumpleCategoria && cumpleDificultad;
    });

    mostrarRetos();
}

function resetearFiltros() {
    document.getElementById("filtroCategoria").value = "";
    document.getElementById("filtroDificultad").value = "";
    retosFiltrados = [...todosLosRetos];
    mostrarRetos();
}

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
        notification.remove();
    }, 3000);
}
