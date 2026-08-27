# Development Workflow

## 1. Objetivo

Este documento define como novas funcionalidades, correções e refatorações devem ser desenvolvidas.

Fluxo oficial:

```text
    SPEC
    ↓
    ANALYZE
    ↓
    PLAN
    ↓
    BRANCH
    ↓
    TEST
    ↓
    IMPLEMENT
    ↓
    REFACTOR
    ↓
    VERIFY
    ↓
    REVIEW
    ↓
    COMMIT
    ↓
    PUSH
    ↓
    PULL REQUEST
    ↓
    MERGE
```

---

# 2. Classificação da Tarefa

Antes de começar, classifique a mudança.

Tipos comuns:

```text
feature
fix
refactor
test
docs
chore
perf
security
ci
build
```

Exemplos:

```text
feature:
Adicionar autenticação.

fix:
Corrigir validação de e-mail.

refactor:
Separar repository de usuários.

test:
Adicionar testes de integração para pedidos.

security:
Corrigir controle de autorização.

chore:
Atualizar Dockerfile.
```

---

# 3. Spec

Toda feature relevante deve possuir especificação.

Exemplo:

```md
# Feature: Create Order

## Objetivo

Permitir que usuários criem pedidos.

## Regras

- pedido deve possuir pelo menos um item;
- produto deve existir;
- quantidade deve ser positiva;
- usuário deve estar autenticado;
- estoque deve ser suficiente.

## Critérios de aceitação

- usuário autenticado consegue criar pedido;
- usuário não autenticado recebe erro;
- produto inexistente gera erro;
- estoque insuficiente gera erro;
- pedido criado possui itens;
- estoque é atualizado atomicamente.
```

---

# 4. Analyze

Antes de alterar código:

```text
1. localizar módulos;
2. localizar schema;
3. localizar use cases;
4. localizar repositories;
5. localizar componentes;
6. localizar testes;
7. localizar integrações;
8. identificar impacto.
```

Nunca começar pela implementação.

---

# 5. Planning

O plano deve possuir tarefas pequenas.

Exemplo:

```text
1. criar schema de Order;
2. criar schema de OrderItem;
3. criar migration;
4. criar repository contract;
5. criar repository Drizzle;
6. criar CreateOrder use case;
7. adicionar testes unitários;
8. adicionar testes de integração;
9. criar Server Action;
10. criar formulário;
11. criar E2E;
12. executar validação;
13. atualizar documentação.
```

---

# 6. Branch

Criar branch curta.

Exemplos:

```bash
git switch -c feature/order-creation
```

ou:

```bash
git switch -c fix/order-validation
```

Não trabalhar diretamente na branch principal, exceto para manutenção explicitamente permitida.

---

# 7. TDD

Para código com regra de negócio:

```text
RED
 ↓
GREEN
 ↓
REFACTOR
```

Exemplo:

```text
test:
CreateOrder rejects empty order
```

Executar:

```bash
npm run test
```

Confirmar que falha.

Depois implementar.

Executar novamente.

Confirmar que passa.

Depois refatorar.

Executar novamente.

---

# 8. Unit Tests

Unit tests devem cobrir:

- regras;
- validações;
- cálculos;
- transformações;
- casos de uso;
- erros de domínio.

Não testar detalhes internos sem necessidade.

---

# 9. Integration Tests

Integration tests devem validar integração real entre:

- application;
- repositories;
- Drizzle;
- banco;
- serviços relevantes.

Exemplos:

```text
CreateOrder
UpdateStock
AuthenticateUser
CreateProduct
```

---

# 10. E2E

E2E deve reproduzir comportamento do usuário.

Exemplo:

```text
login
 ↓
dashboard
 ↓
new order
 ↓
select product
 ↓
confirm
 ↓
success
```

Utilizar Playwright.

---

# 11. Frontend Workflow

Ao criar uma tela:

