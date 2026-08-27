# Architecture

## 1. Visão Geral

Este projeto utiliza uma arquitetura modular baseada em:

- Next.js 16;
- App Router;
- React;
- TypeScript;
- Drizzle ORM;
- PostgreSQL;
- SQLite;
- Clean Architecture;
- princípios SOLID;
- TDD;
- Docker.

O objetivo é manter separação clara entre:

```text
Presentation
    ↓
Application
    ↓
Domain
    ↓
Infrastructure
```

A dependência deve apontar para dentro sempre que possível.

---

# 2. Princípio de Dependência

A arquitetura segue:

```text
┌─────────────────────────────┐
│       Presentation          │
│                             │
│ Next.js / React / API       │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│        Application          │
│                             │
│ Use Cases / Services        │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│           Domain            │
│                             │
│ Entities / Rules / Types    │
└──────────────┬──────────────┘
               ↑
┌──────────────┴──────────────┐
│       Infrastructure        │
│                             │
│ Drizzle / DB / APIs / IO    │
└─────────────────────────────┘
```

O domínio não deve conhecer:

- React;
- Next.js;
- Drizzle;
- PostgreSQL;
- SQLite;
- Docker;
- HTTP.

---

# 3. Estrutura Recomendada

Uma estrutura possível:

```text
src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── dashboard/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
│
├── features/
│   ├── auth/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── components/
│   │   ├── schemas/
│   │   └── tests/
│   │
│   ├── users/
│   ├── products/
│   ├── orders/
│   └── ...
│
├── domain/
│   ├── shared/
│   └── ...
│
├── infrastructure/
│   ├── database/
│   │   ├── drizzle/
│   │   ├── repositories/
│   │   └── migrations/
│   │
│   ├── http/
│   ├── auth/
│   └── services/
│
├── lib/
│   ├── env/
│   ├── utils/
│   └── constants/
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

A estrutura real pode variar conforme o tamanho do projeto.

Não criar diretórios apenas porque aparecem neste documento.

---

# 4. Feature-Based Organization

Quando possível, organizar funcionalidades por domínio.

Exemplo:

```text
features/
└── orders/
    ├── domain/
    │   ├── entities/
    │   ├── value-objects/
    │   ├── repositories/
    │   └── errors/
    │
    ├── application/
    │   ├── use-cases/
    │   └── dto/
    │
    ├── infrastructure/
    │   ├── repositories/
    │   └── mappers/
    │
    ├── components/
    ├── schemas/
    └── tests/
```

Essa abordagem facilita:

- isolamento;
- manutenção;
- testes;
- refactoring;
- entendimento por agentes de IA.

---

# 5. Domain

O domínio representa regras de negócio.

Exemplo:

```text
Order
OrderItem
Money
Product
Customer
Inventory
```

O domínio pode conter:

- entities;
- value objects;
- domain services;
- domain errors;
- repository contracts.

O domínio não deve acessar diretamente:

```ts
db.query(...)
```

ou:

```ts
fetch(...)
```

---

# 6. Application

A camada Application orquestra casos de uso.

Exemplo:

```text
CreateOrder
CancelOrder
AddItemToOrder
ProcessPayment
UpdateProduct
RegisterCustomer
```

Um use case deve:

- receber entrada;
- validar invariantes;
- executar regras;
- utilizar abstrações;
- retornar resultado.

---

# 7. Infrastructure

Infrastructure contém detalhes externos.

Exemplos:

```text
Drizzle
PostgreSQL
SQLite
REST clients
File system
Email provider
Authentication provider
Storage
```

A infraestrutura implementa contratos definidos pelas camadas internas.

---

# 8. Presentation

Presentation contém:

- páginas;
- layouts;
- componentes;
- Route Handlers;
- Server Actions;
- formulários;
- DTOs voltados ao transporte.

Não deve conter regras de negócio complexas.

---

# 9. Next.js

Next.js 16 fornece a camada de aplicação web.

Preferir:

```text
Server Component
    ↓
Use Case
    ↓
Repository
    ↓
Database
```

Para ações:

```text
Form
 ↓
Server Action
 ↓
Validation
 ↓
Use Case
 ↓
Repository
```

Para APIs:

```text
Request
 ↓
Route Handler
 ↓
Validation
 ↓
Use Case
 ↓
Repository
 ↓
Response
```

---

# 10. Server Components

Server Components devem ser o padrão.

Usar Client Components somente quando houver:

- estado local;
- eventos do usuário;
- APIs do browser;
- interação dinâmica;
- biblioteca que exige client-side.

Evitar transformar páginas inteiras em Client Components apenas para utilizar um pequeno componente interativo.

---

# 11. Server Actions

Server Actions são adequadas para:

- mutations originadas da UI;
- formulários;
- operações autenticadas.

Toda Server Action deve:

1. validar input;
2. verificar autenticação;
3. verificar autorização;
4. executar caso de uso;
5. retornar resultado apropriado.

---

# 12. Route Handlers

Route Handlers devem atuar como adaptadores HTTP.

Eles não devem concentrar regras de negócio.

Exemplo:

```text
POST /api/orders
        ↓
