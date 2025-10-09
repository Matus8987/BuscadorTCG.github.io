/**
 * Configuración de la API y URLs base para consultas HTTP
 */
const API_KEY = "9d508e02-69a0-43bf-ad98-8d073b3c19b2"; // Clave de API de Pokémon TCG 
const BASE_URL = "https://api.pokemontcg.io/v2/cards"; // Endpoint base de la API de Pokémon TCG 

/**
 * REFERENCIAS DOM - ELEMENTOS PRINCIPALES
 * Cache de referencias a elementos DOM para optimizar consultas
 */
const container = document.getElementById("cards-container");
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");

// Elementos de interfaz de carga
const loadingMessage = document.getElementById("loading-message");
const progressBarWrapper = loadingMessage.nextElementSibling;
const loadingProgressBar = document.getElementById("loading-progress-bar");

// Elementos de filtrado
const filterControls = document.getElementById("filter-controls");
const rarityFilter = document.getElementById("rarity-filter");
const setFilter = document.getElementById("set-filter");
const clearFiltersBtn = document.getElementById("clear-filters");

// Elementos adicionales
const clearSearchBtn = document.getElementById("clear-search");

// Elementos de modal - detalles de carta
const cardModal = document.getElementById("card-modal");
const cardModalTitle = document.getElementById("card-modal-title");
const cardModalImage = document.getElementById("card-modal-image");
const cardModalType = document.getElementById("card-modal-type");
const cardModalRarity = document.getElementById("card-modal-rarity");
const cardModalSet = document.getElementById("card-modal-set");
const cardModalInfo = document.getElementById("card-modal-info");
const cardModalCloseBtn = document.getElementById("card-modal-close");

// Elementos de modal - manejo de errores
const errorModal = document.getElementById("error-modal");
const errorModalMessage = document.getElementById("error-modal-message");
const errorModalCloseBtn = document.getElementById("error-modal-close");

/**
 * ESTADO DE LA APLICACIÓN
 * Variables globales para manejo de estado y control de flujo
 */
let allLoadedCards = []; // Cache local de cartas cargadas desde API
let progressInterval; // Handler para animación de barra de progreso
let lastSearchQuery = ''; // Almacenar la última búsqueda

/**
 * INICIALIZACIÓN DE EVENT LISTENERS
 * Configuración de manejadores de eventos para interacción del usuario
 */
form.addEventListener("submit", handleSearchSubmit);
rarityFilter.addEventListener("change", applyFilters);
setFilter.addEventListener("change", applyFilters);
clearFiltersBtn.addEventListener("click", clearFilters);
clearSearchBtn.addEventListener("click", clearCachedCards);
cardModalCloseBtn.addEventListener("click", () => closeModal(cardModal));
errorModalCloseBtn.addEventListener("click", () => closeModal(errorModal));

// Event listeners para cierre de modales
cardModal.addEventListener("click", handleModalBackdropClick);
errorModal.addEventListener("click", handleModalBackdropClick);
document.addEventListener("keydown", handleGlobalKeydown);

/**
 * MANEJADORES DE EVENTOS PRINCIPALES
 * Funciones que procesan las interacciones del usuario
 */
async function handleSearchSubmit(e) {
  e.preventDefault();
  const query = input.value.trim();

  if (!query) {
    showErrorModal("Debe llenar el campo para buscar.");
    return;
  }

  await fetchAllCards(query);
}

function handleModalBackdropClick(e) {
  if (e.target === cardModal) closeModal(cardModal);
  if (e.target === errorModal) closeModal(errorModal);
}

function handleGlobalKeydown(e) {
  if (e.key === "Escape") {
    if (cardModal.getAttribute("aria-hidden") === "false") closeModal(cardModal);
    if (errorModal.getAttribute("aria-hidden") === "false") closeModal(errorModal);
  }
}

