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

interface DeleteChannelButtonProps {
  id: number;
  name: string;
}

export function DeleteChannelButton({ id, name }: DeleteChannelButtonProps) {
  const { open, setOpen, pending, error, handleOpenChange, handleSubmit } = useDialogForm();

  function handleDelete() {
    return handleSubmit(
      new FormData(),
      () => fetch(`/api/channels/${id}`, { method: "DELETE" }),
      "Não foi possível excluir o canal.",
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
          <DialogTitle>Excluir canal</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir{" "}
            <span className="text-foreground font-medium">{name}</span>? Todas as configurações de
            workflow associadas serão removidas. Esta ação não pode ser desfeita.
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
