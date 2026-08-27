import { requireAdmin } from "@/lib/auth";
import { listUsers, createUser, getUserByEmail } from "@/db/queries/users";
import { createUserSchema, firstZodMessage } from "@/lib/validation";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const rows = await listUsers();
  const safe = rows.map(({ passwordHash, ...rest }) => rest);
  return Response.json({ users: safe });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }

  const existing = await getUserByEmail(parsed.data.email);
  if (existing) {
    return Response.json({ error: "Já existe um usuário com esse e-mail" }, { status: 409 });
  }

  try {
    const created = await createUser(parsed.data);
    const { passwordHash, ...safe } = created;
    return Response.json({ user: safe }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return Response.json({ error: "Erro interno ao criar o usuário" }, { status: 500 });
  }
}
