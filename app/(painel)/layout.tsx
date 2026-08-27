import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="bg-background flex min-h-screen flex-1 flex-col">
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Pular para o conteudo
      </a>
      <header className="border-border bg-card sticky top-0 z-40 border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-foreground text-sm font-semibold tracking-tight">
              Painel de Vídeos
            </Link>
            <NavLinks />
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-muted-foreground hidden text-sm sm:inline">
              {session.user.name ?? session.user.email}
            </span>
            <form action={signOutAction}>
              <Button variant="outline" size="sm" type="submit">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
