import { listChannels } from "@/db/queries/channels";
import { formatDateTime } from "@/lib/format";
import { ChannelFormDialog } from "./channel-form-dialog";
import { DeleteChannelButton } from "./delete-channel-button";
import Link from "next/link";

export const metadata = {
  title: "Canais",
};

export default async function ChannelsPage() {
  const channels = await listChannels();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Canais</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gerencie os canais e suas configurações de workflow.
          </p>
        </div>
        <ChannelFormDialog />
      </div>

      <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
        {channels.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 px-6 py-16 text-center text-sm">
            <span className="text-foreground font-medium">Nenhum canal cadastrado</span>
            <span>Crie um canal para começar a gerar assets.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-border bg-muted/50 text-muted-foreground border-b text-left">
                  <th className="px-4 py-3 font-medium">Canal</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Descrição</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                  <th className="hidden px-4 py-3 font-medium xl:table-cell">Criado em</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((channel) => (
                  <tr
                    key={channel.id}
                    className="border-border hover:bg-muted/30 border-b transition-colors last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/channels/${channel.id}`}
                        className="flex items-center gap-2 font-medium hover:underline"
                      >
                        <span
                          className="inline-block size-3 shrink-0 rounded-full"
                          style={{
                            backgroundColor: channel.color ?? "#6b7280",
                          }}
                          aria-hidden="true"
                        />
                        {channel.name}
                      </Link>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 font-mono text-xs">
                      {channel.slug}
                    </td>
                    <td className="text-muted-foreground hidden max-w-64 px-4 py-3 md:table-cell">
                      <span className="line-clamp-1">{channel.description ?? "—"}</span>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          channel.enabled
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                        }`}
                      >
                        {channel.enabled ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="text-muted-foreground hidden px-4 py-3 whitespace-nowrap xl:table-cell">
                      {formatDateTime(channel.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <ChannelFormDialog channel={channel} />
                        <DeleteChannelButton id={channel.id} name={channel.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-muted-foreground text-xs">
        {channels.length} canal{channels.length === 1 ? "" : "is"}
      </p>
    </section>
  );
}
