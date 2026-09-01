import { describe, it, expect } from "vitest";
import {
  GENERATION_STATUS_LABELS,
  ASSET_STUDIO_TYPE_LABELS,
  WORKFLOW_EXECUTION_STATUS_LABELS,
  PROMPT_TYPE_LABELS,
  EXECUTION_STATUS_LABELS,
  APPROVAL_STATUS_LABELS,
} from "@/lib/validation";
import {
  ASSET_STUDIO_TYPE_BADGE_CLASSES,
  GENERATION_STATUS_BADGE_CLASSES,
  WORKFLOW_EXECUTION_STATUS_BADGE_CLASSES,
  PROMPT_TYPE_BADGE_CLASSES,
  EXECUTION_STATUS_BADGE_CLASSES,
  APPROVAL_STATUS_BADGE_CLASSES,
  formatDateTime,
  formatBytes,
  fileName,
  relativePath,
} from "@/lib/format";

describe("label records", () => {
  it("has labels for all asset studio types", () => {
    expect(Object.keys(ASSET_STUDIO_TYPE_LABELS)).toHaveLength(6);
    expect(ASSET_STUDIO_TYPE_LABELS.all).toBe("Principal (todos)");
    expect(ASSET_STUDIO_TYPE_LABELS.music).toBe("Música");
    expect(ASSET_STUDIO_TYPE_LABELS.thumbnail).toBe("Thumbnail");
    expect(ASSET_STUDIO_TYPE_LABELS.background).toBe("Background");
    expect(ASSET_STUDIO_TYPE_LABELS.description).toBe("Descrição");
    expect(ASSET_STUDIO_TYPE_LABELS.video).toBe("Vídeo");
  });

  it("has labels for all generation statuses", () => {
    expect(Object.keys(GENERATION_STATUS_LABELS)).toHaveLength(4);
    expect(GENERATION_STATUS_LABELS.pending).toBe("Pendente");
    expect(GENERATION_STATUS_LABELS.generating).toBe("Gerando");
    expect(GENERATION_STATUS_LABELS.completed).toBe("Concluído");
    expect(GENERATION_STATUS_LABELS.failed).toBe("Falhou");
  });

  it("has labels for all workflow execution statuses", () => {
    expect(Object.keys(WORKFLOW_EXECUTION_STATUS_LABELS)).toHaveLength(4);
  });
});

describe("badge classes", () => {
  it("has badge classes for all asset studio types", () => {
    for (const type of Object.keys(ASSET_STUDIO_TYPE_BADGE_CLASSES)) {
      expect(
        ASSET_STUDIO_TYPE_BADGE_CLASSES[type as keyof typeof ASSET_STUDIO_TYPE_BADGE_CLASSES],
      ).toContain("border-");
    }
  });

  it("has badge classes for all generation statuses", () => {
    for (const status of Object.keys(GENERATION_STATUS_BADGE_CLASSES)) {
      expect(
        GENERATION_STATUS_BADGE_CLASSES[status as keyof typeof GENERATION_STATUS_BADGE_CLASSES],
      ).toContain("border-");
    }
  });
});

describe("formatDateTime", () => {
  it("returns dash for null", () => {
    expect(formatDateTime(null)).toBe("—");
    expect(formatDateTime(undefined)).toBe("—");
  });

  it("formats a valid date", () => {
    const result = formatDateTime(new Date("2026-08-15T14:30:00"));
    expect(result).toContain("2026");
    expect(result).toContain("14:30");
  });
});

describe("formatBytes", () => {
  it("returns empty for null/undefined", () => {
    expect(formatBytes(null)).toBe("");
    expect(formatBytes(undefined)).toBe("");
  });

  it("formats bytes correctly", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1048576)).toBe("1.0 MB");
  });
});

describe("fileName", () => {
  it("extracts filename from path", () => {
    expect(fileName("output/music/song.mp3")).toBe("song.mp3");
    expect(fileName("file.txt")).toBe("file.txt");
  });
});

describe("relativePath", () => {
  it("removes first segment", () => {
    expect(relativePath("output/music/song.mp3")).toBe("music/song.mp3");
    expect(relativePath("file.txt")).toBe("file.txt");
  });
});
