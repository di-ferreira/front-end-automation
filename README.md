# Painel de Automação de Vídeos YouTube

Painel web (Next.js) que dispara uma automação no **N8N** para gerar assets de
vídeo (descrição, música, imagens/thumbnail e vídeo via ComfyUI), exibe a
galeria dos arquivos gerados e gerencia a **revisão/aprovação** do conteúdo e a
**biblioteca de prompts** reutilizáveis.

## Stack

- Next.js 16 (App Router, proxy/middleware) · React 19 · TypeScript
- Tailwind CSS v4 + shadcn/ui (base-ui)
- Drizzle ORM — **banco trocável**: SQLite / PostgreSQL / MySQL
- Auth.js v5 (credentials + bcrypt, sessão JWT)

## Status das fases

| Fase | Escopo | Status |
|------|--------|--------|
| 0 | Fundação Next.js + Tailwind + shadcn/ui | ✅ |
| 1 | Banco de dados multi-dialeto + autenticação | ✅ |
| 2 | Biblioteca de prompts (CRUD + filtros + busca) | ✅ |
| 3 | Disparo da automação via webhook N8N | ✅ |
| 4 | Callback de status + registro de assets + polling | ✅ |
| 5 | Galeria de assets (players, lightbox, download) | ✅ |
| 6 | Título/descrição + aprovação com histórico | ✅ |
| 7 | Polimento e documentação | ✅ |

> Detalhes de cada fase em [TODO_LIST.md](./TODO_LIST.md).

## Rodando localmente (sem Docker)

Requisitos: Node.js 20+ (testado no 24) e npm.

```bash
npm install

# banco (SQLite local, não precisa de servidor)
npm run db:migrate        # aplica migrations do provedor ativo
npm run db:seed           # cria o usuário admin inicial

# desenvolvimento
npm run dev               # http://localhost:3000
```

Credenciais iniciais (definidas por `SEED_ADMIN_*` no `.env`):

```
admin@painel.local / trocar123
```

### Trocando o banco de dados

Defina `DB_PROVIDER` e `DATABASE_URL` no `.env` e rode `npm run db:migrate`.
As migrations de cada dialeto ficam em `db/migrations/<dialeto>/`.

| Provider | DATABASE_URL exemplo | Observação |
|----------|----------------------|------------|
| `sqlite` *(padrão)* | `./data/app.db` | zero configuração; ideal p/ dev local |
| `postgres` | `postgresql://usuario:senha@host:5432/banco` | driver postgres.js |
| `mysql` | `mysql://usuario:senha@host:3306/painel` | driver mysql2 |

Scripts úteis:

```bash
npm run db:generate            # gera migration p/ o provedor ativo
npm run db:generate:pg         # força um dialeto específico
npm run db:migrate             # aplica migrations do provedor ativo
npm run db:seed                # cria admin se não existir
npm run db:studio              # drizzle-kit studio (inspeção visual)
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

| Variável | Padrão dev | Descrição |
|----------|-----------|-----------|
| `DB_PROVIDER` | `sqlite` | `sqlite` \| `postgres` \| `mysql` |
| `DATABASE_URL` | `./data/app.db` | arquivo ou URL conforme o provider |
| `AUTH_SECRET` | — | segredo das sessões JWT (obrigatório) |
| `AUTH_TRUST_HOST` | `true` | necessário fora da Vercel |
| `SEED_ADMIN_EMAIL/NAME/PASSWORD` | `admin@painel.local` | usuário criado pelo seed |
| `N8N_WEBHOOK_URL` | — | webhook inicial do workflow (Fase disparo) |
| `N8N_API_KEY` | vazia | se definida, vai como `Authorization: Bearer` |
| `N8N_CALLBACK_SECRET` | — | segredo compartilhado do callback de status |
| `OUTPUT_DIR` | `./output` | pasta onde o N8N grava os assets |

## Contrato painel ↔ N8N

### 1. Disparo — painel → N8N

Ao clicar em "Nova geração", o painel faz:

```
POST {N8N_WEBHOOK_URL}
Authorization: Bearer {N8N_API_KEY}   # opcional
Content-Type: application/json

