# AGENT.md

## Project Engineering Contract

Este arquivo define as regras obrigatórias para agentes de IA que trabalham neste projeto.

O agente deve tratar este documento como contrato de engenharia do repositório.

Não implemente uma solução apenas porque ela "funciona".
A solução deve ser correta, testável, sustentável, segura, observável e coerente com a arquitetura existente.

---

# 1. Objetivo do Projeto

Este projeto utiliza:

- OpenCode como agente de desenvolvimento;
- Next.js 16;
- React;
- TypeScript;
- App Router;
- Tailwind CSS;
- shadcn/ui;
- Drizzle ORM;
- PostgreSQL;
- SQLite;
- Docker;
- Docker Compose;
- Git.

Os princípios de engenharia adotados são:

- Spec-Driven Development;
- SOLID;
- Clean Code;
- Clean Architecture;
- Domain-Driven Design quando aplicável;
- TDD;
- refactoring incremental;
- code review;
- verification before completion.

---

# 2. Regra Principal

Antes de implementar uma funcionalidade:

1. Entenda o problema.
2. Inspecione o código existente.
3. Identifique os módulos afetados.
4. Verifique as decisões arquiteturais existentes.
5. Defina ou atualize a especificação.
6. Crie um plano de implementação.
7. Identifique riscos.
8. Defina os testes necessários.
9. Só então implemente.

Nunca comece criando código automaticamente sem compreender a arquitetura e o comportamento esperado.

---

# 3. Spec-Driven Development

Toda funcionalidade significativa deve partir de uma especificação.

A especificação deve responder:

- Qual problema está sendo resolvido?
- Quem utiliza a funcionalidade?
- Qual é o comportamento esperado?
- Quais são as regras de negócio?
- Quais são as entradas?
- Quais são as saídas?
- Quais são os erros possíveis?
- Quais são as restrições?
- Quais são os critérios de aceitação?
- Quais partes do sistema serão afetadas?

Fluxo:

SPEC
↓
ANALYZE
↓
PLAN
↓
TEST
↓
IMPLEMENT
↓
VERIFY
↓
REVIEW

Quando uma implementação começa a divergir da especificação, pare e reavalie o plano.

---

# 4. Regra de Não Assumir

Nunca invente:

- APIs;
- tabelas;
- campos;
- endpoints;
- regras de negócio;
- variáveis de ambiente;
- configurações;
- dependências;
- comandos;
- componentes;
- comportamento de bibliotecas.

Sempre procure primeiro:

- código existente;
- documentação do projeto;
- package.json;
- configurações;
- schemas;
- migrations;
- testes;
- arquivos de ambiente;
- documentação oficial da biblioteca.

Quando houver incerteza técnica, verifique antes de implementar.

---

# 5. Arquitetura

A arquitetura deve favorecer:

- baixo acoplamento;
- alta coesão;
- separação de responsabilidades;
- testabilidade;
- substituição de implementações;
- clareza;
- evolução incremental.

Preferir:

- Dependency Inversion;
- composição;
- interfaces nas fronteiras;
- módulos com responsabilidades claras;
- funções pequenas;
- casos de uso explícitos;
- domínio independente de infraestrutura quando aplicável.

Evitar:

- God Objects;
- God Functions;
- lógica de negócio dentro de componentes de UI;
- acesso direto ao banco espalhado pela aplicação;
- dependências circulares;
- abstrações prematuras;
- wrappers sem valor;
- duplicação de regras;
- condicionais gigantes;
- funções com múltiplas responsabilidades.

---

# 6. SOLID

## Single Responsibility Principle

Cada módulo deve ter uma responsabilidade clara.

Não misture:

- regra de negócio;
- acesso ao banco;
- renderização;
- autenticação;
- validação;
- comunicação externa.

## Open/Closed Principle

Prefira extensibilidade por composição e abstração em vez de modificar constantemente código estável.

## Liskov Substitution Principle

Implementações devem respeitar o contrato da abstração.

## Interface Segregation Principle

Prefira interfaces pequenas e específicas.

## Dependency Inversion Principle

