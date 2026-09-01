"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorMessage } from "@/components/error-message";
import { useDialogForm } from "@/hooks/use-dialog-form";
import { ASSET_STUDIO_TYPES, ASSET_STUDIO_TYPE_LABELS, WORKFLOW_METHODS } from "@/lib/validation";
import type { WorkflowConfigRow } from "@/db/schema";

interface WorkflowConfigFormDialogProps {
  channelId: number;
  config?: WorkflowConfigRow;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function WorkflowConfigFormDialog({ channelId, config }: WorkflowConfigFormDialogProps) {
  const { open, pending, error, handleOpenChange, handleSubmit } = useDialogForm();
  const isEditing = !!config;

  const [name, setName] = useState(config?.name ?? "");
  const [slug, setSlug] = useState(config?.slug ?? "");
  const [slugManual, setSlugManual] = useState(false);

  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      if (!slugManual) {
        setSlug(slugify(value));
      }
    },
    [slugManual],
  );

  const handleSlugChange = useCallback((value: string) => {
    setSlugManual(true);
    setSlug(value);
  }, []);

  function onSubmit(formData: FormData) {
    const data = {
      channelId,
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      assetType: formData.get("assetType") as string,
      webhookUrl: formData.get("webhookUrl") as string,
      method: formData.get("method") as string,
      priority: Number(formData.get("priority") || 0),
      timeoutMs: Number(formData.get("timeoutMs") || 10000),
    };

    return handleSubmit(
      formData,
      () =>
        fetch(isEditing ? `/api/workflow-configs/${config.id}` : "/api/workflow-configs", {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
      isEditing
        ? "Não foi possível salvar a configuração."
        : "Não foi possível criar a configuração.",
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant={isEditing ? "outline" : "default"} size={isEditing ? "sm" : "default"}>
            {isEditing ? "Editar" : "Nova config"}
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar configuração" : "Nova configuração de workflow"}
          </DialogTitle>
          <DialogDescription>
            Configure o webhook que será chamado para gerar este tipo de asset.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`wf-name-${config?.id ?? "novo"}`}>Nome</Label>
            <Input
              id={`wf-name-${config?.id ?? "novo"}`}
              name="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex.: Jazz Music Generator"
              required
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`wf-slug-${config?.id ?? "novo"}`}>Slug</Label>
            <Input
              id={`wf-slug-${config?.id ?? "novo"}`}
              name="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="jazz-music"
              required
              maxLength={150}
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Asset</Label>
              <Select name="assetType" defaultValue={config?.assetType ?? "music"}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_STUDIO_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {ASSET_STUDIO_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Método</Label>
              <Select name="method" defaultValue={config?.method ?? "POST"}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKFLOW_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`wf-url-${config?.id ?? "novo"}`}>Webhook URL</Label>
            <Input
              id={`wf-url-${config?.id ?? "novo"}`}
              name="webhookUrl"
              type="url"
              defaultValue={config?.webhookUrl ?? ""}
              placeholder="http://localhost:5678/webhook/jazz-music"
              required
              maxLength={2048}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`wf-priority-${config?.id ?? "novo"}`}>Prioridade</Label>
              <Input
                id={`wf-priority-${config?.id ?? "novo"}`}
                name="priority"
                type="number"
                min={0}
                defaultValue={config?.priority ?? 0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`wf-timeout-${config?.id ?? "novo"}`}>Timeout (ms)</Label>
              <Input
                id={`wf-timeout-${config?.id ?? "novo"}`}
                name="timeoutMs"
                type="number"
                min={1000}
                max={300000}
                defaultValue={config?.timeoutMs ?? 10000}
              />
            </div>
          </div>

          <ErrorMessage message={error} />

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
