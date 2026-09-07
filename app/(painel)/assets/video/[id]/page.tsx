import { listChannels } from "@/db/queries/channels";
import { getGenerationDetail } from "@/db/queries/asset-generations";
import { AssetDetailPage } from "@/components/asset-studio/asset-detail-page";

export default async function VideoDetailPage({ params }: { params: { id: string } }) {
  const [detail, channels] = await Promise.all([
    getGenerationDetail(Number(params.id)),
    listChannels(),
  ]);

  if (!detail) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Geração não encontrada.</p>
      </div>
    );
  }

  return <AssetDetailPage generation={detail} channels={channels} assetTypeLabel="Vídeo" />;
}