Regras de negócio não devem depender diretamente de detalhes de infraestrutura.

---

# 7. Clean Code

Todo código novo deve priorizar:

- nomes claros;
- funções pequenas;
- baixo nível de complexidade;
- fluxo de execução compreensível;
- ausência de duplicação;
- tratamento explícito de erros;
- tipos fortes;
- comentários somente quando agregarem contexto.

Não utilizar comentários para explicar código ruim.

Prefira melhorar o código.

---

# 8. TypeScript

TypeScript deve ser utilizado de forma estritamente tipada.

Evitar:

```ts
any;
```

quando houver alternativa adequada.

Preferir:

- tipos explícitos nas fronteiras;
- discriminated unions;
- type guards;
- generics quando agregarem valor;
- inferência quando melhorar legibilidade;
- `unknown` em vez de `any` quando apropriado.

Não desligar verificações do TypeScript para esconder problemas.

Nunca utilizar:

```ts
// @ts-ignore
```

sem justificativa técnica documentada.

---

# 9. Next.js 16

O projeto utiliza Next.js 16 com App Router.

Priorizar:

- Server Components;
- Server Actions quando apropriado;
- Route Handlers quando apropriado;
- streaming;
- Suspense;
- caching explícito;
- separação correta entre Server e Client Components.

Não transformar componentes em Client Components sem necessidade.

Utilize:

```tsx
"use client";
```

somente quando houver necessidade real de comportamento client-side.

Evitar:

- buscar dados no browser quando isso puder ser resolvido no servidor;
- waterfalls de requests;
- estado global desnecessário;
- prop drilling excessivo;
- lógica de negócio em componentes de apresentação.

---

# 10. React

Componentes devem seguir:

- responsabilidade única;
- composição;
- reutilização real;
- baixo acoplamento;
- acessibilidade.

Evitar componentes gigantes.

Quando um componente ultrapassar uma responsabilidade razoável, avaliar a divisão em:

- Container;
- Presentation;
- Form;
- Hook;
- Feature;
- Shared Component.

Não criar abstrações apenas para reduzir linhas de código.

---

# 11. Frontend Design

O frontend deve ser:

- moderno;
- consistente;
- responsivo;
- acessível;
- visualmente coerente;
- funcional;
- orientado à experiência do usuário.

Não produzir interfaces genéricas sem identidade.

Antes de criar uma nova tela, avaliar:

- hierarquia visual;
- espaçamento;
- tipografia;
- contraste;
- densidade;
- estados de interação;
- loading;
- empty state;
- error state;
- success state;
- mobile;
- keyboard navigation.

---

# 12. Tailwind CSS

Utilizar Tailwind para estilização.

Preferir:

- classes utilitárias organizadas;
- tokens semânticos;
- variantes;
- componentes reutilizáveis.

Evitar duplicação excessiva de classes.

Quando a mesma composição visual aparecer repetidamente, considerar um componente.

Não criar CSS global sem necessidade.

---

# 13. shadcn/ui

Preferir componentes shadcn/ui para elementos comuns de interface.

Não reinventar:

- Button;
- Dialog;
- Drawer;
- Dropdown;
- Form;
- Input;
- Select;
- Tabs;
- Tooltip;
- Table;
- Alert;
- Toast.

Customize os componentes quando necessário, mantendo consistência visual.

Não introduza outra biblioteca de componentes sem necessidade arquitetural.

---

# 14. Forms e Validation

Formulários devem utilizar validação tipada.

Preferir:

- React Hook Form;
- Zod;
- validação no cliente para UX;
- validação no servidor para segurança.

Nunca confiar apenas na validação do frontend.

As regras críticas devem existir também no servidor.

---

# 15. Backend

O backend é implementado dentro do ecossistema Next.js quando apropriado.

Separar:

- HTTP;
- application;
- domain;
- infrastructure.

Evitar colocar regras de negócio diretamente dentro de:

- Route Handlers;
- Server Actions;
- Controllers;
- componentes React.

Route Handler ou Server Action deve orquestrar.
A regra de negócio deve viver em uma camada apropriada.

