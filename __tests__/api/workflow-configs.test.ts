import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireSession: vi.fn(),
  requireAdmin: vi.fn(),
  extractSecret: vi.fn(),
  requireSecret: vi.fn(),
}));

vi.mock("@/db/queries/workflow-configs", () => ({
  listWorkflowConfigs: vi.fn(),
  createWorkflowConfig: vi.fn(),
  getWorkflowConfigBySlug: vi.fn(),
  getWorkflowConfigByChannelAndType: vi.fn(),
}));

import { requireSession } from "@/lib/auth";
import {
  createWorkflowConfig,
  getWorkflowConfigByChannelAndType,
  getWorkflowConfigBySlug,
  listWorkflowConfigs,
} from "@/db/queries/workflow-configs";
import { GET, POST } from "@/app/api/workflow-configs/route";

const validBody = {
  channelId: 1,
  assetType: "music",
  name: "Jazz Music Generator",
  slug: "jazz-music",
  webhookUrl: "http://localhost:5678/webhook/jazz-music",
  method: "POST",
  priority: 0,
  timeoutMs: 10000,
};

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/workflow-configs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(requireSession).mockResolvedValue({
    session: { user: { role: "admin" }, expires: "" },
    error: null,
  });
});

describe("POST /api/workflow-configs", () => {
  it("cria config válida (201)", async () => {
    vi.mocked(getWorkflowConfigBySlug).mockResolvedValue(null);
    vi.mocked(getWorkflowConfigByChannelAndType).mockResolvedValue(null);
    vi.mocked(createWorkflowConfig).mockResolvedValue({
      id: 1,
      ...validBody,
      headers: null,
      enabled: 1,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await POST(jsonRequest(validBody));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.config.id).toBe(1);
  });

  it("retorna 409 para slug duplicado", async () => {
    vi.mocked(getWorkflowConfigBySlug).mockResolvedValue({
      id: 99,
      ...validBody,
      headers: null,
      enabled: 1,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await POST(jsonRequest(validBody));
    expect(res.status).toBe(409);
  });

  it("retorna 409 para canal + tipo duplicado", async () => {
    vi.mocked(getWorkflowConfigBySlug).mockResolvedValue(null);
    vi.mocked(getWorkflowConfigByChannelAndType).mockResolvedValue({
      id: 99,
      ...validBody,
      headers: null,
      enabled: 1,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await POST(jsonRequest(validBody));
    expect(res.status).toBe(409);
  });

  it("retorna 400 para assetType ausente", async () => {
    const res = await POST(jsonRequest({ ...validBody, assetType: undefined }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 para assetType nulo (reproduz bug do form)", async () => {
    const res = await POST(jsonRequest({ ...validBody, assetType: null }));
    expect(res.status).toBe(400);
  });

  it("retorna 400 para URL inválida", async () => {
    const res = await POST(jsonRequest({ ...validBody, webhookUrl: "not-a-url" }));
    expect(res.status).toBe(400);
  });

  it("retorna 401 quando não autenticado", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      session: null,
      error: new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401 }),
    });

    const res = await POST(jsonRequest(validBody));
    expect(res.status).toBe(401);
  });
});

describe("GET /api/workflow-configs", () => {
  it("lista configurações", async () => {
    vi.mocked(requireSession).mockResolvedValue({
      session: { user: { role: "admin" }, expires: "" },
      error: null,
    });
    vi.mocked(listWorkflowConfigs).mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);
  });
});
