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

interface WebhookConfigTabsProps {
  channels: ChannelRow[];
  configs: WorkflowConfigRow[];
}

export function WebhookConfigTabs({ channels, configs }: WebhookConfigTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(channels[0]?.slug ?? "");
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
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        status?: string;
        durationMs?: number;
        generationId?: number;
      };
      if (!res.ok) {
        setTestResult((prev) => ({
          ...prev,
          [cfg.id]: `✗ ${data.error ?? res.statusText} (${res.status})`,
        }));
      } else if (data.status === "failed") {
        setTestResult((prev) => ({
          ...prev,
          [cfg.id]: `✗ ${data.error ?? "webhook falhou"} (${data.durationMs ?? 0}ms)`,
        }));
      } else {
        const ms = data.durationMs != null ? ` (${data.durationMs}ms)` : "";
        setTestResult((prev) => ({ ...prev, [cfg.id]: `✓ disparado${ms}` }));
      }
    } catch {
      setTestResult((prev) => ({ ...prev, [cfg.id]: "✗ falha de rede" }));
    } finally {
      setTestingId(null);
      setTimeout(() => setTestResult((prev) => ({ ...prev, [cfg.id]: "" })), 6000);
    }
  }, []);

  const configsByChannel = configs.reduce<Record<number, WorkflowConfigRow[]>>((acc, c) => {
    if (!acc[c.channelId]) acc[c.channelId] = [];
    acc[c.channelId].push(c);
    return acc;
  }, {});

  const orderedTypes = ASSET_STUDIO_TYPES.filter((t) => t !== "all") as AssetStudioType[];

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
      </TabsList>

      {channels.map((ch) => {
        const channelConfigs = configsByChannel[ch.id] ?? [];
        const principal = channelConfigs.find((c) => c.assetType === "all") ?? null;
        const separated = channelConfigs
          .filter((c) => c.assetType !== "all")
          .sort(
            (a, b) =>
              orderedTypes.indexOf(a.assetType as AssetStudioType) -
              orderedTypes.indexOf(b.assetType as AssetStudioType),
          );

        return (
          <TabsContent key={ch.id} value={ch.slug} className="space-y-6">
            <div className="flex items-center gap-2">
              <span
                className="inline-block size-3 rounded-full"
                style={{ backgroundColor: ch.color ?? "#6b7280" }}
              />
              <h2 className="text-sm font-semibold">{ch.name}</h2>
              <span className="text-muted-foreground text-xs">({ch.slug})</span>
            </div>

            {/* Workflow Principal */}
            <div>
              <h3 className="text-foreground mb-2 text-sm font-semibold">Workflow Principal</h3>
              <p className="text-muted-foreground mb-3 text-xs">
                Gera todos os assets do canal de uma vez. Opcional — máx. 1 por canal.
              </p>
              {principal ? (
                <div className="border-border bg-card rounded-xl border p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ASSET_STUDIO_TYPE_BADGE_CLASSES.all}`}
                        >
                          Principal (todos)
                        </span>
                        <span className="truncate text-sm font-medium" title={principal.name}>
                          {principal.name}
                        </span>
                        <span className="text-muted-foreground font-mono text-xs">
                          ({principal.slug})
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 font-mono text-xs">
                        <span className="bg-muted rounded px-1.5 py-0.5">{principal.method}</span>
                        <span className="max-w-[320px] truncate" title={principal.webhookUrl}>
                          {principal.webhookUrl}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${principal.enabled ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"}`}
                        >
                          {principal.enabled ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={testingId === principal.id}
                        onClick={() => handleTest(principal)}
                      >
                        {testingId === principal.id ? "..." : "Testar"}
                      </Button>
                      {testResult[principal.id] && (
                        <span className="text-xs whitespace-nowrap">
                          {testResult[principal.id]}
                        </span>
                      )}
                      <WorkflowConfigFormDialog channelId={ch.id} config={principal} />
                      <DeleteWorkflowConfigButton id={principal.id} name={principal.name} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-border bg-card flex flex-col items-center gap-3 rounded-xl border p-6 text-center shadow-sm">
                  <p className="text-muted-foreground text-sm">
                    Nenhum workflow principal configurado.
                  </p>
                  <WorkflowConfigFormDialog channelId={ch.id} />
                </div>
              )}
            </div>

            {/* Workflows Separados */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-foreground text-sm font-semibold">Workflows Separados</h3>
                  <p className="text-muted-foreground text-xs">
                    Um webhook por tipo de asset. Opcionais.
                  </p>
                </div>
                <WorkflowConfigFormDialog channelId={ch.id} />
              </div>

              <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
                {separated.length === 0 ? (
                  <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 px-6 py-10 text-center text-sm">
                    <span>Nenhum workflow separado configurado.</span>
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
                        {separated.map((cfg) => (
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
                            <td
                              className="max-w-40 truncate px-4 py-3 font-medium"
                              title={cfg.name}
                            >
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
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