validateRequest()
        ↓
createOrderUseCase.execute()
        ↓
HTTP Response
```

---

# 13. Database Architecture

Drizzle é responsável pela persistência.

Exemplo:

```text
Application
      ↓
OrderRepository
      ↓
DrizzleOrderRepository
      ↓
Drizzle
      ↓
PostgreSQL / SQLite
```

Isso permite substituir a implementação sem alterar a regra de negócio.

---

# 14. Database Schemas

Schemas devem permanecer próximos da camada de infraestrutura de banco.

Exemplo:

```text
infrastructure/
└── database/
    └── drizzle/
        ├── schema/
        ├── migrations/
        ├── client.ts
        └── index.ts
```

Evitar importar detalhes de schema diretamente em componentes React.

---

# 15. PostgreSQL e SQLite

A aplicação suporta:

```text
PostgreSQL
SQLite
```

A decisão de usar cada banco deve ser explícita.

PostgreSQL é preferível quando:

- há concorrência maior;
- relações complexas;
- recursos avançados;
- produção centralizada.

SQLite é apropriado quando:

- desenvolvimento local;
- testes;
- aplicações locais;
- cenários com baixa concorrência;
- armazenamento embutido.

Não assumir equivalência completa entre os dois.

---

# 16. Repositories

Repositories devem abstrair persistência quando o domínio/application necessitar disso.

Exemplo:

```ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

Implementação:

```ts
export class DrizzleUserRepository implements UserRepository {
  // implementation
}
```

O domínio não conhece Drizzle.

---

# 17. Transactions

Quando múltiplas operações fazem parte do mesmo caso de uso, avaliar uma transação.

Exemplo:

```text
Create Order
│
├── create order
├── create items
├── decrease stock
└── register movement
```

Essas operações devem ser atomicamente consistentes quando a regra de negócio exigir.

---

# 18. Frontend Architecture

Organizar frontend por:

```text
Shared UI
       +
Feature Components
       +
Page Composition
```

Exemplo:

```text
components/
└── ui/
    ├── button.tsx
    ├── dialog.tsx
    ├── input.tsx
    └── table.tsx

features/
└── products/
    ├── components/
    │   ├── product-form.tsx
    │   └── product-table.tsx
    └── ...
```

---

# 19. Design System

O design system utiliza:

- Tailwind CSS;
- shadcn/ui;
- tokens semânticos;
- componentes reutilizáveis;
- responsividade;
- acessibilidade.

Componentes compartilhados devem ser independentes de regras de negócio específicas.

---

# 20. Estado

Preferir:

1. estado local;
2. estado derivado;
3. URL state;
4. server state;
5. context;
6. biblioteca de estado global somente quando realmente necessária.

Não utilizar estado global para tudo.

---

# 21. Data Fetching

Preferir server-side fetching quando apropriado.

Evitar:

```text
Page
 ↓
useEffect
 ↓
fetch
 ↓
loading
```

quando a mesma informação puder ser obtida diretamente no servidor.

Quando client-side fetching for necessário, avaliar:

- TanStack Query;
- caching;
- stale time;
- mutations;
- optimistic updates.

---

# 22. Error Handling

Erros devem ser previsíveis.

Categorias:

```text
ValidationError
AuthenticationError
AuthorizationError
NotFoundError
ConflictError
DatabaseError
ExternalServiceError
UnexpectedError
```

Evitar:

```ts
throw new Error("deu ruim");
```

como única estratégia de tratamento.

---

# 23. Validation

A validação deve possuir schemas explícitos.

Exemplo:

```ts
const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
});
```

O mesmo contrato deve ser aplicado na fronteira adequada do sistema.

---

# 24. Security Architecture

Nunca confiar no cliente.

Toda operação protegida deve verificar:

```text
Authentication
      ↓
Authorization
      ↓
Validation
      ↓
Business Rules
      ↓
Persistence
```

---

# 25. Docker Architecture

A aplicação deve suportar build de produção com multi-stage.

Modelo:

```text
┌────────────────────────────┐
│ dependencies               │
│ install dependencies       │
└──────────────┬─────────────┘
               ↓
┌────────────────────────────┐
│ builder                    │
│ next build                 │
└──────────────┬─────────────┘
               ↓
┌────────────────────────────┐
│ runner                     │
│ production only            │
└────────────────────────────┘
```

A imagem final deve conter somente o necessário para execução.

---

# 26. Architectural Rules

Nunca criar:

```text
UI → Database
```

Preferir:

```text
UI
 ↓
Application
 ↓
Repository
 ↓
Infrastructure
 ↓
Database
```

Nunca criar:

```text
Domain → Next.js
Domain → React
Domain → Drizzle
Domain → PostgreSQL
```

Preferir:

```text
Infrastructure → Domain
Application → Domain
Presentation → Application
```

---

# 27. Evolution

A arquitetura deve evoluir conforme o sistema cresce.

Não introduzir:

- microservices;
- CQRS;
- event sourcing;
- message brokers;
- complexos padrões distribuídos;

sem necessidade real.

Começar simples.

Adicionar complexidade somente quando houver um problema concreto para resolver.
