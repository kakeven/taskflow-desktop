import { API_BASE_URL } from "./config.js";

const btn = document.getElementById("trocar-tema");
const token = localStorage.getItem("token");

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

if (localStorage.getItem("theme") === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  btn.textContent = "☀️";
}

document.getElementById('tipo-importacao').addEventListener('change', function() {
    const textarea = document.getElementById('secao-textarea');
    const arquivo  = document.getElementById('secao-arquivo');

    if (this.value === 'textarea') {
        textarea.classList.remove('d-none');
        arquivo.classList.add('d-none');
    } else {
        arquivo.classList.remove('d-none');
        textarea.classList.add('d-none');
    }
});

document.addEventListener("click",(e) => {
    if(!e.target.closest("#painel-projeto") && !e.target.closest("#Modalprojeto") && !e.target.closest("#Modal-task") && !e.target.closest("#context-menu") ){
        document.getElementById('painel-projeto').classList.add('d-none');
    }
})

function traduzirStatus(status){

    const mapa = {
        pending: "Pendente",
        in_progress: "Em andamento",
        done: "Concluída"
    };

    return mapa[status];
}

function traduzirPrioridade(priority){

    const mapa = {
        low: "Baixa",
        medium: "Média",
        high: "Alta"
    };

    return mapa[priority];
}

function renderPainel(projeto){

    document.getElementById('painel-conteudo').innerHTML = `
    
        <div class="painel-header">
            <h3>${projeto.title}</h3>

            <span class="badge-status ${
                projeto.status
            }">
                ${traduzirStatus(projeto.status)}
            </span>
        </div>

        <div class="painel-descricao">
            ${
                projeto.description || 
                "Sem descrição"
            }
        </div>

        <div class="painel-info">

            <div class="info-item">
                <span class="info-label">
                    Prazo
                </span>

                <span class="info-value">
                    ${
                        projeto.due_date || 
                        "Sem prazo"
                    }
                </span>
            </div>

            <div class="info-item">
                <span class="info-label">
                    Prioridade
                </span>

                <span class="info-value prioridade-${
                    projeto.priority
                }">
                    ${
                        traduzirPrioridade(
                            projeto.priority
                        )
                    }
                </span>
            </div>

        </div>
    <div id="painel-tasks"></div>
    `;
    document.getElementById('painel-tasks').addEventListener('contextmenu', (e) => {
    const task = e.target.closest('.painel-task-item');
    if (!task) return;

    e.preventDefault();
    taskAlvo = task;

    menu.style.display = 'block';
    menu.style.left = e.clientX + 'px';
    menu.style.top  = e.clientY + 'px';
  });
}

async function renderTasks(projetoId) {
    const response = await fetch(`${API_BASE_URL}/task/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const todasTasks = await response.json();
    const tasks = todasTasks.filter(t => t.project_id == projetoId);

    //igual ao dashboard
    const emAndamento = tasks.filter(t => t.status === 'in_progress');
    const pendentes   = tasks.filter(t => t.status === 'pending');
    const concluidas  = tasks.filter(t => t.status === 'done');

    let html = '<h5>Em andamento</h5>';
    emAndamento.forEach(task => {
        html += `
  <div class="painel-task-item prioridade-${task.priority}" 
        data-id="${task.id}"
        data-title="${task.title}"
        data-status="${task.status}"
        data-priority="${task.priority}"
        data-due_date="${task.due_date ?? ''}"
        data-project_id="${task.project_id}">
    <input type="checkbox" id="check-${task.id}" ${task.status === 'done' ? 'checked' : ''}>
    <label for="check-${task.id}" ${task.status === 'done' ? 'style="text-decoration: line-through; opacity: 0.5;"' : ''}>
      ${task.title}
    </label>
  </div>
`;
    });

    html += '<h5>Pendentes</h5>';
    pendentes.forEach(task => {
       html += `
  <div class="painel-task-item prioridade-${task.priority}"  
        data-id="${task.id}"
        data-title="${task.title}"
        data-status="${task.status}"
        data-priority="${task.priority}"
        data-due_date="${task.due_date ?? ''}"
        data-project_id="${task.project_id}">
    <input type="checkbox" id="check-${task.id}" ${task.status === 'done' ? 'checked' : ''}>
    <label for="check-${task.id}" ${task.status === 'done' ? 'style="text-decoration: line-through; opacity: 0.5;"' : ''}>
      ${task.title}
    </label>
  </div>
`;
    });

    html += '<h5>Concluidas</h5>';
    concluidas.forEach(task=>{
       html += `
  <div class="painel-task-item prioridade-${task.priority}"  
        data-id="${task.id}"
        data-title="${task.title}"
        data-status="${task.status}"
        data-priority="${task.priority}"
        data-due_date="${task.due_date ?? ''}"
        data-project_id="${task.project_id}">
    <input type="checkbox" id="check-${task.id}" ${task.status === 'done' ? 'checked' : ''}>
    <label for="check-${task.id}" ${task.status === 'done' ? 'style="text-decoration: line-through; opacity: 0.5;"' : ''}>
      ${task.title}
    </label>
  </div>
`;
    })
    
    document.getElementById('painel-tasks').innerHTML = html;
    tasks.forEach(task => {
    const checkbox = document.getElementById(`check-${task.id}`);
    
    checkbox.addEventListener('change', async () => {
        // mesma lógica do dashboard
        if (task.status === 'pending')     task.status = 'in_progress';
        else if (task.status === 'in_progress') task.status = 'done';
        else if (task.status === 'done')   task.status = 'pending';

        await fetch(`${API_BASE_URL}/task/${task.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: task.status })
        });
        setTimeout(()=>{
            renderTasks(projetoId); // re-renderiza o painel após mudar
        },450)
        
        });
    })

    const total_tamanho = tasks.length;
    const concluidas_tamanho = tasks.filter(t => t.status === 'done').length;
    const progresso = total_tamanho === 0 ? 0 : Math.round((concluidas_tamanho / total_tamanho) * 100);

    // pega a barra do card correspondente ao projeto
   
    const card = document.querySelector(`#lista-projetos [data-id="${projetoId}"]`);
    if (card) {
        const barra = card.querySelector('.progress-bar');
        if (barra) barra.style.width = `${progresso}%`;
    }
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