/**
 * CONTROL DE BARRA DE PROGRESO
 * Sistema de feedback visual para operaciones asíncronas
 */
function startLoadingProgress() {
  const loadingContainer = document.getElementById("loading-container");
  const loadingProgressBar = document.getElementById("loading-progress-bar");
  
  loadingContainer.style.display = "block";
  loadingProgressBar.style.width = "0%";
  loadingProgressBar.textContent = "0%";
  loadingProgressBar.parentElement.setAttribute("aria-valuenow", "0");
}

function updateProgress(percentage) {
  const loadingProgressBar = document.getElementById("loading-progress-bar");
  const progressContainer = loadingProgressBar.parentElement;
  
  loadingProgressBar.style.width = percentage + "%";
  loadingProgressBar.textContent = Math.round(percentage) + "%";
  progressContainer.setAttribute("aria-valuenow", Math.round(percentage));
}

function completeLoadingProgress() {
  updateProgress(100);
  
  // Ocultar después de un breve delay
  setTimeout(() => {
    stopLoadingProgress();
  }, 500);
}

function stopLoadingProgress() {
  const loadingContainer = document.getElementById("loading-container");
  loadingContainer.style.display = "none";
  clearInterval(progressInterval);
}

/* REPLACED PROGRESS + PRELOAD LOGIC:
   - Add ProgressManager to auto-increment slowly up to a ceiling.
   - Use per-image load/error events to advance the remaining percent and finish at 100% only when all images are loaded.
   - Render cards immediately (faster perceived load). */

// --- new ProgressManager ---
const ProgressManager = (function () {
  let containerEl = null;
  let barEl = null;
  let interval = null;
  let percent = 0;
  let totalImages = 1;
  let loadedImages = 0;
  const autoCeiling = 80; // auto increment will approach this before images finish
  const autoStepMin = 0.5;
  const autoStepMax = 2.0;
  function ensureEls() {
    if (!containerEl) containerEl = document.getElementById('loading-container');
    if (!barEl) barEl = document.getElementById('loading-progress-bar');
  }
  function setBar(p) {
    ensureEls();
    percent = Math.max(0, Math.min(100, p));
    if (barEl) {
      barEl.style.width = percent + '%';
      barEl.textContent = Math.round(percent) + '%';
      if (barEl.parentElement) barEl.parentElement.setAttribute('aria-valuenow', Math.round(percent));
    }
  }
  function start(total) {
    ensureEls();
    totalImages = Math.max(1, total || 1);
    loadedImages = 0;
    setBar(0);
    if (containerEl) containerEl.style.display = 'block';
    clearInterval(interval);
    interval = setInterval(() => {
      // slowly increment toward autoCeiling
      if (percent < autoCeiling) {
        const step = autoStepMin + Math.random() * (autoStepMax - autoStepMin);
        setBar(Math.min(percent + step, autoCeiling));
      }
    }, 450);
  }
  function imageLoaded() {
    loadedImages++;
    // allocate remaining percent (100 - autoCeiling) proportionally to images loaded
    const remaining = 100 - autoCeiling;
    const imagePortion = (loadedImages / totalImages) * remaining;
    setBar(Math.min(autoCeiling + imagePortion, 99.9));
    if (loadedImages >= totalImages) {
      finish();
    }
  }
  function finish() {
    clearInterval(interval);
    setBar(100);
    // hide after a short delay so users see 100%
    setTimeout(() => {
      if (containerEl) containerEl.style.display = 'none';
      setBar(0);
    }, 600);
  }
  return { start, imageLoaded, finish, setBar };
})();
// --- end ProgressManager ---

/**
 * SERVICIOS DE API
 * Funciones para comunicación con la API de Pokémon TCG
 */
