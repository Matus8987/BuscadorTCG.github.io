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