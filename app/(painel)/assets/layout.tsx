import { AssetSubNav } from "@/components/asset-sub-nav";

export default function AssetsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <AssetSubNav />
      {children}
    </div>
  );
}
