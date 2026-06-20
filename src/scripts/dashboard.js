import { API_BASE_URL } from "./config.js";

const token = localStorage.getItem("token")
console.log("token no dashboard:", token)
let editar_task = false


if (!token){
    window.location.replace("/index.html")
}

async function colocarNome() {
    const response = await fetch(`${API_BASE_URL}/user/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
    })
    const user = await response.json()
    const nome = user.name
    
    document.getElementById('perfil_').innerHTML = nome 
}

colocarNome()

async function atualizar_card_cima() {
    const res = await fetch(`${API_BASE_URL}/task/`,{
            method : 'GET',
            headers : {
                'Authorization': `Bearer ${token}`
            }})
    if(res.status === 401 || res.status === 400){
        localStorage.removeItem("token")
        window.location.replace("/index.html")
        return;
    }
    
    let tasks = await res.json()
    
    

    const total = tasks.length;
    const emAndamento = tasks.filter(t => t.status === 'in_progress').length;
    const concluidas = tasks.filter(t => t.status === 'done').length;

    document.getElementById("total").textContent = total
    document.getElementById("em_andamento").textContent = emAndamento
    document.getElementById("concluidas").textContent = concluidas
    
}

async function criar_secao(titulo,task){
    if(task.length==0){return;}

    const container = document.getElementById('card-de-baixo');
    const h5 = document.createElement('h5');
    h5.textContent = titulo
    container.appendChild(h5)

    task.forEach(task => {
        const card = document.createElement("div")
        card.className = 'card-unico'
        card.classList.add(`prioridade-${task.priority}`)
        card.dataset.id = task.id
        card.dataset.title = task.title
        card.dataset.status = task.status
        card.dataset.priority = task.priority
        card.dataset.due_date = task.due_date ?? ''
        card.dataset.project_id = task.project_id ?? ''
        
        const statusClass = {
            pending: 'status-pending',
            in_progress: 'status-progress',
            done: 'status-done'
            }[task.status] ?? '';
        let status_task = "";

        if (task.status == "pending"){
            status_task = "Pendente";
        }
        else if (task.status == "in_progress"){
            status_task = "Em andamento";
        }
        else if (task.status== "done"){
            status_task = "Concluída"
        }

        if (task.status=='done'){
            card.innerHTML = `
            <div>
                <div class="card-nome-tarefa d-flex align-items-center">
                    <input class="form-check-input" style="margin-right: 10px;" type="checkbox" checked id="check-${task.id}">
                    <label style="text-decoration: line-through;" for="check-${task.id}" >${task.title}</label>
                </div>
                ${task.project ? `<small class='projeto-task' >${task.project.title}</small>` : ''}
            </div>
            <div class="card-status ${statusClass}">${status_task}</div>
            `
        }
        else{
            card.innerHTML = `
            <div>
                <div class="card-nome-tarefa d-flex align-items-center">
                    <input class="form-check-input" style="margin-right: 10px;" type="checkbox" id="check-${task.id}">
                    <label for="check-${task.id} ">${task.title}</label>           
                </div>
                ${task.project ? `<small class='projeto-task'">${task.project.title}</small>` : ''}
            </div>
            <div class="card-status ${statusClass}">${status_task}</div>
            
            `
        }
       
        container.appendChild(card)
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            taskAlvo = card;
            menu.style.display = 'block';
            menu.style.left = e.clientX + 'px';
            menu.style.top  = e.clientY + 'px';
        });
        const checkbox = document.getElementById(`check-${task.id}`)

        if(checkbox){
            checkbox.addEventListener("click", async function (event) {
            // event.preventDefault();

            if (task.status === "pending") {
                task.status = "in_progress";
                checkbox.checked = true;
            } 
            
            else if (task.status === "in_progress") {
                task.status = "done";
                checkbox.checked = true;
            } 
            
            else if (task.status === "done") {
                task.status = "pending";
                checkbox.checked = false;
            }

            const res = await fetch(`${API_BASE_URL}/task/${task.id}`, {
                method: "PATCH",
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: task.status
                })
            });

            if (res.ok) {
                atualizar_card_cima();
                setTimeout(()=>{
                    renderizar_task();

                },450)
                
            }

            });

        }
                

    });

}

async function renderizar_projeto_na_cricao_task(){
    const select = document.getElementById('select-project');
    
    const res = await fetch(`${API_BASE_URL}/project/`,{
            method : 'GET',
            headers : {
                'Authorization': `Bearer ${token}`
            }
        })
    if(res.status === 401 || res.status === 400){
        localStorage.removeItem("token")
        window.location.replace("/index.html")
        return;
    }

    const data = await res.json()
    
    select.innerHTML = '<option value="">Nenhum</option>' + data.map(project => 
    `<option value="${project.id}">${project.title}</option>`
    ).join('');
    
}

async function renderizar_task() {
    const res = await fetch(`${API_BASE_URL}/task/`,{
            method : 'GET',
            headers : {
                'Authorization': `Bearer ${token}`
            }
        })
    if(res.status === 401 || res.status === 400){
        localStorage.removeItem("token")
        window.location.replace("/index.html")
        return;
    }

    let tasks = await res.json();
    console.log(tasks)
    const concluidas = tasks.filter(t => t.status === 'done');
    const pendentes = tasks.filter(t=>t.status === 'pending');
    const emAndamento = tasks.filter(t => t.status === 'in_progress');
    
    let qtd = 5;
    
    const concluidas_qtd = concluidas.slice(-qtd).reverse()
    const pendentes_qtd = pendentes.slice(-qtd).reverse()
    const em_andamento_qtd = emAndamento.slice(-qtd).reverse()

    const container = document.getElementById('card-de-baixo')
    container.innerHTML=""

    criar_secao('Em andamento', em_andamento_qtd);
    criar_secao('Pendentes', pendentes_qtd);
    criar_secao('Concluídas', concluidas_qtd);
    renderizar_projeto_na_cricao_task();
}




//CRIAR TASK
const form = document.getElementById("formModal")
form.addEventListener("submit",async function(event){
    event.preventDefault();

    const formData = new FormData(form)
    const dados = Object.fromEntries(formData)
    
    dados.due_date = dados.due_date || null;
    dados.project_id = dados.project_id ? parseInt(dados.project_id) : null;
    
    
    if (editar_task){
        try{
        const response = await fetch(`${API_BASE_URL}/task/${taskAlvo.dataset.id}`,{
            method : 'PATCH',
            headers : {
                'Content-type':'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dados)
        
            
        })
        const resultado = await response.json()
        
        if(response.ok){
            atualizar_card_cima();
            renderizar_task();
        }
    }

    catch (erro){
        console.log("erro na requisicao:", erro)
    }
    editar_task = false
    }
    else{
        try{
        const response = await fetch(`${API_BASE_URL}/task/`,{
            method : 'POST',
            headers : {
                'Content-type':'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dados)
        
            
        })
        const resultado = await response.json()
        
        if(response.ok){
            atualizar_card_cima();
            renderizar_task();
        }
    }

    catch (erro){
        console.log("erro na requisicao:", erro)
    }
    }
    
})



const btn = document.getElementById("trocar-tema")

if (localStorage.getItem("theme") === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  btn.textContent = "☀️";
}

//MUDAR TEMA
btn.addEventListener("click",()=>{
    const html = document.documentElement;
    if(html.getAttribute("data-theme")==="dark"){
        html.removeAttribute("data-theme");
        btn.textContent="🌙"
        localStorage.setItem("theme", "light");
    }else{
        html.setAttribute("data-theme","dark");
        btn.textContent = '☀️'
        localStorage.setItem("theme", "dark");
    }
    
})

const menu = document.getElementById('context-menu');
let taskAlvo = null;


// Fecha ao clicar fora
document.addEventListener('click', () => {
  menu.style.display = 'none';
});

document.getElementById('btn-editar-task').addEventListener('click', async () => {
    const dataset = taskAlvo.dataset;


    const form = document.getElementById("formModal");
    await renderizar_projeto_na_cricao_task(); // carrega os projetos no select
    // dados atuais do painel/card
    form.title.value = dataset.title;
    form.description.value = dataset.description;
    form.status.value = dataset.status;
    form.priority.value = dataset.priority;
    form.due_date.value = dataset.due_date;
    document.getElementById('select-project').value = dataset.project_id ?? ''; // seta o projeto atual

    // abrir modal
    const modal = new bootstrap.Modal(
        document.getElementById("meuModal")
    );
    editar_task = true
    modal.show();
});

document.getElementById('btn-excluir-task').addEventListener('click',async () => {
  const id = taskAlvo.dataset.id;
  const response = await fetch(`${API_BASE_URL}/task/${taskAlvo.dataset.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if(response.ok){
            renderizar_task()
        }
    });

atualizar_card_cima();
renderizar_task();
renderizar_projeto_na_cricao_task();
