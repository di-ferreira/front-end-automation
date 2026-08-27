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
import { ErrorMessage } from "@/components/error-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDialogForm } from "@/hooks/use-dialog-form";

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
  const { open, pending, error, handleOpenChange, handleSubmit } = useDialogForm();

  function onSubmit(formData: FormData) {
    return handleSubmit(
      formData,
      (fd) =>
        fetch(`/api/executions/${executionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: fd.get("title"),
            description: fd.get("description") ?? "",
          }),
        }),
      "Nao foi possivel salvar.",
    );
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
          <DialogTitle>Editar titulo e descricao</DialogTitle>
          <DialogDescription>Texto final que sera usado na publicacao do video.</DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exec-edit-title">Titulo</Label>
            <Input
              id="exec-edit-title"
              name="title"
              maxLength={500}
              defaultValue={initialTitle ?? ""}
              placeholder="Titulo do video no YouTube"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exec-edit-description">Descricao</Label>
            <Textarea
              id="exec-edit-description"
              name="description"
              rows={8}
              maxLength={5000}
              defaultValue={initialDescription ?? ""}
              placeholder="Descricao do video..."
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
