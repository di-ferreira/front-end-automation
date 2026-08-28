import { listChannels } from "@/db/queries/channels";
import { listGenerations } from "@/db/queries/asset-generations";
import { DescriptionPreview } from "./description-preview";

export default async function DescriptionPage() {
  const [channels, generations] = await Promise.all([
    listChannels(),
    listGenerations({ assetType: "description", limit: 20 }),
  ]);

  return <DescriptionPreview channels={channels} initialGenerations={generations} />;
}
