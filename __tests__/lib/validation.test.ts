import { describe, it, expect } from "vitest";
import {
  generateAssetSchema,
  channelSchema,
  workflowConfigSchema,
  assetStudioTypeSchema,
  ASSET_STUDIO_TYPES,
} from "@/lib/validation";

describe("assetStudioTypeSchema", () => {
  it("accepts valid asset types", () => {
    for (const type of ASSET_STUDIO_TYPES) {
      expect(assetStudioTypeSchema.parse(type)).toBe(type);
    }
  });

  it("rejects invalid asset types", () => {
    expect(() => assetStudioTypeSchema.parse("invalid")).toThrow();
    expect(() => assetStudioTypeSchema.parse("")).toThrow();
  });
});

describe("channelSchema", () => {
  it("accepts valid channel data", () => {
    const result = channelSchema.parse({
      name: "Jazz",
      slug: "jazz",
    });
    expect(result.name).toBe("Jazz");
    expect(result.slug).toBe("jazz");
    expect(result.enabled).toBe(1);
  });

  it("rejects empty name", () => {
    expect(() => channelSchema.parse({ name: "", slug: "jazz" })).toThrow();
  });

  it("rejects invalid slug format", () => {
    expect(() => channelSchema.parse({ name: "Jazz", slug: "Jazz Music" })).toThrow();
    expect(() => channelSchema.parse({ name: "Jazz", slug: "jazz_music" })).toThrow();
  });

  it("accepts valid slug formats", () => {
    expect(channelSchema.parse({ name: "Jazz", slug: "jazz" }).slug).toBe("jazz");
    expect(channelSchema.parse({ name: "LoFi", slug: "lo-fi-beats" }).slug).toBe("lo-fi-beats");
    expect(channelSchema.parse({ name: "Metal", slug: "metalcore1" }).slug).toBe("metalcore1");
  });

  it("rejects invalid color format", () => {
    expect(() => channelSchema.parse({ name: "Jazz", slug: "jazz", color: "red" })).toThrow();
    expect(() => channelSchema.parse({ name: "Jazz", slug: "jazz", color: "#FFF" })).toThrow();
  });

  it("accepts valid hex color", () => {
    const result = channelSchema.parse({
      name: "Jazz",
      slug: "jazz",
      color: "#E8A317",
    });
    expect(result.color).toBe("#E8A317");
  });
});

describe("generateAssetSchema", () => {
  it("accepts valid generate asset input", () => {
    const result = generateAssetSchema.parse({
      channelId: 1,
      assetType: "music",
    });
    expect(result.channelId).toBe(1);
    expect(result.assetType).toBe("music");
    expect(result.promptText).toBeUndefined();
  });

  it("accepts with prompt text", () => {
    const result = generateAssetSchema.parse({
      channelId: 1,
      assetType: "video",
      promptText: "Generate a cool video",
    });
    expect(result.promptText).toBe("Generate a cool video");
  });

  it("rejects missing channelId", () => {
    expect(() => generateAssetSchema.parse({ assetType: "music" })).toThrow();
  });

  it("rejects invalid assetType", () => {
    expect(() => generateAssetSchema.parse({ channelId: 1, assetType: "invalid" })).toThrow();
  });

  it("rejects channelId <= 0", () => {
    expect(() => generateAssetSchema.parse({ channelId: 0, assetType: "music" })).toThrow();
    expect(() => generateAssetSchema.parse({ channelId: -1, assetType: "music" })).toThrow();
  });
});

describe("workflowConfigSchema", () => {
  it("accepts valid workflow config", () => {
    const result = workflowConfigSchema.parse({
      channelId: 1,
      assetType: "music",
      name: "Jazz Music Generator",
      slug: "jazz-music",
      webhookUrl: "http://localhost:5678/webhook/jazz-music",
    });
    expect(result.method).toBe("POST");
    expect(result.enabled).toBe(1);
    expect(result.timeoutMs).toBe(10000);
  });

  it("rejects invalid webhookUrl", () => {
    expect(() =>
      workflowConfigSchema.parse({
        channelId: 1,
        assetType: "music",
        name: "Test",
        slug: "test",
        webhookUrl: "not-a-url",
      }),
    ).toThrow();
  });

  it("accepts assetType 'all' (workflow principal)", () => {
    const result = workflowConfigSchema.parse({
      channelId: 1,
      assetType: "all",
      name: "Jazz Principal",
      slug: "jazz-all",
      webhookUrl: "http://localhost:5678/webhook/jazz-all",
    });
    expect(result.assetType).toBe("all");
  });

  it("rejects assetType null (reproduz bug do form)", () => {
    expect(() =>
      workflowConfigSchema.parse({
        channelId: 1,
        assetType: null,
        name: "Jazz Music Generator",
        slug: "jazz-music",
        webhookUrl: "http://localhost:5678/webhook/jazz-music",
      }),
    ).toThrow();
  });
});
