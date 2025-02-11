const registerButton = document.querySelector("#register")

if(registerButton) {
  registerButton.addEventListener("click", () => {
    window.location.href = "/register"
  });
}
const loginButton = document.querySelector("#login")

if(loginButton) {
  loginButton.addEventListener("click", () => {
    window.location.href = "/login"
  });
}

const profileButton = document.querySelector("#profile")

if(profileButton) {
  profileButton.addEventListener("click", () => {
    window.location.href = "/profile"
  });
}