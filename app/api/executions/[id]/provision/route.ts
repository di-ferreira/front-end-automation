import { promises as fsp } from "node:fs";
import path from "node:path";
import { getExecution } from "@/db/queries/executions";
import { requireSecret } from "@/lib/auth";
import { DEFAULT_OUTPUT_DIR } from "@/lib/assets";

type RouteContext = { params: Promise<{ id: string }> };

const FAKE_ASSETS: Record<string, string> = {
  "video/final.mp4": "conteudo de video fake para teste",
  "thumbs/capa.png": "png-fake",
  "music/trilha.mp3": "mp3-fake",
  "descriptions/descricao.txt": "Descricao gerada pelo workflow simulado do N8N.",
};

export async function POST(request: Request, context: RouteContext) {
  const secretError = requireSecret(request);
  if (secretError) return secretError;

  const { id } = await context.params;
  const execution = await getExecution(id);
  if (!execution) {
    return Response.json({ error: "Execução não encontrada" }, { status: 404 });
  }

  const outputDir = path.resolve(process.env.OUTPUT_DIR?.trim() || DEFAULT_OUTPUT_DIR);
  const execDir = path.join(outputDir, id);

  for (const [relPath, content] of Object.entries(FAKE_ASSETS)) {
    const fullPath = path.join(execDir, relPath);
    await fsp.mkdir(path.dirname(fullPath), { recursive: true });
    await fsp.writeFile(fullPath, content, "utf-8");
  }

  return Response.json({ ok: true, files: Object.keys(FAKE_ASSETS).length });
}
