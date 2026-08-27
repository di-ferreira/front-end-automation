import { requireSession } from "@/lib/auth";
import { deletePrompt, getPrompt, isUniqueViolation, updatePrompt } from "@/db/queries/prompts";
import { firstZodMessage, updatePromptSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await context.params;
  const prompt = await getPrompt(Number(id));
  if (!prompt) {
    return Response.json({ error: "Prompt não encontrado" }, { status: 404 });
  }
  return Response.json({ prompt });
}

export async function PUT(request: Request, context: RouteContext) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await context.params;
  const numericId = Number(id);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = updatePromptSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }

  const existing = await getPrompt(numericId);
  if (!existing) {
    return Response.json({ error: "Prompt não encontrado" }, { status: 404 });
  }

  try {
    // existing garante id válido; null aqui só pode ser conflito de nome
    const updated = await updatePrompt(numericId, parsed.data);
    if (!updated) {
      return Response.json({ error: "Já existe um prompt com esse nome" }, { status: 409 });
    }
    return Response.json({ prompt: updated });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return Response.json({ error: "Já existe um prompt com esse nome" }, { status: 409 });
    }
    console.error("Erro ao atualizar prompt:", error);
    return Response.json({ error: "Erro interno ao atualizar o prompt" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await context.params;
  const deleted = await deletePrompt(Number(id));
  if (!deleted) {
    return Response.json({ error: "Prompt não encontrado" }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
