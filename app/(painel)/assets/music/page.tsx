import { listChannels } from "@/db/queries/channels";
import { listGenerations } from "@/db/queries/asset-generations";
import { MusicPreview } from "./music-preview";

export default async function MusicPage() {
  const [channels, generations] = await Promise.all([
    listChannels(),
    listGenerations({ assetType: "music", limit: 20 }),
  ]);

  return <MusicPreview channels={channels} initialGenerations={generations} />;
}
