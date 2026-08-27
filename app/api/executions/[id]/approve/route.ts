import { getExecution, markExecutionCompleted } from "@/db/queries/executions";
import { approvePendingAssets } from "@/db/queries/assets";
import { requireSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await context.params;
  if (!(await getExecution(id))) {
    return Response.json({ error: "Execução não encontrada" }, { status: 404 });
  }

  const userId = Number(session!.user.id);
  if (!Number.isInteger(userId)) {
    return Response.json({ error: "Sessão sem usuário válido" }, { status: 500 });
  }

  // Aprovar tudo encerra o ciclo: execução também é concluída
  const approved = await approvePendingAssets(id, userId);
  await markExecutionCompleted(id);

  return Response.json({ ok: true, approved });
}