```text
Requirement
 ↓
UX flow
 ↓
Layout
 ↓
Component structure
 ↓
Design
 ↓
Implementation
 ↓
Accessibility
 ↓
Responsive
 ↓
Tests
```

Toda tela deve considerar:

- desktop;
- tablet;
- mobile;
- loading;
- empty;
- error;
- success;
- disabled;
- focus;
- keyboard;
- accessibility.

---

# 12. UI Review

Antes de considerar uma tela concluída, verificar:

```text
[ ] hierarquia visual
[ ] tipografia
[ ] espaçamento
[ ] contraste
[ ] alinhamento
[ ] estados
[ ] responsividade
[ ] acessibilidade
[ ] consistência
[ ] feedback ao usuário
```

---

# 13. Database Workflow

Alterações de banco devem seguir:

```text
Schema
 ↓
Migration
 ↓
Repository
 ↓
Tests
 ↓
Application
```

Nunca alterar apenas o schema sem migration quando a mudança for persistente.

---

# 14. Drizzle Workflow

Exemplo:

```text
alterar schema
      ↓
gerar migration
      ↓
revisar migration
      ↓
executar migration
      ↓
testar repository
      ↓
testar caso de uso
```

Nunca assumir que uma migration está correta somente porque foi gerada automaticamente.

Revisar SQL gerado quando a alteração for importante.

---

# 15. PostgreSQL / SQLite

Quando a aplicação suporta os dois:

```text
schema
 ↓
migration
 ↓
PostgreSQL test
 ↓
SQLite test
```

Quando houver comportamento específico de um banco, documentar.

---

# 16. Refactoring Workflow

Para melhorar código existente:

```text
1. identificar problema;
2. criar characterization test;
3. garantir baseline;
4. refatorar;
5. executar testes;
6. repetir.
```

Nunca combinar refactor estrutural enorme com mudança funcional grande sem necessidade.

---

# 17. Legacy Project Workflow

Em projetos existentes:

```text
AUDIT
 ↓
BASELINE
 ↓
CHARACTERIZATION TESTS
 ↓
SMALL REFACTOR
 ↓
VERIFY
 ↓
NEXT AREA
```

Primeiro estabilize.

Depois melhore.

---

# 18. Security Workflow

Para features que envolvem dados ou autenticação:

```text
Threat Model
 ↓
Authentication
 ↓
Authorization
 ↓
Validation
 ↓
Business Rules
 ↓
Persistence
 ↓
Security Tests
```

Sempre pensar:

- O usuário pode acessar esse recurso?
- Ele pode alterar esse registro?
- Ele pode manipular o ID?
- O input pode ser malicioso?
- O servidor valida?
- Há vazamento de informação?

---

# 19. Commit Workflow

Commits devem ser pequenos e coesos.

Exemplo:

```bash
git add src/features/orders/domain
git commit -m "feat(orders): add order domain model"
```

Depois:

```bash
git add src/features/orders/application
git commit -m "feat(orders): add create order use case"
```

Evitar commits gigantes:

```text
feat: implement everything
```

---

# 20. Conventional Commits

Formato:

```text
<type>(<scope>): <description>
```

Tipos:

```text
feat
fix
refactor
test
docs
chore
perf
security
ci
build
style
revert
```

Exemplos:

```text
feat(auth): add session authentication
feat(products): add product creation
fix(auth): reject expired sessions
refactor(db): isolate drizzle repositories
test(orders): add order integration tests
docs(api): document product endpoints
chore(docker): optimize production image
ci(test): add integration test workflow
```

---

# 21. Pull Request

Todo PR deve responder:

## What

O que foi alterado?

## Why

Por que foi alterado?

## How

Como foi implementado?

## Tests

Quais testes foram executados?

## Risks

Existe risco?

## Screenshots

Quando houver alteração visual.

---

# 22. PR Checklist

