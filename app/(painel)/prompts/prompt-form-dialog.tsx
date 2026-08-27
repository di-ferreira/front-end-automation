"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { PROMPT_TYPES, PROMPT_TYPE_LABELS } from "@/lib/validation";

export interface PromptFormData {
  id: number;
  name: string;
  type: string;
  content: string;
  tags: string | null;
}

interface PromptFormDialogProps {
  prompt?: PromptFormData;
  label?: string;
}

export function PromptFormDialog({ prompt, label }: PromptFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setError(null);
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(prompt ? `/api/prompts/${prompt.id}` : "/api/prompts", {
        method: prompt ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          type: formData.get("type"),
          content: formData.get("content"),
          tags: formData.get("tags"),
        }),
      });

      if (response.ok) {
        setOpen(false);
        router.refresh();
        return;
      }

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(data.error ?? "Não foi possível salvar o prompt.");
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant={prompt ? "outline" : "default"} size={prompt ? "sm" : "default"}>
            {label ?? (prompt ? "Editar" : "Novo prompt")}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{prompt ? "Editar prompt" : "Novo prompt"}</DialogTitle>
          <DialogDescription>
            {prompt
              ? "Atualize as informações do prompt."
              : "Cadastre um prompt reutilizável para a automação."}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`name-${prompt?.id ?? "novo"}`}>Nome</Label>
            <Input
              id={`name-${prompt?.id ?? "novo"}`}
              name="name"
              placeholder="Ex.: Descrição épica de gameplay"
              defaultValue={prompt?.name}
              required
              maxLength={255}
              aria-invalid={error ? true : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`type-${prompt?.id ?? "novo"}`}>Tipo</Label>
            <select
              id={`type-${prompt?.id ?? "novo"}`}
              name="type"
              defaultValue={prompt?.type ?? "descricao"}
              className="border-border bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border px-3 text-sm transition-colors outline-none focus-visible:ring-3"
            >
              {PROMPT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {PROMPT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`content-${prompt?.id ?? "novo"}`}>Conteúdo do prompt</Label>
            <Textarea
              id={`content-${prompt?.id ?? "novo"}`}
              name="content"
              rows={6}
              placeholder="Escreva aqui o texto do prompt..."
              defaultValue={prompt?.content}
              required
              aria-invalid={error ? true : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`tags-${prompt?.id ?? "novo"}`}>
              Tags{" "}
              <span className="text-muted-foreground font-normal">(separadas por vírgula)</span>
            </Label>
            <Input
              id={`tags-${prompt?.id ?? "novo"}`}
              name="tags"
              placeholder="youtube, gameplay, épico"
              defaultValue={prompt?.tags ?? ""}
              maxLength={500}
            />
          </div>

          <ErrorMessage message={error} />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
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