async function fetchAllCards(query) {
  // start a small visible progress immediately
  ProgressManager.start(1);

  container.innerHTML = "";
  hideFilters();

  const url = buildApiUrl(query);

  try {
    const response = await fetch(url, {
      headers: { "X-Api-Key": API_KEY },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      ProgressManager.finish();
      showErrorModal("Nombre incorrectamente escrito.");
      return;
    }

    // Use total cards to size progress manager (images to wait for)
    allLoadedCards = data.data;
    lastSearchQuery = query;

    // Guardar cartas y búsqueda en localStorage
    localStorage.setItem('cachedCards', JSON.stringify(allLoadedCards));
    localStorage.setItem('lastSearchQuery', query);

    // Start progress based on number of images to load
    ProgressManager.start(allLoadedCards.length);

    // PRELOAD: esperar a que todas las imágenes terminen de cargar/errorear antes de renderizar
    await preloadImages(allLoadedCards);

    // Fast render: ahora sí mostrar cartas (las imágenes ya fueron preloadadas)
    displayCards(allLoadedCards);

    // Asegurar que el progress manager haya terminado (preloadImages llama a imageLoaded por cada imagen)
    ProgressManager.finish();

    // Configuración de filtros UI
    populateFilters(allLoadedCards);
    showFilters();

  } catch (error) {
    ProgressManager.finish();
    showErrorModal(`Error al cargar las cartas: ${error.message}`);
  }
}

// Nueva función: preload de imágenes con avance del ProgressManager
function preloadImages(cards) {
  return new Promise((resolve) => {
    if (!cards || cards.length === 0) {
      // marcar como cargado para evitar quedarse en 0
      ProgressManager.imageLoaded();
      return resolve();
    }

    let total = cards.length;
    let done = 0;

    cards.forEach(card => {
      const src = card.images?.small || card.images?.large || '';
      if (!src) {
        done++;
        ProgressManager.imageLoaded();
        if (done >= total) resolve();
        return;
      }

      const img = new Image();
      const onFinish = () => {
        img.removeEventListener('load', onFinish);
        img.removeEventListener('error', onFinish);
        done++;
        ProgressManager.imageLoaded();
        if (done >= total) resolve();
      };

      img.addEventListener('load', onFinish);
      img.addEventListener('error', onFinish);
      // asignar src al final para disparar carga
      img.src = src;
      // si ya estaba en cache, algunos navegadores disparan load inmediatamente
    });
  });
}

function buildApiUrl(query) {
  const baseParams = "pageSize=250";
  const searchParam = /^\d+$/.test(query) 
    ? `nationalPokedexNumbers:${query}` 
    : `name:*${query}*`;
  
  return `${BASE_URL}?${baseParams}&q=${encodeURIComponent(searchParam)}`;
}

/**
 * RENDERIZADO DE COMPONENTES
 * Funciones para manipulación del DOM y presentación de datos
 */
async function displayCards(cards) {
  container.innerHTML = "";
  const fragment = document.createDocumentFragment();
  const totalCards = cards.length;

  // Create and append card elements quickly
  cards.forEach((card, index) => {
    const article = createCardElement(card);
    fragment.appendChild(article);

    // light progress hint while building DOM (not final)
    if (index % 10 === 0) {
      // small nudge so progress doesn't stay at 0 before images start loading
      const approx = Math.min(30 + (index / totalCards) * 20, 50);
      ProgressManager.setBar(approx);
    }
  });

  container.appendChild(fragment);

  // Do NOT await image preload here; wait is handled separately so UI is responsive
  // preloadCardImages removed to speed up perceived load.
}

// Wait for all images inside #cards-container to finish loading or error.
// Calls ProgressManager.imageLoaded() per image and resolves when all done.
function waitForAllImagesLoad() {
  return new Promise((resolve) => {
    const imgs = container.querySelectorAll('img');
    const total = imgs.length || 1;
    let done = 0;

    if (total === 0) {
      // nothing to wait
      ProgressManager.imageLoaded(); // mark 1-of-1
      return resolve();
    }

    imgs.forEach((img) => {
      // If image already finished, count immediately
      if (img.complete) {
        done++;
        ProgressManager.imageLoaded();
        if (done >= total) resolve();
        return;
      }

      const onFinish = () => {
        img.removeEventListener('load', onFinish);
        img.removeEventListener('error', onFinish);
        done++;
        ProgressManager.imageLoaded();
        if (done >= total) resolve();
      };

      img.addEventListener('load', onFinish);
      img.addEventListener('error', onFinish);

      // As a defensive timeout in case an image never fires load/error
      setTimeout(() => {
        if (!img.complete) {
          // treat as loaded after timeout to avoid forever-wait
          try { img.dispatchEvent(new Event('error')); } catch {}
        }
      }, 10000); // 10s per image timeout
    });
  });
}

/**
 * RENDERIZADO DE COMPONENTES
 * Funciones para manipulación del DOM y presentación de datos
 */
function createCardElement(card) {
  const article = document.createElement("article");
  article.className = "card";
  article.setAttribute("tabindex", "0");
  article.setAttribute("role", "button");
  article.setAttribute("aria-pressed", "false");
  article.dataset.card = JSON.stringify(card);

  article.innerHTML = `
    <img src="${card.images?.small || ''}" alt="Imagen de ${card.name}" loading="lazy" />
    <div class="card-name">${card.name}</div>
    <div class="card-type"><strong>Tipo:</strong> ${card.types ? card.types.join(", ") : "Desconocido"}</div>
    <div class="card-rarity"><strong>Rareza:</strong> ${card.rarity || "Desconocida"}</div>
    <div class="card-set"><strong>Set:</strong> ${card.set?.name || "Desconocido"}</div>
    <button class="add-to-pack-btn" onclick="addToPack(event, '${card.id}')" title="Agregar a paquete">
      <i class="bi bi-plus-lg"></i> Agregar a paquete
    </button>
  `;

  // Event delegation para interacción con cartas
  article.addEventListener("click", (e) => {
    // Evitar que el click en el botón abra el modal
    if (!e.target.closest('.add-to-pack-btn')) {
      openCardModal(article);
    }
  });
  article.addEventListener("keydown", handleCardKeydown);

  return article;
}

function handleCardKeydown(e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openCardModal(e.currentTarget);
  }
}

