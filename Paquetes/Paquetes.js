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
      // Añadir animación de entrada
      modalElement.classList.add('fade');
      const modal = getModalInstance(modalElement);
      modal.show();
      
      // Después de mostrar el modal, activar la animación
      setTimeout(() => {
        modalElement.classList.add('show');
      }, 10);
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
  
  // Crear objeto paquete vacío
  const nuevoPaquete = {
    id: Date.now(), // ID único basado en timestamp
    nombre: nombre,
    numeroCartas: numeroCartas,
    rareza: rareza,
    set: set,
    tipo: tipo,
    fechaCreacion: new Date().toLocaleDateString(),
    cartas: [] // Inicializar como array vacío
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
  
  // Añadir botón para crear nuevo paquete (usando data-translate para la parte estática)
  const botonCrear = document.createElement('div');
  // Mantener la misma estructura y centrado que el bloque estático en el HTML
  botonCrear.className = 'contenedor-crear-paquete d-flex justify-content-center align-items-center flex-column';
  botonCrear.innerHTML = `
    <button type="button" class="btn-crear-paquete" aria-label="Crear paquete">
      <i class="bi bi-plus-lg" style="font-size: 27px;padding: 0px 10px 0px 10px;background-color: #b95c00;border-radius: 8px; margin-top: 14px; margin-bottom: 14px; color: #ffffff;"></i>
    </button>
    <h5 style="text-align: center;" data-translate="packs.create">Nuevo Paquete</h5>
  `;
  
  // Añadir event listener al nuevo botón
  const nuevoBoton = botonCrear.querySelector('.btn-crear-paquete');
  nuevoBoton.addEventListener('click', abrirModalCrearPaquete);
  
  container.appendChild(botonCrear);

  // Aplicar traducciones a los elementos añadidos dinámicamente
  const lang = localStorage.getItem('selectedLanguage') || document.documentElement.lang || 'es';
  if (typeof updateTranslations === 'function') updateTranslations(lang);
}

// Función para crear el elemento HTML de un paquete
function crearElementoPaquete(paquete) {
  const div = document.createElement('div');
  div.className = 'paquete-card';
  div.dataset.paqueteId = paquete.id; // permitir referencia al paquete

  let detallesExtra = [];
  if (paquete.rareza) detallesExtra.push(`<span data-translate="paquete.rareza">Rareza:</span> ${paquete.rareza}`);
  if (paquete.set) detallesExtra.push(`<span data-translate="paquete.set">Set:</span> ${paquete.set}`);
  if (paquete.tipo) detallesExtra.push(`<span data-translate="paquete.tipo">Tipo:</span> ${paquete.tipo}`);

  div.innerHTML = `
    <div class="paquete-nombre">${paquete.nombre}</div>
    <div class="paquete-info"><span class="paquete-numero-cartas">${paquete.numeroCartas}</span> <span data-translate="paquete.cardsAvailable">cartas disponibles</span></div>
    <div class="paquete-info"><span data-translate="paquete.created">Creado:</span> <span class="paquete-fecha">${paquete.fechaCreacion}</span></div>
    ${detallesExtra.length > 0 ? `<div class="paquete-detalles">${detallesExtra.join(' • ')}</div>` : ''}
    <br>
    <div class="paquete-botones">
      <button class="btn-editar-paquete" data-translate-title="paquete.edit" title="Editar paquete">
        <i class="bi bi-pencil-square" style="font-size: 20px;padding: 0px 10px 0px 10px;color: #ffffff;background-color: #0300b9ff;border-radius: 8px; margin-top: 14px; margin-bottom: 14px;"></i>
      </button>
      <button class="btn-eliminar-paquete" data-translate-title="paquete.delete" title="Eliminar paquete">
        <i class="bi bi-trash" style="font-size: 20px;padding: 0px 10px 0px 10px;color: #ffffff;background-color: #b90000ff;border-radius: 8px; margin-top: 14px; margin-bottom: 14px;"></i>
      </button>
    </div>
  `;

  // Al hacer click en la tarjeta (pero no en los botones), abrir el modal con las cartas
  div.addEventListener('click', (e) => {
    // Verificar si el click fue en un botón de acción
    if (e.target.closest('.btn-editar-paquete') || e.target.closest('.btn-eliminar-paquete')) {
      return; // No abrir el modal si se clickeó un botón
    }
    abrirModalDetallesPaquete(Number(div.dataset.paqueteId));
  });

  // Event listener para botón de editar
  const btnEditar = div.querySelector('.btn-editar-paquete');
  btnEditar.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevenir que se abra el modal de detalles
    editarPaquete(Number(div.dataset.paqueteId));
  });

  // Event listener para botón de eliminar
  const btnEliminar = div.querySelector('.btn-eliminar-paquete');
  btnEliminar.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevenir que se abra el modal de detalles
    eliminarPaquete(Number(div.dataset.paqueteId));
  });

  // Aplicar traducciones a los elementos creados (si el traductor ya está cargado)
  const lang = localStorage.getItem('selectedLanguage') || document.documentElement.lang || 'es';
  if (typeof updateTranslations === 'function') updateTranslations(lang);

  return div;
}

