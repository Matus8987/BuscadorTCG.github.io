/**
 * BUSCADOR POKÉMON TCG - CONFIGURACIÓN Y CONSTANTES
 * Configuración de la API y URLs base para consultas HTTP
 */
const API_KEY = "9d508e02-69a0-43bf-ad98-8d073b3c19b2";
const BASE_URL = "https://api.pokemontcg.io/v2/cards";

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

/**
 * INICIALIZACIÓN DE EVENT LISTENERS
 * Configuración de manejadores de eventos para interacción del usuario
 */
form.addEventListener("submit", handleSearchSubmit);
rarityFilter.addEventListener("change", applyFilters);
setFilter.addEventListener("change", applyFilters);
clearFiltersBtn.addEventListener("click", clearFilters);
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
  loadingMessage.hidden = false;
  progressBarWrapper.hidden = false;
  loadingProgressBar.style.width = "0%";
  loadingProgressBar.setAttribute("aria-valuenow", "0");
  
  // Animación progresiva hasta 90% durante la carga de datos
  let percent = 0;
  progressInterval = setInterval(() => {
    if (percent < 90) {
      percent += 2;
      loadingProgressBar.style.width = percent + "%";
      loadingProgressBar.setAttribute("aria-valuenow", percent.toFixed(0));
    }
  }, 50);
}

function completeLoadingProgress() {
  clearInterval(progressInterval);
  loadingProgressBar.style.width = "100%";
  loadingProgressBar.setAttribute("aria-valuenow", "100");
  
  // Delay para feedback visual antes de ocultar
  setTimeout(() => {
    stopLoadingProgress();
  }, 300);
}

function stopLoadingProgress() {
  loadingMessage.hidden = true;
  progressBarWrapper.hidden = true;
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
    const response = await fetch(url, {
      headers: { "X-Api-Key": API_KEY },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      stopLoadingProgress();
      showErrorModal("Nombre incorrectamente escrito.");
      return;
    }

    // Procesamiento y renderizado de datos
    allLoadedCards = data.data;
    await displayCards(allLoadedCards);
    
    // Configuración de filtros UI
    populateFilters(allLoadedCards);
    showFilters();
    
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

  cards.forEach((card) => {
    const article = createCardElement(card);
    fragment.appendChild(article);
  });

  container.appendChild(fragment);
  
  // Optimización: preload de imágenes antes de completar renderizado
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
  `;

  // Event delegation para interacción con cartas
  article.addEventListener("click", () => openCardModal(article));
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

function populateCardModal(card) {
  cardModalTitle.textContent = card.name || "Desconocido";
  cardModalImage.src = card.images?.large || card.images?.small || "";
  cardModalImage.alt = `Imagen de ${card.name}`;
  cardModalType.textContent = card.types ? card.types.join(", ") : "Desconocido";
  cardModalRarity.textContent = card.rarity || "Desconocida";
  cardModalSet.textContent = card.set?.name || "Desconocido";
  cardModalInfo.textContent = card.text || card.rules?.join(", ") || "Información no disponible.";
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
