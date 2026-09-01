import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireSession: vi.fn(),
  requireAdmin: vi.fn(),
  extractSecret: vi.fn(),
  requireSecret: vi.fn(),
}));

vi.mock("@/db/queries/workflow-configs", () => ({
  getWorkflowConfig: vi.fn(),
  getWorkflowConfigByChannelAndType: vi.fn(),
  updateWorkflowConfig: vi.fn(),
  deleteWorkflowConfig: vi.fn(),
}));

import { requireSession } from "@/lib/auth";
import {
  getWorkflowConfig,
  getWorkflowConfigByChannelAndType,
  updateWorkflowConfig,
  deleteWorkflowConfig,
} from "@/db/queries/workflow-configs";
import { DELETE, GET, PUT } from "@/app/api/workflow-configs/[id]/route";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/workflow-configs/1", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const ctx = { params: Promise.resolve({ id: "1" }) };

const configRow = {
  id: 1,
  channelId: 1,
  assetType: "music",
  name: "Jazz Music Generator",
  slug: "jazz-music",
  webhookUrl: "http://localhost:5678/webhook/jazz-music",
  method: "POST",
  headers: null,
  enabled: 1,
  priority: 0,
  timeoutMs: 10000,
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(requireSession).mockResolvedValue({
    session: { user: { role: "admin" }, expires: "" },
    error: null,
  });
});

describe("GET /api/workflow-configs/[id]", () => {
  it("retorna config (200)", async () => {
    vi.mocked(getWorkflowConfig).mockResolvedValue({
      ...configRow,
      channelName: "Jazz",
      channelSlug: "jazz",
    });
    const res = await GET(null as never, ctx);
    expect(res.status).toBe(200);
  });

  it("retorna 404 quando não encontrada", async () => {
    vi.mocked(getWorkflowConfig).mockResolvedValue(null);
    const res = await GET(null as never, ctx);
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/workflow-configs/[id]", () => {
  it("atualiza config (200)", async () => {
    vi.mocked(getWorkflowConfig).mockResolvedValue({
      ...configRow,
      channelName: "Jazz",
      channelSlug: "jazz",
    });
    vi.mocked(getWorkflowConfigByChannelAndType).mockResolvedValue(null);
    vi.mocked(updateWorkflowConfig).mockResolvedValue({
      ...configRow,
      webhookUrl: "http://localhost:5678/webhook/nova",
    });

    const res = await PUT(jsonRequest({ webhookUrl: "http://localhost:5678/webhook/nova" }), ctx);
    expect(res.status).toBe(200);
  });

  it("retorna 404 para config inexistente", async () => {
    vi.mocked(getWorkflowConfig).mockResolvedValue(null);
    vi.mocked(getWorkflowConfigByChannelAndType).mockResolvedValue(null);
    vi.mocked(updateWorkflowConfig).mockResolvedValue(null);

    const res = await PUT(jsonRequest({ webhookUrl: "http://localhost:5678/webhook/x" }), ctx);
    expect(res.status).toBe(404);
  });

  it("retorna 409 para canal + tipo duplicado em outro id", async () => {
    vi.mocked(getWorkflowConfig).mockResolvedValue({
      ...configRow,
      channelName: "Jazz",
      channelSlug: "jazz",
    });
    vi.mocked(getWorkflowConfigByChannelAndType).mockResolvedValue({ ...configRow, id: 2 });

    const res = await PUT(jsonRequest({ channelId: 1, assetType: "music" }), ctx);
    expect(res.status).toBe(409);
  });

  it("retorna 400 para id inválido", async () => {
    const res = await PUT(jsonRequest({}), {
      params: Promise.resolve({ id: "abc" }),
    });
    expect(res.status).toBe(400);
  });

  it("retorna 401 quando não autenticado", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      session: null,
      error: new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401 }),
    });
    const res = await PUT(jsonRequest({}), ctx);
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/workflow-configs/[id]", () => {
  it("remove config (204)", async () => {
    vi.mocked(deleteWorkflowConfig).mockResolvedValue(true);
    const res = await DELETE(null as never, ctx);
    expect(res.status).toBe(204);
  });

  it("retorna 404 quando não encontrada", async () => {
    vi.mocked(deleteWorkflowConfig).mockResolvedValue(false);
    const res = await DELETE(null as never, ctx);
    expect(res.status).toBe(404);
  });
});
