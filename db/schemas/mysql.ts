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
    type: varchar({ length: 20 }).$type<"musica" | "imagem" | "descricao" | "video">().notNull(),
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
    description: text(), // descrição final (YouTube) editável no painel
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

export const channels = mysqlTable(
  "channels",
  {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 100 }).notNull(),
    description: varchar({ length: 500 }),
    color: varchar({ length: 7 }),
    icon: varchar({ length: 50 }),
    enabled: int().notNull().default(1),
    metadata: json().$type<Record<string, unknown>>(),
    createdAt: datetime("created_at", { fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: datetime("updated_at", { fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("channels_slug_unique").on(table.slug)],
);

export const workflowConfigs = mysqlTable(
  "workflow_configs",
  {
    id: int().autoincrement().primaryKey(),
    channelId: int("channel_id")
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    assetType: varchar("asset_type", { length: 50 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 150 }).notNull(),
    webhookUrl: varchar("webhook_url", { length: 2048 }).notNull(),
    method: varchar({ length: 10 }).notNull().default("POST"),
    headers: json().$type<Record<string, string>>(),
    enabled: int().notNull().default(1),
    priority: int().notNull().default(0),
    timeoutMs: int("timeout_ms").notNull().default(10000),
    metadata: json().$type<Record<string, unknown>>(),
    createdAt: datetime("created_at", { fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: datetime("updated_at", { fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("workflow_configs_slug_unique").on(table.slug),
    index("workflow_configs_channel_id_idx").on(table.channelId),
  ],
);

export const assetGenerations = mysqlTable(
  "asset_generations",
  {
    id: int().autoincrement().primaryKey(),
    channelId: int("channel_id")
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    assetType: varchar("asset_type", { length: 50 }).notNull(),
    promptText: text("prompt_text"),
    filePath: varchar("file_path", { length: 2048 }),
    mimeType: varchar("mime_type", { length: 100 }),
    sizeBytes: int("size_bytes"),
    status: varchar({ length: 20 })
      .$type<"pending" | "generating" | "completed" | "failed">()
      .notNull()
      .default("pending"),
    error: text(),
    workflowConfigId: int("workflow_config_id").references(() => workflowConfigs.id),
    metadata: json().$type<Record<string, unknown>>(),
    approvedById: int("approved_by_id").references(() => users.id),
    approvedAt: datetime("approved_at", { fsp: 3 }),
    createdAt: datetime("created_at", { fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: datetime("updated_at", { fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("asset_generations_channel_id_idx").on(table.channelId),
    index("asset_generations_status_idx").on(table.status),
  ],
);

export const workflowExecutions = mysqlTable(
  "workflow_executions",
  {
    id: int().autoincrement().primaryKey(),
    workflowConfigId: int("workflow_config_id")
      .notNull()
      .references(() => workflowConfigs.id, { onDelete: "cascade" }),
    assetGenerationId: int("asset_generation_id").references(() => assetGenerations.id, {
      onDelete: "set null",
    }),
    status: varchar({ length: 20 })
      .$type<"pending" | "running" | "success" | "failed">()
      .notNull()
      .default("pending"),
    requestPayload: json("request_payload"),
    responsePayload: json("response_payload"),
    error: text(),
    startedAt: datetime("started_at", { fsp: 3 }),
    completedAt: datetime("completed_at", { fsp: 3 }),
    durationMs: int("duration_ms"),
    createdAt: datetime("created_at", { fsp: 3 })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("workflow_executions_config_id_idx").on(table.workflowConfigId)],
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

export const channelsRelations = relations(channels, ({ many }) => ({
  workflowConfigs: many(workflowConfigs),
  assetGenerations: many(assetGenerations),
}));

export const workflowConfigsRelations = relations(workflowConfigs, ({ one, many }) => ({
  channel: one(channels, {
    fields: [workflowConfigs.channelId],
    references: [channels.id],
  }),
  executions: many(workflowExecutions),
  generations: many(assetGenerations),
}));

export const assetGenerationsRelations = relations(assetGenerations, ({ one, many }) => ({
  channel: one(channels, {
    fields: [assetGenerations.channelId],
    references: [channels.id],
  }),
  workflowConfig: one(workflowConfigs, {
    fields: [assetGenerations.workflowConfigId],
    references: [workflowConfigs.id],
  }),
  approvedBy: one(users, {
    fields: [assetGenerations.approvedById],
    references: [users.id],
  }),
  executions: many(workflowExecutions),
}));

export const workflowExecutionsRelations = relations(workflowExecutions, ({ one }) => ({
  workflowConfig: one(workflowConfigs, {
    fields: [workflowExecutions.workflowConfigId],
    references: [workflowConfigs.id],
  }),
  assetGeneration: one(assetGenerations, {
    fields: [workflowExecutions.assetGenerationId],
    references: [assetGenerations.id],
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
export type ChannelRow = typeof channels.$inferSelect;
export type NewChannelRow = typeof channels.$inferInsert;
export type WorkflowConfigRow = typeof workflowConfigs.$inferSelect;
export type NewWorkflowConfigRow = typeof workflowConfigs.$inferInsert;
export type AssetGenerationRow = typeof assetGenerations.$inferSelect;
export type NewAssetGenerationRow = typeof assetGenerations.$inferInsert;
export type WorkflowExecutionRow = typeof workflowExecutions.$inferSelect;
export type NewWorkflowExecutionRow = typeof workflowExecutions.$inferInsert;
