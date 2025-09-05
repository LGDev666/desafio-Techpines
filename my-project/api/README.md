# Tião Carreiro & Pardinho - Top 5 Músicas API

Backend Laravel para o sistema de gerenciamento das músicas mais tocadas da dupla Tião Carreiro & Pardinho.

## 🎯 Sobre o Projeto

Este é o backend de uma aplicação que exibe as 5 músicas mais tocadas da dupla caipira Tião Carreiro e Pardinho, permitindo que usuários façam sugestões de novas músicas via YouTube e que administradores gerenciem o conteúdo.

## 🚀 Funcionalidades

- **API REST** completa para gerenciamento de músicas
- **Sistema de autenticação** com Laravel Sanctum
- **Roles de usuário** (user/admin)
- **Top 5 músicas** mais tocadas
- **Paginação** para músicas restantes (6ª em diante)
- **Sistema de sugestões** via YouTube
- **Aprovação/reprovação** de sugestões (admin)
- **CRUD completo** para administradores
- **Integração com YouTube** para extração de metadados

## 🛠️ Tecnologias

- **Laravel 11** - Framework PHP
- **SQLite** - Banco de dados
- **Laravel Sanctum** - Autenticação API
- **Docker** - Containerização
- **PHPUnit** - Testes automatizados

## 📋 Pré-requisitos

- Docker e Docker Compose
- Git

## 🔧 Instalação e Configuração

### 1. Clone o repositório
\`\`\`bash
git clone <url-do-repositorio>
cd tiao-carreiro-backend
\`\`\`

### 2. Configure o ambiente
\`\`\`bash
# Copie o arquivo de ambiente
cp .env.example .env

# Edite as configurações se necessário
nano .env
\`\`\`

### 3. Execute com Docker
\`\`\`bash
# Suba os containers
docker-compose up -d

# Acesse o container da aplicação
docker-compose exec app bash

# Gere a chave da aplicação
php artisan key:generate

# Execute as migrations
php artisan migrate

# Execute os seeders (dados iniciais)
php artisan db:seed
\`\`\`

### 4. Acesse a aplicação
- **API**: http://localhost:8000
- **phpMyAdmin**: http://localhost:8080

## 📚 Endpoints da API

### Públicos
- `GET /api/health` - Health check
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/songs` - Listar músicas (paginado)
- `GET /api/songs/top5` - Top 5 músicas
- `POST /api/songs/suggest` - Sugerir música

### Protegidos (requer autenticação)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Dados do usuário logado

### Admin apenas
- `POST /api/songs` - Criar música
- `PUT /api/songs/{id}` - Atualizar música
- `DELETE /api/songs/{id}` - Deletar música
- `POST /api/songs/{id}/approve` - Aprovar sugestão
- `POST /api/songs/{id}/reject` - Rejeitar sugestão

## 🧪 Executando Testes

\`\`\`bash
# Dentro do container
php artisan test

# Ou com coverage
php artisan test --coverage
\`\`\`

## 👥 Usuários Padrão

Após executar os seeders:

**Administrador:**
- Email: admin@tiaocarreiro.com
- Senha: password123

**Usuário comum:**
- Email: user@tiaocarreiro.com
- Senha: password123

## 🎵 Músicas Iniciais

O sistema vem com 10 músicas pré-cadastradas da dupla, incluindo clássicos como:
- O Mineiro e o Italiano
- Pagode em Brasília
- Terra Roxa
- Tristeza do Jeca
- Rio de Lágrimas

## 🔒 Segurança

- Autenticação via tokens (Laravel Sanctum)
- Autorização baseada em roles
- Validação de dados de entrada
- Soft deletes para preservar histórico
- CORS configurado para frontend

## 📝 Estrutura do Banco

### Tabela `users`
- id, name, email, password, role, timestamps

### Tabela `songs`
- id, title, artist, views, youtube_id, youtube_url, thumbnail, status, deleted_at, timestamps