/**
 * SISTEMA DE FILTRADO
 * Implementación de filtros client-side para optimización de UX
 */
function populateFilters(cards) {
  populateRarityFilter(cards);
  populateSetFilter(cards);
}

function populateRarityFilter(cards) {
  const rarities = [...new Set(cards.map(card => card.rarity).filter(Boolean))].sort();
  rarityFilter.innerHTML = '<option value="">Todas</option>';
  
  rarities.forEach(rarity => {
    const option = document.createElement("option");
    option.value = rarity;
    option.textContent = rarity;
    rarityFilter.appendChild(option);
  });
}

function populateSetFilter(cards) {
  const sets = [...new Set(cards.map(card => card.set?.name).filter(Boolean))].sort();
  setFilter.innerHTML = '<option value="">Todos</option>';
  
  sets.forEach(set => {
    const option = document.createElement("option");
    option.value = set;
    option.textContent = set;
    setFilter.appendChild(option);
  });
}

function applyFilters() {
  if (allLoadedCards.length === 0) return;

  const selectedRarity = rarityFilter.value;
  const selectedSet = setFilter.value;
  
  let filteredCards = allLoadedCards;

  // Aplicación de filtros secuencial
  if (selectedRarity) {
    filteredCards = filteredCards.filter(card => card.rarity === selectedRarity);
  }

  if (selectedSet) {
    filteredCards = filteredCards.filter(card => card.set?.name === selectedSet);
  }

  displayCards(filteredCards);
  showFilteredInfo(filteredCards.length, allLoadedCards.length);
}

function clearFilters() {
  rarityFilter.value = "";
  setFilter.value = "";
  displayCards(allLoadedCards);
  hideFilteredInfo();
}

