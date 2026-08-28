/**
 * Seed idempotente para workflow_configs.
 *
 * Cria 3 canais (jazz, lofi, metalcore) × 5 asset types = 15 configs.
 * Se o canal ou config já existir (por slug), skipa.
 *
 * Uso: npx tsx db/seed-workflows.ts
 */
import { config } from "dotenv";
config();

import { eq } from "drizzle-orm";
import { channels, workflowConfigs } from "./schema";

// ── Canais ───────────────────────────────────────────────────────
const CHANNELS: (typeof channels.$inferInsert)[] = [
  {
    name: "Jazz",
    slug: "jazz",
    description: "Conteúdo musical jazz",
    color: "#E8A317",
    icon: "music",
    enabled: 1,
  },
  {
    name: "LoFi",
    slug: "lofi",
    description: "Conteúdo lofi beats",
    color: "#7B68EE",
    icon: "headphones",
    enabled: 1,
  },
  {
    name: "Metalcore",
    slug: "metalcore",
    description: "Conteúdo metalcore",
    color: "#DC143C",
    icon: "guitar",
    enabled: 1,
  },
];

// ── Asset types ──────────────────────────────────────────────────
const ASSET_TYPES = ["music", "thumbnail", "background", "description", "video"] as const;

const ASSET_LABELS: Record<(typeof ASSET_TYPES)[number], string> = {
  music: "Music Generator",
  thumbnail: "Thumbnail Generator",
  background: "Background Generator",
  description: "Description Generator",
  video: "Video Generator",
};

// ── Seed ─────────────────────────────────────────────────────────
async function seed() {
  const { db } = await import("./client");

  console.log("Seeding channels...");

  const channelMap = new Map<string, number>();

  for (const ch of CHANNELS) {
    const existing = db
      .select({ id: channels.id })
      .from(channels)
      .where(eq(channels.slug, ch.slug))
      .get();

    if (existing) {
      console.log(`  Channel "${ch.slug}" already exists (id=${existing.id}), skipping.`);
      channelMap.set(ch.slug, existing.id);
      continue;
    }

    const inserted = db.insert(channels).values(ch).returning({ id: channels.id }).get();

    console.log(`  Created channel "${ch.slug}" (id=${inserted.id}).`);
    channelMap.set(ch.slug, inserted.id);
  }

  console.log("\nSeeding workflow_configs...");

  for (const ch of CHANNELS) {
    const channelId = channelMap.get(ch.slug)!;

    for (const assetType of ASSET_TYPES) {
      const slug = `${ch.slug}-${assetType}`;
      const name = `${ch.name} ${ASSET_LABELS[assetType]}`;

      const existing = db
        .select({ id: workflowConfigs.id })
        .from(workflowConfigs)
        .where(eq(workflowConfigs.slug, slug))
        .get();

      if (existing) {
        console.log(`  Config "${slug}" already exists (id=${existing.id}), skipping.`);
        continue;
      }

      const cfg: typeof workflowConfigs.$inferInsert = {
        channelId,
        assetType,
        name,
        slug,
        webhookUrl: `http://localhost:5678/webhook/${slug}`,
        method: "POST",
        enabled: 1,
        priority: 0,
        timeoutMs: 10000,
      };

      const inserted = db
        .insert(workflowConfigs)
        .values(cfg)
        .returning({ id: workflowConfigs.id })
        .get();

      console.log(`  Created config "${slug}" (id=${inserted.id}).`);
    }
  }

  console.log("\nSeed completed successfully.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
