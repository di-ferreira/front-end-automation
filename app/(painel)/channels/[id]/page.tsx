import { notFound } from "next/navigation";
import Link from "next/link";
import { getChannel } from "@/db/queries/channels";
import { listWorkflowsByChannel } from "@/db/queries/workflow-configs";
import { ASSET_STUDIO_TYPE_LABELS, type AssetStudioType } from "@/lib/validation";
import { ASSET_STUDIO_TYPE_BADGE_CLASSES } from "@/lib/format";
import { WorkflowConfigFormDialog } from "./workflow-config-form-dialog";
import { DeleteWorkflowConfigButton } from "./delete-workflow-config-button";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const channel = await getChannel(Number(id));
  return { title: channel?.name ?? "Canal" };
}

export default async function ChannelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const channelId = Number(id);

  if (!Number.isInteger(channelId)) notFound();

  const [channel, configs] = await Promise.all([
    getChannel(channelId),
    listWorkflowsByChannel(channelId),
  ]);

  if (!channel) notFound();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/channels"
              className="text-muted-foreground hover:text-foreground text-sm hover:underline"
            >
              Canais
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-foreground flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <span
                className="inline-block size-3 rounded-full"
                style={{ backgroundColor: channel.color ?? "#6b7280" }}
                aria-hidden="true"
              />
              {channel.name}
            </h1>
          </div>
          {channel.description && (
            <p className="text-muted-foreground mt-1 text-sm">{channel.description}</p>
          )}
        </div>
        <WorkflowConfigFormDialog channelId={channelId} />
      </div>

      <div className="bg-card rounded-xl border p-4 shadow-sm">
        <h2 className="text-foreground mb-1 text-sm font-semibold">Detalhes</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Slug</dt>
            <dd className="font-mono text-xs">{channel.slug}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Cor</dt>
            <dd className="flex items-center gap-1.5">
              <span
                className="inline-block size-3 rounded-full"
                style={{ backgroundColor: channel.color ?? "#6b7280" }}
              />
              {channel.color ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Ícone</dt>
            <dd>{channel.icon ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  channel.enabled
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                }`}
              >
                {channel.enabled ? "Ativo" : "Inativo"}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="text-foreground mb-3 text-sm font-semibold">
          Configurações de Workflow
          <span className="text-muted-foreground ml-1 font-normal">({configs.length})</span>
        </h2>

        <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
          {configs.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 px-6 py-12 text-center text-sm">
              <span className="text-foreground font-medium">Nenhuma configuração</span>
              <span>Crie uma configuração de workflow para este canal.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-border bg-muted/50 text-muted-foreground border-b text-left">
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="hidden px-4 py-3 font-medium lg:table-cell">Webhook URL</th>
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">Método</th>
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">Prioridade</th>
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((config) => (
                    <tr
                      key={config.id}
                      className="border-border hover:bg-muted/30 border-b transition-colors last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            ASSET_STUDIO_TYPE_BADGE_CLASSES[config.assetType as AssetStudioType] ??
                            ""
                          }`}
                        >
                          {ASSET_STUDIO_TYPE_LABELS[config.assetType as AssetStudioType] ??
                            config.assetType}
                        </span>
                      </td>
                      <td className="max-w-48 truncate px-4 py-3 font-medium" title={config.name}>
                        {config.name}
                      </td>
                      <td className="text-muted-foreground hidden max-w-64 truncate px-4 py-3 font-mono text-xs lg:table-cell">
                        {config.webhookUrl}
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 font-mono text-xs">
                          {config.method}
                        </span>
                      </td>
                      <td className="text-muted-foreground hidden px-4 py-3 tabular-nums sm:table-cell">
                        {config.priority}
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            config.enabled
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                          }`}
                        >
                          {config.enabled ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <WorkflowConfigFormDialog channelId={channelId} config={config} />
                          <DeleteWorkflowConfigButton id={config.id} name={config.name} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