/**
 * CONTROL DE VISIBILIDAD DE COMPONENTES UI
 * Funciones para manejo de estado visual de elementos
 */
function showFilters() {
  filterControls.style.display = "block";
}

function hideFilters() {
  filterControls.style.display = "none";
}

function showFilteredInfo(filteredCount, totalCount) {
  const resultsInfo = document.getElementById("results-info");
  if (resultsInfo) {
    resultsInfo.textContent = `Mostrando ${filteredCount} de ${totalCount} cartas`;
    resultsInfo.style.display = "inline";
  }
}

function hideFilteredInfo() {
  const resultsInfo = document.getElementById("results-info");
  if (resultsInfo) {
    resultsInfo.style.display = "none";
  }
}
/*FIN DE SISTEMA DE FILTRADO */
/**
 * SISTEMA DE MODALES
 * Gestión de ventanas modales para detalles y errores
 */
function openCardModal(cardElement) {
  try {
    const card = JSON.parse(cardElement.dataset.card);
    populateCardModal(card);
    showModal(cardModal);
  } catch {
    showErrorModal("No se pudo abrir la información de la carta.");
  }
}

let currentCardData = null;

function toggleFavorite() {
  if (!currentCardData) return;
  
  const favoriteCard = localStorage.getItem('favoriteCard');
  const icon = document.querySelector('.modal-content i[class*="bi-star"]');
  
  if (!icon) return; // Verificar que el icono exista
  
  if (favoriteCard && JSON.parse(favoriteCard).id === currentCardData.id) {
    // Quitar de favoritos
    localStorage.removeItem('favoriteCard');
    icon.className = 'bi bi-star';
  } else {
    // Agregar a favoritos
    localStorage.setItem('favoriteCard', JSON.stringify(currentCardData));
    icon.className = 'bi bi-star-fill';
  }
}

function updateFavoriteIcon() {
  if (!currentCardData) return;
  
  const favoriteCard = localStorage.getItem('favoriteCard');
  const icon = document.querySelector('.modal-content i[class*="bi-star"]');
  
  if (!icon) return; // Verificar que el icono exista
  
  if (favoriteCard && JSON.parse(favoriteCard).id === currentCardData.id) {
    icon.className = 'bi bi-star-fill';
  } else {
    icon.className = 'bi bi-star';
  }
}

function populateCardModal(card) {
  currentCardData = card;
  cardModalTitle.textContent = card.name || "Desconocido";
  cardModalImage.src = card.images?.large || card.images?.small || "";
  cardModalImage.alt = `Imagen de ${card.name}`;
  cardModalType.textContent = card.types ? card.types.join(", ") : "Desconocido";
  cardModalRarity.textContent = card.rarity || "Desconocida";
  cardModalSet.textContent = card.set?.name || "Desconocido";
  cardModalInfo.textContent = card.text || card.rules?.join(", ") || "Información no disponible.";
  
  // Actualizar estado de la estrella
  updateFavoriteIcon();
  
  // Agregar event listener al ícono favorito dinámicamente
  const favoriteIcon = document.querySelector('.modal-content i[class*="bi-star"]');
  if (favoriteIcon) {
    favoriteIcon.onclick = toggleFavorite;
  }
}

function showModal(modal) {
  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "flex";
  
  // Gestión de foco para accesibilidad
  const closeBtn = modal.querySelector("button");
  if (closeBtn) closeBtn.focus();
  modal._previousActiveElement = document.activeElement;
}

function closeModal(modal) {
  modal.setAttribute("aria-hidden", "true");
  modal.style.display = "none";
  
  // Restauración de foco para navegación accesible
  if (modal._previousActiveElement) modal._previousActiveElement.focus();
}

function showErrorModal(message) {
  errorModalMessage.innerHTML = message;
  showModal(errorModal);
}

