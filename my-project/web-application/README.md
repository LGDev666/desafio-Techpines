# Ranking Tião Carreiro & Pardinho

Uma aplicação web que exibe o ranking das músicas mais tocadas de Tião Carreiro & Pardinho no YouTube, com funcionalidades de administração e autenticação.

## 🎵 Sobre o Projeto

Este projeto apresenta um ranking interativo das músicas mais populares da dupla sertaneja Tião Carreiro & Pardinho, baseado nas visualizações do YouTube. A aplicação oferece uma interface moderna e responsiva para visualizar as estatísticas das músicas.

## ✨ Funcionalidades

- **Ranking de Músicas**: Visualização das músicas mais tocadas com estatísticas detalhadas
- **Painel Administrativo**: Interface para gerenciamento de músicas e dados
- **Sistema de Autenticação**: Login seguro para administradores
- **Interface Responsiva**: Design adaptável para diferentes dispositivos
- **Estatísticas em Tempo Real**: Dados atualizados das visualizações

## 🚀 Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Lucide React** - Ícones modernos
- **Radix UI** - Componentes acessíveis
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

## 📋 Pré-requisitos

- Node.js 18+ 
- npm, yarn ou pnpm
- Laravel API (backend)

## 🛠️ Instalação

1. **Clone o repositório**
\`\`\`bash
git clone <url-do-repositorio>
cd ranking-tiao-carreiro-pardinho
\`\`\`

2. **Instale as dependências**
\`\`\`bash
npm install
# ou
yarn install
# ou
pnpm install
\`\`\`

3. **Configure as variáveis de ambiente**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edite o arquivo `.env.exemple` com suas configurações:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
\`\`\`

4. **Execute o projeto em desenvolvimento**
\`\`\`bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
\`\`\`

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000)

## 🐳 Docker

### Executar com Docker

1. **Instale as dependências do projeto**
\`\`\`bash
npm install
\`\`\`

2. **Executar o container**
\`\`\`bash
docker compose up --build
\`\`\`


## 📁 Estrutura do Projeto

\`\`\`
├── app/                    # App Router do Next.js
│   ├── admin/             # Páginas administrativas
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── admin/            # Componentes administrativos
│   ├── ui/               # Componentes de interface
│   └── ...
├── lib/                  # Utilitários e configurações
├── public/               # Arquivos estáticos
└── types/                # Definições TypeScript
\`\`\`

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Executa build de produção
- `npm run lint` - Executa linting do código


# Testes Automatizados - Tião Carreiro App

Este documento descreve os testes automatizados configurados para a aplicação usando Jest e React Testing Library.

## Cenários de Teste Implementados

### 1. Teste de Admin (admin-workflow.test.tsx)
**Cenário**: Admin faz login, apaga/rejeita uma música aprovada e faz logout

**Passos testados**:
1. Login como admin (admin@tiaocarreiro.com / password123)
2. Acesso ao painel de gerenciamento de músicas
3. Exclusão de uma música aprovada
4. Rejeição de uma música através da edição de status
5. Logout da conta

### 2. Teste de Usuário + Admin (user-workflow.test.tsx)
**Cenário**: Usuário sugere música, admin aprova a sugestão

**Passos testados**:
1. Login como usuário comum (user@tiaocarreiro.com / password123)
2. Sugestão de nova música via URL do YouTube
3. Logout do usuário
4. Login como admin
5. Aprovação da música sugerida no painel admin
6. Teste adicional: sugestão sem login (usuário anônimo)

## Como Executar os Testes

### Executar todos os testes
\`\`\`bash
npm test
\`\`\`

### Executar testes em modo watch (desenvolvimento)
\`\`\`bash
npm run test:watch
\`\`\`

### Executar testes com cobertura
\`\`\`bash
npm run test:coverage
\`\`\`

### Executar testes específicos
\`\`\`bash
# Apenas testes do admin
npm run test:admin

# Apenas testes do usuário
npm run test:user
\`\`\`

## Estrutura dos Testes

### Arquivos de Teste
- `__tests__/admin-workflow.test.tsx` - Testes do fluxo administrativo
- `__tests__/user-workflow.test.tsx` - Testes do fluxo do usuário
- `__tests__/test-utils.tsx` - Utilitários e helpers para testes
- `__tests__/setup.ts` - Configuração global dos testes

### Configuração
- `jest.config.js` - Configuração principal do Jest
- `jest.setup.js` - Setup e mocks globais

## Mocks Implementados

### API Mock
Todos os endpoints da API são mockados para testes isolados:
- `api.login()` - Autenticação
- `api.logout()` - Logout
- `api.me()` - Verificação de usuário
- `api.suggestSong()` - Sugestão de música
- `api.getSongsByStatus()` - Listagem por status
- `api.approveSong()` - Aprovação
- `api.rejectSong()` - Rejeição
- `api.deleteSong()` - Exclusão

### Browser APIs Mock
- `localStorage` - Armazenamento de tokens
- `window.confirm` - Confirmações de exclusão
- `IntersectionObserver` - Para componentes com scroll
- `ResizeObserver` - Para componentes responsivos
- `fetch` - Requisições HTTP

## Logs de Debug

Os testes incluem logs de debug que começam com `[v0]` para acompanhar o progresso:

\`\`\`
[v0] Iniciando teste de workflow do admin
[v0] Testando login do admin
[v0] Login do admin realizado com sucesso
[v0] Testando exclusão de música aprovada
[v0] Música excluída com sucesso
[v0] Testando logout do admin
[v0] Teste de workflow do admin concluído
\`\`\`

## Credenciais de Teste

### Admin
- Email: admin@tiaocarreiro.com
- Senha: password123

### Usuário Comum
- Email: user@tiaocarreiro.com
- Senha: password123

## Troubleshooting

### Problemas Comuns

1. **Timeout nos testes**: Aumentar o timeout em `jest.config.js`
2. **Mocks não funcionando**: Verificar se os mocks estão no `jest.setup.js`
3. **Componentes não renderizando**: Verificar se os providers estão no `test-utils.tsx`

### Debug

Para debugar testes específicos, adicione `console.log('[v0] Debug message')` no código de teste.
