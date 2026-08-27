import { setAssetApproval } from "@/db/queries/assets";
import { assetApprovalSchema, firstZodMessage } from "@/lib/validation";
import { requireSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string; assetId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id, assetId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = assetApprovalSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }

  const userId = Number(session!.user.id);
  if (!Number.isInteger(userId)) {
    return Response.json({ error: "Sessão sem usuário válido" }, { status: 500 });
  }

  const updated = await setAssetApproval(id, Number(assetId), parsed.data.approvalStatus, userId);
  if (!updated) {
    return Response.json({ error: "Asset não encontrado" }, { status: 404 });
  }
  return Response.json({ asset: updated });
}