/**
 * FUNCIONES DE PERSISTENCIA
 * Funciones para guardar y cargar estado de la aplicación
 */
function loadCachedCards() {
  const cachedCards = localStorage.getItem('cachedCards');
  const cachedQuery = localStorage.getItem('lastSearchQuery');
  
  if (cachedCards && cachedQuery) {
    try {
      allLoadedCards = JSON.parse(cachedCards);
      lastSearchQuery = cachedQuery;
      input.value = cachedQuery;
      
      displayCards(allLoadedCards);
      populateFilters(allLoadedCards);
      showFilters();
      
      return true;
    } catch (error) {
      console.error('Error al cargar cartas guardadas:', error);
      localStorage.removeItem('cachedCards');
      localStorage.removeItem('lastSearchQuery');
    }
  }
  
  return false;
}

function clearCachedCards() {
  localStorage.removeItem('cachedCards');
  localStorage.removeItem('lastSearchQuery');
  allLoadedCards = [];
  lastSearchQuery = '';
  container.innerHTML = "";
  hideFilters();
  input.value = '';
}

// Función para inicializar la página al cargar
window.addEventListener('DOMContentLoaded', function() {
  const currentUser = localStorage.getItem('currentUser');
  
  if (currentUser) {
    // Mostrar barra de usuario
    document.getElementById('currentUserName').textContent = currentUser;
    document.getElementById('userBar').style.display = 'block';
    
    // Cargar cartas guardadas si existen
    loadCachedCards();
    
  } else {
    // Redirigir al login si no hay usuario
    window.location.href = '../index.html';
  }
});

function logout() {
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('hasSeenWelcome');
  sessionStorage.removeItem('justLoggedIn');
  // Limpiar también las cartas guardadas al cerrar sesión
  clearCachedCards();
  window.location.href = '../index.html';
}

// Función para actualizar la barra de progreso
function updateProgressBar(percentage) {
  const progressBar = document.getElementById('loading-progress-bar');
  const progressContainer = document.querySelector('.progress');
  
  if (progressBar && progressContainer) {
    progressBar.style.width = percentage + '%';
    progressBar.textContent = Math.round(percentage) + '%';
    progressContainer.setAttribute('aria-valuenow', Math.round(percentage));
  }
}

// Función para mostrar la barra de progreso
function showProgressBar() {
  const loadingContainer = document.getElementById('loading-container');
  if (loadingContainer) {
    loadingContainer.style.display = 'block';
    updateProgressBar(0);
  }
}

// Función para ocultar la barra de progreso
function hideProgressBar() {
  const loadingContainer = document.getElementById('loading-container');
  if (loadingContainer) {
    setTimeout(() => {
      loadingContainer.style.display = 'none';
      updateProgressBar(0);
    }, 500); // Pequeña pausa antes de ocultar
  }
}

// Simular progreso durante la carga de cartas
function simulateProgress(totalCards, onComplete) {
  let currentProgress = 0;
  const increment = 100 / totalCards;
  
  const progressInterval = setInterval(() => {
    currentProgress += increment;
    updateProgressBar(Math.min(currentProgress, 100));
    
    if (currentProgress >= 100) {
      clearInterval(progressInterval);
      setTimeout(() => {
        hideProgressBar();
        if (onComplete) onComplete();
      }, 300);
    }
  }, 100); // Actualiza cada 100ms para hacer el progreso más fluido
}

// En tu función de búsqueda (modifica según tu implementación actual)
async function searchCards(query) {
  try {
    // Mostrar barra de progreso
    showProgressBar();
    
    // Realizar la búsqueda
    const response = await fetch(`tu-api-endpoint?q=${query}`);
    const data = await response.json();
    
    // Simular el progreso conforme se cargan las cartas
    const totalCards = data.data?.length || 0;
    
    if (totalCards > 0) {
      // Simular progreso gradual
      simulateProgress(totalCards, () => {
        // Mostrar las cartas cuando termine el progreso
        displayCards(data.data);
      });
    } else {
      hideProgressBar();
      // Manejar caso sin resultados
    }
    
  } catch (error) {
    hideProgressBar();
    console.error('Error en la búsqueda:', error);
  }
}

