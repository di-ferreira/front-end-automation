import { auth } from "@/auth";
import { getUser, updateUser, deleteUser } from "@/db/queries/users";
import {
  updateUserSchema,
  firstZodMessage,
} from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await context.params;
  const user = await getUser(Number(id));
  if (!user) {
    return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
  }
  const { passwordHash, ...safe } = user;
  return Response.json({ user: safe });
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: firstZodMessage(parsed.error) },
      { status: 400 },
    );
  }

  const existing = await getUser(Number(id));
  if (!existing) {
    return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const updated = await updateUser(Number(id), parsed.data);
  if (!updated) {
    return Response.json(
      { error: "Já existe um usuário com esse e-mail" },
      { status: 409 },
    );
  }

  const { passwordHash, ...safe } = updated;
  return Response.json({ user: safe });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { id } = await context.params;

  // Não deixar deletar a si mesmo
  if (String(session.user.id) === id) {
    return Response.json(
      { error: "Você não pode deletar seu próprio usuário" },
      { status: 400 },
    );
  }

  const deleted = await deleteUser(Number(id));
  if (!deleted) {
    return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
