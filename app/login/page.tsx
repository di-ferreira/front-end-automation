import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <div className="bg-background flex flex-1 items-center justify-center p-6">
      <main className="border-border bg-card w-full max-w-sm rounded-xl border p-8 shadow-sm">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Painel de Automação de Vídeos
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Acesse com sua conta para continuar.
        </p>
        <LoginForm />
      </main>
    </div>
  );
}