// Función para agregar carta al paquete (ahora abre modal para seleccionar paquete)
function addToPack(event, cardId) {
  event.stopPropagation(); // Evitar que se abra el modal

  // Mostrar modal de selección de paquete
  showPackageSelectModal(cardId, event.target);
}

// Mostrar modal con paquetes creados para seleccionar
function showPackageSelectModal(cardId, sourceElement) {
  const paquetes = JSON.parse(localStorage.getItem('paquetesCreados') || '[]');

  if (!paquetes || paquetes.length === 0) {
    showErrorModal("Primero debes crear un paquete");
    return;
  }

  const listEl = document.getElementById('package-list');
  listEl.innerHTML = '';

  paquetes.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-outline-primary';
    btn.style.textAlign = 'left';
    btn.style.display = 'block';
    btn.style.width = '100%';
    btn.textContent = `${p.nombre} — ${p.numeroCartas} cartas`;
    btn.dataset.pkgId = p.id;
    btn.addEventListener('click', () => {
      // Al seleccionar paquete: iniciar flujo de mostrar carta, animar y guardar
      handlePackageSelection(p.id, cardId);
    });
    listEl.appendChild(btn);
  });

  // Mostrar modal
  const modalEl = document.getElementById('package-select-modal');
  showModal(modalEl);
}

// Maneja la selección de paquete
async function handlePackageSelection(packageId, cardId) {
  // Cerrar modal de selección
  closeModal(document.getElementById('package-select-modal'));

  // Buscar carta en cache
  const card = allLoadedCards.find(c => c.id === cardId);
  if (!card) {
    showErrorModal("No se encontró la carta en cache.");
    return;
  }

  // Mostrar modal de la carta
  try {
    populateCardModal(card);
    showModal(cardModal);
  } catch (e) {
    showErrorModal("No se pudo mostrar la carta.");
    return;
  }

  // Esperar un momento para que el modal aparezca y el DOM tenga la imagen
  await new Promise(r => setTimeout(r, 300));

  // Animar la imagen del modal hacia abajo
  const imgEl = document.getElementById('card-modal-image');
  await animateCardToBottom(imgEl);

  // Guardar la carta en userPacksMap por packageId
  saveCardToPackage(packageId, card);

  // Cerrar modal de la carta (si sigue abierto) y mostrar confirmación
  closeModal(cardModal);
  showConfirmSaveModal();
}

// Persistencia: guardar carta bajo un paquete específico
function saveCardToPackage(packageId, card) {
  const mapKey = 'userPacksMap';
  const map = JSON.parse(localStorage.getItem(mapKey) || '{}');
  const key = String(packageId);

  if (!Array.isArray(map[key])) map[key] = [];

  // Evitar duplicados por id en el map
  if (map[key].some(c => c.id === card.id)) {
    return;
  }

  // Guardar una versión ligera de la carta (evita duplicar todo el objeto grande)
  const cardSummary = {
    id: card.id,
    name: card.name,
    set: card.set?.name || null,
    image: card.images?.small || card.images?.large || null
  };

  map[key].push(cardSummary);
  localStorage.setItem(mapKey, JSON.stringify(map));

  // --- Sincronizar con 'paquetesCreados' para que la página de Paquetes muestre las cartas ---
  try {
    const paquetesKey = 'paquetesCreados';
    const paquetes = JSON.parse(localStorage.getItem(paquetesKey) || '[]');

    // Buscar el paquete por id (normalizando tipo)
    const pkgIndex = paquetes.findIndex(p => String(p.id) === String(packageId));
    if (pkgIndex !== -1) {
      if (!Array.isArray(paquetes[pkgIndex].cartas)) paquetes[pkgIndex].cartas = [];

      // Evitar duplicados por id dentro del paquete
      if (!paquetes[pkgIndex].cartas.some(c => c.id === cardSummary.id)) {
        paquetes[pkgIndex].cartas.push(cardSummary);
        // Guardar cambios
        localStorage.setItem(paquetesKey, JSON.stringify(paquetes));
      }
    }
  } catch (err) {
    console.error('Error sincronizando paquetesCreados:', err);
  }

  // Emitir evento por si otra parte de la app (otra pestaña / página) necesita actualizar UI
  try {
    window.dispatchEvent(new CustomEvent('pack-updated', { detail: { packageId: key, card: cardSummary } }));
  } catch (e) {
    // no crítico
  }
}

