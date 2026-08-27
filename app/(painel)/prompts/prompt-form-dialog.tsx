"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorMessage } from "@/components/error-message";
import { PROMPT_TYPES, PROMPT_TYPE_LABELS } from "@/lib/validation";
import { useDialogForm } from "@/hooks/use-dialog-form";

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
  const { open, pending, error, handleOpenChange, handleSubmit } = useDialogForm();

  function onSubmit(formData: FormData) {
    return handleSubmit(
      formData,
      (fd) =>
        fetch(prompt ? `/api/prompts/${prompt.id}` : "/api/prompts", {
          method: prompt ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fd.get("name"),
            type: fd.get("type"),
            content: fd.get("content"),
            tags: fd.get("tags"),
          }),
        }),
      "Nao foi possivel salvar o prompt.",
    );
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
              ? "Atualize as informacoes do prompt."
              : "Cadastre um prompt reutilizavel para a automacao."}
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`name-${prompt?.id ?? "novo"}`}>Nome</Label>
            <Input
              id={`name-${prompt?.id ?? "novo"}`}
              name="name"
              placeholder="Ex.: Descricao epica de gameplay"
              defaultValue={prompt?.name}
              required
              maxLength={255}
              aria-invalid={error ? true : undefined}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`type-${prompt?.id ?? "novo"}`}>Tipo</Label>
            <Select defaultValue={prompt?.type ?? "descricao"}>
              <SelectTrigger id={`type-${prompt?.id ?? "novo"}`} name="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROMPT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {PROMPT_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`content-${prompt?.id ?? "novo"}`}>Conteudo do prompt</Label>
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
              <span className="text-muted-foreground font-normal">(separadas por virgula)</span>
            </Label>
            <Input
              id={`tags-${prompt?.id ?? "novo"}`}
              name="tags"
              placeholder="youtube, gameplay, epico"
              defaultValue={prompt?.tags ?? ""}
              maxLength={500}
            />
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
