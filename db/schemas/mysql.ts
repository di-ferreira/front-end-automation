import { relations } from "drizzle-orm";
import {
  datetime,
  index,
  int,
  json,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 320 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: varchar({ length: 20 }).notNull().default("admin"),
    createdAt: datetime("created_at", { fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: datetime("updated_at", { fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const prompts = mysqlTable(
  "prompts",
  {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    // musica | imagem | descricao | video
    type: varchar({ length: 20 })
      .$type<"musica" | "imagem" | "descricao" | "video">()
      .notNull(),
    content: text().notNull(),
    tags: varchar({ length: 500 }),
    useCount: int("use_count").notNull().default(0),
    lastUsedAt: datetime("last_used_at", { fsp: 3 }),
    createdAt: datetime("created_at", { fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: datetime("updated_at", { fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("prompts_name_unique").on(table.name)],
);

export const executions = mysqlTable(
  "executions",
  {
    id: varchar({ length: 36 }).primaryKey(), // uuid gerado na aplicação
    // queued | running | completed | failed
    status: varchar({ length: 20 })
      .$type<"queued" | "running" | "completed" | "failed">()
      .notNull()
      .default("queued"),
    title: varchar({ length: 500 }),
    promptId: int("prompt_id").references(() => prompts.id),
    promptText: text("prompt_text"),
    n8nPayload: text("n8n_payload"), // JSON em texto (resposta do webhook)
    error: text(),
    startedAt: datetime("started_at", { fsp: 3 }),
    finishedAt: datetime("finished_at", { fsp: 3 }),
    createdAt: datetime("created_at", { fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: datetime("updated_at", { fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("executions_status_idx").on(table.status),
    index("executions_created_at_idx").on(table.createdAt),
  ],
);

export const assets = mysqlTable(
  "assets",
  {
    id: int().autoincrement().primaryKey(),
    executionId: varchar("execution_id", { length: 36 })
      .notNull()
      .references(() => executions.id, { onDelete: "cascade" }),
    // video | thumb | music | image | description
    type: varchar({ length: 20 })
      .$type<"video" | "thumb" | "music" | "image" | "description">()
      .notNull(),
    filePath: text("file_path").notNull(),
    mimeType: varchar("mime_type", { length: 100 }),
    sizeBytes: int("size_bytes"),
    // pending | approved | rejected
    approvalStatus: varchar("approval_status", { length: 20 })
      .$type<"pending" | "approved" | "rejected">()
      .notNull()
      .default("pending"),
    approvedById: int("approved_by_id").references(() => users.id),
    approvedAt: datetime("approved_at", { fsp: 3 }),
    metadata: json().$type<Record<string, unknown>>(),
    createdAt: datetime("created_at", { fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("assets_execution_id_idx").on(table.executionId),
    index("assets_type_idx").on(table.type),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  approvals: many(assets),
}));

export const promptsRelations = relations(prompts, ({ many }) => ({
  executions: many(executions),
}));

export const executionsRelations = relations(executions, ({ one, many }) => ({
  prompt: one(prompts, {
    fields: [executions.promptId],
    references: [prompts.id],
  }),
  assets: many(assets),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  execution: one(executions, {
    fields: [assets.executionId],
    references: [executions.id],
  }),
  approvedBy: one(users, {
    fields: [assets.approvedById],
    references: [users.id],
  }),
}));

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type PromptRow = typeof prompts.$inferSelect;
export type NewPromptRow = typeof prompts.$inferInsert;
export type ExecutionRow = typeof executions.$inferSelect;
export type NewExecutionRow = typeof executions.$inferInsert;
export type AssetRow = typeof assets.$inferSelect;
export type NewAssetRow = typeof assets.$inferInsert;
