// Login: valida usuario y contraseña
function login() {
  try {
    const userEl = document.getElementById("loginUser");
    const passEl = document.getElementById("loginPass");
    if (!userEl || !passEl) {
      console.error('Login: elementos de input no encontrados');
      return;
    }

    const user = String(userEl.value || '').trim();
    const pass = String(passEl.value || '').trim();

    const storedUser = (localStorage.getItem("user") || '').trim();
    const storedPass = (localStorage.getItem("pass") || '').trim();

    console.log('Login attempt for', user);

    if (user && pass && user === storedUser && pass === storedPass) {
      // Mostrar modal de bienvenida
      document.getElementById("welcomeUsername").textContent = user;
      const welcomeModal = document.getElementById("welcomeModal");
      if (welcomeModal) welcomeModal.style.display = "flex";

      // Animación de salida y redirección
      setTimeout(() => {
        const container = document.querySelector('.container');
        const title = document.querySelector('.tituloh1');
        const modal = document.getElementById('welcomeModal');
        
        if (container) container.style.animation = "fadeOut 0.8s forwards";
        if (title) title.style.animation = "fadeOut 0.8s forwards";
        if (modal) modal.style.animation = "fadeOut 0.8s forwards";

        setTimeout(() => {
          localStorage.setItem("currentUser", user);
          window.location.href = "../Perfil Usuario/perfil.html";
        }, 800);
      }, 1500);

    } else {
      // Mensaje de error con traducción si está disponible
      const msg = (typeof window.t === 'function') ? window.t('alert.login.error') : '❌ Usuario o contraseña incorrectos';
      // Usar alert traducido si el traductor está presente
      try {
        window.alert && window.alert('t:alert.login.error');
      } catch (e) {
        console.warn('alert traducido no disponible, mostrando mensaje en DOM');
        const errorMsg = document.createElement('div');
        errorMsg.textContent = msg;
        errorMsg.style.cssText = "color: red; text-align: center; margin-top: 15px; font-weight: bold;";
        document.querySelector('.container').appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 3000);
      }
    }
  } catch (err) {
    console.error('Error en login():', err);
  }
}