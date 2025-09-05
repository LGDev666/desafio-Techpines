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

Edite o arquivo `.env.local` com suas configurações:
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

1. **Build da imagem**
\`\`\`bash
docker build -t ranking-tiao-carreiro .
\`\`\`

2. **Executar o container**
\`\`\`bash
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://your-api-url/api ranking-tiao-carreiro
\`\`\`

### Docker Compose (Recomendado)

Crie um arquivo `docker-compose.yml`:

\`\`\`yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000/api
    depends_on:
      - backend
  
  backend:
    # Configuração do seu backend Laravel
    image: your-laravel-api
    ports:
      - "8000:8000"
\`\`\`

Execute com:
\`\`\`bash
docker-compose up -d
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

## 🌐 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure a variável `NEXT_PUBLIC_API_URL`
3. Deploy automático a cada push

### Outros Provedores
1. Execute `npm run build`
2. Faça upload da pasta `.next` e arquivos necessários
3. Configure as variáveis de ambiente