---

# 16. API

APIs devem possuir:

- contratos claros;
- validação;
- tratamento de erros;
- autenticação;
- autorização;
- respostas consistentes;
- códigos HTTP apropriados;
- documentação quando necessário.

Não expor diretamente estruturas internas do banco sem motivo.

---

# 17. Drizzle ORM

Drizzle ORM é a camada de acesso ao banco.

Regra:

Acesso ao banco deve ser centralizado e previsível.

Evitar queries espalhadas por toda a aplicação.

Preferir:

- repositories;
- query modules;
- services;
- use cases.

O schema do Drizzle deve ser a fonte declarativa do modelo de dados da aplicação, respeitando as capacidades reais de cada banco.

Nunca alterar schema manualmente em produção sem considerar migrations.

---

# 18. PostgreSQL e SQLite

O projeto suporta:

- PostgreSQL;
- SQLite.

Nunca assumir que os dois bancos são semanticamente idênticos.

Antes de utilizar um recurso específico:

- verificar compatibilidade;
- verificar tipos;
- verificar constraints;
- verificar migrations;
- verificar índices;
- verificar comportamento transacional;
- verificar diferenças de sintaxe.

Evitar dependência desnecessária de recursos exclusivos do PostgreSQL quando o mesmo código também precisa funcionar em SQLite.

Quando uma funcionalidade exigir recurso específico de PostgreSQL, isso deve ser explícito na arquitetura.

---

# 19. Database

Regras:

- usar migrations versionadas;
- manter schema consistente;
- evitar alterações destrutivas;
- usar foreign keys quando apropriado;
- utilizar índices de forma consciente;
- evitar N+1;
- validar queries importantes;
- manter integridade dos dados.

Nunca apagar ou recriar o banco automaticamente em ambiente que possa conter dados reais.

---

# 20. Transactions

Operações que alteram múltiplos recursos relacionados devem considerar transações.

Exemplos:

- criação de pedido;
- atualização de estoque;
- pagamento;
- alteração de múltiplas entidades;
- operações financeiras.

Nunca presumir atomicidade sem verificar o comportamento do banco e do ORM.

---

# 21. TDD

Quando a funcionalidade possuir comportamento verificável:

1. escrever o teste;
2. executar;
3. confirmar que falha;
4. implementar o mínimo necessário;
5. executar novamente;
6. refatorar;
7. executar novamente.

Fluxo:

RED
↓
GREEN
↓
REFACTOR

Nunca escrever testes que simplesmente reproduzem a implementação.

Testar comportamento, não detalhes internos desnecessários.

---

# 22. Testing Pyramid

Priorizar:

```text
        E2E
       /   \
 Integration
    /       \
   Unit Tests
```

Utilizar:

- Unit Tests para regras isoladas;
- Integration Tests para banco e módulos;
- E2E para fluxos críticos.

Não substituir todos os testes por E2E.

---

# 23. Playwright

Playwright deve ser utilizado para fluxos críticos de interface.

Exemplos:

- login;
- cadastro;
- criação;
- edição;
- exclusão;
- pagamentos;
- checkout;
- fluxos administrativos;
- permissões.

Testes E2E devem validar comportamento do usuário.

Evitar testes excessivamente acoplados à estrutura HTML.

Preferir:

- roles;
- labels;
- accessible names;
- test ids somente quando necessários.

---

# 24. Verification Before Completion

Nunca informar:

"feito",
"concluído",
"resolvido"

sem validar.

Antes de finalizar uma tarefa, quando aplicável:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

e:

```bash
npm run test:e2e
```

quando houver E2E.

Também executar:

```bash
docker build .
```

quando a mudança afetar containerização.

O agente deve informar quais verificações foram executadas e seus resultados.

Nunca alegar que algo passou sem executar a verificação.

---

# 25. Docker

O projeto deve ser executável em container.

Preferir:

- multi-stage build;
- imagens oficiais;
- imagens mínimas;
- usuário não-root quando possível;
- cache eficiente de dependências;
- `.dockerignore`;
- secrets fora da imagem;
- variáveis de ambiente em runtime;
- healthcheck quando apropriado.

