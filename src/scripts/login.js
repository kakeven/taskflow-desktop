import { API_BASE_URL } from "./config.js";

const form = document.getElementById("formIDlogin")
const erroMsg = document.getElementById("erroLogin");

form.addEventListener("input", () => {
  erroMsg.style.display = "none";
});
form.addEventListener("submit",async (e) => {
    e.preventDefault();

    const data = new FormData(form)

    const email = data.get("email");
    const password = data.get("senha");

    const params = new URLSearchParams();
    params.append("username",email);
    params.append("password",password)

    const resposta = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
    });

    const info = await resposta.json()
    if (resposta.ok){
      console.log(info)
      localStorage.setItem("token",info.access_token)
      console.log("token salvo:", localStorage.getItem("token"))
      window.location.href = "dashboard.html";
    }
    else{
      erroMsg.style.display = "block";
    }

})