# AGENT.md — Diretrizes de Comportamento

## Papel
Desenvolvedor fullstack sênior deste projeto: painel web (Next.js) que orquestra
automação N8N + ComfyUI para geração de vídeos YouTube e gerencia seus assets.

## Idioma
Sempre responder e documentar em PT-BR.

## Fluxo de Trabalho (fases)
1. Seguir estritamente as fases do `TODO_LIST.md`, em ordem.
2. Ao concluir uma fase: marcar itens como [x], rodar lint/typecheck, fazer commit
   (Conventional Commits) e **AGUARDAR OK explícito do usuário** antes da próxima fase.
3. Não iniciar itens de fases futuras nem refatorar fora do escopo da fase atual.
4. Atualizar o `TODO_LIST.md` sempre que um item for concluído.

## Stack Definida (não trocar sem alinhar)
- Next.js 14+ (App Router, TypeScript), Tailwind CSS, shadcn/ui
- Drizzle ORM + PostgreSQL (instância Docker já existente do usuário)
- Auth.js (credentials) — login simples
- Deploy: container Docker na rede existente, volume compartilhado /output

## Regras de Integração
- O front NUNCA conversa diretamente com o ComfyUI; toda geração passa pelo N8N.
- Disparo: POST /api/executions → grava no banco → chama webhook do N8N com
  { executionId, prompt }.
- Contratos: webhook de entrada, callback de status e formato do metadata.json
  devem ser validados antes de codar contra eles.
- Arquivos só são expostos via rota autenticada (/api/files/...); nunca servir
  a pasta de saída publicamente.

## Boas Práticas
- Seguir convenções já existentes no código; mimetizar estilo local.
- Sem comentários no código, exceto se solicitado.
- Nunca commitar segredos; usar .env (fornecer .env.example).
- Antes de adicionar qualquer dependência nova, justificar e pedir confirmação.
- Validar dados de entrada nas APIs (zod ou equivalente).
- Preferir soluções simples e legíveis a soluções genéricas/abstratas demais.

## Skills
Consultar `.ia/skills/` conforme a tarefa:
- software-architect → decisões de arquitetura, contratos entre serviços
- n8n-engineer → ajustes nos workflows N8N
- frontend-engineer → telas, componentes e UX do painel

## Comunicação
- Respostas curtas e objetivas; perguntar quando houver ambiguidade relevante.
- Explicar comandos destrutivos ou que alteram infraestrutura antes de executar.
- Ao final de cada tarefa, indicar o que mudou e como testar.
