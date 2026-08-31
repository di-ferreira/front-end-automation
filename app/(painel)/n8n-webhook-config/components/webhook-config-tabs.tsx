"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ASSET_STUDIO_TYPES,
  ASSET_STUDIO_TYPE_LABELS,
  type AssetStudioType,
} from "@/lib/validation";
import { ASSET_STUDIO_TYPE_BADGE_CLASSES } from "@/lib/format";
import { WorkflowConfigFormDialog } from "@/app/(painel)/channels/[id]/workflow-config-form-dialog";
import { DeleteWorkflowConfigButton } from "@/app/(painel)/channels/[id]/delete-workflow-config-button";
import type { ChannelRow, WorkflowConfigRow } from "@/db/schema";

type ConfigWithChannel = WorkflowConfigRow;

interface WebhookConfigTabsProps {
  channels: ChannelRow[];
  configs: ConfigWithChannel[];
  fallbackUrl: string | null;
}

export function WebhookConfigTabs({ channels, configs, fallbackUrl }: WebhookConfigTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(channels[0]?.slug ?? "principal");
  const [testingId, setTestingId] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<Record<number, string>>({});

  const handleTest = useCallback(async (cfg: WorkflowConfigRow) => {
    setTestingId(cfg.id);
    setTestResult((prev) => ({ ...prev, [cfg.id]: "" }));
    try {
      const res = await fetch("/api/assets/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: cfg.channelId,
          assetType: cfg.assetType,
          promptText: "teste webhook",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        setTestResult((prev) => ({ ...prev, [cfg.id]: "✓ disparado" }));
      } else {
        setTestResult((prev) => ({ ...prev, [cfg.id]: `✗ ${data.error ?? res.statusText}` }));
      }
    } catch {
      setTestResult((prev) => ({ ...prev, [cfg.id]: "✗ falha de rede" }));
    } finally {
      setTestingId(null);
      setTimeout(() => setTestResult((prev) => ({ ...prev, [cfg.id]: "" })), 4000);
    }
  }, []);

  const configsByChannel = configs.reduce<Record<number, WorkflowConfigRow[]>>((acc, c) => {
    if (!acc[c.channelId]) acc[c.channelId] = [];
    acc[c.channelId].push(c);
    return acc;
  }, {});

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="flex h-auto flex-wrap gap-1">
        {channels.map((ch) => (
          <TabsTrigger key={ch.id} value={ch.slug}>
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: ch.color ?? "#6b7280" }}
            />
            {ch.name}
          </TabsTrigger>
        ))}
        <TabsTrigger value="principal">Workflow Principal</TabsTrigger>
      </TabsList>

      {channels.map((ch) => {
        const channelConfigs = configsByChannel[ch.id] ?? [];
        const sorted = [...channelConfigs].sort(
          (a, b) =>
            ASSET_STUDIO_TYPES.indexOf(a.assetType as AssetStudioType) -
            ASSET_STUDIO_TYPES.indexOf(b.assetType as AssetStudioType),
        );
        return (
          <TabsContent key={ch.id} value={ch.slug} className="space-y-4">
            <div className="flex items-center gap-2">
              <span
                className="inline-block size-3 rounded-full"
                style={{ backgroundColor: ch.color ?? "#6b7280" }}
              />
              <h2 className="text-sm font-semibold">{ch.name}</h2>
              <span className="text-muted-foreground text-xs">
                ({ch.slug}) — {sorted.length} webhooks
              </span>
              <span className="ml-auto">
                <WorkflowConfigFormDialog channelId={ch.id} />
              </span>
            </div>

            <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
              {sorted.length === 0 ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 px-6 py-12 text-center text-sm">
                  <span className="text-foreground font-medium">Nenhuma configuração</span>
                  <span>Crie um webhook para este canal.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-border bg-muted/50 text-muted-foreground border-b text-left">
                        <th className="px-4 py-3 font-medium">Asset</th>
                        <th className="px-4 py-3 font-medium">Nome</th>
                        <th className="hidden px-4 py-3 font-medium lg:table-cell">URL</th>
                        <th className="hidden px-4 py-3 font-medium sm:table-cell">Método</th>
                        <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                        <th className="px-4 py-3 text-right font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((cfg) => (
                        <tr
                          key={cfg.id}
                          className="border-border hover:bg-muted/30 border-b transition-colors last:border-b-0"
                        >
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ASSET_STUDIO_TYPE_BADGE_CLASSES[cfg.assetType as AssetStudioType] ?? ""}`}
                            >
                              {ASSET_STUDIO_TYPE_LABELS[cfg.assetType as AssetStudioType] ??
                                cfg.assetType}
                            </span>
                          </td>
                          <td className="max-w-40 truncate px-4 py-3 font-medium" title={cfg.name}>
                            {cfg.name}
                            <span className="text-muted-foreground ml-1 font-mono text-xs">
                              ({cfg.slug})
                            </span>
                          </td>
                          <td
                            className="text-muted-foreground hidden max-w-64 truncate px-4 py-3 font-mono text-xs lg:table-cell"
                            title={cfg.webhookUrl}
                          >
                            {cfg.webhookUrl}
                          </td>
                          <td className="hidden px-4 py-3 sm:table-cell">
                            <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 font-mono text-xs">
                              {cfg.method}
                            </span>
                          </td>
                          <td className="hidden px-4 py-3 sm:table-cell">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.enabled ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"}`}
                            >
                              {cfg.enabled ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={testingId === cfg.id}
                                onClick={() => handleTest(cfg)}
                                title="Disparar teste"
                              >
                                {testingId === cfg.id ? "..." : "Testar"}
                              </Button>
                              {testResult[cfg.id] && (
                                <span className="text-xs whitespace-nowrap">
                                  {testResult[cfg.id]}
                                </span>
                              )}
                              <WorkflowConfigFormDialog channelId={ch.id} config={cfg} />
                              <DeleteWorkflowConfigButton id={cfg.id} name={cfg.name} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        );
      })}

      <TabsContent value="principal" className="space-y-4">
        <h2 className="text-sm font-semibold">Workflow Principal (legado)</h2>
        <div className="border-border bg-card space-y-4 rounded-xl border p-5 shadow-sm">
          <p className="text-muted-foreground text-sm">
            O workflow principal gera todos os assets de uma só vez via{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
              POST /api/executions
            </code>
            . Hoje ele usa o webhook abaixo. Após migrar, cada canal + asset passa a usar a tabela{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">workflow_configs</code>
            .
          </p>

          <div className="grid gap-3 text-sm">
            <div>
              <div className="text-muted-foreground text-xs font-medium">
                N8N_WEBHOOK_URL (.env)
              </div>
              <div className="bg-muted rounded-md px-3 py-2 font-mono text-xs break-all">
                {fallbackUrl ?? <span className="text-muted-foreground">não definido</span>}
              </div>
              {fallbackUrl ? (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  Fallback ativo: usado quando não há config no banco para o canal/asset.
                </p>
              ) : (
                <p className="text-muted-foreground mt-1 text-xs">
                  Sem fallback — configure os webhooks por canal/asset.
                </p>
              )}
            </div>
            <div>
              <div className="text-muted-foreground text-xs font-medium">Fluxo</div>
              <ol className="text-muted-foreground list-decimal space-y-1 pl-5 text-xs">
                <li>
                  <code className="font-mono">POST /api/executions</code> cria execução e chama N8N
                </li>
                <li>
                  N8N gera assets em{" "}
                  <code className="font-mono">{"{OUTPUT_DIR}/{executionId}/"}</code>
                </li>
                <li>
                  N8N chama{" "}
                  <code className="font-mono">POST /api/executions/{"{id}"}/callback</code> com{" "}
                  <code className="font-mono">x-callback-secret</code>
                </li>
              </ol>
            </div>
            <div>
              <div className="text-muted-foreground text-xs font-medium">Migração recomendada</div>
              <p className="text-muted-foreground text-xs">
                Defina um <code className="bg-muted rounded px-1 font-mono">webhookUrl</code> para
                cada canal × asset em suas abas. Quando todos estiverem preenchidos, remova{" "}
                <code className="bg-muted rounded px-1 font-mono">N8N_WEBHOOK_URL</code> do .env.
              </p>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