// Nueva función para editar un paquete (actualizada para usar claves traducibles)
function editarPaquete(paqueteId) {
  const paquete = paquetesCreados.find(p => p.id === paqueteId);
  if (!paquete) {
    // usar alerta traducida si está disponible
    if (typeof translatedAlert === 'function') translatedAlert('alert.pack.error');
    else alert('Paquete no encontrado');
    return;
  }

  // Llenar el formulario con los datos del paquete
  document.getElementById('nombrePaquete').value = paquete.nombre;
  document.getElementById('numeroCartas').value = paquete.numeroCartas;
  document.getElementById('rarezaEspecifica').value = paquete.rareza || '';
  document.getElementById('setEspecifico').value = paquete.set || '';
  document.getElementById('tipoPokemon').value = paquete.tipo || '';

  // Cambiar el título del modal a clave traducible
  const modalTitle = document.getElementById('modalCrearPaqueteLabel');
  modalTitle.setAttribute('data-translate', 'modal.create.editTitle');

  // Cambiar el texto del botón a clave traducible y asignar handler
  const btnCrear = document.querySelector('#modalCrearPaquete .btn-warning');
  btnCrear.setAttribute('data-translate', 'modal.create.saveChanges');
  btnCrear.onclick = () => guardarCambiosPaquete(paqueteId);

  // Aplicar traducciones y abrir el modal
  const lang = localStorage.getItem('selectedLanguage') || document.documentElement.lang || 'es';
  if (typeof updateTranslations === 'function') updateTranslations(lang);

  abrirModalCrearPaquete();
}

// Nueva función para guardar cambios de un paquete editado
function guardarCambiosPaquete(paqueteId) {
  const form = document.getElementById('formCrearPaquete');
  
  // Validar formulario
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Encontrar el paquete
  const paqueteIndex = paquetesCreados.findIndex(p => p.id === paqueteId);
  if (paqueteIndex === -1) {
    alert('Paquete no encontrado');
    return;
  }

  // Actualizar los datos del paquete
  const paquete = paquetesCreados[paqueteIndex];
  paquete.nombre = document.getElementById('nombrePaquete').value.trim();
  paquete.numeroCartas = parseInt(document.getElementById('numeroCartas').value);
  paquete.rareza = document.getElementById('rarezaEspecifica').value;
  paquete.set = document.getElementById('setEspecifico').value.trim();
  paquete.tipo = document.getElementById('tipoPokemon').value;

  // Guardar en localStorage
  localStorage.setItem('paquetesCreados', JSON.stringify(paquetesCreados));

  // Actualizar la interfaz
  actualizarInterfazPaquetes();

  // Restaurar el modal a su estado original
  restaurarModalCrear();

  // Cerrar modal
  const modalElement = document.getElementById('modalCrearPaquete');
  const modal = getModalInstance(modalElement);
  modal.hide();
}

// Nueva función para eliminar un paquete
function eliminarPaquete(paqueteId) {
  const paquete = paquetesCreados.find(p => p.id === paqueteId);
  if (!paquete) {
    alert('Paquete no encontrado');
    return;
  }

  // Confirmar eliminación
  if (confirm(`¿Estás seguro de que quieres eliminar el paquete "${paquete.nombre}"? Esta acción no se puede deshacer.`)) {
    // Eliminar del array
    paquetesCreados = paquetesCreados.filter(p => p.id !== paqueteId);
    
    // Guardar en localStorage
    localStorage.setItem('paquetesCreados', JSON.stringify(paquetesCreados));
    
    // Actualizar la interfaz
    actualizarInterfazPaquetes();
  }
}

