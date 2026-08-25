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

export const ASSET_TYPES = [
  "video",
  "thumb",
  "music",
  "image",
  "description",
] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  video: "Vídeo",
  thumb: "Thumbnail",
  music: "Música",
  image: "Imagem",
  description: "Descrição",
};

export const assetTypeSchema = z.enum(ASSET_TYPES);

/**
 * Contrato do callback do N8N (POST /api/executions/{id}/callback).
 * `assets` é opcional: se ausente, o painel varre OUTPUT_DIR/{executionId}.
 */
export const executionCallbackSchema = z.object({
  status: z.enum(["completed", "failed"]),
  error: z.string().trim().max(1000, "Erro muito longo").optional(),
  assets: z
    .array(
      z.object({
        type: assetTypeSchema,
        filePath: z.string().trim().min(1).max(1024),
        mimeType: z.string().trim().max(100).optional(),
        sizeBytes: z.number().int().nonnegative().optional(),
      }),
    )
    .max(200)
    .optional(),
});

export type ExecutionCallbackInput = z.infer<typeof executionCallbackSchema>;

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
