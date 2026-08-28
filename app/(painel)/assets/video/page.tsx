import { listChannels } from "@/db/queries/channels";
import { listGenerations } from "@/db/queries/asset-generations";
import { VideoPreview } from "./video-preview";

export default async function VideoPage() {
  const [channels, generations] = await Promise.all([
    listChannels(),
    listGenerations({ assetType: "video", limit: 20 }),
  ]);

  return <VideoPreview channels={channels} initialGenerations={generations} />;
}
