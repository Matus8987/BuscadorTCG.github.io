// Constantes con clave Api y URL base
const API_KEY = "9d508e02-69a0-43bf-ad98-8d073b3c19b2";
const BASE_URL = "https://api.pokemontcg.io/v2/cards";

// Elementos del DOM para consultas y resultados
const container = document.getElementById("cards-container");
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");

const loadingMessage = document.getElementById("loading-message");
const progressBarWrapper = loadingMessage.nextElementSibling; // contenedor de la barra
const loadingProgressBar = document.getElementById("loading-progress-bar");

const prevBtn = document.getElementById("prev-page");
const nextBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

// Elementos modal detalles de carta
const cardModal = document.getElementById("card-modal");
const cardModalTitle = document.getElementById("card-modal-title");
const cardModalImage = document.getElementById("card-modal-image");
const cardModalType = document.getElementById("card-modal-type");
const cardModalRarity = document.getElementById("card-modal-rarity");
const cardModalSet = document.getElementById("card-modal-set");
const cardModalInfo = document.getElementById("card-modal-info");
const cardModalCloseBtn = document.getElementById("card-modal-close");

// Elementos modal error
const errorModal = document.getElementById("error-modal");
const errorModalMessage = document.getElementById("error-modal-message");
const errorModalCloseBtn = document.getElementById("error-modal-close");

// Variables para paginación y búsqueda
let currentPage = 1;
const pageSize = 6; // mostrar 6 cartas (3x2)
let lastQuery = "";

// Intervalo para animar barra progreso
let progressInterval;

// Eventos formularios y botones
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = input.value.trim();

  // Validar si el campo está vacío
  if (!query) {
    showErrorModal("Debe llenar el campo para buscar.");
    return;
  }

  // Reiniciar página y guardar texto de búsqueda
  currentPage = 1;
  lastQuery = query;

  // Buscar cartas con la consulta y página actuales
  await fetchCards(query, currentPage);
});

prevBtn.addEventListener("click", async () => {
  if (currentPage > 1) {
    currentPage--;
    await fetchCards(lastQuery, currentPage);
  }
});

nextBtn.addEventListener("click", async () => {
  currentPage++;
  await fetchCards(lastQuery, currentPage);
});

// Función para iniciar animación barra progreso
function startLoadingProgress(duration = 3000) {
  loadingMessage.hidden = false;
  progressBarWrapper.hidden = false;
  loadingProgressBar.style.width = "0%";
  loadingProgressBar.setAttribute("aria-valuenow", "0");

  let startTime = Date.now();

  progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    let percent = Math.min((elapsed / duration) * 100, 100);
    loadingProgressBar.style.width = percent + "%";
    loadingProgressBar.setAttribute("aria-valuenow", percent.toFixed(0));
    if (percent >= 100) {
      clearInterval(progressInterval);
    }
  }, 50);
}

// Función para detener animación barra progreso
function stopLoadingProgress() {
  loadingMessage.hidden = true;
  progressBarWrapper.hidden = true;
  clearInterval(progressInterval);
}

// Función para obtener cartas desde la API con búsqueda y paginación
async function fetchCards(query, page) {
  startLoadingProgress(3000); // animar barra 3 seg como estimado
  container.innerHTML = "";

  const offset = (page - 1) * pageSize;
  let url = "";

  // Si la consulta es un número, buscar por número exacto en nacional pokedex
  if (/^\d+$/.test(query)) {
    url = `${BASE_URL}?pageSize=${pageSize}&offset=${offset}&q=${encodeURIComponent(`nationalPokedexNumbers:${query}`)}`;
  } else {
    // Buscar por nombre con comodines para coincidencia parcial
    url = `${BASE_URL}?pageSize=${pageSize}&offset=${offset}&q=${encodeURIComponent(`name:*${query}*`)}`;
  }

  try {
    const response = await fetch(url, {
      headers: { "X-Api-Key": API_KEY },
    });

    // Manejar errores HTTP
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    stopLoadingProgress();

    // Si no hay resultados mostrar mensaje error nombre mal escrito
    if (!data.data || data.data.length === 0) {
      showErrorModal("Nombre incorrectamente escrito.");
      updatePagination(0, page);
      return;
    }

    displayCards(data.data);
    updatePagination(data.totalCount || 0, page);

  } catch (error) {
    stopLoadingProgress();
    showErrorModal(`Error al cargar las cartas: ${error.message}`);
    updatePagination(0, page);
  }
}

