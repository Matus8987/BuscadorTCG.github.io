// Login: valida usuario y contraseña
function login() {
  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;

  const storedUser = localStorage.getItem("user");
  const storedPass = localStorage.getItem("pass");

  if (user === storedUser && pass === storedPass) {
    document.getElementById("status").innerText = "✅ Bienvenido, " + user;
    document.getElementById("status").style.color = "green";
  } else {
    document.getElementById("status").innerText = "❌ Usuario o contraseña incorrectos";
    document.getElementById("status").style.color = "red";
  }
}