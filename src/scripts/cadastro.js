import { API_BASE_URL } from "./config.js";

const form = document.getElementById("formIDcadastro")
const erroMsg = document.getElementById("erroLogin");

form.addEventListener("input", () => {
  erroMsg.style.display = "none";
});
form.addEventListener("submit",async (e) => {
    e.preventDefault();

    const data = new FormData(form)

    const name = data.get("nome")
    const email = data.get("email");
    const password = data.get("senha");

    const resposta = await fetch(`${API_BASE_URL}/user/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
    name: name,
    email: email,
    password: password
    })
    });

    const resultado = await resposta.json()
    if (resposta.ok){
        window.location.replace("index.html");
    }
    else{
        erroMsg.style.display = "block";
    }
    

    

})