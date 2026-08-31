import { listChannels } from "@/db/queries/channels";
import { listWorkflowConfigs } from "@/db/queries/workflow-configs";
import { WebhookConfigTabs } from "./components/webhook-config-tabs";

export const metadata = {
  title: "Webhooks N8N",
};

export default async function N8NWebhookConfigPage() {
  const [channels, configs] = await Promise.all([listChannels(), listWorkflowConfigs()]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Webhooks N8N</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Cada canal pode ter um workflow principal (gera todos os assets) e workflows separados por
          tipo. Configure por abas.
        </p>
      </div>

      {channels.length === 0 ? (
        <div className="border-border bg-card rounded-xl border p-8 text-center shadow-sm">
          <p className="text-foreground font-medium">Nenhum canal cadastrado</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Crie um canal em “Canais” para configurar seus webhooks.
          </p>
        </div>
      ) : (
        <WebhookConfigTabs channels={channels} configs={configs} />
      )}
    </section>
  );
}
