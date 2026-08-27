export const JSON_HEADERS = { "Content-Type": "application/json" } as const;

export async function parseJsonBody(
  request: Request,
): Promise<{ body: unknown; error: null } | { body: null; error: Response }> {
  try {
    const body = await request.json();
    return { body, error: null };
  } catch {
    return {
      body: null,
      error: Response.json({ error: "JSON inválido" }, { status: 400 }),
    };
  }
}
