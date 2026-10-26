// ==========================================
// 1. CLASE TAREA (POO)
// Representa la estructura individual de cada tarea.
// ==========================================
class Tarea {
    constructor(id, nombre, completa = false) {
        this.id = id;               // Identificador único basado en marca de tiempo
        this.nombre = nombre;       // Contenido o texto de la tarea
        this.completa = completa;   // Estado de la tarea (true o false)
    }

    // Método para alternar el estado de completado
    completar() {
        this.completa = !this.completa;
    }
}

// ==========================================
// 2. CLASE GESTOR DE TAREAS (POO)
// Administra la colección de tareas y operaciones sobre ellas.
// ==========================================
class GestorDeTareas {
    constructor() {
        this.tareas = [];           // Arreglo que almacena las instancias de Tarea
        this.cargarLocalStorage();  // Carga las tareas guardadas previamente al iniciar
    }

    // Agrega una nueva tarea a la lista
    agregarTarea(nombre) {
        const nueva = new Tarea(Date.now(), nombre);
        this.tareas.push(nueva);
        this.sincronizarYRenderizar();
    }

    // Elimina una tarea filtrando por su ID único
    eliminarTarea(id) {
        this.tareas = this.tareas.filter(t => t.id !== Number(id));
        this.sincronizarYRenderizar();
    }

    // Cambia el estado (completa / incompleta) de una tarea específica
    toggleCompletar(id) {
        const tarea = this.tareas.find(t => t.id === Number(id));
        if (tarea) {
            tarea.completar();
            this.sincronizarYRenderizar();
        }
    }

    // Edita el texto de una tarea existente
    editarTarea(id, nuevoNombre) {
        const tarea = this.tareas.find(t => t.id === Number(id));
        if (tarea && nuevoNombre.trim() !== "") {
            tarea.nombre = nuevoNombre.trim();
            this.sincronizarYRenderizar();
        }
    }

    // Guarda el arreglo de tareas en el navegador usando LocalStorage (JSON.stringify)
    guardarLocalStorage() {
        localStorage.setItem('tareas', JSON.stringify(this.tareas));
    }

    // Recupera y reconstruye los objetos desde LocalStorage (JSON.parse)
    cargarLocalStorage() {
        const datos = localStorage.getItem('tareas');
        if (datos) {
            const parsed = JSON.parse(datos);
            // Mapeamos los datos para reinstanciarlos como objetos de la clase Tarea y conservar sus métodos
            this.tareas = parsed.map(t => new Tarea(t.id, t.nombre, t.completa));
        }
    }

    // Actualiza la persistencia y vuelve a pintar la interfaz
    sincronizarYRenderizar() {
        this.guardarLocalStorage();
        this.render();
    }

    // Renderiza la lista de tareas en el DOM de manera dinámica
    render() {
        const listaUl = document.getElementById('lista-tareas');
        listaUl.innerHTML = '';

        // Uso de forEach (Característica de ES6+) para iterar sobre las tareas
        this.tareas.forEach(tarea => {
            const li = document.createElement('li');
            li.className = tarea.completa ? 'completada' : '';
            
            // Uso de template literals (``) para generar el contenido HTML dinámicamente
            li.innerHTML = `
                <span data-accion="toggle" data-id="${tarea.id}">${tarea.nombre}</span>
                <div class="acciones">
                    <button class="btn-editar" data-accion="editar" data-id="${tarea.id}">Editar</button>
                    <button class="btn-eliminar" data-accion="eliminar" data-id="${tarea.id}">Eliminar</button>
                </div>
            `;
            listaUl.appendChild(li);
        });
    }
}

// ==========================================
// 3. INICIALIZACIÓN Y MANEJO DE EVENTOS
// ==========================================
const gestor = new GestorDeTareas();

const inputTarea = document.getElementById('nueva-tarea');
const btnAgregar = document.getElementById('agregar-tarea');
const errorMsg = document.getElementById('error-msg');

// Evento click para agregar tarea con validación de entradas vacías
btnAgregar.addEventListener('click', (e) => {
    e.preventDefault();
    const texto = inputTarea.value.trim();

    // Validación: si el campo está vacío, muestra un mensaje de error y detiene la ejecución
    if (texto === "") {
        errorMsg.classList.add('error-visible');
        return;
    }

    errorMsg.classList.remove('error-visible');
    gestor.agregarTarea(texto);
    inputTarea.value = "";
    inputTarea.focus();
});

// Delegación de eventos en la lista (permite manejar clics en elementos creados dinámicamente)
document.getElementById('lista-tareas').addEventListener('click', (e) => {
    const accion = e.target.getAttribute('data-accion');
    const id = e.target.getAttribute('data-id');

    if (!accion || !id) return;

    if (accion === 'eliminar') {
        gestor.eliminarTarea(id);
    } else if (accion === 'toggle') {
        gestor.toggleCompletar(id);
    } else if (accion === 'editar') {
        const tareaActual = gestor.tareas.find(t => t.id === Number(id));
        const nuevoTexto = prompt("Edita el nombre de tu tarea:", tareaActual ? tareaActual.nombre : "");
        if (nuevoTexto !== null) {
            gestor.editarTarea(id, nuevoTexto);
        }
    }
});

// Render inicial al cargar el script en el navegador
gestor.render();