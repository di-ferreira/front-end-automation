import { relations } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    email: text().notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text().notNull().default("admin"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const prompts = sqliteTable(
  "prompts",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    // musica | imagem | descricao | video
    type: text().$type<"musica" | "imagem" | "descricao" | "video">().notNull(),
    content: text().notNull(),
    tags: text(),
    useCount: integer("use_count").notNull().default(0),
    lastUsedAt: integer("last_used_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("prompts_name_unique").on(table.name)],
);

export const executions = sqliteTable(
  "executions",
  {
    id: text().primaryKey(), // uuid gerado na aplicação
    // queued | running | completed | failed
    status: text()
      .$type<"queued" | "running" | "completed" | "failed">()
      .notNull()
      .default("queued"),
    title: text(),
    promptId: integer("prompt_id").references(() => prompts.id),
    promptText: text("prompt_text"),
    n8nPayload: text("n8n_payload"), // JSON em texto (resposta do webhook)
    description: text(), // descrição final (YouTube) editável no painel
    error: text(),
    startedAt: integer("started_at", { mode: "timestamp_ms" }),
    finishedAt: integer("finished_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("executions_status_idx").on(table.status),
    index("executions_created_at_idx").on(table.createdAt),
  ],
);

export const assets = sqliteTable(
  "assets",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    executionId: text("execution_id")
      .notNull()
      .references(() => executions.id, { onDelete: "cascade" }),
    // video | thumb | music | image | description
    type: text()
      .$type<"video" | "thumb" | "music" | "image" | "description">()
      .notNull(),
    filePath: text("file_path").notNull(),
    mimeType: text("mime_type"),
    sizeBytes: integer("size_bytes"),
    // pending | approved | rejected
    approvalStatus: text("approval_status")
      .$type<"pending" | "approved" | "rejected">()
      .notNull()
      .default("pending"),
    approvedById: integer("approved_by_id").references(() => users.id),
    approvedAt: integer("approved_at", { mode: "timestamp_ms" }),
    metadata: text().$type<Record<string, unknown>>(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
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
