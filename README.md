# Painel de Automação de Vídeos YouTube

Painel web (Next.js) que dispara uma automação no **N8N** para gerar assets de
vídeo (descrição, música, imagens/thumbnail e vídeo via ComfyUI), exibe a
galeria dos arquivos gerados e gerencia a **revisão/aprovação** do conteúdo e a
**biblioteca de prompts** reutilizáveis.

Inclui o **Asset Studio** — sistema de geração individual de assets por canal
(música, thumbnail, background, descrição, vídeo) com workflow configs
persistidas no banco de dados.

## Stack

- Next.js 16 (App Router, proxy/middleware) · React 19 · TypeScript
- Tailwind CSS v4 + shadcn/ui (base-ui)
- Drizzle ORM — **banco trocável**: SQLite / PostgreSQL / MySQL
- Auth.js v5 (credentials + bcrypt, sessão JWT)

## Status das fases

| Fase | Escopo                                                 | Status |
| ---- | ------------------------------------------------------ | ------ |
| 0    | Fundação Next.js + Tailwind + shadcn/ui                | ✅     |
| 1    | Banco de dados multi-dialeto + autenticação            | ✅     |
| 2    | Biblioteca de prompts (CRUD + filtros + busca)         | ✅     |
| 3    | Disparo da automação via webhook N8N                   | ✅     |
| 4    | Callback de status + registro de assets + polling      | ✅     |
| 5    | Galeria de assets (players, lightbox, download)        | ✅     |
| 6    | Título/descrição + aprovação com histórico             | ✅     |
| 7    | Polimento e documentação                               | ✅     |
| 8    | Asset Studio — geração individual de assets por canal  | ✅     |
| 9    | Channel Management — CRUD de canais + workflow configs | ✅     |

> Detalhes de cada fase em [TODO_LIST.md](./TODO_LIST.md).

## Rodando localmente (sem Docker)

Requisitos: Node.js 20+ (testado no 24) e npm.

```bash
npm install

# banco (SQLite local, não precisa de servidor)
npm run db:migrate           # aplica migrations do provedor ativo
npm run db:seed              # cria o usuário admin inicial
npm run db:seed:workflows    # cria 3 canais × 5 asset types (Jazz, LoFi, Metalcore)

# desenvolvimento
npm run dev                  # http://localhost:3000
```

Credenciais iniciais (definidas por `SEED_ADMIN_*` no `.env`):

```
admin@painel.local / trocar123
```

### Trocando o banco de dados

Defina `DB_PROVIDER` e `DATABASE_URL` no `.env` e rode `npm run db:migrate`.
As migrations de cada dialeto ficam em `db/migrations/<dialeto>/`.

| Provider            | DATABASE_URL exemplo                         | Observação                            |
| ------------------- | -------------------------------------------- | ------------------------------------- |
| `sqlite` _(padrão)_ | `./data/app.db`                              | zero configuração; ideal p/ dev local |
| `postgres`          | `postgresql://usuario:senha@host:5432/banco` | driver postgres.js                    |
| `mysql`             | `mysql://usuario:senha@host:3306/painel`     | driver mysql2                         |

Scripts úteis:

