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

export const users = active.users as unknown as typeof sqliteTypes.users;
export const prompts = active.prompts as unknown as typeof sqliteTypes.prompts;
export const executions = active.executions as unknown as typeof sqliteTypes.executions;
export const assets = active.assets as unknown as typeof sqliteTypes.assets;

export const usersRelations = active.usersRelations;
export const promptsRelations = active.promptsRelations;
export const executionsRelations = active.executionsRelations;
export const assetsRelations = active.assetsRelations;

export type UserRow = sqliteTypes.UserRow;
export type NewUserRow = sqliteTypes.NewUserRow;
export type PromptRow = sqliteTypes.PromptRow;
export type NewPromptRow = sqliteTypes.NewPromptRow;
export type ExecutionRow = sqliteTypes.ExecutionRow;
export type NewExecutionRow = sqliteTypes.NewExecutionRow;
export type AssetRow = sqliteTypes.AssetRow;
export type NewAssetRow = sqliteTypes.NewAssetRow;
