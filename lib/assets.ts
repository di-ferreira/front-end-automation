import { promises as fsp } from "node:fs";
import path from "node:path";

import type { AssetType } from "@/lib/validation";

export interface CollectedAsset {
  type: AssetType;
  filePath: string; // relativo a OUTPUT_DIR, prefixado com executionId
  mimeType?: string;
  sizeBytes?: number;
}

const TYPE_BY_FOLDER: Record<string, AssetType> = {
  video: "video",
  videos: "video",
  thumb: "thumb",
  thumbs: "thumb",
  thumbnails: "thumb",
  music: "music",
  musicas: "music",
  audio: "music",
  images: "image",
  imagens: "image",
  image: "image",
  description: "description",
  descriptions: "description",
  descricao: "description",
};

const TYPE_BY_EXT: Record<string, AssetType> = {
  mp4: "video",
  webm: "video",
  mov: "video",
  mkv: "video",
  avi: "video",
  mp3: "music",
  wav: "music",
  m4a: "music",
  ogg: "music",
  flac: "music",
  txt: "description",
  srt: "description",
};

const MIME_BY_EXT: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mkv: "video/x-matroska",
  avi: "video/x-msvideo",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  flac: "audio/flac",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  txt: "text/plain; charset=utf-8",
  srt: "text/plain; charset=utf-8",
  json: "application/json",
};

export function mimeForFile(filePath: string): string | undefined {
  return MIME_BY_EXT[extOf(filePath)];
}

function extOf(filePath: string): string {
  return path.extname(filePath).slice(1).toLowerCase();
}

/**
 * Normaliza o caminho vindo de fonte externa para um caminho RELATIVO
 * seguro dentro de OUTPUT_DIR/{executionId}. Retorna null se escapar.
 */
export function sanitizeAssetPath(
  executionId: string,
  input: string,
): string | null {
  const segments = input
    .replaceAll("\\", "/")
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0 && segment !== ".");

  if (segments.some((segment) => segment === "..")) return null;

  // Remove o prefixo do id caso venha incluído; depois recompõe normalizado
  if (segments[0] === executionId) segments.shift();
  if (segments.length === 0) return null;

  return [executionId, ...segments].join("/");
}

function classify(
  segments: string[],
  fileName: string,
): AssetType | null {
  // 1. pasta (primeiro segmento após o id)
  for (const segment of segments) {
    const byFolder = TYPE_BY_FOLDER[segment.toLowerCase()];
    if (byFolder) return byFolder;
  }
  // 2. nome contendo "thumb"
  if (/thumb/i.test(fileName)) return "thumb";
  // 3. extensão
  const byExt = TYPE_BY_EXT[extOf(fileName)];
  if (byExt) return byExt;
  // 4. imagens genéricas
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(extOf(fileName))) {
    return "image";
  }
  return null;
}

async function walk(
  dir: string,
  outputRoot: string,
  executionId: string,
  out: CollectedAsset[],
  depth: number,
): Promise<void> {
  if (depth > 3) return;

  let entries;
  try {
    entries = await fsp.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, outputRoot, executionId, out, depth + 1);
      continue;
    }
    if (!entry.isFile()) continue;
    if (entry.name.toLowerCase() === "metadata.json") continue; // metadado, não asset

    // relativo ao OUTPUT_DIR: {executionId}/pasta/arquivo.ext
    const relative = path
      .relative(outputRoot, full)
      .replaceAll("\\", "/");
    const segments = relative.split("/").slice(1); // ignora o próprio executionId
    const type = classify(segments, entry.name);
    if (!type) continue;

    let sizeBytes: number | undefined;
    try {
      sizeBytes = (await fsp.stat(full)).size;
    } catch {
      // arquivo sumiu entre readdir e stat: segue sem tamanho
    }

    out.push({
      type,
      filePath: relative,
      mimeType: mimeForFile(entry.name),
      sizeBytes,
    });
  }
}

/**
 * Varre OUTPUT_DIR/{executionId} coletando os assets gerados.
 * Retorna lista vazia se a pasta não existir.
 */
export async function collectAssetsFromDisk(
  outputDir: string,
  executionId: string,
): Promise<CollectedAsset[]> {
  const execDir = path.join(outputDir, executionId);
  const assets: CollectedAsset[] = [];
  await walk(execDir, outputDir, executionId, assets, 0);
  return assets.sort((a, b) => a.filePath.localeCompare(b.filePath));
}