```bash
npm run db:generate            # gera migration p/ o provedor ativo
npm run db:generate:pg         # força um dialeto específico
npm run db:migrate             # aplica migrations do provedor ativo
npm run db:seed                # cria admin se não existir
npm run db:seed:workflows      # popula canais e workflow configs
npm run db:studio              # drizzle-kit studio (inspeção visual)
npm run test                   # executa testes unitários (vitest)
npm run test:watch             # testes em watch mode
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

| Variável                         | Padrão dev           | Descrição                                                              |
| -------------------------------- | -------------------- | ---------------------------------------------------------------------- |
| `DB_PROVIDER`                    | `sqlite`             | `sqlite` \| `postgres` \| `mysql`                                      |
| `DATABASE_URL`                   | `./data/app.db`      | arquivo ou URL conforme o provider                                     |
| `AUTH_SECRET`                    | —                    | segredo das sessões JWT (obrigatório)                                  |
| `AUTH_TRUST_HOST`                | `true`               | necessário fora da Vercel                                              |
| `SEED_ADMIN_EMAIL/NAME/PASSWORD` | `admin@painel.local` | usuário criado pelo seed                                               |
| `N8N_WEBHOOK_URL`                | —                    | **[DEPRECATED]** webhook legado (fallback se não existir config no DB) |
| `N8N_API_KEY`                    | vazia                | se definida, vai como `Authorization: Bearer`                          |
| `N8N_CALLBACK_SECRET`            | —                    | segredo compartilhado do callback de status                            |
| `OUTPUT_DIR`                     | `./output`           | pasta onde o N8N grava os assets                                       |

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
2. **Canais** (`/channels`) — cadastre canais (nome, slug, cor) e configure
   workflows por tipo de asset (webhook URL, método, prioridade).
3. **Asset Studio** (`/assets/music`, `/assets/thumbnail`, etc.) — gere assets
   individuais por canal: selecione o canal, envie um prompt e acompanhe a geração.
4. **Prompts** (`/prompts`) — cadastre prompts reutilizáveis por tipo
   (música, imagem, descrição, vídeo) com tags e histórico de uso.
5. **Execuções** (`/`) — "Nova geração": escolha um prompt da biblioteca OU
   digite texto livre; acompanhe o status (fila → executando → concluído/falhou).
6. **Detalhe** (`/executions/{id}`) — galeria por tipo com players, lightbox,
   download e copiar caminho/texto; edite título e descrição finais; aprove ou
   rejeite cada asset (ou "aprovar todos"); veja o histórico de decisões.

## Estrutura

```
app/
├── (painel)/            # rotas protegidas (header/nav compartilhados)
│   ├── page.tsx         # dashboard de execuções
│   ├── channels/        # gerenciamento de canais
│   │   ├── page.tsx     # lista de canais
│   │   └── [id]/        # detalhe + workflow configs
│   ├── assets/          # Asset Studio (5 páginas)
│   │   ├── music/
│   │   ├── thumbnail/
│   │   ├── background/
│   │   ├── description/
│   │   └── video/
│   ├── executions/[id]/ # detalhe + galeria + aprovações
│   └── prompts/         # biblioteca de prompts
├── login/
├── api/
│   ├── auth/[...nextauth]/
│   ├── channels/        # CRUD de canais
│   ├── workflow-configs/ # CRUD de configs de workflow
│   ├── assets/generate  # geração individual de assets
│   ├── prompts/[id]/    # CRUD de prompts
│   ├── executions/[id]/ # PATCH texto, callback, aprovação
│   └── files/[...path]/ # streaming com Range (auth por sessão)
proxy.ts                 # ex-middleware: protege rotas, libera /login e callback
db/
├── schemas/{sqlite,pg,mysql}.ts   # mesmo schema nos 3 dialetos
├── queries/             # consultas portáveis (sem dialect-only APIs)
│   ├── channels.ts      # CRUD de canais
│   ├── workflow-configs.ts # CRUD de workflow configs
│   ├── asset-generations.ts # consultas de gerações
│   └── workflow-executions.ts # consultas de execuções de workflow
└── migrations/{sqlite,pg,mysql}/
lib/
├── n8n.ts               # dispatcher do webhook (legado)
├── workflow-resolver.ts # resolução de workflow (DB + fallback env)
├── workflow-executor.ts # execução HTTP de webhooks
├── use-cases/
│   └── generate-asset.ts # caso de uso de geração de asset
├── errors.ts            # classes de erro de domínio
├── validation.ts        # schemas Zod (inclui Asset Studio)
└── assets.ts            # scan/classificação/sanitização de arquivos
components/
├── asset-studio/        # componentes compartilhados do Asset Studio
│   ├── channel-selector.tsx
│   ├── asset-generator-form.tsx
│   ├── asset-preview-card.tsx
│   ├── asset-history-list.tsx
│   ├── asset-status-badge.tsx
│   └── asset-page-layout.tsx
└── ui/                  # componentes base (shadcn/ui)
```

## Segurança

- Todas as rotas exigem sessão (exceto `/login`, `/api/auth/*` e o callback);
- Callback autenticado por segredo compartilhado;
- Servidor de arquivos confinado ao `OUTPUT_DIR` (traversal bloqueado);
- Senhas com bcrypt (12 rounds); sessões JWT assinadas com `AUTH_SECRET`.

## API — Referência das rotas

Todas as rotas retornam JSON. Exceto indicado, exigem sessão autenticada.

### Autenticação

| Método     | Rota                      | Autenticação | Descrição                                 |
| ---------- | ------------------------- | ------------ | ----------------------------------------- |
| `GET/POST` | `/api/auth/[...nextauth]` | pública      | Handlers do Auth.js (login, sessão, CSRF) |

### Usuários (admin)

| Método   | Rota              | Body                                  | Descrição                                  |
| -------- | ----------------- | ------------------------------------- | ------------------------------------------ |
| `GET`    | `/api/users`      | —                                     | Lista todos os usuários (sem passwordHash) |
| `POST`   | `/api/users`      | `{ name, email, password, role? }`    | Cria usuário. E-mail único.                |
| `GET`    | `/api/users/[id]` | —                                     | Retorna um usuário pelo ID                 |
| `PUT`    | `/api/users/[id]` | `{ name?, email?, password?, role? }` | Atualiza usuário. Campos opcionais.        |
| `DELETE` | `/api/users/[id]` | —                                     | Remove usuário. Retorna 204.               |

> Rotas de usuário exigem `role: "admin"`. Um admin não pode deletar a si mesmo.

**POST /api/users** — Exemplo:

```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "password": "minha-senha-123",
  "role": "editor"
}
```

Valores de `role`: `"admin"` | `"editor"` | `"viewer"` (padrão: `"viewer"`)

### Prompts (biblioteca)

| Método   | Rota                    | Body                                | Descrição                                                                             |
| -------- | ----------------------- | ----------------------------------- | ------------------------------------------------------------------------------------- |
| `GET`    | `/api/prompts?q=&type=` | —                                   | Lista prompts. Filtros opcionais: `q` (busca), `type` (video/music/image/description) |
| `POST`   | `/api/prompts`          | `{ name, content, type, tags? }`    | Cria prompt. Nome deve ser único.                                                     |
| `GET`    | `/api/prompts/[id]`     | —                                   | Retorna um prompt pelo ID                                                             |
| `PUT`    | `/api/prompts/[id]`     | `{ name?, content?, type?, tags? }` | Atualiza prompt. Campos opcionais.                                                    |
| `DELETE` | `/api/prompts/[id]`     | —                                   | Remove prompt. Retorna 204.                                                           |

### Execuções

| Método  | Rota                      | Body/Query                         | Descrição                                                           |
| ------- | ------------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| `GET`   | `/api/executions?status=` | —                                  | Lista execuções. Filtro: `queued`, `running`, `completed`, `failed` |
| `POST`  | `/api/executions`         | `{ promptId }` OU `{ promptText }` | Cria execução e dispara N8N. Exige exatamente uma origem.           |
| `PATCH` | `/api/executions/[id]`    | `{ title?, description? }`         | Edita título/descrição (pós-geração)                                |

**GET /api/executions** — Exemplos:

```
GET /api/executions              # todas
GET /api/executions?status=completed   # apenas concluídas
GET /api/executions?status=failed      # apenas falhas
GET /api/executions?status=running     # em execução
```

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

| Método  | Rota                                    | Body                 | Descrição                                    |
| ------- | --------------------------------------- | -------------------- | -------------------------------------------- |
| `PATCH` | `/api/executions/[id]/assets/[assetId]` | `{ approvalStatus }` | Aprova/rejeita um asset                      |
| `POST`  | `/api/executions/[id]/approve`          | —                    | Aprova todos os assets pendentes da execução |

**PATCH /api/executions/[id]/assets/[assetId]** — Valores de `approvalStatus`:

- `"pending"` — pendente (padrão)
- `"approved"` — aprovado
- `"rejected"` — rejeitado

### Callback N8N (sem sessão, autenticação por segredo)

| Método | Rota                             | Header              | Body                          | Descrição                           |
| ------ | -------------------------------- | ------------------- | ----------------------------- | ----------------------------------- |
| `POST` | `/api/executions/[id]/callback`  | `x-callback-secret` | `{ status, error?, assets? }` | Callback de conclusão/falha do N8N  |
| `POST` | `/api/executions/[id]/provision` | `x-callback-secret` | —                             | Cria 4 assets fake no disco (teste) |

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

| Método     | Rota                   | Autenticação | Descrição                                                |
| ---------- | ---------------------- | ------------ | -------------------------------------------------------- |
| `GET/HEAD` | `/api/files/[...path]` | sessão       | Serve arquivos de `OUTPUT_DIR` com suporte a Range (206) |

O caminho é relativo a `OUTPUT_DIR`. Exemplo:

```
GET /api/files/{executionId}/video/final.mp4
```

Suporta `?download` para forçar download e `Range: bytes=0-1023` para seek.

### Resumo de autenticação por rota

| Rota                             | Autenticação           |
| -------------------------------- | ---------------------- |
| `/api/auth/*`                    | pública                |
| `/api/users/*`                   | sessão + `role: admin` |
| `/api/files/*`                   | sessão                 |
| `/api/prompts/*`                 | sessão                 |
| `/api/channels/*`                | sessão                 |
| `/api/workflow-configs/*`        | sessão                 |
| `/api/assets/generate`           | sessão                 |
| `/api/executions` (GET, POST)    | sessão                 |
| `/api/executions/[id]` (PATCH)   | sessão                 |
| `/api/executions/[id]/assets/*`  | sessão                 |
| `/api/executions/[id]/approve`   | sessão                 |
| `/api/executions/[id]/callback`  | `x-callback-secret`    |
| `/api/executions/[id]/provision` | `x-callback-secret`    |

### Canais

| Método   | Rota                 | Body                                                      | Descrição                            |
| -------- | -------------------- | --------------------------------------------------------- | ------------------------------------ |
| `GET`    | `/api/channels`      | —                                                         | Lista todos os canais                |
| `POST`   | `/api/channels`      | `{ name, slug, description?, color?, icon? }`             | Cria canal. Slug único.              |
| `GET`    | `/api/channels/[id]` | —                                                         | Retorna um canal pelo ID             |
| `PUT`    | `/api/channels/[id]` | `{ name?, slug?, description?, color?, icon?, enabled? }` | Atualiza canal                       |
| `DELETE` | `/api/channels/[id]` | —                                                         | Remove canal e seus workflow configs |

**POST /api/channels** — Exemplo:

```json
{
  "name": "Jazz",
  "slug": "jazz",
  "description": "Conteúdo musical jazz",
  "color": "#E8A317",
  "icon": "music"
}
```

### Workflow Configs

| Método   | Rota                         | Body                                                        | Descrição                  |
| -------- | ---------------------------- | ----------------------------------------------------------- | -------------------------- |
| `GET`    | `/api/workflow-configs`      | —                                                           | Lista todas as configs     |
| `POST`   | `/api/workflow-configs`      | `{ channelId, assetType, name, slug, webhookUrl, method? }` | Cria config                |
| `GET`    | `/api/workflow-configs/[id]` | —                                                           | Retorna uma config pelo ID |
| `PUT`    | `/api/workflow-configs/[id]` | campos opcionais                                            | Atualiza config            |
| `DELETE` | `/api/workflow-configs/[id]` | —                                                           | Remove config              |

Valores de `assetType`: `"music"` | `"thumbnail"` | `"background"` | `"description"` | `"video"`

Valores de `method`: `"GET"` | `"POST"` | `"PUT"` | `"PATCH"` | `"DELETE"`

### Asset Generation

| Método | Rota                   | Body                                    | Descrição                |
| ------ | ---------------------- | --------------------------------------- | ------------------------ |
| `POST` | `/api/assets/generate` | `{ channelId, assetType, promptText? }` | Gera um asset individual |

**POST /api/assets/generate** — Exemplo:

```json
{
  "channelId": 1,
  "assetType": "music",
  "promptText": "Crie uma música jazz suave para fundo musical"
}
```

Resposta (200):

```json
{
  "generationId": 1,
  "status": "completed",
  "filePath": "output/jazz-music/gen-1/song.mp3",
  "durationMs": 3200
}
```

## Exemplos práticos (curl)

### Login e obter sessão

```bash
B=http://localhost:3000
JAR=cookies.txt
rm -f $JAR

# Login
CSRF=$(curl -s -c $JAR $B/api/auth/csrf | python3 -c "import sys,json;print(json.load(sys.stdin)['csrfToken'])")
curl -s -b $JAR -c $JAR -o /dev/null -X POST $B/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=$CSRF&email=admin@painel.local&password=trocar123"

# Verificar sessão
curl -s -b $JAR $B/api/auth/session | python3 -m json.tool
```

### Usuários

```bash
# Listar
curl -s -b $JAR $B/api/users | python3 -m json.tool

# Criar
curl -s -b $JAR -X POST $B/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","email":"maria@example.com","password":"123456","role":"editor"}'

# Atualizar
curl -s -b $JAR -X PUT $B/api/users/2 \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}'

# Deletar
curl -s -b $JAR -X DELETE $B/api/users/2 -w "%{http_code}"
```

### Prompts

```bash
# Criar
curl -s -b $JAR -X POST $B/api/prompts \
  -H "Content-Type: application/json" \
  -d '{"name":"Intro 30s","type":"video","content":"Crie um video de 30 segundos com musica animada","tags":"intro,curto"}'

# Listar (com filtros)
curl -s -b $JAR "$B/api/prompts?q=video&type=video"

# Atualizar
curl -s -b $JAR -X PUT $B/api/prompts/1 \
  -H "Content-Type: application/json" \
  -d '{"content":"Novo texto do prompt"}'

# Deletar
curl -s -b $JAR -X DELETE $B/api/prompts/1 -w "%{http_code}"
```

### Execuções

```bash
# Criar (texto livre)
curl -s -b $JAR -X POST $B/api/executions \
  -H "Content-Type: application/json" \
  -d '{"promptText":"Crie um video animado sobre o Brasil"}'

# Criar (prompt da biblioteca)
curl -s -b $JAR -X POST $B/api/executions \
  -H "Content-Type: application/json" \
  -d '{"promptId":1}'

# Listar todas
curl -s -b $JAR $B/api/executions

# Listar por status
curl -s -b $JAR "$B/api/executions?status=completed"
curl -s -b $JAR "$B/api/executions?status=failed"

# Editar titulo/descricao
curl -s -b $JAR -X PATCH $B/api/executions/{id} \
  -H "Content-Type: application/json" \
  -d '{"title":"Meu Video Final","description":"Descricao para o YouTube"}'

# Aprovar todos os assets pendentes
curl -s -b $JAR -X POST $B/api/executions/{id}/approve
```

### Assets (aprovação individual)

```bash
# Aprovar
curl -s -b $JAR -X PATCH $B/api/executions/{id}/assets/{assetId} \
  -H "Content-Type: application/json" \
  -d '{"approvalStatus":"approved"}'

# Rejeitar
curl -s -b $JAR -X PATCH $B/api/executions/{id}/assets/{assetId} \
  -H "Content-Type: application/json" \
  -d '{"approvalStatus":"rejected"}'
```

### Callback N8N (simular webhook externo)

```bash
# Sucesso
curl -X POST $B/api/executions/{id}/callback \
  -H "x-callback-secret: $N8N_CALLBACK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Falha
curl -X POST $B/api/executions/{id}/callback \
  -H "x-callback-secret: $N8N_CALLBACK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"status":"failed","error":"ComfyUI fora do ar"}'

# Criar assets fake (teste)
curl -X POST $B/api/executions/{id}/provision \
  -H "x-callback-secret: $N8N_CALLBACK_SECRET"
```

### Arquivos

```bash
# Acessar asset
curl -s -b $JAR "$B/api/files/{id}/video/final.mp4" -o video.mp4

# Download forçado
curl -s -b $JAR "$B/api/files/{id}/thumbs/capa.png?download" -o capa.png
```

### Canais

```bash
# Listar
curl -s -b $JAR $B/api/channels | python3 -m json.tool

# Criar
curl -s -b $JAR -X POST $B/api/channels \
  -H "Content-Type: application/json" \
  -d '{"name":"LoFi","slug":"lofi","description":"Conteúdo lofi beats","color":"#7B68EE"}'

# Atualizar
curl -s -b $JAR -X PUT $B/api/channels/1 \
  -H "Content-Type: application/json" \
  -d '{"description":"Novo nome do canal"}'

# Deletar
curl -s -b $JAR -X DELETE $B/api/channels/1 -w "%{http_code}"
```

### Workflow Configs

```bash
# Listar todas
curl -s -b $JAR $B/api/workflow-configs | python3 -m json.tool

# Criar
curl -s -b $JAR -X POST $B/api/workflow-configs \
  -H "Content-Type: application/json" \
  -d '{"channelId":1,"assetType":"music","name":"Jazz Music","slug":"jazz-music","webhookUrl":"http://localhost:5678/webhook/jazz-music"}'

# Atualizar
curl -s -b $JAR -X PUT $B/api/workflow-configs/1 \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl":"http://n8n:5678/webhook/jazz-music-v2"}'

# Deletar
curl -s -b $JAR -X DELETE $B/api/workflow-configs/1 -w "%{http_code}"
```

### Asset Generation

```bash
# Gerar música para o canal Jazz
curl -s -b $JAR -X POST $B/api/assets/generate \
  -H "Content-Type: application/json" \
  -d '{"channelId":1,"assetType":"music","promptText":"Jazz suave para fundo"}'

# Gerar thumbnail para o canal LoFi
curl -s -b $JAR -X POST $B/api/assets/generate \
  -H "Content-Type: application/json" \
  -d '{"channelId":2,"assetType":"thumbnail","promptText":"Thumbnail lofi aesthetic"}'
```

## Docker

O `Dockerfile` (standalone, usuário `node`) e o `docker-compose.yml` da Fase 0
estão prontos e serão validados na entrega final, junto com a conexão à rede
Docker existente (`infra_default`, onde rodam n8n/postgres).

## Testes

```bash
npm run test          # vitest — testes unitários
npm run test:watch    # vitest — watch mode
```

Cobertura atual:

- Validação de schemas (channel, workflowConfig, generateAsset)
- Classes de erro (WorkflowNotFoundError, etc.)
- Utilitários de formatação (labels, badges, formatDateTime, formatBytes)
