// Mostrar usuario logueado o redirigir si no existe
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
  
  // Muestra el nombre en el panel
  const panelUsuario = document.querySelector('#nombreUsuario');
  if (panelUsuario) {
    panelUsuario.textContent = currentUser;
  }
  
  // Mostrar carta favorita
  displayFavoriteCard();
  
  // ------------------ NUEVO: mostrar conteo y paquetes del usuario ------------------
  updatePackageCountAndList();
  // -------------------------------------------------------------------------------

  // Lógica del modal de bienvenida - mostrar siempre al cargar la página de perfil
  const hasSeenWelcomeToday = sessionStorage.getItem('hasSeenWelcomeToday');
  
  if (!hasSeenWelcomeToday) {
    // Mostrar modal de bienvenida
    document.getElementById('pageWelcomeUser').textContent = currentUser;
    document.getElementById('pageWelcomeModal').style.display = 'flex';
    
    // Marcar que ya vio el modal hoy
    sessionStorage.setItem('hasSeenWelcomeToday', 'true');
  }
});

function displayFavoriteCard() {
  const favoriteCard = localStorage.getItem('favoriteCard');
  const cartaFavoritaContainer = document.getElementById('cartaFavoritaContainer');
  
  if (favoriteCard && cartaFavoritaContainer) {
    const card = JSON.parse(favoriteCard);
    // Usar helper de traducción expuesto por translator.js si está disponible
    const t = window.t || ((k) => (localStorage.getItem('selectedLanguage') === 'en' ? k : k));
    const favoriteLabel = (typeof t === 'function') ? t('profile.favoriteCard') : 'Carta Favorita:';
    cartaFavoritaContainer.innerHTML = `
      <div class="favorite-card-display">
        <img src="${card.images?.small || ''}" alt="${favoriteLabel} ${card.name || ''}" class="favorite-card-image">
      </div>
    `;
  } else if (cartaFavoritaContainer) {
    // Insertar elemento marcado para traducción por el translator.js
    cartaFavoritaContainer.innerHTML = '<p data-translate="noCardSelected" class="no-favorite"></p>';
  }
}

function closeWelcomeModal() {
  document.getElementById('pageWelcomeModal').style.display = 'none';
}

// Cerrar sesión
function logout() {
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('hasSeenWelcome');
  sessionStorage.removeItem('justLoggedIn');
  sessionStorage.removeItem('hasSeenWelcomeToday');
  window.location.href = '../index.html';
}

// ------------------ NUEVAS FUNCIONES: conteo y render de paquetes ------------------
function updatePackageCountAndList() {
  const cantidadSpan = document.getElementById('cantidadPaquetes');
  const noCartasDiv = document.querySelector('.noCartas');

  let paquetes = [];
  try {
    const raw = localStorage.getItem('paquetesCreados');
    paquetes = raw ? JSON.parse(raw) : [];
  } catch (e) {
    paquetes = [];
    console.error('Error parsing paquetesCreados from localStorage', e);
  }

  // Actualizar contador (cantidad total de paquetes creados, aunque algunos estén vacíos)
  if (cantidadSpan) cantidadSpan.textContent = String(paquetes.length || 0);

  // Filtrar sólo paquetes que tengan al menos una carta guardada
  const paquetesConCartas = (paquetes || []).filter(p => Array.isArray(p.cartas) && p.cartas.length > 0);

  if (!noCartasDiv) return;

  if (paquetesConCartas.length === 0) {
    // Dejar el mensaje original si no hay paquetes con cartas
    noCartasDiv.innerHTML = `<h3 data-translate="profile.noPacks">Todavía no has comenzado con tus paquetes con tus propias cartas</h3>`;
    // Reaplicar traducciones si el traductor ya está cargado
    const lang = localStorage.getItem('selectedLanguage') || document.documentElement.lang || 'es';
    if (typeof updateTranslations === 'function') updateTranslations(lang);
    return;
  }

  // Construir grid con los paquetes (mostrar sólo aquellos con cartas; mostrar la primera carta)
  const listContainer = document.createElement('div');
  listContainer.className = 'user-package-grid';

  paquetesConCartas.forEach(paquete => {
    const firstCard = paquete.cartas[0];
    const imgSrc = (firstCard && (firstCard.images?.small || firstCard.image || firstCard.imagen)) || '../Imagenes/carta-placeholder.png';
    const nombre = paquete.nombre || 'Paquete sin nombre';

    const cardDiv = document.createElement('div');
    cardDiv.className = 'user-package-card';
    cardDiv.innerHTML = `
      <div class="user-package-card-inner">
        <div class="user-package-img-wrap">
          <img src="${imgSrc}" alt="Primera carta de ${nombre}" onerror="this.src='../Imagenes/carta-placeholder.png'">
        </div>
        <div class="user-package-meta">
          <div class="user-package-name">${escapeHtml(nombre)}</div>
          <div class="user-package-info">${(paquete.cartas ? paquete.cartas.length : 0)} cartas</div>
        </div>
      </div>
    `;
    // Opcional: al hacer click se puede abrir detalles si se desea
    listContainer.appendChild(cardDiv);
  });

  // Reemplazar contenido del contenedor noCartas por la lista
  noCartasDiv.innerHTML = ''; // limpiar
  noCartasDiv.appendChild(listContainer);

  // Reaplicar traducciones si el traductor ya está cargado
  const lang = localStorage.getItem('selectedLanguage') || document.documentElement.lang || 'es';
  if (typeof updateTranslations === 'function') updateTranslations(lang);
}

// Pequeño helper para evitar inyección al insertar texto
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
// -----------------------------------------------------------------------------