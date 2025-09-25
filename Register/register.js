// Registro: guarda usuario y contraseña en Local Storage
function register() {
    const user = document.getElementById("regUser").value;
    const pass = document.getElementById("regPass").value;
  
    if (user && pass) {
        localStorage.setItem("user", user);
        localStorage.setItem("pass", pass);
        alert("Usuario registrado correctamente ✅");

        // Animación de transición para contenedor y título
        const container = document.querySelector('.container');
        const title = document.querySelector('.tituloh1');
        container.style.animation = "fadeOut 0.8s forwards";
        title.style.animation = "fadeOut 0.8s forwards";

        setTimeout(() => {
            window.location.href = "../Login/login.html";
        }, 800);
    } else {
      alert("⚠️ Complete todos los campos");
    }
  }