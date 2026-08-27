import { requireSession } from "@/lib/auth";
import { updateExecutionText } from "@/db/queries/executions";
import { firstZodMessage, updateExecutionSchema } from "@/lib/validation";
import { parseJsonBody } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await context.params;

  const { body, error: parseError } = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = updateExecutionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }

  const updated = await updateExecutionText(id, parsed.data);
  if (!updated) {
    return Response.json({ error: "Execução não encontrada" }, { status: 404 });
  }
  return Response.json({ execution: updated });
}
