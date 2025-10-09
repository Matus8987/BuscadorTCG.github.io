// Array para almacenar los paquetes creados
let paquetesCreados = [];

// Verificar usuario logueado y mostrar navbar
document.addEventListener('DOMContentLoaded', () => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    window.location.href = '../index.html';
    return;
  }
  
  const userBar = document.getElementById('userBar');
  const nameSpan = document.getElementById('currentUserName');
  if (userBar && nameSpan) {
    nameSpan.textContent = currentUser;
    userBar.style.display = 'block';
  }

  // Cargar paquetes guardados
  const paquetesGuardados = localStorage.getItem('paquetesCreados');
  if (paquetesGuardados) {
    paquetesCreados = JSON.parse(paquetesGuardados);
    actualizarInterfazPaquetes();
  } else {
    // Si no hay paquetes guardados, añadir event listener al botón inicial
    const botonInicial = document.querySelector('.btn-crear-paquete');
    if (botonInicial) {
      botonInicial.addEventListener('click', abrirModalCrearPaquete);
    }
  }
});

// Función para cerrar sesión
function logout() {
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('hasSeenWelcome');
  sessionStorage.removeItem('justLoggedIn');
  sessionStorage.removeItem('hasSeenWelcomeToday');
  window.location.href = '../index.html';
}

// Función para abrir el modal de crear paquete
function abrirModalCrearPaquete() {
  try {
    const modalElement = document.getElementById('modalCrearPaquete');
    if (modalElement) {
      const modal = getModalInstance(modalElement);
      modal.show();
    } else {
      console.error('Modal element not found');
    }
  } catch (error) {
    console.error('Error opening modal:', error);
  }
}

// --- Updated: modal helper + dismissal handlers ---
function showModalFallback(modalElement) {
	if (!modalElement) return;
	if (modalElement.classList.contains('show')) return;

	modalElement.classList.add('show');
	modalElement.style.display = 'block';
	modalElement.setAttribute('aria-hidden', 'false');

	// create backdrop if it doesn't exist
	if (!document.querySelector('.modal-backdrop')) {
		const backdrop = document.createElement('div');
		backdrop.className = 'modal-backdrop fade show';
		document.body.appendChild(backdrop);
		modalElement._backdrop = backdrop;

		// click on backdrop hides modal
		modalElement._backdropHandler = () => hideModalFallback(modalElement);
		backdrop.addEventListener('click', modalElement._backdropHandler);
	}

	// Escape key closes modal
	modalElement._escHandler = (e) => {
		if (e.key === 'Escape') hideModalFallback(modalElement);
	};
	document.addEventListener('keydown', modalElement._escHandler);

	document.body.classList.add('modal-open');
}

function hideModalFallback(modalElement) {
	if (!modalElement) return;
	if (!modalElement.classList.contains('show')) return;

	modalElement.classList.remove('show');
	modalElement.style.display = 'none';
	modalElement.setAttribute('aria-hidden', 'true');

	// remove backdrop if we created it
	if (modalElement._backdrop) {
		modalElement._backdrop.removeEventListener('click', modalElement._backdropHandler);
		modalElement._backdrop.remove();
		delete modalElement._backdropHandler;
		delete modalElement._backdrop;
	} else {
		const backdrop = document.querySelector('.modal-backdrop');
		if (backdrop) backdrop.remove();
	}

	// remove Escape handler
	if (modalElement._escHandler) {
		document.removeEventListener('keydown', modalElement._escHandler);
		delete modalElement._escHandler;
	}

	document.body.classList.remove('modal-open');
}

function getModalInstance(modalElement) {
	// If bootstrap is available use its Modal API, otherwise return a small shim
	if (window.bootstrap && window.bootstrap.Modal) {
		let instance = window.bootstrap.Modal.getInstance(modalElement);
		if (!instance) instance = new window.bootstrap.Modal(modalElement);
		return instance;
	}
	// shim with show() and hide()
	return {
		show() { showModalFallback(modalElement); },
		hide() { hideModalFallback(modalElement); }
	};
}

