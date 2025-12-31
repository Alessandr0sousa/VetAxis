## 🚀 Visão Geral
O **VetAxis** é uma aplicação desenvolvida em **Angular 20** com foco em gestão veterinária.  
Ela oferece um **menu lateral responsivo** que se adapta ao tamanho da tela e integra diferentes módulos da clínica, como **dashboard, agenda, internações, estoque e financeiro**.

---

## 🛠️ Tecnologias Utilizadas
### Frontend
- [Angular 20](https://angular.dev/)  
- [TypeScript](https://www.typescriptlang.org/)  
- [Bootstrap 5](https://getbootstrap.com/)  
- [Font Awesome](https://fontawesome.com/)  

### Backend
O backend é responsável por fornecer os dados e autenticação da aplicação.  
- **Node.js + Express** (API REST)  
- **Banco de Dados**: PostgreSQL ou MySQL  
- **Autenticação**: JWT (JSON Web Token) para login seguro  
- **Serviços**: CRUD de clientes, pets, internações, estoque e financeiro  

---

## 📂 Estrutura do Projeto
src/ ├── app/ │    ├── components/ │    │    ├── card-cliente/ │    │    └── menu-principal/ │    ├── pages/ │    │    ├── dashboard/ │    │    ├── pets/ │    │    ├── agenda/ │    │    ├── internacoes/ │    │    ├── estoque/ │    │    └── financeiro/ │    └── app.component.ts ├── assets/ │    └── menu.json

---

## ⚙️ Funcionalidades
- **Menu lateral responsivo** com suporte a submenus.  
- **Dashboard** com visão geral da clínica.  
- **Agenda de cirurgias e exames** com calendário interativo.  
- **Gestão de pets**: formulário de cadastro e lista de pets vinculados aos clientes.  
- **Internações**: controle de pacientes internados.  
- **Estoque**: gerenciamento de medicamentos e insumos.  
- **Financeiro**: controle de receitas e despesas.  
- **Autenticação**: login seguro com JWT.  

---

## 📦 Instalação

### Frontend
```bash
git clone https://github.com/seu-repo/vetaxis.git
cd vetaxis
npm install
ng serve
Acesse em:
http://localhost:4200
Backend (Java/Spring Boot)
http://localhost:8080
🖼️ Exemplo de menu.json
{
  "items": [
    { "label": "Dashboard", "icon": "fa-solid fa-home", "routerLink": ["/dashboard"] },
    { "label": "Pets", "icon": "fa-solid fa-dog", "routerLink": ["/pets"] },
    { "label": "Agenda", "icon": "fa-solid fa-calendar", "routerLink": ["/agenda"] },
    { "label": "Internações", "icon": "fa-solid fa-bed", "routerLink": ["/internacoes"] },
    { "label": "Estoque", "icon": "fa-solid fa-boxes", "routerLink": ["/estoque"] },
    { "label": "Financeiro", "icon": "fa-solid fa-dollar-sign", "routerLink": ["/financeiro"] }
  ]
}
📌 Próximos Passos
- [ ] Formulário e lista de pets
- Criar formulário de cadastro com dados básicos (nome, espécie, raça, idade, tutor).
- Implementar lista com busca e filtros.
- [ ] Dashboard
- Exibir métricas principais (número de pets, cirurgias agendadas, internações ativas).
- [ ] Agenda de cirurgias e exames
- Criar calendário interativo para agendamento e visualização.
- [ ] Internações
- Implementar módulo para acompanhar pacientes internados e status.
- [ ] Estoque
- Controle de entrada/saída de medicamentos e insumos.
- [ ] Financeiro
- Relatórios de receitas, despesas e fluxo de caixa.
- [ ] Autenticação
- Implementar login com JWT e controle de permissões por perfil (admin, veterinário, recepção).
🎨 Estilos
No menu-principal.scss você pode definir:
.sidebar-collapsed {
  width: 60px;
  transition: all 0.3s ease;
}

.sidebar-expanded {
  width: 250px;
  transition: all 0.3s ease;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 998;
}
📌 Contribuição
- Faça um fork do projeto.
- Crie uma branch para sua feature: git checkout -b minha-feature.
- Commit suas alterações: git commit -m 'Adiciona minha feature'.
- Faça push para a branch: git push origin minha-feature.
- Abra um Pull Request.
📄 Licença
Este projeto está sob a licença MIT.
Sinta-se livre para usar, modificar e distribuir.

---