Nunca copiar:

- `.env`;
- secrets;
- credenciais;
- chaves privadas;

para dentro da imagem.

---

# 26. Docker Compose

Quando utilizar serviços auxiliares:

- PostgreSQL;
- SQLite não necessita de container;
- Redis;
- observability;
- outros serviços;

organizar o `docker-compose.yml` com:

- healthchecks;
- volumes;
- networks;
- variáveis;
- dependências explícitas.

Não depender apenas de:

```yaml
depends_on:
```

para garantir que um serviço esteja pronto.

Utilizar healthchecks quando a disponibilidade do serviço for relevante.

---

# 27. Environment Variables

Secrets nunca devem ser commitados.

Nunca colocar diretamente no código:

- passwords;
- tokens;
- API keys;
- private keys;
- connection strings reais.

Manter:

```text
.env
```

fora do Git quando contiver informações sensíveis.

Fornecer:

```text
.env.example
```

com valores fictícios.

---

# 28. Security

Aplicar princípios OWASP.

Considerar:

- input validation;
- authorization;
- authentication;
- CSRF;
- XSS;
- SQL injection;
- SSRF;
- insecure direct object references;
- broken access control;
- rate limiting;
- secret leakage;
- dependency vulnerabilities.

Nunca confiar no cliente.

Toda autorização real deve ser verificada no servidor.

---

# 29. Dependências

Antes de adicionar uma dependência:

1. verificar se o projeto já possui solução equivalente;
2. verificar manutenção;
3. verificar compatibilidade;
4. verificar licença;
5. verificar impacto de bundle;
6. verificar segurança;
7. verificar se realmente reduz complexidade.

Não instalar dependências apenas para resolver problemas triviais.

---

# 30. Git

O histórico existente é preservado.

Nunca:

- reescrever histórico compartilhado;
- realizar force push;
- resetar trabalho do usuário;
- apagar branches;
- alterar commits antigos.

Sem autorização explícita.

Novas mudanças devem utilizar commits pequenos e coesos.

Preferir Conventional Commits:

```text
feat(auth): add session authentication
fix(users): prevent duplicate email
refactor(db): isolate drizzle repositories
test(order): add creation integration tests
docs(api): update authentication docs
chore(docker): optimize production image
perf(query): optimize product search
```

Formato:

```text
<type>(<scope>): <description>
```

---

# 31. Branches

Preferir branches curtas.

Exemplos:

```text
feature/user-authentication
feature/order-management
fix/login-validation
refactor/database-repository
test/order-flow
docs/api-authentication
chore/docker-build
```

Não criar branches extremamente longas sem necessidade.

---

# 32. Pull Requests

PRs devem possuir:

- objetivo;
- contexto;
- mudanças;
- testes;
- riscos;
- impacto;
- screenshots quando houver UI.

Antes do merge:

- lint;
- typecheck;
- testes;
- build;
- E2E quando necessário;
- revisão.

---

# 33. Code Review

Durante code review procurar:

- bugs;
- violações de arquitetura;
- riscos de segurança;
- duplicação;
- complexidade;
- problemas de performance;
- testes insuficientes;
- inconsistências de tipagem;
- problemas de UX;
- problemas de acessibilidade.

Review deve priorizar problemas reais, não preferências pessoais.

---

# 34. Refactoring

Refactoring deve ser incremental.

Não misturar:

```text
refactor gigante
+
nova feature
+
mudança de banco
+
mudança visual
```

na mesma alteração sem necessidade.

Preferir:

1. criar testes;
2. modificar uma parte;
3. verificar;
4. seguir para a próxima.

---

# 35. Performance

Priorizar performance onde houver impacto mensurável.

Considerar:

- bundle size;
- server/client boundary;
- waterfalls;
- caching;
- database queries;
- indexes;
- N+1;
- image optimization;
- lazy loading;
- streaming;
- Core Web Vitals.

Não fazer micro-otimizações sem evidência.

---

