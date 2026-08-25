# TODO LIST — Front-end Automação de Vídeos YouTube

> Projeto: painel Next.js que dispara automação N8N (assets: descrição, música,
> imagens/thumbnail, vídeo via ComfyUI), exibe galeria dos arquivos gerados e
> gerencia aprovação e biblioteca de prompts.
>
> **Regra:** concluir fase → commit → aguardar OK do usuário → iniciar próxima.
> Marcar itens com [x] conforme conclusão.

## Status Geral (atualizado em 25/08/2026)
| Fase | Nome | Status |
|------|------|--------|
| 0 | Fundação | ✅ Concluída |
| 1 | Banco de Dados e Autenticação | ✅ Concluída |
| 2 | Biblioteca de Prompts | ✅ Concluída |
| 3 | Disparo da Automação | ✅ Concluída (painel) |
| 4 | Callback de Status e Saída | ✅ Concluída (painel) |
| 5 | Galeria de Assets | ✅ Concluída |
| 6 | Descrições e Aprovação | ✅ Concluída |
| 7 | Polimento e Documentação | ⬜ Próxima |

**Pendências externas (infra N8N, não bloqueiam o painel):**
- Criar workflow no N8N: webhook inicial `{ executionId, prompt }` (respond immediately) → geração → POST callback
- Convenção de saída: `OUTPUT_DIR/{executionId}/{video|thumbs|music|images}/` + `metadata.json`

**Decisões que valem para todo o projeto:**
- Docker apenas na fase final; desenvolvimento local sem containers
- Banco trocável via `DB_PROVIDER` (`sqlite` padrão, `postgres`, `mysql`)
- Dev local sem N8N: usar mock do webhook (`N8N_WEBHOOK_URL` apontando para um servidor local)

## Fase 0 — Fundação

- [x] Scaffold Next.js 14+ (TypeScript, App Router) + Tailwind + shadcn/ui
- [x] Estrutura de pastas (app/, components/, lib/, db/)
- [x] ESLint + Prettier configurados
- [x] Dockerfile (standalone) + docker-compose integrado à rede Docker existente
- [x] Volume compartilhado da pasta de saída (/output) montado no container
- [x] .env.example (DATABASE_URL, AUTH_SECRET, N8N_WEBHOOK_URL, OUTPUT_DIR...)
- [x] Página inicial "hello world" servindo no container

**DoD:** app sobe em Docker na rede existente e responde em localhost.
**Status:** concluída.

> Notas da Fase 0:
>
> - Next.js 16.3 / React 19 / Tailwind v4 / shadcn/ui (estilo base-nova)
> - Rede docker alvo: `infra_default` (n8n = `infra-n8n-1`, postgres = `infra-supabase-db-1`)
> - Imagem roda como usuário `node` (uid 1000) para casar com o dono do volume do host
> - Next 16 renomeou `middleware.ts` para `proxy.ts` — usar na Fase 1

## Fase 1 — Banco de Dados e Autenticação

- [x] Drizzle ORM multi-dialeto (sqlite | postgres | mysql via DB_PROVIDER)
- [x] Schema: users, executions, assets, prompts (+ migrations por dialeto)
- [x] Auth.js (credentials) com usuário no banco + bcrypt
- [x] Proxy (ex-middleware) protegendo todas as rotas exceto /login
- [x] Tela de login PT-BR

**DoD:** login funcional; schema aplicado no banco.
**Status:** concluída (dev local sem Docker).

> Notas da Fase 1:
>
> - Banco trocável por `DB_PROVIDER` (`sqlite` padrão em `./data/app.db`,
>   `postgres` via postgres.js, `mysql` via mysql2) — sem Docker
> - Schemas equivalentes por dialeto em `db/schemas/`; facade em `db/schema.ts`
> - Migrations geradas/aplicadas por dialeto: `npm run db:generate[:sqlite|:pg|:mysql]`,
>   `npm run db:migrate`, seed admin: `npm run db:seed`
> - Auth.js v5 (next-auth@beta): sessão JWT, bcryptjs, proxy edge-safe (`proxy.ts`,
>   renomeado de middleware.ts no Next 16)
> - Usuário inicial: `admin@painel.local` / `trocar123` (envs SEED_ADMIN_*)

## Fase 2 — Biblioteca de Prompts

- [x] API CRUD /api/prompts (tipos: música, imagem, descrição, vídeo)
- [x] Página /prompts: listagem com filtro por tipo + busca
- [x] Formulário criar/editar/excluir
- [x] Campos: nome, tipo, conteúdo, tags, contador de uso, último uso

**DoD:** CRUD completo funcionando na UI.
**Status:** concluída.

> Notas da Fase 2:
>
> - API REST protegida por sessão (401 JSON em /api sem login)
> - Validação com zod (`lib/validation.ts`); nome único → 409 na UI
> - Consultas centralizadas em `db/queries/prompts.ts` (portáveis entre dialetos,
>   sem `.returning()` que não existe no MySQL)
> - Busca case-insensitive por nome/conteúdo/tags + filtro por tipo via URL
> - Route group `(painel)` com header/nav compartilhados; modais base-ui Dialog
>   (criar/editar) e confirmação de exclusão