// Función para mostrar cartas en la cuadrícula
function displayCards(cards) {
  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  cards.forEach((card) => {
    const article = document.createElement("article");
    article.className = "card";
    article.setAttribute("tabindex", "0");
    article.setAttribute("role", "button");
    article.setAttribute("aria-pressed", "false");
    article.dataset.card = JSON.stringify(card);

    article.innerHTML = `
      <img src="${card.images?.small || ''}" alt="Imagen de ${card.name}" loading="lazy" />
      <div class="card-name">${card.name}</div>
      <div class="card-type "><strong>Tipo:</strong> ${card.types ? card.types.join(", ") : "Desconocido"}</div>
      <div class="card-rarity"><strong>Rareza:</strong> ${card.rarity || "Desconocida"}</div>
      <div class="card-set"><strong>Set:</strong> ${card.set?.name || "Desconocido"}</div>
    `;

    // Agregar eventos para abrir modal con información detallada
    article.addEventListener("click", () => openCardModal(article));
    article.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCardModal(article);
      }
    });

    fragment.appendChild(article);
  });

  container.appendChild(fragment);
}

// Función para mostrar modal con información de carta
function openCardModal(cardEl) {
  try {
    // Obtener datos JSON de la carta del atributo data-card
    const card = JSON.parse(cardEl.dataset.card);

    cardModalTitle.textContent = card.name || "Desconocido";
    cardModalImage.src = card.images?.large || card.images?.small || "";
    cardModalImage.alt = `Imagen de ${card.name}`;
    cardModalType.textContent = card.types ? card.types.join(", ") : "Desconocido";
    cardModalRarity.textContent = card.rarity || "Desconocida";
    cardModalSet.textContent = card.set?.name || "Desconocido";
    cardModalInfo.textContent = card.text || card.rules?.join(", ") || "Información no disponible.";

    showModal(cardModal);
  } catch {
    showErrorModal("No se pudo abrir la información de la carta.");
  }
}

// Función para mostrar modal
function showModal(modal) {
  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "flex";
  const closeBtn = modal.querySelector("button");
  if (closeBtn) closeBtn.focus();
  modal._previousActiveElement = document.activeElement;
}

// Función para cerrar modal
function closeModal(modal) {
  modal.setAttribute("aria-hidden", "true");
  modal.style.display = "none";
  if (modal._previousActiveElement) modal._previousActiveElement.focus();
}

// Eventos botones cerrar modal
cardModalCloseBtn.addEventListener("click", () => closeModal(cardModal));
errorModalCloseBtn.addEventListener("click", () => closeModal(errorModal));

// Cerrar modales clic fuera o teclado Escape
cardModal.addEventListener("click", (e) => { if (e.target === cardModal) closeModal(cardModal); });
errorModal.addEventListener("click", (e) => { if (e.target === errorModal) closeModal(errorModal); });

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (cardModal.getAttribute("aria-hidden") === "false") closeModal(cardModal);
    if (errorModal.getAttribute("aria-hidden") === "false") closeModal(errorModal);
  }
});

// Función para mostrar modal de error con mensaje
function showErrorModal(msg) {
  errorModalMessage.innerHTML = msg;
  showModal(errorModal);
}

// Actualizar botones paginación y texto info
function updatePagination(totalCount, page) {
  const totalPages = Math.ceil(totalCount / pageSize);
  pageInfo.textContent = totalPages > 0 ? `Página ${page} de ${totalPages}` : "Sin resultados";
  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= totalPages || totalPages === 0;
  prevBtn.setAttribute("aria-disabled", prevBtn.disabled);
  nextBtn.setAttribute("aria-disabled", nextBtn.disabled);
}
