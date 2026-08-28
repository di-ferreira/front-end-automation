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
import { Textarea } from "@/components/ui/textarea";
import { ErrorMessage } from "@/components/error-message";
import { useDialogForm } from "@/hooks/use-dialog-form";
import type { ChannelRow } from "@/db/schema";

interface ChannelFormDialogProps {
  channel?: ChannelRow;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ChannelFormDialog({ channel }: ChannelFormDialogProps) {
  const { open, pending, error, handleOpenChange, handleSubmit } = useDialogForm();
  const isEditing = !!channel;

  const [name, setName] = useState(channel?.name ?? "");
  const [slug, setSlug] = useState(channel?.slug ?? "");
  const [slugManual, setSlugManual] = useState(false);
  const [enabled, setEnabled] = useState(channel?.enabled ?? 1);

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
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: (formData.get("description") as string) || undefined,
      color: (formData.get("color") as string) || undefined,
      icon: (formData.get("icon") as string) || undefined,
      ...(isEditing ? { enabled } : {}),
    };

    return handleSubmit(
      formData,
      () =>
        fetch(isEditing ? `/api/channels/${channel.id}` : "/api/channels", {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
      isEditing ? "Não foi possível salvar o canal." : "Não foi possível criar o canal.",
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant={isEditing ? "outline" : "default"} size={isEditing ? "sm" : "default"}>
            {isEditing ? "Editar" : "Novo canal"}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar canal" : "Novo canal"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do canal."
              : "Cadastre um novo canal para gerar assets."}
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`ch-name-${channel?.id ?? "novo"}`}>Nome</Label>
            <Input
              id={`ch-name-${channel?.id ?? "novo"}`}
              name="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex.: Jazz, LoFi, Metalcore"
              required
              maxLength={255}
              aria-invalid={error ? true : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ch-slug-${channel?.id ?? "novo"}`}>Slug</Label>
            <Input
              id={`ch-slug-${channel?.id ?? "novo"}`}
              name="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="jazz, lofi-beats"
              required
              maxLength={100}
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              aria-invalid={error ? true : undefined}
            />
            <p className="text-muted-foreground text-xs">
              Identificador único. Minúsculas, números e hífens.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ch-desc-${channel?.id ?? "novo"}`}>
              Descrição <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Textarea
              id={`ch-desc-${channel?.id ?? "novo"}`}
              name="description"
              rows={2}
              placeholder="Descreva o canal..."
              defaultValue={channel?.description ?? ""}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`ch-color-${channel?.id ?? "novo"}`}>
                Cor <span className="text-muted-foreground font-normal">(hex)</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`ch-color-${channel?.id ?? "novo"}`}
                  name="color"
                  type="color"
                  defaultValue={channel?.color ?? "#6b7280"}
                  className="h-9 w-12 cursor-pointer p-1"
                />
                <Input
                  name="color"
                  defaultValue={channel?.color ?? ""}
                  placeholder="#E8A317"
                  maxLength={7}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`ch-icon-${channel?.id ?? "novo"}`}>
                Ícone <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Input
                id={`ch-icon-${channel?.id ?? "novo"}`}
                name="icon"
                defaultValue={channel?.icon ?? ""}
                placeholder="music, guitar..."
                maxLength={50}
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label>Ativo</Label>
                <p className="text-muted-foreground text-xs">
                  {enabled ? "Canal ativo e visível" : "Canal inativo e oculto"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled === 1}
                onClick={() => setEnabled(enabled ? 0 : 1)}
                className={`peer focus-visible:ring-ring inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  enabled ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`bg-background pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform ${
                    enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}

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
