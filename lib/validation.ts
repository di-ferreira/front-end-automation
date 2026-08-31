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
  content: z.string().trim().min(1, "Informe o conteúdo do prompt"),
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

export type FilterValue = "all" | ExecutionStatus;

export const ASSET_TYPES = ["video", "thumb", "music", "image", "description"] as const;
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
  .refine((data) => Boolean(data.promptId) !== Boolean(data.promptText), {
    message: "Escolha um prompt da biblioteca OU digite o texto (apenas uma opção)",
  });

export type CreateExecutionInput = z.infer<typeof createExecutionSchema>;

/** Edição de título/descrição da execução (revisão para YouTube). */
export const updateExecutionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Título não pode ficar vazio")
      .max(500, "Título muito longo")
      .optional(),
    description: z.string().trim().max(5_000, "Descrição muito longa").optional(),
  })
  .refine((data) => data.title !== undefined || data.description !== undefined, {
    message: "Envie título e/ou descrição",
  });

export type UpdateExecutionInput = z.infer<typeof updateExecutionSchema>;

export const APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

export const assetApprovalSchema = z.object({
  approvalStatus: z.enum(APPROVAL_STATUSES),
});

// ---------------------------------------------------------------------------
// Usuários
// ---------------------------------------------------------------------------

export const USER_ROLES = ["admin", "editor", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  editor: "Editor",
  viewer: "Visualizador",
};

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(100, "Nome muito longo"),
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha muito longa"),
  role: z.enum(USER_ROLES).default("viewer"),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1, "Nome não pode ficar vazio").max(100).optional(),
    email: z.string().trim().email("E-mail inválido").max(255).optional(),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(100).optional(),
    role: z.enum(USER_ROLES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie ao menos um campo para atualizar",
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ---------------------------------------------------------------------------
// Execuções — filtros
// ---------------------------------------------------------------------------

export const executionStatusFilterSchema = z
  .enum(["queued", "running", "completed", "failed"])
  .optional();

/** Primeiro erro legível de um ZodError (v4: issues[].message). */
export function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos";
}

// ---------------------------------------------------------------------------
// Asset Studio
// ---------------------------------------------------------------------------

export const ASSET_STUDIO_TYPES = [
  "all",
  "music",
  "thumbnail",
  "background",
  "description",
  "video",
] as const;
export type AssetStudioType = (typeof ASSET_STUDIO_TYPES)[number];

export const ASSET_STUDIO_TYPE_LABELS: Record<AssetStudioType, string> = {
  all: "Principal (todos)",
  music: "Música",
  thumbnail: "Thumbnail",
  background: "Background",
  description: "Descrição",
  video: "Vídeo",
};

export const assetStudioTypeSchema = z.enum(ASSET_STUDIO_TYPES);

export const WORKFLOW_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
export type WorkflowMethod = (typeof WORKFLOW_METHODS)[number];

export const workflowMethodSchema = z.enum(WORKFLOW_METHODS);

export const GENERATION_STATUSES = ["pending", "generating", "completed", "failed"] as const;
export type GenerationStatus = (typeof GENERATION_STATUSES)[number];

export const GENERATION_STATUS_LABELS: Record<GenerationStatus, string> = {
  pending: "Pendente",
  generating: "Gerando",
  completed: "Concluído",
  failed: "Falhou",
};

export const generationStatusSchema = z.enum(GENERATION_STATUSES);

export const WORKFLOW_EXECUTION_STATUSES = ["pending", "running", "success", "failed"] as const;
export type WorkflowExecutionStatus = (typeof WORKFLOW_EXECUTION_STATUSES)[number];

export const WORKFLOW_EXECUTION_STATUS_LABELS: Record<WorkflowExecutionStatus, string> = {
  pending: "Pendente",
  running: "Executando",
  success: "Sucesso",
  failed: "Falhou",
};

export const workflowExecutionStatusSchema = z.enum(WORKFLOW_EXECUTION_STATUSES);

export const channelSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do canal").max(255),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas minúsculas, números e hífens"),
  description: z.string().trim().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser hexadecimal (#RRGGBB)")
    .optional(),
  icon: z.string().trim().max(50).optional(),
  enabled: z.coerce.number().int().min(0).max(1).default(1),
});

export const updateChannelSchema = channelSchema.partial();

export type ChannelInput = z.infer<typeof channelSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;

export const workflowConfigSchema = z.object({
  channelId: z.number().int().positive("Selecione um canal"),
  assetType: assetStudioTypeSchema,
  name: z.string().trim().min(1, "Informe o nome").max(255),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas minúsculas, números e hífens"),
  webhookUrl: z.string().url("URL inválida").max(2048),
  method: workflowMethodSchema.default("POST"),
  headers: z.record(z.string(), z.string()).optional(),
  enabled: z.coerce.number().int().min(0).max(1).default(1),
  priority: z.coerce.number().int().min(0).default(0),
  timeoutMs: z.coerce.number().int().min(1000).max(300000).default(10000),
});

export const updateWorkflowConfigSchema = workflowConfigSchema.partial();

export type WorkflowConfigInput = z.infer<typeof workflowConfigSchema>;
export type UpdateWorkflowConfigInput = z.infer<typeof updateWorkflowConfigSchema>;

export const generateAssetSchema = z.object({
  channelId: z.number().int().positive("Selecione um canal"),
  assetType: assetStudioTypeSchema,
  promptText: z
    .string()
    .trim()
    .min(1, "Informe o prompt")
    .max(10_000, "Prompt muito longo")
    .optional(),
});

export type GenerateAssetInput = z.infer<typeof generateAssetSchema>;
