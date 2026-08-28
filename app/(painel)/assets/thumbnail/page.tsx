import { listChannels } from "@/db/queries/channels";
import { listGenerations } from "@/db/queries/asset-generations";
import { ThumbnailPreview } from "./thumbnail-preview";

export default async function ThumbnailPage() {
  const [channels, generations] = await Promise.all([
    listChannels(),
    listGenerations({ assetType: "thumbnail", limit: 20 }),
  ]);

  return <ThumbnailPreview channels={channels} initialGenerations={generations} />;
}
