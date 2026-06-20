# TaskFlow

TaskFlow é uma aplicação desktop para gerenciamento de projetos e tarefas, desenvolvida com HTML, CSS e JavaScript e empacotada com Tauri para distribuição multiplataforma.

O objetivo do projeto é fornecer uma interface simples e organizada para acompanhar projetos, tarefas, prioridades e progresso em um único ambiente.

##  Funcionalidades

* Autenticação de usuários
* Dashboard com métricas gerais

  * Total de tarefas
  * Tarefas em andamento
  * Tarefas concluídas
* Gerenciamento de projetos
* Gerenciamento de tarefas
* Definição de prioridade
* Controle de status
* Datas de prazo opcionais
* Importação de tarefas via JSON
* Interface moderna com tema escuro
* Aplicação desktop distribuída com Tauri

## 🛠 Tecnologias Utilizadas

### Frontend

* HTML5
* CSS3
* JavaScript

### Desktop

* Tauri

## 📂 Estrutura do Projeto

```text
TaskFlow/
├── src/
├── src-tauri/
└── README.md
```

## 🤖 Importação via JSON

O sistema permite importar tarefas através de um JSON estruturado.

Exemplo:

```json
{
  "tasks": [
    {
      "title": "Criar README",
      "description": "Documentação inicial do projeto",
      "priority": "alta",
      "status": "pendente"
    }
  ]
}
```

Essa funcionalidade facilita a integração com ferramentas de IA para geração automática de tarefas e organização de projetos.

## 🎯 Objetivos do Projeto

* Organização pessoal e profissional
* Controle de projetos em andamento
* Experimentos com aplicações desktop utilizando Tauri
* Aprimoramento de arquitetura frontend com JavaScript puro
* Integração de fluxos assistidos por IA

## 🚀 Instalação

```bash
git clone https://github.com/kakeven/taskflow-desktop

cd taskflow

npm install ou pnpm install

npm run tauri dev ou pnpm run tauri dv
```


## 📦 Build para Produção

```bash
npm run tauri build
```

## 🔮 Melhorias Futuras

* Drag and drop de tarefas
* Etiquetas (tags)
* Filtros avançados
* Notificações locais
* Sincronização em nuvem
* Exportação para PDF
* Dashboard com gráficos
* Integração direta com APIs de IA

## 👨‍💻 Autor

Kauã

Desenvolvedor Full Stack
