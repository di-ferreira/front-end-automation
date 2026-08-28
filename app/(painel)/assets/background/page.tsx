import { listChannels } from "@/db/queries/channels";
import { listGenerations } from "@/db/queries/asset-generations";
import { BackgroundPreview } from "./background-preview";

export default async function BackgroundPage() {
  const [channels, generations] = await Promise.all([
    listChannels(),
    listGenerations({ assetType: "background", limit: 20 }),
  ]);

  return <BackgroundPreview channels={channels} initialGenerations={generations} />;
}
