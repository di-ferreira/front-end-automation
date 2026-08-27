"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
import { FilterTabs } from "@/components/filter-tabs";
import { PROMPT_TYPE_LABELS, type PromptType } from "@/lib/validation";
import { useDialogForm } from "@/hooks/use-dialog-form";

interface PromptOption {
  id: number;
  name: string;
  type: PromptType;
  content: string;
}

type SourceMode = "biblioteca" | "texto";

export function NewExecutionDialog() {
  const { open, pending, error, handleOpenChange, handleSubmit } = useDialogForm();
  const [mode, setMode] = useState<SourceMode>("biblioteca");
  const [promptOptions, setPromptOptions] = useState<PromptOption[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [promptId, setPromptId] = useState("");

  useEffect(() => {
    if (!open || promptOptions.length > 0) return;
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/prompts");
        const data = response.ok
          ? ((await response.json()) as { prompts?: PromptOption[] })
          : { prompts: [] as PromptOption[] };
        if (!cancelled) setPromptOptions(data.prompts ?? []);
      } catch {
        if (!cancelled) setPromptOptions([]);
      } finally {
        if (!cancelled) setLoadingPrompts(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, promptOptions.length]);

  function onSubmit(formData: FormData) {
    if (mode === "biblioteca" && !promptId) {
      return handleSubmit(
        formData,
        () => Promise.resolve(new Response(null, { status: 400 })),
        "Escolha um prompt da biblioteca.",
      );
    }

    return handleSubmit(
      formData,
      (fd) => {
        const body =
          mode === "biblioteca"
            ? {
                title: fd.get("title") || undefined,
                promptId: Number(promptId),
              }
            : {
                title: fd.get("title") || undefined,
                promptText: fd.get("promptText"),
              };

        return fetch("/api/executions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      },
      "Nao foi possivel iniciar a geracao.",
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" /> Nova geracao
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova geracao</DialogTitle>
          <DialogDescription>
            Dispara a automacao no N8N para gerar os assets do video.
          </DialogDescription>
        </DialogHeader>

        <FilterTabs
          options={[
            { value: "biblioteca", label: "Da biblioteca" },
            { value: "texto", label: "Digitar prompt" },
          ]}
          active={mode}
          onChange={setMode}
        />

        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exec-title">
              Titulo <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="exec-title"
              name="title"
              placeholder='Ex.: Video "Top 10 jogadas"'
              maxLength={500}
            />
          </div>

          {mode === "biblioteca" ? (
            <div className="space-y-2">
              <Label htmlFor="exec-prompt">Prompt da biblioteca</Label>
              <Select
                value={promptId}
                onValueChange={(value) => setPromptId(value ?? "")}
                disabled={loadingPrompts}
                required
              >
                <SelectTrigger id="exec-prompt" className="w-full">
                  <SelectValue
                    placeholder={
                      loadingPrompts
                        ? "Carregando prompts..."
                        : promptOptions.length === 0
                          ? "Nenhum prompt cadastrado"
                          : "Escolha um prompt"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {promptOptions.map((option) => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      [{PROMPT_TYPE_LABELS[option.type]}] {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPreview(promptOptions, promptId) ? (
                <p className="text-muted-foreground bg-muted/50 line-clamp-3 rounded-lg px-3 py-2 text-xs leading-5">
                  {selectedPreview(promptOptions, promptId)}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="exec-prompt-text">Texto do prompt</Label>
              <Textarea
                id="exec-prompt-text"
                name="promptText"
                rows={6}
                placeholder="Descreva o que o N8N deve gerar..."
                required
              />
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
              {pending ? "Disparando..." : "Disparar automacao"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function selectedPreview(options: PromptOption[], id: string): string | null {
  return options.find((option) => String(option.id) === id)?.content ?? null;
}
