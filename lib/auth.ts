import { auth } from "@/auth";

type SessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

type AuthSession = {
  user: SessionUser;
  expires: string;
};

export async function requireSession() {
  const session = (await auth()) as AuthSession | null;
  if (!session?.user) {
    return {
      session: null,
      error: Response.json({ error: "Não autenticado" }, { status: 401 }) as Response,
    };
  }
  return { session, error: null as Response | null };
}

export async function requireAdmin() {
  const { session, error } = await requireSession();
  if (error) return { session: null, error };
  if (session!.user.role !== "admin") {
    return {
      session: null,
      error: Response.json({ error: "Sem permissão" }, { status: 403 }) as Response,
    };
  }
  return { session: session!, error: null as Response | null };
}

export function extractSecret(request: Request): string {
  const header = request.headers.get("x-callback-secret");
  if (header) return header.trim();
  const authHeader = request.headers.get("authorization");
  if (authHeader) return authHeader.replace(/^Bearer\s+/i, "").trim();
  return "";
}

export function requireSecret(request: Request): Response | null {
  const expected = process.env.N8N_CALLBACK_SECRET?.trim() ?? "";
  if (expected.length === 0 || extractSecret(request) !== expected) {
    return Response.json({ error: "Segredo inválido" }, { status: 401 });
  }
  return null;
}
