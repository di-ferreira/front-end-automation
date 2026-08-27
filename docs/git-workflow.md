# Git Workflow — front-end-automation

## Objetivo

Estabelecer um Git Workflow profissional e consistente para o projeto, garantindo:

- Histórico limpo e rastreável
- Code review obrigatório
- CI antes do merge
- Commits padronizados (Conventional Commits)

## Estratégia de Branches: GitHub Flow

```
master (protegida, sempre deployável)
  │
  ├── feat/user-auth          → PR → review → merge (squash)
  ├── fix/n8n-callback-timeout → PR → review → merge (squash)
  └── chore/setup-ci          → PR → review → merge (squash)
```

### Regras

1. **Nunca commitar direto na `master`** — sempre via PR
2. **Branches curtas** — máximo 3 dias de trabalho
3. **Uma feature/fix por branch** — PRs focados
4. **Deletar branch após merge**

### Nomenclatura de Branches

| Tipo       | Formato                | Exemplo                    |
| ---------- | ---------------------- | -------------------------- |
| Feature    | `feat/<descrição>`     | `feat/user-avatar-upload`  |
| Fix        | `fix/<descrição>`      | `fix/n8n-callback-timeout` |
| Hotfix     | `hotfix/<descrição>`   | `hotfix/auth-bypass`       |
| Refactor   | `refactor/<descrição>` | `refactor/db-queries`      |
| Docs       | `docs/<descrição>`     | `docs/api-reference`       |
| Chore      | `chore/<descrição>`    | `chore/setup-ci`           |
| Experiment | `exp/<descrição>`      | `exp/websocket-polling`    |

**Regras de nomes:**

- max 3 palavras
- kebab-case (ex: `user-avatar-upload`)
- sem acentos ou caracteres especiais
- sem `/` exceto o prefixo do tipo

## Conventional Commits

### Formato

```
<type>(<scope>): <descrição>

[corpo opcional]

[footer opcional]
```

### Types

| Type       | Quando usar                         | Exemplo                             |
| ---------- | ----------------------------------- | ----------------------------------- |
| `feat`     | Nova funcionalidade                 | `feat(auth): login com credenciais` |
| `fix`      | Correção de bug                     | `fix(api): retorno 500 no callback` |
| `docs`     | Documentação                        | `docs(readme): instruções de setup` |
| `refactor` | Refatoração sem mudança de behavior | `refactor(db): extrair queries`     |
| `test`     | Testes                              | `test(prompts): validação zod`      |
| `chore`    | Manutenção                          | `chore(deps): atualizar drizzle`    |
| `style`    | Formatação                          | `style: corrigir indentação`        |
| `perf`     | Performance                         | `perf(query): index executions`     |
| `ci`       | CI/CD                               | `ci: adicionar workflow lint`       |
| `build`    | Build                               | `build: ajustar Dockerfile`         |
| `revert`   | Reverter                            | `revert: reverter "feat(auth)..."`  |

### Scopes do Projeto

`auth`, `api`, `db`, `ui`, `n8n`, `executions`, `prompts`, `assets`, `docker`, `config`

### Exemplos

```
feat(executions): filtro por status na dashboard
fix(n8n): timeout no webhook de callback
refactor(db): extrair schema para módulo separado
chore: adicionar .gitattributes
```

### Regras

- **Imperativo**: "adicionar" não "adicionado"
- **Sem ponto final**
- **Max 72 caracteres** no título
- **Body** explica POR QUE, não O QUE
- **Footer** referencia issues: `Closes #123`

## Pull Requests

### Título

Mesmo formato do commit: `<type>(<scope>): <descrição>`

### Template

```markdown
## O que

<descrição breve>

## Por que

<justificativa>

## Como

<detalhes>

## Testes

- [ ] Unitários adicionados/atualizados
- [ ] Integração (se aplicável)
- [ ] Manual realizado

## Checklist

- [ ] `npm run lint` passa
- [ ] `npm run typecheck` passa
- [ ] `npm run build` passa
- [ ] Revisão completa
- [ ] Docs atualizados

Closes #<issue>
```

### Regras

- **PRs pequenos** — < 500 linhas ideal
- **1 feature/fix por PR**
- **CI deve passar** antes do merge
- **Squash merge** — 1 PR = 1 commit no histórico
- **Deletar branch** após merge

## Code Review

### Para Reviewers

- [ ] Código resolve o problema proposto?
- [ ] Edge cases tratados?
- [ ] Código legível e manutenível?
- [ ] Testes suficientes?
- [ ] Problemas de segurança?
- [ ] Histórico limpo (squashed)?

### Para Autores

