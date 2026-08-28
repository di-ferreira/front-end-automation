import { describe, it, expect } from "vitest";
import {
  WorkflowNotFoundError,
  WorkflowDisabledError,
  WorkflowExecutionError,
  InvalidAssetPayloadError,
} from "@/lib/errors";

describe("WorkflowNotFoundError", () => {
  it("has correct name and message", () => {
    const error = new WorkflowNotFoundError(1, "music");
    expect(error.name).toBe("WorkflowNotFoundError");
    expect(error.message).toContain("1");
    expect(error.message).toContain("music");
    expect(error instanceof Error).toBe(true);
  });
});

describe("WorkflowDisabledError", () => {
  it("has correct name and message", () => {
    const error = new WorkflowDisabledError(42);
    expect(error.name).toBe("WorkflowDisabledError");
    expect(error.message).toContain("42");
  });
});

describe("WorkflowExecutionError", () => {
  it("has correct name, message, and status", () => {
    const error = new WorkflowExecutionError("Webhook failed", 500);
    expect(error.name).toBe("WorkflowExecutionError");
    expect(error.message).toBe("Webhook failed");
    expect(error.status).toBe(500);
  });

  it("works without status", () => {
    const error = new WorkflowExecutionError("Connection refused");
    expect(error.status).toBeUndefined();
  });
});

describe("InvalidAssetPayloadError", () => {
  it("has correct name and message", () => {
    const error = new InvalidAssetPayloadError("Missing field");
    expect(error.name).toBe("InvalidAssetPayloadError");
    expect(error.message).toBe("Missing field");
  });
});
