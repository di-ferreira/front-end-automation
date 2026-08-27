"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ErrorMessage } from "@/components/error-message";
import { useDialogForm } from "@/hooks/use-dialog-form";

interface DeletePromptButtonProps {
  id: number;
  name: string;
}

export function DeletePromptButton({ id, name }: DeletePromptButtonProps) {
  const { open, setOpen, pending, error, handleOpenChange, handleSubmit } = useDialogForm();

  function handleDelete() {
    return handleSubmit(
      new FormData(),
      () => fetch(`/api/prompts/${id}`, { method: "DELETE" }),
      "Nao foi possivel excluir o prompt.",
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
            Excluir
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir prompt</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir{" "}
            <span className="text-foreground font-medium">{name}</span>? Esta acao nao pode ser
            desfeita.
          </DialogDescription>
        </DialogHeader>

        <ErrorMessage message={error} />

        <DialogFooter>
          <DialogClose
            render={
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
            }
          />
          <Button variant="destructive" onClick={handleDelete} disabled={pending}>
            {pending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
