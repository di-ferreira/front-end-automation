import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial().primaryKey(),
    name: text().notNull(),
    email: text().notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text().notNull().default("admin"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const prompts = pgTable(
  "prompts",
  {
    id: serial().primaryKey(),
    name: text().notNull(),
    // musica | imagem | descricao | video
    type: text().$type<"musica" | "imagem" | "descricao" | "video">().notNull(),
    content: text().notNull(),
    tags: text(),
    useCount: integer("use_count").notNull().default(0),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("prompts_name_unique").on(table.name)],
);

export const executions = pgTable(
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
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("executions_status_idx").on(table.status),
    index("executions_created_at_idx").on(table.createdAt),
  ],
);

export const assets = pgTable(
  "assets",
  {
    id: serial().primaryKey(),
    executionId: text("execution_id")
      .notNull()
      .references(() => executions.id, { onDelete: "cascade" }),
    // video | thumb | music | image | description
    type: text().$type<"video" | "thumb" | "music" | "image" | "description">().notNull(),
    filePath: text("file_path").notNull(),
    mimeType: text("mime_type"),
    sizeBytes: integer("size_bytes"),
    // pending | approved | rejected
    approvalStatus: text("approval_status")
      .$type<"pending" | "approved" | "rejected">()
      .notNull()
      .default("pending"),
    approvedById: integer("approved_by_id").references(() => users.id),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    metadata: jsonb().$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("assets_execution_id_idx").on(table.executionId),
    index("assets_type_idx").on(table.type),
  ],
);

export const channels = pgTable(
  "channels",
  {
    id: serial().primaryKey(),
    name: text().notNull(),
    slug: text().notNull(),
    description: text(),
    color: text(),
    icon: text(),
    enabled: boolean().notNull().default(true),
    metadata: jsonb().$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("channels_slug_unique").on(table.slug)],
);

export const workflowConfigs = pgTable(
  "workflow_configs",
  {
    id: serial().primaryKey(),
    channelId: integer("channel_id")
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    assetType: text("asset_type").notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    webhookUrl: text("webhook_url").notNull(),
    method: text().notNull().default("POST"),
    headers: jsonb().$type<Record<string, string>>(),
    enabled: boolean().notNull().default(true),
    priority: integer().notNull().default(0),
    timeoutMs: integer("timeout_ms").notNull().default(10000),
    metadata: jsonb().$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("workflow_configs_slug_unique").on(table.slug),
    index("workflow_configs_channel_id_idx").on(table.channelId),
  ],
);

export const assetGenerations = pgTable(
  "asset_generations",
  {
    id: serial().primaryKey(),
    channelId: integer("channel_id")
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    assetType: text("asset_type").notNull(),
    promptText: text("prompt_text"),
    filePath: text("file_path"),
    mimeType: text("mime_type"),
    sizeBytes: integer("size_bytes"),
    status: text()
      .$type<"pending" | "generating" | "completed" | "failed">()
      .notNull()
      .default("pending"),
    error: text(),
    workflowConfigId: integer("workflow_config_id").references(() => workflowConfigs.id),
    metadata: jsonb().$type<Record<string, unknown>>(),
    approvedById: integer("approved_by_id").references(() => users.id),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("asset_generations_channel_id_idx").on(table.channelId),
    index("asset_generations_status_idx").on(table.status),
  ],
);

export const workflowExecutions = pgTable(
  "workflow_executions",
  {
    id: serial().primaryKey(),
    workflowConfigId: integer("workflow_config_id")
      .notNull()
      .references(() => workflowConfigs.id, { onDelete: "cascade" }),
    assetGenerationId: integer("asset_generation_id").references(() => assetGenerations.id, {
      onDelete: "set null",
    }),
    status: text()
      .$type<"pending" | "running" | "success" | "failed">()
      .notNull()
      .default("pending"),
    requestPayload: jsonb("request_payload"),
    responsePayload: jsonb("response_payload"),
    error: text(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
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
