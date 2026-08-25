"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

interface DeletePromptButtonProps {
  id: number;
  name: string;
}

export function DeletePromptButton({ id, name }: DeletePromptButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: "DELETE",
      });
      if (response.ok || response.status === 404) {
        router.refresh();
        return;
      }
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(data.error ?? "Não foi possível excluir o prompt.");
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog>
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
            <span className="text-foreground font-medium">{name}</span>? Esta
            ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p
            role="alert"
            className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-sm font-medium"
          >
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="ghost" disabled={pending}>
                Cancelar
              </Button>
            }
          />
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