// Nueva función para restaurar el modal de crear a su estado original (usando claves)
function restaurarModalCrear() {
  const modalTitle = document.getElementById('modalCrearPaqueteLabel');
  modalTitle.setAttribute('data-translate', 'modal.create.title');
  const btnCrear = document.querySelector('#modalCrearPaquete .btn-warning');
  btnCrear.setAttribute('data-translate', 'modal.create.button');
  btnCrear.onclick = crearPaquete;
  
  // Limpiar formulario
  document.getElementById('formCrearPaquete').reset();

  // Reaplicar traducciones
  const lang = localStorage.getItem('selectedLanguage') || document.documentElement.lang || 'es';
  if (typeof updateTranslations === 'function') updateTranslations(lang);
}

// Nueva función para configurar la navegación manual del carousel
function configurarNavegacionCarousel(carouselElement, totalCartas) {
  let currentSlide = 0;
  let isTransitioning = false;
  
  const prevButton = carouselElement.querySelector('.carousel-control-prev');
  const nextButton = carouselElement.querySelector('.carousel-control-next');
  const slides = carouselElement.querySelectorAll('.carousel-item');
  
  // Función para mostrar slide específico with animación
  function showSlide(slideIndex, direction = 'next') {
    if (isTransitioning) return;
    isTransitioning = true;
    
    const currentSlideElement = slides[currentSlide];
    const nextSlideElement = slides[slideIndex];
    
    // Añadir clases de animación de salida
    if (direction === 'next') {
      currentSlideElement.classList.add('slide-out-left');
      nextSlideElement.classList.add('slide-in-right');
    } else {
      currentSlideElement.classList.add('slide-out-right');
      nextSlideElement.classList.add('slide-in-left');
    }
    
    // Después de la animación de salida
    setTimeout(() => {
      // Remover active del slide actual
      currentSlideElement.classList.remove('active', 'slide-out-left', 'slide-out-right');
      
      // Activar nuevo slide
      nextSlideElement.classList.add('active');
      
      // Después de que termine la animación de entrada
      setTimeout(() => {
        nextSlideElement.classList.remove('slide-in-left', 'slide-in-right');
        isTransitioning = false;
      }, 600);
      
    }, 400);
    
    currentSlide = slideIndex;
  }
  
  // Remover event listeners anteriores si existen
  if (prevButton._clickHandler) {
    prevButton.removeEventListener('click', prevButton._clickHandler);
  }
  if (nextButton._clickHandler) {
    nextButton.removeEventListener('click', nextButton._clickHandler);
  }
  
  // Event listener para botón anterior
  prevButton._clickHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTransitioning) return;
    
    const newIndex = currentSlide > 0 ? currentSlide - 1 : totalCartas - 1;
    showSlide(newIndex, 'prev');
  };
  
  // Event listener para botón siguiente
  nextButton._clickHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTransitioning) return;
    
    const newIndex = currentSlide < totalCartas - 1 ? currentSlide + 1 : 0;
    showSlide(newIndex, 'next');
  };
  
  prevButton.addEventListener('click', prevButton._clickHandler);
  nextButton.addEventListener('click', nextButton._clickHandler);
  
  // Navegación con teclado
  const keydownHandler = function(e) {
    if (carouselElement.closest('.modal.show')) {
      if (e.key === 'ArrowLeft') {
        prevButton._clickHandler(e);
      } else if (e.key === 'ArrowRight') {
        nextButton._clickHandler(e);
      }
    }
  };
  
  document.addEventListener('keydown', keydownHandler);
  
  // Guardar referencia para poder limpiar después
  carouselElement._keydownHandler = keydownHandler;
}

