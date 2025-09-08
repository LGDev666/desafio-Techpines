# Eu Amo Setanejo API 

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
- Composer

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

### 3. Instale as dependências
\`\`\`bash
# Suba os containers
composer install --no-interaction --prefer-dist --optimize-autoloader

### 4. Execute com Docker
\`\`\`bash
# Suba os containers
docker-compose up --build

## 🎵 Visão Geral

Sistema de ranking de músicas do Tião Carreiro & Pardinho com funcionalidades de moderação administrativa e logging detalhado.

## 🚀 Melhorias Implementadas

### 1. **Logging Detalhado das Requisições**
- ✅ Middleware `RequestLogger` que captura todas as requisições da API
- ✅ Logs com emojis para fácil identificação (🔵 requisição, 🟢 sucesso, 🔴 erro)
- ✅ Filtragem automática de dados sensíveis (senhas, tokens)
- ✅ Medição de tempo de resposta em milissegundos
- ✅ Informações do usuário (ID, role) quando autenticado

### 2. **Funcionalidades Administrativas Completas**
- ✅ **Aprovar músicas**: `POST /api/songs/{id}/approve`
- ✅ **Rejeitar músicas**: `POST /api/songs/{id}/reject`
- ✅ **Editar músicas**: `PUT /api/songs/{id}` (título, artista, URL, status)
- ✅ **Excluir músicas**: `DELETE /api/songs/{id}` (soft delete)
- ✅ **Criar músicas**: `POST /api/songs` (auto-aprovadas para admins)

### 3. **APIs de Consulta por Status**
- ✅ **Músicas pendentes**: `GET /api/songs/status/pending`
- ✅ **Músicas aprovadas**: `GET /api/songs/status/approved`
- ✅ **Músicas rejeitadas**: `GET /api/songs/status/rejected`

### 4. **Logging Específico das Operações**
Todas as operações administrativas são logadas com detalhes:
- 👑 Operações de admin com ID do administrador
- 🎵 Consultas de músicas com contadores
- ✅ Sucessos com dados relevantes
- ❌ Erros com stack trace completo
- 🔄 Atualizações com dados antigos e novos

## 📋 Endpoints da API

### Públicos (sem autenticação)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Status da API |
| GET | `/api/songs/top5` | Top 5 músicas por visualizações |
| GET | `/api/songs/remaining` | Músicas restantes (6ª posição em diante) |
| GET | `/api/songs` | Lista paginada de músicas aprovadas |
| GET | `/api/songs/status/{status}` | Músicas por status (pending/approved/rejected) |
| POST | `/api/songs/suggest` | Sugerir nova música |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Registro |

### Protegidos (requer autenticação)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/api/auth/me` | Dados do usuário | Usuário |
| POST | `/api/auth/logout` | Logout | Usuário |
| POST | `/api/songs` | Criar música | Admin |
| PUT | `/api/songs/{id}` | Editar música | Admin |
| DELETE | `/api/songs/{id}` | Excluir música | Admin |
| POST | `/api/songs/{id}/approve` | Aprovar música | Admin |
| POST | `/api/songs/{id}/reject` | Rejeitar música | Admin |

## 🧪 Testes Implementados

### Testes de Funcionalidade (`SongManagementTest`)
- ✅ Admin pode aprovar músicas pendentes
- ✅ Admin pode rejeitar músicas pendentes  
- ✅ Admin pode editar detalhes das músicas
- ✅ Admin pode excluir músicas (soft delete)
- ✅ Consulta de músicas por status (pending/approved/rejected)
- ✅ Validação de status inválidos
- ✅ Usuários comuns não podem fazer operações administrativas
- ✅ Verificação de logging em operações

### Testes de Logging (`RequestLoggingTest`)
- ✅ Middleware registra requisições recebidas
- ✅ Filtragem de dados sensíveis (senhas, tokens)
- ✅ Inclusão de informações do usuário autenticado
- ✅ Medição de tempo de resposta

## 🔧 Como Executar os Testes

\`\`\`bash
# Todos os testes
php artisan test

# Testes específicos de gerenciamento
php artisan test --filter=SongManagementTest

# Testes de logging
php artisan test --filter=RequestLoggingTest

# Teste manual dos endpoints
php artisan api:test --host=http://localhost:8000
\`\`\`

## 📊 Exemplos de Logs

### Requisição Recebida
\`\`\`
🔵 REQUISIÇÃO RECEBIDA
{
  "method": "POST",
  "url": "http://localhost:8000/api/songs/123/approve",
  "user_id": 1,
  "user_role": "admin",
  "timestamp": "2024-01-15 10:30:45"
}
\`\`\`

### Operação Administrativa
\`\`\`
👑 ADMIN APROVANDO MÚSICA
{
  "action": "approve_song",
  "song_id": 123,
  "title": "O Mineiro e o Italiano",
  "previous_status": "pending",
  "admin_id": 1
}
\`\`\`

### Resposta Enviada
\`\`\`
🟢 RESPOSTA ENVIADA
{
  "method": "POST",
  "status_code": 200,
  "duration_ms": 45.67,
  "user_id": 1
}
\`\`\`

## 🔐 Segurança

- ✅ Autenticação via Laravel Sanctum
- ✅ Autorização baseada em roles (admin/user)
- ✅ Policies para controle de acesso
- ✅ Filtragem de dados sensíveis nos logs
- ✅ Validação de entrada em todos os endpoints

## 🎯 Status de Músicas

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando aprovação do admin |
| `approved` | Aprovada e visível publicamente |
| `rejected` | Rejeitada pelo admin |

## 📝 Notas de Integração Frontend

1. **Thumbnail**: Obtida automaticamente via API do YouTube
2. **Soft Delete**: Músicas excluídas não aparecem nas consultas mas permanecem no banco
3. **Paginação**: Todos os endpoints de listagem suportam `per_page` parameter
4. **Logs**: Monitore os logs em `storage/logs/laravel.log` para debugging
5. **Autenticação**: Use header `Authorization: Bearer {token}` para endpoints protegidos
