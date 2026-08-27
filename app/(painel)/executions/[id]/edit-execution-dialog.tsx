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
import { ErrorMessage } from "@/components/error-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditExecutionDialogProps {
  executionId: string;
  initialTitle: string | null;
  initialDescription: string | null;
}

export function EditExecutionDialog({
  executionId,
  initialTitle,
  initialDescription,
}: EditExecutionDialogProps) {
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
      const response = await fetch(`/api/executions/${executionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description") ?? "",
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
      setError(data.error ?? "Não foi possível salvar.");
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
          <Button variant="outline" size="sm">
            Editar
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar título e descrição</DialogTitle>
          <DialogDescription>Texto final que será usado na publicação do vídeo.</DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exec-edit-title">Título</Label>
            <Input
              id="exec-edit-title"
              name="title"
              maxLength={500}
              defaultValue={initialTitle ?? ""}
              placeholder="Título do vídeo no YouTube"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exec-edit-description">Descrição</Label>
            <Textarea
              id="exec-edit-description"
              name="description"
              rows={8}
              maxLength={5000}
              defaultValue={initialDescription ?? ""}
              placeholder="Descrição do vídeo..."
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
