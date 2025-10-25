// Registro: guarda usuario y contraseña en Local Storage
function register() {
    const userEl = document.getElementById("regUser");
    const passEl = document.getElementById("regPass");
    const user = userEl ? String(userEl.value || '').trim() : '';
    const pass = passEl ? String(passEl.value || '').trim() : '';
  
    if (user && pass) {
        localStorage.setItem("user", user);
        localStorage.setItem("pass", pass);
        // Mensaje traducido si está disponible
        try {
            window.alert && window.alert('t:alert.register.success');
        } catch (e) {
            alert("Usuario registrado correctamente");
        }

        // Animación de transición para contenedor y título
        const container = document.querySelector('.container');
        const title = document.querySelector('.tituloh1');
        if (container) container.style.animation = "fadeOut 0.8s forwards";
        if (title) title.style.animation = "fadeOut 0.8s forwards";

        setTimeout(() => {
            window.location.href = "Login/login.html";
        }, 800);
    } else {
      // Mensaje traducido si está disponible
      try {
          window.alert && window.alert('t:alert.register.error');
      } catch (e) {
          alert("Complete todos los campos");
      }
    }
  }