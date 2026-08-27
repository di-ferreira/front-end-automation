"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
import { FilterTabs } from "@/components/filter-tabs";
import { PROMPT_TYPE_LABELS, type PromptType } from "@/lib/validation";

interface PromptOption {
  id: number;
  name: string;
  type: PromptType;
  content: string;
}

type SourceMode = "biblioteca" | "texto";

export function NewExecutionDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<SourceMode>("biblioteca");
  const [promptOptions, setPromptOptions] = useState<PromptOption[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [promptId, setPromptId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || promptOptions.length > 0) return;
    let cancelled = false;

    // setState apenas em continuações assíncronas (regra react-hooks)
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

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setError(null);
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const body =
        mode === "biblioteca"
          ? {
              title: formData.get("title") || undefined,
              promptId: Number(promptId),
            }
          : {
              title: formData.get("title") || undefined,
              promptText: formData.get("promptText"),
            };

      if (mode === "biblioteca" && !promptId) {
        setError("Escolha um prompt da biblioteca.");
        return;
      }

      const response = await fetch("/api/executions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      router.refresh();

      if (response.ok) {
        setOpen(false);
        return;
      }

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(data.error ?? "Não foi possível iniciar a geração.");
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button>Nova geração</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova geração</DialogTitle>
          <DialogDescription>
            Dispara a automação no N8N para gerar os assets do vídeo.
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

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exec-title">
              Título <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="exec-title"
              name="title"
              placeholder='Ex.: Vídeo "Top 10 jogadas"'
              maxLength={500}
            />
          </div>

          {mode === "biblioteca" ? (
            <div className="space-y-2">
              <Label htmlFor="exec-prompt">Prompt da biblioteca</Label>
              <select
                id="exec-prompt"
                value={promptId}
                onChange={(event) => setPromptId(event.target.value)}
                disabled={loadingPrompts}
                className="border-border bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border px-3 text-sm transition-colors outline-none focus-visible:ring-3 disabled:opacity-50"
                required
              >
                <option value="">
                  {loadingPrompts
                    ? "Carregando prompts..."
                    : promptOptions.length === 0
                      ? "Nenhum prompt cadastrado"
                      : "Escolha um prompt"}
                </option>
                {promptOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    [{PROMPT_TYPE_LABELS[option.type]}] {option.name}
                  </option>
                ))}
              </select>
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
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Disparando..." : "Disparar automação"}
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
