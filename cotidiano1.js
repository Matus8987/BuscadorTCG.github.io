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

  // Buscar todas las cartas con la consulta
  await fetchAllCards(query);
});

// Función para iniciar animación barra progreso
function startLoadingProgress() {
  loadingMessage.hidden = false;
  progressBarWrapper.hidden = false;
  loadingProgressBar.style.width = "0%";
  loadingProgressBar.setAttribute("aria-valuenow", "0");
  
  // Animar hasta 90% mientras se cargan los datos
  let percent = 0;
  progressInterval = setInterval(() => {
    if (percent < 90) {
      percent += 2;
      loadingProgressBar.style.width = percent + "%";
      loadingProgressBar.setAttribute("aria-valuenow", percent.toFixed(0));
    }
  }, 50);
}

// Función para completar la barra de progreso
function completeLoadingProgress() {
  clearInterval(progressInterval);
  loadingProgressBar.style.width = "100%";
  loadingProgressBar.setAttribute("aria-valuenow", "100");
  
  // Ocultar después de un breve momento
  setTimeout(() => {
    stopLoadingProgress();
  }, 300);
}

// Función para detener animación barra progreso
function stopLoadingProgress() {
  loadingMessage.hidden = true;
  progressBarWrapper.hidden = true;
  clearInterval(progressInterval);
}

// Función para obtener todas las cartas desde la API
async function fetchAllCards(query) {
  startLoadingProgress();
  container.innerHTML = "";

  let url = "";
  
  if (/^\d+$/.test(query)) {
    url = `${BASE_URL}?pageSize=250&q=${encodeURIComponent(`nationalPokedexNumbers:${query}`)}`;
  } else {
    url = `${BASE_URL}?pageSize=250&q=${encodeURIComponent(`name:*${query}*`)}`;
  }

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

    // Renderizar todas las cartas
    await displayCards(data.data);
    
    // Completar barra de progreso después de renderizar
    completeLoadingProgress();

  } catch (error) {
    stopLoadingProgress();
    showErrorModal(`Error al cargar las cartas: ${error.message}`);
  }
}

// Función para mostrar cartas en la cuadrícula
async function displayCards(cards) {
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
  
  // Esperar a que las imágenes se carguen
  const images = container.querySelectorAll('img');
  const imagePromises = Array.from(images).map(img => {
    return new Promise(resolve => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = resolve;
        img.onerror = resolve; // resolver incluso si hay error
      }
    });
  });
  
  await Promise.all(imagePromises);
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
  const paginationControls = document.getElementById("pagination-controls");
  
  // Calcular si realmente hay más cartas disponibles
  const hasMoreCards = (page * pageSize) < totalCount && actualCardsReturned === pageSize;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Solo mostrar controles si hay más de 6 cartas (más de 1 página)
  if (totalCount > pageSize && (hasMoreCards || page > 1)) {
    paginationControls.classList.add("show");
    pageInfo.textContent = `Página ${page} de ${totalPages}`;
    
    // Deshabilitar botones según corresponda
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = !hasMoreCards || page >= totalPages;
  } else {
    paginationControls.classList.remove("show");
    pageInfo.textContent = totalCount > 0 ? `${totalCount} carta${totalCount !== 1 ? 's' : ''} encontrada${totalCount !== 1 ? 's' : ''}` : "Sin resultados";
  }
  
  prevBtn.setAttribute("aria-disabled", prevBtn.disabled);
  nextBtn.setAttribute("aria-disabled", nextBtn.disabled);
}