// Global delegation for data-bs-dismiss (works with real Bootstrap or the fallback)
// Hides the nearest ancestor modal when a dismiss element is clicked
document.addEventListener('click', (e) => {
	const dismissEl = e.target.closest('[data-bs-dismiss="modal"], [data-bs-dismiss]');
	if (!dismissEl) return;
	const modalEl = dismissEl.closest('.modal');
	if (!modalEl) return;
	const inst = getModalInstance(modalEl);
	if (inst && typeof inst.hide === 'function') inst.hide();
});
// --- End updated helpers ---

// Función para crear un nuevo paquete
function crearPaquete() {
  const form = document.getElementById('formCrearPaquete');
  
  // Validar formulario
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  // Obtener valores del formulario
  const nombre = document.getElementById('nombrePaquete').value.trim();
  const numeroCartas = parseInt(document.getElementById('numeroCartas').value);
  const rareza = document.getElementById('rarezaEspecifica').value;
  const set = document.getElementById('setEspecifico').value.trim();
  const tipo = document.getElementById('tipoPokemon').value;
  
  // Crear objeto paquete
  const nuevoPaquete = {
    id: Date.now(), // ID único basado en timestamp
    nombre: nombre,
    numeroCartas: numeroCartas,
    rareza: rareza,
    set: set,
    tipo: tipo,
    fechaCreacion: new Date().toLocaleDateString()
  };
  
  // Añadir al array de paquetes
  paquetesCreados.push(nuevoPaquete);
  
  // Guardar en localStorage
  localStorage.setItem('paquetesCreados', JSON.stringify(paquetesCreados));
  
  // Actualizar la interfaz
  actualizarInterfazPaquetes();
  
  // Limpiar formulario y cerrar modal
  form.reset();
  const modalElement = document.getElementById('modalCrearPaquete');
  const modal = getModalInstance(modalElement);
  modal.hide();
}

// Función para actualizar la interfaz con los paquetes
function actualizarInterfazPaquetes() {
  const container = document.getElementById('paquetes-container');
  
  // Limpiar contenedor
  container.innerHTML = '';
  
  // Añadir paquetes creados
  paquetesCreados.forEach(paquete => {
    const paqueteElement = crearElementoPaquete(paquete);
    container.appendChild(paqueteElement);
  });
  
  // Añadir botón para crear nuevo paquete
  const botonCrear = document.createElement('div');
  botonCrear.className = 'contenedor-crear-paquete';
  botonCrear.innerHTML = `
    <button type="button" class="btn-crear-paquete">
      <i class="bi bi-plus-lg" style="font-size: 27px;padding: 0px 10px 0px 10px;color: #ffffff;background-color: #b95c00;border-radius: 8px; margin-top: 14px; margin-bottom: 14px;"></i>
    </button>
    <h5 style="text-align: center;">Crear nuevo paquete</h5>
  `;
  
  // Añadir event listener al nuevo botón
  const nuevoBoton = botonCrear.querySelector('.btn-crear-paquete');
  nuevoBoton.addEventListener('click', abrirModalCrearPaquete);
  
  container.appendChild(botonCrear);
}

// Función para crear el elemento HTML de un paquete
function crearElementoPaquete(paquete) {
  const div = document.createElement('div');
  div.className = 'paquete-card';
  
  let detallesExtra = [];
  if (paquete.rareza) detallesExtra.push(`Rareza: ${paquete.rareza}`);
  if (paquete.set) detallesExtra.push(`Set: ${paquete.set}`);
  if (paquete.tipo) detallesExtra.push(`Tipo: ${paquete.tipo}`);
  
  div.innerHTML = `
    <div class="paquete-nombre">${paquete.nombre}</div>
    <div class="paquete-info">${paquete.numeroCartas} cartas disponibles</div>
    <div class="paquete-info">Creado: ${paquete.fechaCreacion}</div>
    ${detallesExtra.length > 0 ? `<div class="paquete-detalles">${detallesExtra.join(' • ')}</div>` : ''}
  `;
  
  return div;
}
