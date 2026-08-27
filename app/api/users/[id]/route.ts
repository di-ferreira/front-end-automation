import { requireAdmin } from "@/lib/auth";
import { getUser, updateUser, deleteUser } from "@/db/queries/users";
import { updateUserSchema, firstZodMessage } from "@/lib/validation";
import { parseJsonBody } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  const user = await getUser(Number(id));
  if (!user) {
    return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
  }
  const { passwordHash, ...safe } = user;
  return Response.json({ user: safe });
}

export async function PUT(request: Request, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;

  const { body, error: parseError } = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }

  const existing = await getUser(Number(id));
  if (!existing) {
    return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const updated = await updateUser(Number(id), parsed.data);
  if (!updated) {
    return Response.json({ error: "Já existe um usuário com esse e-mail" }, { status: 409 });
  }

  const { passwordHash, ...safe } = updated;
  return Response.json({ user: safe });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;

  // Não deixar deletar a si mesmo
  if (String(session!.user.id) === id) {
    return Response.json({ error: "Você não pode deletar seu próprio usuário" }, { status: 400 });
  }

  const deleted = await deleteUser(Number(id));
  if (!deleted) {
    return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