// Nueva función: abre y rellena el modal de detalles de paquete
function abrirModalDetallesPaquete(paqueteId) {
  const paquete = paquetesCreados.find(p => p.id === paqueteId);
  const modalElement = document.getElementById('modalDetallesPaquete');
  const tituloEl = modalElement.querySelector('#modalDetallesPaqueteLabel');
  const descripcionEl = modalElement.querySelector('#descripcionPaquete');
  const carouselInner = modalElement.querySelector('#carouselCartasInner');
  const mensajeNoCartas = modalElement.querySelector('#mensajeNoCartas');
  const carouselElement = modalElement.querySelector('#carouselCartasPaquete');

  // Limpiar carousel y event listeners previos
  carouselInner.innerHTML = '';
  if (carouselElement._keydownHandler) {
    document.removeEventListener('keydown', carouselElement._keydownHandler);
  }

  if (!paquete) {
    tituloEl.textContent = 'Paquete no encontrado';
    descripcionEl.textContent = '';
    carouselElement.style.display = 'none';
    mensajeNoCartas.style.display = 'block';
    mensajeNoCartas.innerHTML = '<p>No se encontró información de este paquete.</p>';
    
    // Añadir animación y mostrar modal
    modalElement.classList.add('fade');
    const modal = getModalInstance(modalElement);
    modal.show();
    setTimeout(() => modalElement.classList.add('show'), 50);
    return;
  }

  // Título y descripción breve
  tituloEl.textContent = `Cartas de: ${paquete.nombre}`;
  const cartasActuales = paquete.cartas ? paquete.cartas.length : 0;
  descripcionEl.textContent = `Creado: ${paquete.fechaCreacion} • ${cartasActuales}/${paquete.numeroCartas} cartas agregadas`;

  // Obtener cartas del paquete (pueden estar vacías)
  const cartas = paquete.cartas || [];

  if (cartas.length === 0) {
    carouselElement.style.display = 'none';
    mensajeNoCartas.style.display = 'block';
    mensajeNoCartas.innerHTML = `
      <div class="text-center">
        <i class="bi bi-folder-plus" style="font-size: 3rem; color: #bb5d00; margin-bottom: 15px;"></i>
        <h5>Paquete vacío</h5>
        <p>Este paquete aún no tiene cartas agregadas.</p>
        <p class="small text-muted">Puedes agregar cartas desde la sección de cartas del buscador.</p>
      </div>
    `;
  } else {
    carouselElement.style.display = 'block';
    mensajeNoCartas.style.display = 'none';

    // Crear slides del carousel - cada carta en su propio slide
    cartas.forEach((carta, index) => {
      const carouselItem = document.createElement('div');
      carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
      
      const cartaHTML = crearHTMLCarta(carta);
      carouselItem.innerHTML = cartaHTML;
      
      carouselInner.appendChild(carouselItem);
    });

    // Configurar navegación manual del carousel
    configurarNavegacionCarousel(carouselElement, cartas.length);
  }

  // Añadir animación y mostrar modal
  modalElement.classList.add('fade');
  const modal = getModalInstance(modalElement);
  modal.show();
  setTimeout(() => modalElement.classList.add('show'), 50);
}

// Función auxiliar para crear el HTML de una carta
function crearHTMLCarta(carta) {
  // Manejar diferentes formatos de carta
  let nombre = 'Carta sin nombre';
  let imagen = '../Imagenes/carta-placeholder.png';
  let tipo = '';
  let rareza = '';
  let set = '';
  let precio = '';
  let hp = '';

  if (typeof carta === 'string') {
    nombre = carta;
  } else if (carta && typeof carta === 'object') {
    nombre = carta.name || carta.title || carta.nombre || 'Carta sin nombre';
    imagen = carta.images?.small || carta.image || carta.imagen || '../Imagenes/carta-placeholder.png';
    tipo = carta.types ? carta.types.join(', ') : (carta.tipo || '');
    rareza = carta.rarity || carta.rareza || '';
    set = carta.set?.name || carta.set || '';
    precio = carta.cardmarket?.prices?.averageSellPrice ? 
             `$${carta.cardmarket.prices.averageSellPrice}` : 
             (carta.precio || '');
    hp = carta.hp || '';
  }

  return `
    <div class="carta-contenido">
      <img src="${imagen}" alt="${nombre}" class="carta-imagen" 
           onerror="this.src='../Imagenes/carta-placeholder.png'">
      <div class="carta-info">
        <h3 class="carta-nombre">${nombre}</h3>
        ${hp ? `<div class="carta-detalle">
          <span class="carta-detalle-label">HP:</span>
          <span class="carta-detalle-valor">${hp}</span>
        </div>` : ''}
        ${tipo ? `<div class="carta-detalle">
          <span class="carta-detalle-label">Tipo:</span>
          <span class="carta-detalle-valor">${tipo}</span>
        </div>` : ''}
        ${rareza ? `<div class="carta-detalle">
          <span class="carta-detalle-label">Rareza:</span>
          <span class="carta-detalle-valor">${rareza}</span>
        </div>` : ''}
        <div class="carta-detalle carta-detalle-set">
          <div class="carta-set-info">
            <span class="carta-detalle-label">Set:</span>
            <span class="carta-detalle-valor">${set}</span>
          </div>
        </div>
        ${precio ? `<div class="carta-detalle">
          <span class="carta-detalle-label">Precio:</span>
          <span class="carta-detalle-valor">${precio}</span>
        </div>` : ''}
        <button type="button" class="btn btn-danger btn-sm" onclick="eliminarCartaDePaquete('${carta.id || carta.name}')" title="Eliminar carta del paquete">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `;
}

