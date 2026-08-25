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

/** Primeiro erro legível de um ZodError (v4: issues[].message). */
export function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos";
}
