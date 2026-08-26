import { auth } from "@/auth";
import {
  createExecution,
  getExecution,
  incrementPromptUse,
  listExecutions,
  markExecutionFailed,
  markExecutionRunning,
} from "@/db/queries/executions";
import { getPrompt } from "@/db/queries/prompts";
import { triggerN8N } from "@/lib/n8n";
import {
  createExecutionSchema,
  executionStatusFilterSchema,
  firstZodMessage,
} from "@/lib/validation";

export async function GET(request: Request) {
  if (!(await auth())?.user) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status") ?? undefined;
  const parsedStatus = executionStatusFilterSchema.safeParse(statusParam);

  const rows = await listExecutions({
    status: parsedStatus.success ? parsedStatus.data : undefined,
  });
  return Response.json({ executions: rows });
}

export async function POST(request: Request) {
  if (!(await auth())?.user) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = createExecutionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: firstZodMessage(parsed.error) },
      { status: 400 },
    );
  }

  let promptText = parsed.data.promptText;
  const title = parsed.data.title;
  let promptId: number | undefined;

  // Origem biblioteca: carrega o conteúdo e valida existência
  if (parsed.data.promptId) {
    const prompt = await getPrompt(parsed.data.promptId);
    if (!prompt) {
      return Response.json(
        { error: "Prompt não encontrado" },
        { status: 404 },
      );
    }
    promptText = prompt.content;
    promptId = prompt.id;
  }

  const execution = await createExecution({ title, promptId, promptText });

  // Contrato N8N: { executionId, prompt }, resposta imediata
  const dispatch = await triggerN8N(execution.id, promptText!);

  if (!dispatch.ok) {
    await markExecutionFailed(execution.id, dispatch.error ?? "Desconhecido");
    return Response.json(
      {
        error: dispatch.error,
        execution: await getExecution(execution.id),
      },
      { status: 502 },
    );
  }

  await markExecutionRunning(execution.id);
  if (promptId) {
    await incrementPromptUse(promptId);
  }

  return Response.json(
    { execution: await getExecution(execution.id) },
    { status: 201 },
  );
}