function criarCard(projeto) {
  
    const statusClass = {
        pending: 'status-pending',
        in_progress: 'status-progress',
        done: 'status-done'
    }[projeto.status] ?? '';
  
        let status_projeto = "";

        if (projeto.status == "pending"){
            status_projeto = "Pendente";
        }
        else if (projeto.status == "in_progress"){
            status_projeto = "Em andamento";
        }
        else if (projeto.status== "done"){
            status_projeto = "Concluída"
        }

    return `
        <div class="col" data-id="${projeto.id}" data-title="${projeto.title}" data-status="${projeto.status}" data-due_date="${projeto.due_date ?? ''}" data-description="${projeto.description}" data-priority="${projeto.priority}">
        <div class="card d-flex flex-column" id="card-cima">

            <div class="card-body">
            <h5 class="card-title">${projeto.title}</h5>
            <p class="card-text">${projeto.description}</p>
            </div> <!-- fecha card-body -->

            <div class="card-footer mt-auto" id="card-baixo">
                
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span id="card-status" class="${statusClass}">
                        ${status_projeto}
                    </span>

                    <small>
                        ${projeto.due_date ?? 'Sem prazo'}
                    </small>
                </div> <!-- fecha div status/data -->

                <div class="progress" style="height: 5px;">
                    <div class="progress-bar" style="width: ${projeto.progresso}%">
                    </div> <!-- fecha progress-bar -->
                </div> <!-- fecha progress -->

            </div> <!-- fecha card-footer -->

        </div> <!-- fecha card -->

        </div> <!-- fecha col -->
    `;

   
}