## Fase 3 — Disparo da Automação

- [ ] *(infra N8N)* Workflow: Webhook inicial recebendo { executionId, prompt } (respond immediately)
- [x] API POST /api/executions → grava registro (status=queued) → chama webhook N8N
- [x] Modal "Nova geração": digitar prompt OU escolher da biblioteca
- [x] Dashboard: lista execuções com status (fila/executando/concluído/falhou)

**DoD:** clique no front dispara o workflow N8N com os parâmetros corretos.
**Status:** concluída no painel; workflow do N8N a criar na infra (contrato pronto).

> Notas da Fase 3:
>
> - Fluxo: cria execução `queued` → dispara webhook → `running` (+uso do prompt)
>   ou `failed` com mensagem de erro se o webhook não responder 2xx (timeout 10s)
> - Contrato: POST N8N_WEBHOOK_URL { executionId, prompt }, Authorization Bearer
>   opcional via N8N_API_KEY; testado com mock local
> - API GET /api/executions disponível para polling futuro
> - Origem do prompt validada por zod: promptId XOR promptText

## Fase 4 — Saída Organizada e Callback de Status

- [ ] *(infra N8N)* Salvar assets em /output/{executionId}/ (video, thumb, music, images)
- [ ] *(infra N8N)* metadata.json por execução (título, descrição, prompts usados, arquivos)
- [x] Node HTTP final do N8N → POST /api/executions/{id}/callback
- [x] Endpoint callback valida e atualiza status no banco
- [x] Polling de fallback na UI para progresso em tempo real

**DoD:** execução aparece como "concluída" automaticamente após o N8N terminar.
**Status:** concluída no painel; convenção de pastas a seguir pelo workflow N8N.

> Notas da Fase 4:
>
> - Callback autenticado por segredo compartilhado (header `x-callback-secret`
>   ou `Authorization: Bearer`, env `N8N_CALLBACK_SECRET`); rota isenta de
>   sessão no proxy
> - Contrato: `{ status: "completed" | "failed", error?, assets? }`; sem
>   `assets`, o painel varre `OUTPUT_DIR/{executionId}` (pasta define o tipo:
>   video/thumbs/music/images; fallback por extensão; metadata.json ignorado)
> - Caminhos sanitizados (relativos a OUTPUT_DIR, prefixados com executionId,
>   traversal rejeitado); assets substituídos em lote (callback reentrante)
> - UI: polling de 5s via RSC refresh apenas enquanto há execuções ativas

## Fase 5 — Galeria de Assets

- [x] Rota autenticada /api/files/[...path] servindo arquivos do volume
- [x] Página /executions/[id]: grid de assets com preview
- [x] Player de vídeo, player de áudio, lightbox de imagens
- [x] Botões copiar texto/caminho e download

**DoD:** todos os assets da execução visíveis e reproduzíveis no painel.
**Status:** concluída.

> Notas da Fase 5:
>
> - Servidor de arquivos com Range/206 (seek em players), HEAD, Content-Type
>   por extensão, `?download=1` (attachment) e sanitização contra traversal
> - Página agrupa por tipo (Vídeo, Thumbnail, Imagem, Música, Descrição);
>   descrições lidas do disco no servidor e exibidas em <pre> com copiar texto
> - Lightbox base-ui Dialog com navegação anterior/próxima entre imagens
> - Cards com copiar caminho e download; dashboard ganhou link "Ver detalhes"

## Fase 6 — Descrições e Aprovação

- [x] Edição de título/descrição persistida no banco
- [x] Aprovar/rejeitar por asset e aprovação global da execução
- [x] Status de aprovação visível na galeria (badges/filtros)
- [x] Histórico das decisões (quem/quando)

**DoD:** fluxo de revisão completo utilizável ponta a ponta.
**Status:** concluída.

> Notas da Fase 6:
>
> - Nova coluna `executions.description` (migration 0001 nos 3 dialetos);
>   título e descrição finais editáveis via modal (PATCH /api/executions/{id})
> - Aprovação por asset: PATCH .../assets/{assetId} com approved/rejected/
>   pending (desfazer); grava aprovador e data; 404 se asset de outra execução
> - "Aprovar todos" (POST .../approve) aprova pendentes e conclui a execução
> - Galeria: badges por status, borda colorida, filtros Todos/Pendentes/
>   Aprovados/Rejeitados com contadores; legenda "Aprovado por X em data"
> - Histórico das decisões listado na página da execução (mais recentes primeiro)
> - Re-callback do N8N substitui assets e zera aprovações (nova revisão)

## Fase 7 — Polimento e Documentação

- [ ] Estados de loading, erro e vazio em todas as telas
- [ ] Responsividade mobile/tablet
- [ ] Revisão de textos PT-BR
- [ ] README: setup, variáveis de ambiente, contrato N8N ↔ front
- [ ] (Fase 2 futura) Regeneração individual de assets

**DoD:** projeto entregue documentado para uso diário.