{ "executionId": "<uuid>", "prompt": "<texto do prompt>" }
```

O workflow deve estar configurado como **respond immediately** (o painel não
espera a geração terminar). Falha de rede/timeout (10s)/status ≠ 2xx marca a
execução como `failed` com a mensagem do erro.

### 2. Convenção de saída — N8N → disco

Salve os assets em subpastas por execução (a pasta define o tipo):

```
{OUTPUT_DIR}/{executionId}/
├── video/final.mp4          → tipo "video"
├── thumbs/capa.jpg          → tipo "thumb"
├── music/trilha.mp3         → tipo "music"
├── images/cena01.png        → tipo "image"
├── descriptions/desc.txt    → tipo "description"
└── metadata.json            → ignorado pelo scanner (uso livre do workflow)
```

Tipos também são inferidos por extensão quando o arquivo fica na raiz.

### 3. Callback de status — N8N → painel

Ao concluir (ou falhar), o último nó HTTP do workflow chama:

```
POST {PAINEL_URL}/api/executions/{executionId}/callback
x-callback-secret: {N8N_CALLBACK_SECRET}     # ou Authorization: Bearer <segredo>
Content-Type: application/json

{ "status": "completed" }
```

- Sem `"assets"`, o painel **varre a pasta** `{OUTPUT_DIR}/{executionId}` e
  registra tudo que encontrar;
- Ou envie explicitamente:
  `{ "status": "completed", "assets": [{ "type": "video", "filePath": "video/final.mp4" }] }`
  (caminhos relativos à execução; `../` é rejeitado);
- Para falhas: `{ "status": "failed", "error": "motivo" }`;
- Reenviar o callback **substitui** os assets e zera aprovações (nova revisão).

A UI atualiza sozinha (polling de 5s enquanto houver execuções ativas).

## Fluxo de uso

1. **Login** (`/login`) — credenciais do banco.
2. **Prompts** (`/prompts`) — cadastre prompts reutilizáveis por tipo
   (música, imagem, descrição, vídeo) com tags e histórico de uso.
3. **Execuções** (`/`) — "Nova geração": escolha um prompt da biblioteca OU
   digite texto livre; acompanhe o status (fila → executando → concluído/falhou).
4. **Detalhe** (`/executions/{id}`) — galeria por tipo com players, lightbox,
   download e copiar caminho/texto; edite título e descrição finais; aprove ou
   rejeite cada asset (ou "aprovar todos"); veja o histórico de decisões.

## Estrutura

```
app/
├── (painel)/            # rotas protegidas (header/nav compartilhados)
│   ├── page.tsx         # dashboard de execuções
│   └── executions/[id]/ # detalhe + galeria + aprovações
├── login/
├── api/
│   ├── auth/[...nextauth]/
│   ├── prompts/[id]/    # CRUD de prompts
│   ├── executions/[id]/ # PATCH texto, callback, aprovação
│   └── files/[...path]/ # streaming com Range (auth por sessão)
proxy.ts                 # ex-middleware: protege rotas, libera /login e callback
db/
├── schemas/{sqlite,pg,mysql}.ts   # mesmo schema nos 3 dialetos
├── queries/             # consultas portáveis (sem dialect-only APIs)
└── migrations/{sqlite,pg,mysql}/
lib/n8n.ts               # dispatcher do webhook
lib/assets.ts            # scan/classificação/sanitização de arquivos
```

## Segurança

- Todas as rotas exigem sessão (exceto `/login`, `/api/auth/*` e o callback);
- Callback autenticado por segredo compartilhado;
- Servidor de arquivos confinado ao `OUTPUT_DIR` (traversal bloqueado);
- Senhas com bcrypt (12 rounds); sessões JWT assinadas com `AUTH_SECRET`.

## API — Referência das rotas

Todas as rotas retornam JSON. Exceto indicado, exigem sessão autenticada.

### Autenticação

| Método | Rota | Autenticação | Descrição |
|--------|------|-------------|-----------|
| `GET/POST` | `/api/auth/[...nextauth]` | pública | Handlers do Auth.js (login, sessão, CSRF) |

### Prompts (biblioteca)

| Método | Rota | Body | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/prompts?q=&type=` | — | Lista prompts. Filtros opcionais: `q` (busca), `type` (video/music/image/description) |
| `POST` | `/api/prompts` | `{ name, content, type, tags? }` | Cria prompt. Nome deve ser único. |
| `GET` | `/api/prompts/[id]` | — | Retorna um prompt pelo ID |
| `PUT` | `/api/prompts/[id]` | `{ name?, content?, type?, tags? }` | Atualiza prompt. Campos opcionais. |
| `DELETE` | `/api/prompts/[id]` | — | Remove prompt. Retorna 204. |

### Execuções

| Método | Rota | Body | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/executions` | — | Lista todas as execuções (mais recentes primeiro) |
| `POST` | `/api/executions` | `{ promptId }` OU `{ promptText }` | Cria execução e dispara N8N. Exige exatamente uma origem. |
| `PATCH` | `/api/executions/[id]` | `{ title?, description? }` | Edita título/descrição (pós-geração) |

**POST /api/executions** — Exemplos:

```jsonc
// Usando prompt da biblioteca
{ "promptId": 42 }

// Texto livre
{ "promptText": "Crie um video animado sobre a historia do Brasil" }

// Com título opcional
{ "promptText": "...", "title": "Meu video custom" }
```

Resposta (201):
```json
{
  "execution": {
    "id": "b9b96c29-...",
    "status": "running",
    "promptText": "Crie um video...",
    "createdAt": "2026-08-26T..."
  }
}
```

### Assets (por execução)

| Método | Rota | Body | Descrição |
|--------|------|------|-----------|
| `PATCH` | `/api/executions/[id]/assets/[assetId]` | `{ approvalStatus }` | Aprova/rejeita um asset |
| `POST` | `/api/executions/[id]/approve` | — | Aprova todos os assets pendentes da execução |

**PATCH /api/executions/[id]/assets/[assetId]** — Valores de `approvalStatus`:
- `"pending"` — pendente (padrão)
- `"approved"` — aprovado
- `"rejected"` — rejeitado

### Callback N8N (sem sessão, autenticação por segredo)

| Método | Rota | Header | Body | Descrição |
|--------|------|--------|------|-----------|
| `POST` | `/api/executions/[id]/callback` | `x-callback-secret` | `{ status, error?, assets? }` | Callback de conclusão/falha do N8N |
| `POST` | `/api/executions/[id]/provision` | `x-callback-secret` | — | Cria 4 assets fake no disco (teste) |

**POST /api/executions/[id]/callback** — Contrato:

```jsonc
// Sucesso (assets varridos do disco automaticamente)
{ "status": "completed" }

// Sucesso (assets explícitos)
{
  "status": "completed",
  "assets": [
    { "type": "video",    "filePath": "video/final.mp4" },
    { "type": "thumb",    "filePath": "thumbs/capa.png" },
    { "type": "music",    "filePath": "music/trilha.mp3" },
    { "type": "description", "filePath": "descriptions/desc.txt" }
  ]
}

// Falha
{ "status": "failed", "error": "ComfyUI fora do ar" }
```

Autenticação via header:
```
x-callback-secret: {N8N_CALLBACK_SECRET}
# ou
Authorization: Bearer {N8N_CALLBACK_SECRET}
```

**POST /api/executions/[id]/provision** — Cria arquivos fake para teste:
```
video/final.mp4, thumbs/capa.png, music/trilha.mp3, descriptions/descricao.txt
```

### Arquivos (streaming)

| Método | Rota | Autenticação | Descrição |
|--------|------|-------------|-----------|
| `GET/HEAD` | `/api/files/[...path]` | sessão | Serve arquivos de `OUTPUT_DIR` com suporte a Range (206) |

O caminho é relativo a `OUTPUT_DIR`. Exemplo:
```
GET /api/files/{executionId}/video/final.mp4
```

Suporta `?download` para forçar download e `Range: bytes=0-1023` para seek.

### Resumo de autenticação por rota

| Rota | Autenticação |
|------|-------------|
| `/api/auth/*` | pública |
| `/api/files/*` | sessão |
| `/api/prompts/*` | sessão |
| `/api/executions` (GET, POST) | sessão |
| `/api/executions/[id]` (PATCH) | sessão |
| `/api/executions/[id]/assets/*` | sessão |
| `/api/executions/[id]/approve` | sessão |
| `/api/executions/[id]/callback` | `x-callback-secret` |
| `/api/executions/[id]/provision` | `x-callback-secret` |

## Docker

O `Dockerfile` (standalone, usuário `node`) e o `docker-compose.yml` da Fase 0
estão prontos e serão validados na entrega final, junto com a conexão à rede
Docker existente (`infra_default`, onde rodam n8n/postgres).