async function carregarProjetos() {
  
  
  const response = await fetch(`${API_BASE_URL}/project`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const projetos = await response.json();
  const lista = document.getElementById('lista-projetos');
  lista.innerHTML = projetos.map(criarCard).join('');
}

async function carregarProjetosNoSelect() {
    const response = await fetch(`${API_BASE_URL}/project`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const projetos = await response.json();
    const select = document.getElementById('select-project');

    select.innerHTML = '<option value="">Nenhum</option>' + 
        projetos.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
}


const form = document.getElementById("formModal")
form.addEventListener("submit",async function(event){
    event.preventDefault();

    const formData = new FormData(form)
    const dados = Object.fromEntries(formData)
    dados.due_date = dados.due_date || null;
    const id_project = form.dataset.editando;
    if (!id_project){
        try{
            const response = await fetch(`${API_BASE_URL}/project/criar`,{
                method : 'POST',
                headers : {
                    'Content-type':'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dados)
            
                
            })
            const resultado = await response.json()
            if(response.ok){
                carregarProjetos();
                const modal = bootstrap.Modal.getInstance(document.getElementById("Modalprojeto"));
                modal.hide();
                form.reset();
            }
        }
        catch (erro){
        console.log("erro na requisicao:", erro)
        }
    
    }else if(id_project){
        try{
            const response = await fetch(`${API_BASE_URL}/project/${id_project}`,{
                method : 'PATCH',
                headers : {
                    'Content-type':'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dados)
            
                
            })
            const resultado = await response.json()
            console.log(resultado)
            if(response.ok){
                carregarProjetos();
                form.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById("Modalprojeto"));
                modal.hide();
                delete form.dataset.editando;
                document.querySelector(".modal-title").textContent = "Criar projeto";
                renderPainel(dados)
            }
        }
        catch (erro){
            console.log("erro na requisicao:", erro)
        }
    }
   
})

document.getElementById('lista-projetos').addEventListener('click', function(e) {
    const card = e.target.closest('.col')
    e.stopPropagation()
    if (!card) return
        const dataset = card.dataset
        
        renderPainel(dataset)
        renderTasks(dataset.id)
        document.getElementById('painel-projeto').classList.remove('d-none')
        
        const btnExcluir = document.getElementById('btn-excluir')
        btnExcluir.onclick = async function(){
        await fetch(`${API_BASE_URL}/project/${dataset.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        document.getElementById('painel-projeto').classList.add('d-none')
        carregarProjetos()
        }

        const btnEditar = document.getElementById('btn-editar')
        btnEditar.onclick = () => {
            
            const form = document.getElementById("formModal");

            // dados atuais do painel/card
            form.title.value = dataset.title;
            form.description.value = dataset.description;
            form.status.value = dataset.status;
            form.priority.value = dataset.priority;
            form.due_date.value = dataset.due_date;

            // guardar id do projeto
            form.dataset.editando = dataset.id;

            // mudar titulo do modal
            document.querySelector(".modal-title")
            .textContent = "Editar projeto";

            // abrir modal
            const modal = new bootstrap.Modal(
                document.getElementById("Modalprojeto")
            );

            modal.show();
            
        };

        const btnTask = document.getElementById('btn-add-task')
        btnTask.onclick = async () => {
            await carregarProjetosNoSelect();
            document.getElementById('select-project').value = dataset.id;
            document.querySelector(".modal-title").textContent = "Criar task";

            const modal = new bootstrap.Modal(document.getElementById("Modal-task"));
            modal.show();
        
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


    const form = document.getElementById("Modaltask");

    // dados atuais do painel/card
    form.title.value = dataset.title;
    form.description.value = dataset.description;
    form.status.value = dataset.status;
    form.priority.value = dataset.priority;
    form.due_date.value = dataset.due_date;

    // abrir modal
    const modal = new bootstrap.Modal(
        document.getElementById("Modal-task")
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
            renderTasks(taskAlvo.dataset.project_id)
        }
    });

document.getElementById("btn-importar-json").addEventListener("click", async () => {
    const tipoImportacao = document.getElementById("tipo-importacao").value;
    let tasks;

    if (tipoImportacao === "textarea") {
        try {
            tasks = JSON.parse(document.getElementById("textarea-json").value);
        } catch {
            alert("JSON inválido");
            return;
        }
    } else {
        const file = document.getElementById("input-file").files[0];
        const text = await file.text();
        try { tasks = JSON.parse(text); } 
        catch { alert("Arquivo JSON inválido"); return; }
    }

    //  é array
    if (!Array.isArray(tasks)) tasks = [tasks];

    const projectId = document.getElementById("select-project").value;

    for (const task of tasks) {
        task.project_id = task.project_id || projectId || null;
        await fetch(`${API_BASE_URL}/task/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(task)
        });
    }

    bootstrap.Modal.getInstance(document.getElementById("Modal-task")).hide();
    renderTasks(projectId);
});


document.getElementById("Modaltask").addEventListener("submit", async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const dados = Object.fromEntries(formData);
    dados.due_date = dados.due_date || null;
    if(editar_task){
        const response = await fetch(`${API_BASE_URL}/task/${taskAlvo.dataset.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById("Modal-task"));
            modal.hide();
            renderTasks(taskAlvo.dataset.project_id); // atualiza o painel
        }
        editar_task = false
    }else{
        try {
        const response = await fetch(`${API_BASE_URL}/task/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById("Modal-task"));
            modal.hide();
            renderTasks(dados.project_id); // atualiza o painel
        }
    } catch (erro) {
        console.log("erro:", erro);
    }
    }
    
});
carregarProjetos()


