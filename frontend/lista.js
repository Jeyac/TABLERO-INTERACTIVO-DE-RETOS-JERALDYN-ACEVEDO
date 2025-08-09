const API_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
    cargarDificultades();
    cargarEstados();
    listarRetos();
    cargarDificultadesFiltro();
    // Para filtro de categorías, podrías implementar autocompletado en el futuro
});

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
        console.error(error);
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
        console.error(error);
    }
}

// Cargar dificultades en select
async function cargarDificultades() {
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
        console.error(error);
    }
}

// Cargar estados (aunque no se usan aquí, está para posible futura expansión)
async function cargarEstados() {
    try {
        const res = await fetch(`${API_URL}/estados`);
        if (!res.ok) throw new Error("Error al cargar estados");
        // Si quieres, puedes cargar aquí o quitar esta función
    } catch (error) {
        console.error(error);
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

    setTimeout(() => notification.classList.add("show"), 10);
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}