```text
[ ] código compilando
[ ] lint passando
[ ] typecheck passando
[ ] unit tests passando
[ ] integration tests passando
[ ] E2E passando quando aplicável
[ ] build passando
[ ] Docker build passando quando aplicável
[ ] migration revisada
[ ] segurança revisada
[ ] documentação atualizada
```

---

# 23. CI

Pipeline recomendado:

```text
Push / PR
   ↓
Install
   ↓
Lint
   ↓
Typecheck
   ↓
Unit Tests
   ↓
Integration Tests
   ↓
Build
   ↓
E2E
   ↓
Docker Build
```

Uma falha deve impedir merge quando a etapa for obrigatória.

---

# 24. Docker Validation

Quando alterar:

- package.json;
- lockfile;
- Next.js;
- runtime;
- environment;
- Dockerfile;
- Docker Compose;
- dependências;

executar:

```bash
docker build -t project:test .
```

e, quando apropriado:

```bash
docker compose build
docker compose up
```

Verificar logs e disponibilidade da aplicação.

---

# 25. Final Verification

Antes de finalizar:

```bash
git status
git diff
```

Depois executar:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Se aplicável:

```bash
npm run test:e2e
docker build .
```

---

# 26. Definition of Done

Uma tarefa somente pode ser considerada concluída quando:

```text
[ ] especificação atendida
[ ] código implementado
[ ] testes criados
[ ] testes passando
[ ] lint passando
[ ] typecheck passando
[ ] build passando
[ ] segurança analisada
[ ] Docker validado quando aplicável
[ ] documentação atualizada
[ ] diff revisado
[ ] status revisado
```

---

# 27. Releases

Releases devem ser orientadas por tags.

Exemplo:

```text
v1.0.0
v1.1.0
v1.1.1
```

SemVer:

```text
MAJOR.MINOR.PATCH
```

MAJOR:

breaking changes.

MINOR:

new backward-compatible features.

PATCH:

bug fixes.

---

# 28. Hotfix

Fluxo:

```text
main
 ↓
hotfix/*
 ↓
test
 ↓
review
 ↓
merge
 ↓
tag
```

Exemplo:

```bash
git switch -c hotfix/auth-session-expiration
```

---

# 29. Rollback

Nunca utilizar:

```bash
git reset --hard
```

em branch compartilhada para "corrigir produção".

Preferir:

```bash
git revert
```

ou estratégia de rollback baseada no mecanismo de deployment.

O rollback deve preservar histórico.

---

# 30. AI Agent Workflow

Quando o OpenCode receber uma tarefa:

```text
UNDERSTAND
 ↓
INSPECT
 ↓
SPEC
 ↓
PLAN
 ↓
TEST
 ↓
IMPLEMENT
 ↓
REFACTOR
 ↓
VERIFY
 ↓
REVIEW
 ↓
REPORT
```

O agente deve sempre explicar:

- o que mudou;
- por que mudou;
- quais arquivos foram alterados;
- quais testes foram executados;
- quais limitações existem.

---

# 31. Nunca fazer automaticamente

Sem autorização explícita:

```text
git push --force
git reset --hard
git rebase em branch compartilhada
git clean -fd
deletar branches
deletar banco
dropar tabelas
apagar migrations
remover secrets
alterar produção
```

---

# 32. Prioridade

Sempre priorizar:

1. Correção;
2. Segurança;
3. Testabilidade;
4. Arquitetura;
5. Manutenibilidade;
6. Performance;
7. DX;
8. Estética;
9. Otimização.

---

# 33. Filosofia

A regra fundamental do projeto é:

```text
Não escreva código primeiro.
Entenda primeiro.

Não refatore primeiro.
Teste primeiro.

Não diga que terminou.
Verifique primeiro.

Não crie abstração porque parece elegante.
Crie porque resolve um problema.

Não transforme tudo em arquitetura.
Mantenha simples até existir uma razão para evoluir.
```
