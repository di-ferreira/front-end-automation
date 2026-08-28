export class WorkflowNotFoundError extends Error {
  constructor(channelId: number, assetType: string) {
    super(`Workflow não encontrado para canal ${channelId} e tipo ${assetType}`);
    this.name = "WorkflowNotFoundError";
  }
}

export class WorkflowDisabledError extends Error {
  constructor(configId: number) {
    super(`Workflow ${configId} está desabilitado`);
    this.name = "WorkflowDisabledError";
  }
}

export class WorkflowExecutionError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "WorkflowExecutionError";
  }
}

export class InvalidAssetPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidAssetPayloadError";
  }
}