- [ ] Self-review antes de pedir review
- [ ] CI passa (lint, typecheck, build)
- [ ] PRsize razoável (< 500 linhas)
- [ ] Focado em uma mudança
- [ ] Descrição clara

## Merge Strategy: Squash Merge

```
feat/user-auth (3 commits)
  ├── feat(auth): criar schema de usuário
  ├── feat(auth): implementar login
  └── feat(auth): adicionar proteção de rotas

↓ squash merge ↓

master (1 commit)
  └── feat(auth): implementar autenticacao completa (#12)
```

**Por que squash merge:**

- Histórico linear e limpo
- 1 PR = 1 commit rastreável
- Sem "WIP" ou commits intermediários no master
- Fácil de reverter

## Releases e Tags

### Semantic Versioning

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes
MINOR: Novas features (compatível)
PATCH: Bug fixes
```

### Criando Releases

```bash
# Tag anotada
git tag -a v1.0.0 -m "Release v1.0.0

Features:
- Autenticação completa
- CRUD de prompts
- Dashboard de execuções

Fixes:
- Timeout no callback N8N"

# Push da tag
git push origin v1.0.0
```

## Hotfix

Para correções urgentes na produção:

```bash
# 1. Criar branch hotfix da master
git checkout master
git checkout -b hotfix/critical-security-patch

# 2. Corrigir e commitar
git commit -m "fix(auth): corrigir bypass de autenticação"

# 3. Push e PR
git push -u origin hotfix/critical-security-patch

# 4. Squash merge imediato (após review mínimo)

# 5. Tag de patch
git tag -a v1.0.1 -m "Hotfix: corrigir bypass de autenticação"
git push origin v1.0.1

# 6. Deletar branch
git branch -d hotfix/critical-security-patch
```

## Rollback

```bash
# Opção 1: Revert (preserva histórico)
git revert <commit-hash>
git push origin master

# Opção 2: Revert de tag inteira
git revert v1.0.0..v1.0.1
git commit -m "revert: reverter mudanças da v1.0.1"
git push origin master
```

**Nunca usar `git reset` em branches compartilhadas.**

## Breaking Changes

Quando uma mudança quebra compatibilidade:

1. Usar type `feat!:` ou `fix!:` no commit
2. Adicionar `BREAKING CHANGE:` no footer
3. Incrementar MAJOR na versão

```
feat(api)!: redesign completo do endpoint de execuções

BREAKING CHANGE: formato do response do GET /api/executions mudou.
Antes: { executions: [...] }
Depois: { data: [...], meta: { total, page } }
```

## Fluxo Completo de Desenvolvimento

```
1. SPEC          → Analisar requisitos (spec-driven-development)
2. PLAN          → Definir passos (writing-plans)
3. BRANCH        → git checkout -b feat/<nome>
4. TDD           → Escrever testes primeiro
5. IMPLEMENT     → Código limpo (clean-code, SOLID)
6. TEST          → Rodar lint, typecheck, build
7. VERIFY        → Conferir tudo passa (verification-before-completion)
8. COMMIT        → git commit -m "feat(scope): descrição"
9. PUSH          → git push -u origin feat/<nome>
10. PULL REQUEST → Criar PR com template
11. CODE REVIEW  → Revisão por pares (code-review)
12. MERGE        → Squash merge (CI verde obrigatório)
13. CLEANUP      → Deletar branch
```

## Comandos Rápidos

| Tarefa                | Comando                                        |
| --------------------- | ---------------------------------------------- |
| Criar branch          | `git checkout -b feat/nome`                    |
| Atualizar com main    | `git fetch origin && git rebase origin/master` |
| Push                  | `git push -u origin feat/nome`                 |
| Ver log visual        | `git log --oneline --graph --all`              |
| Deletar branch merged | `git branch -d feat/nome`                      |
| Deletar branch remota | `git push origin --delete feat/nome`           |
| Stash                 | `git stash push -m "descrição"`                |
| Pop stash             | `git stash pop`                                |

## Anti-Patterns

```
# ERRADO: Commitar direto na master
# ERRADO: Commits como "update", "fix", "WIP"
# ERRADO: PRs gigantes (1000+ linhas)
# ERRADO: Force push em branches compartilhadas
# ERRADO: Branches vivas por semanas
# ERRADO: Commitar .env, node_modules, secrets

# CERTO: Branch feature + PR + review + squash merge
# CERTO: Commits descritivos e coerentes
# CERTO: PRs pequenos e focados
# CERTO: Rebase local antes de push
# CERTO: Branches curtas (< 3 dias)
# CERTO: .gitignore para arquivos sensíveis
```
