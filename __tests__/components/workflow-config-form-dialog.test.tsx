// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WorkflowConfigFormDialog } from "@/app/(painel)/channels/[id]/workflow-config-form-dialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("WorkflowConfigFormDialog", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("envia assetType e method não-nulos ao criar", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<WorkflowConfigFormDialog channelId={1} />);

    await user.click(screen.getByRole("button", { name: "Nova config" }));
    await user.type(screen.getByLabelText("Nome"), "Jazz Music Generator");
    await user.type(
      screen.getByLabelText("Webhook URL"),
      "http://localhost:5678/webhook/jazz-music",
    );

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body as string);

    expect(body.assetType).toBe("music");
    expect(body.method).toBe("POST");
    expect(body.channelId).toBe(1);
  });

  it("envia assetType e method ao editar (PUT)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(
      <WorkflowConfigFormDialog
        channelId={1}
        config={{
          id: 10,
          channelId: 1,
          assetType: "video",
          name: "Jazz Video Generator",
          slug: "jazz-video",
          webhookUrl: "http://localhost:5678/webhook/jazz-video",
          method: "POST",
          headers: null,
          enabled: 1,
          priority: 0,
          timeoutMs: 10000,
          metadata: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body as string);

    expect(url).toBe("/api/workflow-configs/10");
    expect(options.method).toBe("PUT");
    expect(body.assetType).toBe("video");
    expect(body.method).toBe("POST");
  });
});
