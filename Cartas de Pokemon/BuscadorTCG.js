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

/**
 * SERVICIOS DE API
 * Funciones para comunicación con la API de Pokémon TCG
 */
async function fetchAllCards(query) {
  startLoadingProgress();
  container.innerHTML = "";
  hideFilters();

  const url = buildApiUrl(query);

  try {
    // Progreso inicial
    updateProgress(10);
    
    const response = await fetch(url, {
      headers: { "X-Api-Key": API_KEY },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    // Progreso tras recibir respuesta
    updateProgress(30);
    
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      stopLoadingProgress();
      showErrorModal("Nombre incorrectamente escrito.");
      return;
    }

    // Progreso tras procesar datos
    updateProgress(50);
    
    // Procesamiento y renderizado de datos
    allLoadedCards = data.data;
    lastSearchQuery = query;
    
    // Guardar cartas y búsqueda en localStorage
    localStorage.setItem('cachedCards', JSON.stringify(allLoadedCards));
    localStorage.setItem('lastSearchQuery', query);
    
    // Progreso durante renderizado
    updateProgress(70);
    
    await displayCards(allLoadedCards);
    
    // Progreso tras renderizar cartas
    updateProgress(85);
    
    // Configuración de filtros UI
    populateFilters(allLoadedCards);
    showFilters();
    
    // Progreso completo
    updateProgress(95);
    
    completeLoadingProgress();

  } catch (error) {
    stopLoadingProgress();
    showErrorModal(`Error al cargar las cartas: ${error.message}`);
  }
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

  cards.forEach((card, index) => {
    const article = createCardElement(card);
    fragment.appendChild(article);
    
    // Actualizar progreso durante la creación de elementos
    const cardProgress = Math.min(70 + (index / totalCards) * 15, 85);
    if (index % 10 === 0 || index === totalCards - 1) { // Actualizar cada 10 cartas o en la última
      updateProgress(cardProgress);
    }
  });

  container.appendChild(fragment);
  
  // Optimización: preload de imágenes más rápido
  await preloadCardImages();
}

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

async function preloadCardImages() {
  const images = container.querySelectorAll('img');
  const imagePromises = Array.from(images).map(img => {
    return new Promise(resolve => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = resolve;
        img.onerror = resolve; // Resolución robusta en caso de error
      }
    });
  });
  
  await Promise.all(imagePromises);
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

// Función para agregar carta al paquete
function addToPack(event, cardId) {
  event.stopPropagation(); // Evitar que se abra el modal
  
  // Verificar si el usuario tiene al menos un paquete creado
  let userPacks = JSON.parse(localStorage.getItem('userPacks') || '[]');
  let userPacksMetadata = JSON.parse(localStorage.getItem('userPacksMetadata') || '[]');
  
  // Si no hay metadata de paquetes creados, mostrar error
  if (userPacksMetadata.length === 0) {
    showErrorModal("Primero debes crear un paquete");
    return;
  }
  
  // Buscar la carta en allLoadedCards
  const card = allLoadedCards.find(c => c.id === cardId);
  if (!card) return;
  
  // Verificar si la carta ya existe en el paquete
  const cardExists = userPacks.some(packCard => packCard.id === cardId);
  
  if (cardExists) {
    showErrorModal("Esta carta ya está en tu paquete.");
    return;
  }
  
  // Agregar la carta al paquete
  userPacks.push(card);
  localStorage.setItem('userPacks', JSON.stringify(userPacks));
  
  // Feedback visual - cambiar temporalmente el texto del botón
  const button = event.target.closest('.add-to-pack-btn');
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="bi bi-check"></i> Agregado';
  button.style.backgroundColor = '#28a745';
  
  setTimeout(() => {
    button.innerHTML = originalText;
    button.style.backgroundColor = '';
  }, 2000);
}