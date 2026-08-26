import type { PromptRow } from "@/db/schema";
import {
  formatDateTime,
  parseTags,
  PROMPT_TYPE_BADGE_CLASSES,
} from "@/lib/format";
import { PROMPT_TYPE_LABELS } from "@/lib/validation";
import { promptTypeSchema, type PromptType } from "@/lib/validation";

import { DeletePromptButton } from "./delete-prompt-button";
import { PromptFilters } from "./prompt-filters";
import { PromptFormDialog } from "./prompt-form-dialog";
import { listPrompts } from "@/db/queries/prompts";

export const metadata = {
  title: "Prompts",
};

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const parsedType = promptTypeSchema.safeParse(params.type);
  const type: PromptType | undefined = parsedType.success
    ? parsedType.data
    : undefined;

  const rows = await listPrompts({ q, type });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Biblioteca de Prompts
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Prompts reutilizáveis para a automação: música, imagem, descrição e
            vídeo.
          </p>
        </div>
        <PromptFormDialog />
      </div>

      <PromptFilters />

      <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
        {rows.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 px-6 py-16 text-center text-sm">
            <span className="text-foreground font-medium">
              Nenhum prompt encontrado
            </span>
            <span>Crie um novo prompt ou ajuste os filtros de busca.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-border bg-muted/50 text-muted-foreground border-b text-left">
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">
                    Conteúdo
                  </th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">
                    Tags
                  </th>
                  <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">
                    Usos
                  </th>
                  <th className="hidden px-4 py-3 font-medium xl:table-cell">
                    Último uso
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <PromptTableRow key={row.id} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-muted-foreground text-xs">
        {rows.length} prompt{rows.length === 1 ? "" : "s"}
      </p>
    </section>
  );
}

function TypeBadge({ type }: { type: PromptType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${PROMPT_TYPE_BADGE_CLASSES[type]}`}
    >
      {PROMPT_TYPE_LABELS[type]}
    </span>
  );
}

function PromptTableRow({ row }: { row: PromptRow }) {
  const tags = parseTags(row.tags);

  return (
    <tr className="border-border hover:bg-muted/30 border-b transition-colors last:border-b-0">
      <td className="max-w-52 truncate px-4 py-3 font-medium" title={row.name}>
        {row.name}
      </td>
      <td className="px-4 py-3">
        <TypeBadge type={row.type} />
      </td>
      <td className="text-muted-foreground hidden max-w-72 px-4 py-3 md:table-cell">
        <span className="line-clamp-2">{row.content}</span>
      </td>
      <td className="hidden px-4 py-3 lg:table-cell">
        {tags.length === 0 ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span className="flex max-w-40 flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 ? (
              <span className="text-muted-foreground text-xs">
                +{tags.length - 3}
              </span>
            ) : null}
          </span>
        )}
      </td>
      <td className="text-muted-foreground hidden px-4 py-3 text-right tabular-nums sm:table-cell">
        {row.useCount}
      </td>
      <td className="text-muted-foreground hidden px-4 py-3 whitespace-nowrap xl:table-cell">
        {formatDateTime(row.lastUsedAt)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <PromptFormDialog
            prompt={{
              id: row.id,
              name: row.name,
              type: row.type,
              content: row.content,
              tags: row.tags,
            }}
          />
          <DeletePromptButton id={row.id} name={row.name} />
        </div>
      </td>
    </tr>
  );
}
