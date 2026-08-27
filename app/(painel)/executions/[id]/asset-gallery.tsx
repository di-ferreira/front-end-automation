"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FilterTabs } from "@/components/filter-tabs";
import { ASSET_TYPE_LABELS, type ApprovalStatus, type AssetType } from "@/lib/validation";

import { AssetCard, type GalleryAsset } from "./asset-card";
import { AssetLightbox } from "./asset-lightbox";

export type { GalleryAsset };

const SECTION_ORDER: AssetType[] = ["video", "thumb", "image", "music", "description"];

type ApprovalFilter = "all" | ApprovalStatus;

const FILTERS: { value: ApprovalFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "approved", label: "Aprovados" },
  { value: "rejected", label: "Rejeitados" },
];

export function AssetGallery({
  executionId,
  assets,
}: {
  executionId: string;
  assets: GalleryAsset[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<ApprovalFilter>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);

  const counts = {
    all: assets.length,
    pending: assets.filter((asset) => asset.approvalStatus === "pending").length,
    approved: assets.filter((asset) => asset.approvalStatus === "approved").length,
    rejected: assets.filter((asset) => asset.approvalStatus === "rejected").length,
  };

  const visible = filter === "all" ? assets : assets.filter((a) => a.approvalStatus === filter);

  const images = visible.filter((asset) => asset.type === "image" || asset.type === "thumb");

  async function decide(assetId: number, approvalStatus: ApprovalStatus) {
    await fetch(`/api/executions/${executionId}/assets/${assetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalStatus }),
    });
    router.refresh();
  }

  async function approveAll() {
    setApprovingAll(true);
    try {
      await fetch(`/api/executions/${executionId}/approve`, { method: "POST" });
      router.refresh();
    } finally {
      setApprovingAll(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          options={FILTERS.map((option) => ({
            ...option,
            count: counts[option.value],
          }))}
          active={filter}
          onChange={setFilter}
        />

        {counts.pending > 0 ? (
          <Button variant="secondary" size="sm" onClick={approveAll} disabled={approvingAll}>
            {approvingAll ? "Aprovando..." : `Aprovar todos (${counts.pending})`}
          </Button>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground rounded-xl border border-dashed px-6 py-12 text-center text-sm">
          Nenhum asset neste filtro.
        </p>
      ) : (
        <div className="space-y-8">
          {SECTION_ORDER.map((type) => {
            const group = visible.filter((asset) => asset.type === type);
            if (group.length === 0) return null;

            return (
              <section key={type} className="space-y-3">
                <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                  {ASSET_TYPE_LABELS[type]}
                  <span className="text-muted-foreground font-normal">({group.length})</span>
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      onDecide={decide}
                      onOpenImage={
                        images.some((image) => image.id === asset.id)
                          ? () =>
                              setLightboxIndex(images.findIndex((image) => image.id === asset.id))
                          : undefined
                      }
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <AssetLightbox
        images={images}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
