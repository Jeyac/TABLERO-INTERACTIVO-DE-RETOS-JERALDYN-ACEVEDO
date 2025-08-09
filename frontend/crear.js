const API_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
    cargarDificultades();
    cargarEstados();
});

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
        // Crear categoría si no existe.
        let id_categoria;
        const resCat = await fetch(`${API_URL}/categorias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: categoriaNombre }),
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
                id_estado,
            }),
        });

        if (res.ok) {
            mostrarNotificacion("Reto creado exitosamente", "success");
            // Limpiar formulario
            document.getElementById("titulo").value = "";
            document.getElementById("descripcion").value = "";
            document.getElementById("categoriaNombre").value = "";
            document.getElementById("dificultadSelect").value = "";
            document.getElementById("estadoSelect").value = "";
        } else {
            const err = await res.json();
            mostrarNotificacion(err.error || "Error creando reto", "error");
        }
    } catch (error) {
        mostrarNotificacion("Error de conexión con el servidor", "error");
        console.error(error);
    }
}

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
        console.error(error);
    }
}

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
        console.error(error);
    }
}

function mostrarNotificacion(mensaje, tipo) {
    const notification = document.createElement("div");
    notification.className = `notification ${tipo}`;
    notification.innerHTML = `
        <i class="fas fa-${tipo === "success" ? "check-circle" : "exclamation-circle"}"></i>
        ${mensaje}
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add("show"), 10);
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}