// Mostrar modal de confirmación
function showConfirmSaveModal() {
  const modalEl = document.getElementById('confirm-save-modal');
  showModal(modalEl);

  // Cerrar automáticamente tras 1.5s
  setTimeout(() => {
    closeModal(modalEl);
  }, 1500);
}

// Animación: clona la imagen, la posiciona encima, hace un "despegue" breve y luego la mueve hacia abajo más lento
function animateCardToBottom(imageElement) {
  return new Promise(resolve => {
    if (!imageElement) {
      resolve();
      return;
    }

    const overlay = document.getElementById('animation-overlay');

    // Obtener posición y tamaño actuales
    const rect = imageElement.getBoundingClientRect();

    // Crear clon
    const clone = imageElement.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.left = rect.left + 'px';
    clone.style.top = rect.top + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.style.zIndex = 3000;
    clone.style.pointerEvents = 'none';
    clone.style.borderRadius = window.getComputedStyle(imageElement).borderRadius;
    // Preparar para animación (primera fase: despegue)
    clone.style.transition = 'transform 240ms cubic-bezier(.2,.8,.2,1), opacity 240ms ease';
    clone.style.transform = 'translateY(0px) scale(1) rotate(0deg)';
    overlay.appendChild(clone);

    // Forzar reflow
    void clone.offsetWidth;

    // Primera fase: pequeño "despegue" (subir, agrandar un poco, rotar)
    const liftY = -36;
    clone.style.transform = `translateY(${liftY}px) scale(1.06) rotate(-4deg)`;
    clone.style.opacity = '1';

    // Al acabar la primera fase, iniciar la segunda fase (caída lenta hacia abajo)
    const onLiftEnd = () => {
      clone.removeEventListener('transitionend', onLiftEnd);

      // Segunda fase: transición más lenta hacia abajo
      const distance = window.innerHeight - rect.top + rect.height + 120; // salir abajo
      // Cambiar transición a duración mayor y easing suave
      clone.style.transition = 'transform 1400ms cubic-bezier(.22,.9,.32,1), opacity 900ms ease';
      // Aplicar movimiento hacia abajo, rotación y reducción de opacidad
      clone.style.transform = `translateY(${distance}px) rotate(8deg) scale(0.92)`;
      clone.style.opacity = '0.85';

      // Escuchar final de la segunda transición
      const onFallEnd = () => {
        clone.removeEventListener('transitionend', onFallEnd);
        clone.remove();
        resolve();
      };
      clone.addEventListener('transitionend', onFallEnd);

      // Safety timeout
      setTimeout(() => {
        if (document.body.contains(clone)) {
          clone.remove();
          resolve();
        }
      }, 1700);
    };

    clone.addEventListener('transitionend', onLiftEnd);

    // Safety: si transitionend no se dispara en la fase de lift, forzamos la segunda fase tras 300ms
    setTimeout(() => {
      // if still present and still in initial lift, trigger second phase
      if (document.body.contains(clone) && clone.style.transition.includes('240ms')) {
        onLiftEnd();
      }
    }, 320);
  });
}