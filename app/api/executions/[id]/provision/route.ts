import { promises as fsp } from "node:fs";
import path from "node:path";
import { getExecution } from "@/db/queries/executions";

type RouteContext = { params: Promise<{ id: string }> };

function extractSecret(request: Request): string {
  const header = request.headers.get("x-callback-secret");
  if (header) return header.trim();
  const auth = request.headers.get("authorization");
  if (auth) return auth.replace(/^Bearer\s+/i, "").trim();
  return "";
}

const FAKE_ASSETS: Record<string, string> = {
  "video/final.mp4": "conteudo de video fake para teste",
  "thumbs/capa.png": "png-fake",
  "music/trilha.mp3": "mp3-fake",
  "descriptions/descricao.txt":
    "Descricao gerada pelo workflow simulado do N8N.",
};

export async function POST(request: Request, context: RouteContext) {
  const expected = process.env.N8N_CALLBACK_SECRET?.trim() ?? "";
  if (expected.length === 0 || extractSecret(request) !== expected) {
    return Response.json({ error: "Segredo inválido" }, { status: 401 });
  }

  const { id } = await context.params;
  const execution = await getExecution(id);
  if (!execution) {
    return Response.json(
      { error: "Execução não encontrada" },
      { status: 404 },
    );
  }

  const outputDir = path.resolve(process.env.OUTPUT_DIR?.trim() || "./output");
  const execDir = path.join(outputDir, id);

  for (const [relPath, content] of Object.entries(FAKE_ASSETS)) {
    const fullPath = path.join(execDir, relPath);
    await fsp.mkdir(path.dirname(fullPath), { recursive: true });
    await fsp.writeFile(fullPath, content, "utf-8");
  }

  return Response.json({ ok: true, files: Object.keys(FAKE_ASSETS).length });
}
