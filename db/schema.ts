/**
 * Facade de schema: exporta as tabelas do dialeto ativo (definido por
 * DB_PROVIDER / DATABASE_URL). As tabelas são tipadas com as variantes
 * sqlite-core para oferecer uma superfície de tipos estável para a aplicação;
 * em runtime os objetos reais pertencem ao dialeto escolhido.
 */
import { resolveDbProvider } from "./provider";
import * as sqlite from "./schemas/sqlite";
import type * as sqliteTypes from "./schemas/sqlite";
import * as pg from "./schemas/pg";
import * as mysql from "./schemas/mysql";

const provider = resolveDbProvider();

const active = provider === "postgres" ? pg : provider === "mysql" ? mysql : sqlite;

// ── Existing tables ──────────────────────────────────────────────
export const users = active.users as unknown as typeof sqliteTypes.users;
export const prompts = active.prompts as unknown as typeof sqliteTypes.prompts;
export const executions = active.executions as unknown as typeof sqliteTypes.executions;
export const assets = active.assets as unknown as typeof sqliteTypes.assets;

export const usersRelations = active.usersRelations;
export const promptsRelations = active.promptsRelations;
export const executionsRelations = active.executionsRelations;
export const assetsRelations = active.assetsRelations;

// ── Asset Studio tables ──────────────────────────────────────────
export const channels = active.channels as unknown as typeof sqliteTypes.channels;
export const workflowConfigs =
  active.workflowConfigs as unknown as typeof sqliteTypes.workflowConfigs;
export const assetGenerations =
  active.assetGenerations as unknown as typeof sqliteTypes.assetGenerations;
export const workflowExecutions =
  active.workflowExecutions as unknown as typeof sqliteTypes.workflowExecutions;

export const channelsRelations = active.channelsRelations;
export const workflowConfigsRelations = active.workflowConfigsRelations;
export const assetGenerationsRelations = active.assetGenerationsRelations;
export const workflowExecutionsRelations = active.workflowExecutionsRelations;

// ── Types ────────────────────────────────────────────────────────
export type UserRow = sqliteTypes.UserRow;
export type NewUserRow = sqliteTypes.NewUserRow;
export type PromptRow = sqliteTypes.PromptRow;
export type NewPromptRow = sqliteTypes.NewPromptRow;
export type ExecutionRow = sqliteTypes.ExecutionRow;
export type NewExecutionRow = sqliteTypes.NewExecutionRow;
export type AssetRow = sqliteTypes.AssetRow;
export type NewAssetRow = sqliteTypes.NewAssetRow;
export type ChannelRow = sqliteTypes.ChannelRow;
export type NewChannelRow = sqliteTypes.NewChannelRow;
export type WorkflowConfigRow = sqliteTypes.WorkflowConfigRow;
export type NewWorkflowConfigRow = sqliteTypes.NewWorkflowConfigRow;
export type AssetGenerationRow = sqliteTypes.AssetGenerationRow;
export type NewAssetGenerationRow = sqliteTypes.NewAssetGenerationRow;
export type WorkflowExecutionRow = sqliteTypes.WorkflowExecutionRow;
export type NewWorkflowExecutionRow = sqliteTypes.NewWorkflowExecutionRow;
