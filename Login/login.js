// Login: valida usuario y contraseña
function login() {
  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;

  const storedUser = localStorage.getItem("user");
  const storedPass = localStorage.getItem("pass");

  if (user === storedUser && pass === storedPass) {
    // Mostrar modal de bienvenida
    document.getElementById("welcomeUsername").textContent = user;
    document.getElementById("welcomeModal").style.display = "flex";

    // Animación de salida y redirección
    setTimeout(() => {
      const container = document.querySelector('.container');
      const title = document.querySelector('.tituloh1');
      const modal = document.getElementById('welcomeModal');
      
      container.style.animation = "fadeOut 0.8s forwards";
      title.style.animation = "fadeOut 0.8s forwards";
      modal.style.animation = "fadeOut 0.8s forwards";

      setTimeout(() => {
        localStorage.setItem("currentUser", user);
        window.location.href = "../Pagina Base/cotidiano1.html";
      }, 800);
    }, 1500);

  } else {
    // Crear elemento temporal para mostrar error
    const errorMsg = document.createElement('div');
    errorMsg.textContent = "❌ Usuario o contraseña incorrectos";
    errorMsg.style.cssText = "color: red; text-align: center; margin-top: 15px; font-weight: bold;";
    document.querySelector('.container').appendChild(errorMsg);
    
    setTimeout(() => errorMsg.remove(), 3000);
  }
}

