# 🎶 Ranking Tião Carreiro & Pardinho

Aplicação fullstack (Laravel + React/Next.js) desenvolvida como solução para o desafio **"Teste de conhecimento - Programador Laravel/ReactJS"** da [Techpines](https://github.com/jansenfelipe/top5-tiao-carreiro).  
O sistema exibe o ranking das músicas mais tocadas da dupla **Tião Carreiro & Pardinho**, permite sugestões via YouTube e oferece funcionalidades de administração com autenticação.

---

## 📖 Contexto do Desafio

O desafio consistia em evoluir o projeto original (versão 1.0 em PHP 8.1) para a versão 2.0, atendendo os seguintes requisitos:

1. Separar aplicações em **backend (Laravel)** e **frontend (ReactJS/Next.js)**.  
2. Criar comunicação via **API REST**.  
3. Utilizar **Docker** em ambas aplicações.  
4. Implementar **autenticação** para aprovação/reprovação de músicas.  
5. Permitir CRUD de músicas para usuários autenticados.  
6. Adicionar **testes automatizados** no backend e frontend.  
7. Modernizar layout com biblioteca de estilo.  
8. Exibir **Top 5 músicas** e também (em menor destaque) as músicas da 6ª em diante, com paginação.  

---

## 🏗️ Estrutura do Projeto

```
├── api/                # API Laravel
│   ├── README.md           # Documentação backend
│   ├── docker-compose.yml  # Containers do backend
│   └── ...
├── web-application/               # Aplicação React/Next.js
│   ├── README.md           # Documentação frontend
│   ├── docker-compose.yml  # Containers do frontend
│   └── ...
└── README.md               # Este arquivo unificado
```

---

## 🚀 Tecnologias

### Backend
- **Laravel 11** (API REST)  
- **SQLite** (banco de dados)  
- **Laravel Sanctum** (autenticação)  
- **PHPUnit** (testes)  
- **Docker**  

### Frontend
- **Next.js 14 (React SPA)**  
- **TypeScript**  
- **Tailwind CSS**  
- **Lucide React** e **Radix UI** (UI/UX)  
- **React Hook Form + Zod** (validação de formulários)  
- **Jest + React Testing Library** (testes)  
- **Docker** 

---

## 🎯 Funcionalidades

- Visualizar **Top 5 músicas** mais tocadas no YouTube.  
- Listar músicas restantes (6ª em diante) com paginação.  
- Sugestão de novas músicas via link do YouTube.  
- Painel administrativo com:  
  - Aprovação/rejeição de músicas sugeridas  
  - Criação, edição e exclusão de músicas  
- Autenticação com roles **user** e **admin**.  
- Logging detalhado de requisições no backend.  

---

## 🔧 Instalação e Execução

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd projeto-tiao-carreiro
```

### 2. Configuração com Docker (recomendado)

```bash
docker-compose up -d
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)  
- **Backend API**: [http://localhost:8000](http://localhost:8000)  
- **phpMyAdmin**: [http://localhost:8080](http://localhost:8080)  

---

## 📚 Endpoints da API

### Públicos
- `GET /api/health` → Status da API  
- `GET /api/songs/top5` → Top 5 músicas  
- `GET /api/songs/remaining` → Músicas restantes  
- `GET /api/songs` → Listagem paginada  
- `GET /api/songs/status/{status}` → Músicas por status  
- `POST /api/songs/suggest` → Sugerir nova música  
- `POST /api/auth/register` → Registro de usuário  
- `POST /api/auth/login` → Login  

### Protegidos
- `GET /api/auth/me` → Dados do usuário logado  
- `POST /api/auth/logout` → Logout  

### Admin
- `POST /api/songs` → Criar música  
- `PUT /api/songs/{id}` → Editar música  
- `DELETE /api/songs/{id}` → Excluir música (soft delete)  
- `POST /api/songs/{id}/approve` → Aprovar sugestão  
- `POST /api/songs/{id}/reject` → Rejeitar sugestão  

---

## 🧪 Testes

### Backend (PHPUnit)
```bash
php artisan test
php artisan test --coverage
```

- Testes de gerenciamento (`SongManagementTest`)  
- Testes de logging (`RequestLoggingTest`)  

### Frontend (Jest + RTL)
```bash
npm test
npm run test:watch
npm run test:coverage
```

- `admin-workflow.test.tsx` → Fluxo do admin  
- `user-workflow.test.tsx` → Fluxo usuário + admin  
- Mocks da API e browser APIs  

---

## 👥 Usuários de Teste

**Administrador**  
- Email: `admin@tiaocarreiro.com`  
- Senha: `password123`  

**Usuário Comum**  
- Email: `user@tiaocarreiro.com`  
- Senha: `password123`  

---

## 🔒 Segurança

- Autenticação via tokens (Sanctum).  
- Roles (`user` e `admin`) com policies.  
- Validação de dados de entrada.  
- Soft delete de músicas.  
- Logs de requisição com mascaramento de dados sensíveis.  

---

## 🎵 Dados Iniciais

O sistema vem com **10 músicas pré-cadastradas**, incluindo clássicos como:  
- O Mineiro e o Italiano  
- Pagode em Brasília  
- Terra Roxa  
- Tristeza do Jeca  
- Rio de Lágrimas  
