# 🚀 Empreendedores do Brasil

Plataforma completa para a comunidade e rede estratégica de membros do grupo **Empreendedores do Brasil**. 

O projeto foi construído para ser **100% autônomo, self-contained e de fácil passagem**: não depende de contas externas de terceiros, serviços de nuvem pagos ou configurações complexas. Qualquer membro ou desenvolvedor que clonar o repositório consegue rodar tudo imediatamente.

---

## 🎯 Principais Funcionalidades

1. **💡 Banco de Ideias & Inovações:**
   - Cadastro de propostas com descritivo detalhado, categorias e tags dinâmicas (`#Tech`, `#Parcerias`, `#B2B`, `#Inteligência Artificial`, `#Venture Capital`, `#Redução de Custos`, etc.).
   - Filtros instantâneos por tags e busca por palavra-chave.
   - Ordenação por ideias mais apoiadas, mais discutidas e mais recentes.
   - Sistema de votação e apoio (upvote) em tempo real.

2. **💬 Sistema de Discussões & Comentários:**
   - Espaço para os participantes debaterem cada ideia, trocarem feedbacks, orçamentos e propostas de parcerias.

3. **📅 Reuniões & Palestras Internas:**
   - **Palestras Internas (Talks):** Apresentadas por membros especialistas do grupo compartilhando playbooks práticos e cases de mercado.
   - **Reuniões Estratégicas:** Alinhamento geral, comissões e decisões coletivas.
   - Confirmação de presença em 1 clique (RSVP) com lista de participantes e link direto para salas virtuais (Google Meet / Zoom).

4. **📚 Acervo & Dossiês de Conhecimento Colaborativo:**
   - Criação de "livros" e coletâneas temáticas de inteligência coletiva (jurisprudência comentada, teses tributárias, contratos societários, aulas práticas e playbooks).
   - Colaboração multiusuário: criadores e membros convidados acrescentam capítulos, PDFs, vídeos e minutas ao mesmo dossiê.
   - Vídeos e imagens enviados são compactados de verdade no servidor (ffmpeg), com preview integrado (PDF viewer e video player).
   - Chat contextual em tempo real por dossiê para debates e alinhamentos específicos do tema.
   - Aba e catálogo individual no perfil de cada empreendedor.

5. **🎬 Aulas em Vídeo:**
   - Qualquer membro envia aulas em vídeo (até 1GB) separadas por categoria (Vendas, Finanças, Jurídico, Tecnologia, Gestão, Marketing...).
   - Cada vídeo é recomprimido automaticamente para MP4 H.264 até 720p (normalmente 70–95% menor) e começa a tocar antes de baixar inteiro.

6. **👤 Autenticação & Perfis de Empreendedores:**
   - Sistema de login com JWT e senhas criptografadas (bcrypt).
   - Cadastro completo com dados da empresa, cargo e bio.
   - **Acesso Rápido Demonstrativo:** Permite simular diferentes perfis de membros em 1 clique para testar interações e pontos de vista.

7. **💎 Design Executivo Premium Dark:**
   - Identidade visual executiva em tons de ônix, azul safira e dourado champanhe, com cards em glassmorphism e tipografia refinada (*Plus Jakarta Sans* e *Outfit*).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, Vite, Vanilla CSS (Design System sob medida), Lucide Icons.
- **Backend:** Node.js, Express, JWT, Bcrypt.
- **Banco de Dados:** SQLite nativo integrado (`node:sqlite`), sem necessidade de instalar servidores de banco externos ou compilações C++.
- **Seed Automático:** O banco de dados se inicializa e se popula automaticamente na primeira execução com dados realistas.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js (v22.5 ou superior — usa o SQLite nativo `node:sqlite`).
- [FFmpeg](https://ffmpeg.org/download.html) no PATH para a compressão de vídeos/imagens (Windows: `winget install Gyan.FFmpeg`). Sem ele o site funciona, mas os arquivos ficam no tamanho original. Também dá para apontar o executável com a variável `FFMPEG_PATH`.

### 1. Clonar o repositório
```bash
git clone https://github.com/ZGroote/Empreendedores-do-Brasil.git
cd "Empreendedores-do-Brasil"
```

### 2. Instalar dependências (Cliente e Servidor)
```bash
npm run install:all
```

### 3. Iniciar o ambiente completo
```bash
npm run dev
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)

---

## 📂 Estrutura de Pastas

```text
├── client/              # Aplicação Frontend React (Vite)
│   ├── src/
│   │   ├── components/  # Navbar, IdeasBoard, EventsCalendar, Modais
│   │   ├── context/     # AuthContext e Sessão do Usuário
│   │   ├── App.jsx      # Estrutura principal
│   │   └── index.css    # Design System Executivo em Vanilla CSS
├── server/              # Backend API Express
│   ├── db.js            # Conexão e Schemas do Banco SQLite
│   ├── seed.js          # Dados de exemplo iniciais
│   └── server.js        # Endpoints REST e autenticação
├── dev.js               # Script cross-platform para rodar client e server juntos
└── package.json         # Scripts unificados do repositório
```
