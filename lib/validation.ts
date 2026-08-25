import { z } from "zod";

export const PROMPT_TYPES = ["musica", "imagem", "descricao", "video"] as const;
export type PromptType = (typeof PROMPT_TYPES)[number];

export const PROMPT_TYPE_LABELS: Record<PromptType, string> = {
  musica: "Música",
  imagem: "Imagem",
  descricao: "Descrição",
  video: "Vídeo",
};

export const promptTypeSchema = z.enum(PROMPT_TYPES);

export const createPromptSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(255, "Nome muito longo"),
  type: promptTypeSchema,
  content: z
    .string()
    .trim()
    .min(1, "Informe o conteúdo do prompt"),
  tags: z.string().trim().max(500, "Tags muito longas").optional(),
});

export const updatePromptSchema = createPromptSchema.partial();

export type CreatePromptInput = z.infer<typeof createPromptSchema>;
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;

export type ExecutionStatus = "queued" | "running" | "completed" | "failed";

export const EXECUTION_STATUS_LABELS: Record<ExecutionStatus, string> = {
  queued: "Na fila",
  running: "Executando",
  completed: "Concluído",
  failed: "Falhou",
};

/**
 * Exige exatamente uma origem de prompt: biblioteca (promptId) OU texto livre.
 */
export const createExecutionSchema = z
  .object({
    title: z.string().trim().max(500, "Título muito longo").optional(),
    promptId: z.number().int().positive().optional(),
    promptText: z
      .string()
      .trim()
      .min(1, "Informe o texto do prompt")
      .max(10_000, "Texto do prompt muito longo")
      .optional(),
  })
  .refine(
    (data) => Boolean(data.promptId) !== Boolean(data.promptText),
    {
      message:
        "Escolha um prompt da biblioteca OU digite o texto (apenas uma opção)",
    },
  );

export type CreateExecutionInput = z.infer<typeof createExecutionSchema>;

/** Primeiro erro legível de um ZodError (v4: issues[].message). */
export function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos";
}