# 36. Accessibility

Toda interface deve considerar:

- teclado;
- foco;
- contraste;
- labels;
- roles;
- semantic HTML;
- screen readers;
- mensagens de erro;
- estados de loading;
- estados de disabled.

Priorizar WCAG.

---

# 37. Observability

Código de produção deve facilitar diagnóstico.

Quando apropriado utilizar:

- structured logging;
- métricas;
- tracing;
- error tracking.

Logs não devem conter:

- passwords;
- tokens;
- secrets;
- informações sensíveis desnecessárias.

---

# 38. AI Development Rules

O agente deve:

- analisar antes de modificar;
- preferir pequenas alterações;
- verificar antes de afirmar;
- não inventar APIs;
- não duplicar código sem necessidade;
- não adicionar dependências sem justificativa;
- não apagar código aparentemente "não utilizado" sem verificar;
- não modificar configurações críticas sem compreender o impacto;
- manter compatibilidade com a arquitetura existente.

Se houver dúvida entre duas abordagens:

1. verificar o código;
2. verificar documentação;
3. verificar testes;
4. escolher a solução mais simples que respeite a arquitetura.

---

# 39. Definition of Done

Uma tarefa só está concluída quando:

- [ ] especificação atendida;
- [ ] arquitetura respeitada;
- [ ] SOLID respeitado;
- [ ] Clean Code aplicado;
- [ ] testes adicionados ou atualizados;
- [ ] testes executados;
- [ ] lint executado;
- [ ] typecheck executado;
- [ ] build executado;
- [ ] E2E executado quando aplicável;
- [ ] segurança considerada;
- [ ] Docker validado quando aplicável;
- [ ] documentação atualizada quando necessário;
- [ ] git diff revisado;
- [ ] git status revisado.

---

# 40. Asset Studio

O Asset Studio permite gerar assets individuais (música, thumbnail, background, descrição, vídeo) para canais configurados.

## 40.1 Estrutura de Dados

```text
channels → workflow_configs (1:N)
channels → asset_generations (1:N)
workflow_configs → workflow_executions (1:N)
asset_generations → workflow_executions (1:N)
```

## 40.2 Canais

Canais são entidades gerenciadas via `/channels`. Cada canal possui:

- name, slug (unique), description, color, icon, enabled
- Workflow configs associados (um por asset type)

## 40.3 Workflow Configs

Cada config define:

- channel_id + asset_type (combinação única)
- webhook_url, method, headers, priority, timeout_ms
- enabled/disabled

## 40.4 Geração de Assets

Fluxo:

1. Usuário seleciona canal + tipo de asset
2. `resolveWorkflow()` busca config no DB (fallback: env)
3. `executeWorkflow()` chama webhook externo
4. Resultado registrado em `asset_generations` + `workflow_executions`

## 40.5 Pages

```text
/channels              → CRUD de canais
/channels/[id]         → Detalhe + workflow configs
/assets/music          → Music Asset Studio
/assets/thumbnail      → Thumbnail Asset Studio
/assets/background     → Background Asset Studio
/assets/description    → Description Asset Studio
/assets/video          → Video Asset Studio
```

## 40.6 Scripts

```bash
npm run db:migrate          # Aplica migrations
npm run db:seed:workflows   # Popula 3 canais × 5 asset types
npm run test                # Executa testes unitários
```

## 40.7 Regras

- Canais devem ter slug único em minúsculas
- Workflow configs devem ter slug único
- Webhook URLs não devem ficar no .env após migração
- Não expor secrets nos payloads de request/response
- Validar input com Zod em toda fronteira

---

# 41. Regra Final

Prioridade das decisões:

1. Correção;
2. Segurança;
3. Testabilidade;
4. Clareza;
5. Manutenibilidade;
6. Performance;
7. Elegância;
8. Otimização prematura.

Uma solução simples, clara e testável é preferível a uma solução sofisticada e desnecessariamente complexa.

Não implemente arquitetura pela arquitetura.

Não implemente abstrações pela abstração.

Não implemente código pela quantidade.

Implemente valor.
