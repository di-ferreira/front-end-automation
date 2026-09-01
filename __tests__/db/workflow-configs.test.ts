import { beforeEach, describe, expect, it } from "vitest";

import { createTestDb } from "../helpers/in-memory-db";
import { channels } from "@/db/schema";
import {
  createWorkflowConfig,
  deleteWorkflowConfig,
  getWorkflowConfigByChannelAndType,
  getWorkflowConfigBySlug,
  listWorkflowsByChannel,
  resolveWorkflow,
  updateWorkflowConfig,
} from "@/db/queries/workflow-configs";

let dbx: ReturnType<typeof createTestDb>;
let channelId: number;

beforeEach(async () => {
  dbx = createTestDb();
  const [ch] = await dbx
    .insert(channels)
    .values({ name: "Jazz", slug: "jazz", enabled: 1 })
    .returning();
  channelId = ch.id;
});

const validConfig = () => ({
  channelId,
  assetType: "music" as const,
  name: "Jazz Music Generator",
  slug: "jazz-music",
  webhookUrl: "http://localhost:5678/webhook/jazz-music",
  method: "POST" as const,
  enabled: 1,
  priority: 0,
  timeoutMs: 10000,
});

describe("createWorkflowConfig", () => {
  it("insere e retorna a config", async () => {
    const config = await createWorkflowConfig(validConfig(), dbx);
    expect(config.id).toBeGreaterThan(0);
    expect(config.slug).toBe("jazz-music");
    expect(config.assetType).toBe("music");
  });
});

describe("getWorkflowConfigByChannelAndType", () => {
  it("retorna a config existente", async () => {
    const created = await createWorkflowConfig(validConfig(), dbx);
    const found = await getWorkflowConfigByChannelAndType(channelId, "music", dbx);
    expect(found?.id).toBe(created.id);
  });

  it("retorna null quando não existe", async () => {
    const found = await getWorkflowConfigByChannelAndType(channelId, "video", dbx);
    expect(found).toBeNull();
  });
});

describe("getWorkflowConfigBySlug", () => {
  it("retorna localizado por slug ou null", async () => {
    await createWorkflowConfig(validConfig(), dbx);
    expect((await getWorkflowConfigBySlug("jazz-music", dbx))?.id).toBeGreaterThan(0);
    expect(await getWorkflowConfigBySlug("inexistente", dbx)).toBeNull();
  });
});

describe("updateWorkflowConfig", () => {
  it("altera os campos e retorna atualizado", async () => {
    const created = await createWorkflowConfig(validConfig(), dbx);
    const updated = await updateWorkflowConfig(
      created.id,
      { webhookUrl: "http://localhost:5678/webhook/nova" },
      dbx,
    );
    expect(updated?.webhookUrl).toBe("http://localhost:5678/webhook/nova");
  });

  it("retorna null para id inexistente", async () => {
    const updated = await updateWorkflowConfig(9999, { name: "x" }, dbx);
    expect(updated).toBeNull();
  });
});

describe("deleteWorkflowConfig", () => {
  it("remove e retorna true", async () => {
    const created = await createWorkflowConfig(validConfig(), dbx);
    expect(await deleteWorkflowConfig(created.id, dbx)).toBe(true);
    expect(await getWorkflowConfigByChannelAndType(channelId, "music", dbx)).toBeNull();
  });

  it("retorna false para id inexistente", async () => {
    expect(await deleteWorkflowConfig(9999, dbx)).toBe(false);
  });
});

describe("resolveWorkflow", () => {
  it("retorna config habilitada", async () => {
    const created = await createWorkflowConfig(validConfig(), dbx);
    const resolved = await resolveWorkflow(channelId, "music", dbx);
    expect(resolved?.id).toBe(created.id);
  });

  it("retorna null quando desabilitada", async () => {
    await createWorkflowConfig({ ...validConfig(), enabled: 0 }, dbx);
    expect(await resolveWorkflow(channelId, "music", dbx)).toBeNull();
  });

  it("retorna null quando não existe para o tipo", async () => {
    await createWorkflowConfig(validConfig(), dbx);
    expect(await resolveWorkflow(channelId, "video", dbx)).toBeNull();
  });
});

describe("listWorkflowsByChannel", () => {
  it("lista ordenado por assetType", async () => {
    await createWorkflowConfig(validConfig(), dbx);
    await createWorkflowConfig(
      { ...validConfig(), assetType: "all", slug: "jazz-all", name: "Jazz Principal" },
      dbx,
    );
    const rows = await listWorkflowsByChannel(channelId, dbx);
    expect(rows.map((r) => r.assetType)).toEqual(["all", "music"]);
  });
});
