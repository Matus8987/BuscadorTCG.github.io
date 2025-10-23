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

  // Construir grid con los paquetes, usando la misma estructura que el modal de selección
  const grid = document.createElement('div');
  grid.className = 'row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 user-package-grid';

  paquetesConCartas.forEach(pkg => {
    const currentCards = Array.isArray(pkg.cartas) ? pkg.cartas.length : 0;
    const isAtLimit = pkg.numeroCartas && currentCards >= pkg.numeroCartas;

    // Tipo -> clase
    const typeClass = pkg.tipo ? `type-${pkg.tipo}` : 'no-type';

    // Primera carta como imagen
    let cardImageSrc = '../Imagenes/carta-placeholder.png';
    let cardImageAlt = 'Primera carta del paquete';
    if (pkg.cartas && pkg.cartas.length > 0) {
      const first = pkg.cartas[0];
      cardImageSrc = first.image || first.images?.small || first.images?.large || first.imagen || cardImageSrc;
      cardImageAlt = first.name || first.nombre || cardImageAlt;
    }

    // Columna + tarjeta (mismo markup base que package-bootstrap-card)
    const col = document.createElement('div');
    col.className = 'col';

    const card = document.createElement('div');
    card.className = `card package-bootstrap-card ${typeClass} ${isAtLimit ? 'disabled' : 'clickable'}`;
    card.dataset.pkgId = pkg.id;

    card.innerHTML = `
      <div class="card-img-container">
        <img src="${cardImageSrc}" class="card-img-top package-card-image-center" alt="${escapeHtml(cardImageAlt)}" onerror="this.src='../Imagenes/carta-placeholder.png'">
      </div>
      <div class="card-body text-center">
        <h5 class="card-title package-card-name-center">${escapeHtml(pkg.nombre || 'Paquete')}</h5>
        <p class="card-text">
          <small class="text-muted">${currentCards}/${pkg.numeroCartas || '∞'} cartas</small><br>
          ${pkg.tipo ? `<small class="text-muted">Tipo: ${escapeHtml(capitalizeFirst(pkg.tipo))}</small><br>` : ''}
          ${pkg.rareza ? `<small class="text-muted">Rareza: ${escapeHtml(pkg.rareza)}</small><br>` : ''}
          ${pkg.set ? `<small class="text-muted">Set: ${escapeHtml(pkg.set)}</small><br>` : ''}
          <span class="badge ${isAtLimit ? 'bg-danger' : 'bg-success'} mt-2">
            ${isAtLimit ? 'Paquete lleno' : 'Disponible'}
          </span>
        </p>
      </div>
    `;

    // Click abre modal de detalles del paquete si existe la función (misma UX que en Paquetes.js)
    if (!isAtLimit) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        // Preferir la función global definida en Paquetes.js
        if (typeof window.abrirModalDetallesPaquete === 'function') {
          window.abrirModalDetallesPaquete(pkg.id);
        } else {
          // Fallback: emitir evento para que otra parte pueda escucharlo
          window.dispatchEvent(new CustomEvent('profile-open-package', { detail: { packageId: pkg.id } }));
        }
      });
    } else {
      card.style.cursor = 'not-allowed';
    }

    col.appendChild(card);
    grid.appendChild(col);
  });

  // Reemplazar contenido del contenedor noCartas por la grid
  noCartasDiv.innerHTML = '';
  noCartasDiv.appendChild(grid);

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