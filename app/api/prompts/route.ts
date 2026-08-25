import { auth } from "@/auth";
import { createPrompt, getPromptByName, isUniqueViolation, listPrompts } from "@/db/queries/prompts";
import {
  createPromptSchema,
  firstZodMessage,
  promptTypeSchema,
} from "@/lib/validation";

export async function GET(request: Request) {
  if (!(await auth())?.user) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? undefined;
  const typeParam = url.searchParams.get("type") ?? undefined;
  const parsedType = promptTypeSchema.safeParse(typeParam);

  const rows = await listPrompts({
    q,
    type: parsedType.success ? parsedType.data : undefined,
  });
  return Response.json({ prompts: rows });
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

  const parsed = createPromptSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: firstZodMessage(parsed.error) },
      { status: 400 },
    );
  }

  try {
    if (await getPromptByName(parsed.data.name)) {
      return Response.json(
        { error: "Já existe um prompt com esse nome" },
        { status: 409 },
      );
    }
    const created = await createPrompt(parsed.data);
    return Response.json({ prompt: created }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return Response.json(
        { error: "Já existe um prompt com esse nome" },
        { status: 409 },
      );
    }
    console.error("Erro ao criar prompt:", error);
    return Response.json(
      { error: "Erro interno ao criar o prompt" },
      { status: 500 },
    );
  }
}