// Nueva función para eliminar carta de un paquete
function eliminarCartaDePaquete(cartaId) {
  // Obtener el paquete actualmente mostrado en el modal
  const modalElement = document.getElementById('modalDetallesPaquete');
  const tituloEl = modalElement.querySelector('#modalDetallesPaqueteLabel');
  const tituloTexto = tituloEl.textContent;
  
  // Extraer el nombre del paquete del título
  const nombrePaquete = tituloTexto.replace('Cartas de: ', '');
  
  // Buscar el paquete en el array
  const paquete = paquetesCreados.find(p => p.nombre === nombrePaquete);
  if (!paquete) {
    alert('No se pudo encontrar el paquete');
    return;
  }
  
  // Confirmar eliminación
  if (!confirm('¿Estás seguro de que quieres eliminar esta carta del paquete?')) {
    return;
  }
  
  // Eliminar la carta del paquete
  if (paquete.cartas) {
    paquete.cartas = paquete.cartas.filter(carta => {
      const id = carta.id || carta.name;
      return id !== cartaId;
    });
  }
  
  // Guardar cambios en localStorage
  localStorage.setItem('paquetesCreados', JSON.stringify(paquetesCreados));
  
  // Actualizar la interfaz de paquetes
  actualizarInterfazPaquetes();
  
  // Reabrir el modal con los datos actualizados
  setTimeout(() => {
    abrirModalDetallesPaquete(paquete.id);
  }, 100);
}

// Verificar que el traductor esté disponible antes de usarlo
document.addEventListener('DOMContentLoaded', function() {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'es';

    function ensureTranslatorReady(callback) {
        // Si ya está listo, ejecutar inmediatamente
        if (window.__translatorReady || typeof updateTranslations === 'function') {
            callback();
            return;
        }

        // Si ya se está intentando cargar el script, esperar al evento
        const onReady = () => {
            window.removeEventListener('translatorReady', onReady);
            callback();
        };
        window.addEventListener('translatorReady', onReady);

        // Si no se ha iniciado la carga del script, inyectarlo una sola vez
        if (!window.__translatorLoadAttempted) {
            window.__translatorLoadAttempted = true;
            const script = document.createElement('script');
            script.src = '../Traduccion/translator.js';
            script.defer = true;
            script.onload = function() {
                // Si el traductor ya no emite translatorReady (defensa), intentar aplicar traducciones
                if (typeof updateTranslations === 'function') {
                    try { updateTranslations(savedLanguage); } catch (e) { console.error(e); }
                }
            };
            script.onerror = function() {
                console.error('No se pudo cargar translator.js desde ../Traduccion/translator.js');
            };
            document.head.appendChild(script);
        }

        // Fallback: si no se dispara el evento en X ms, intentar llamar si existe la función
        setTimeout(() => {
            if (typeof updateTranslations === 'function') {
                window.removeEventListener('translatorReady', onReady);
                callback();
            }
        }, 2500);
    }

    ensureTranslatorReady(() => {
        try {
            updateTranslations(savedLanguage);
            console.log('Translator loaded and initialized in Paquetes');
        } catch (err) {
            console.error('Error applying translations after translator ready:', err);
        }
    });
});