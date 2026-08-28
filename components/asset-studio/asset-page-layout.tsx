import type { ReactNode } from "react";

interface AssetPageLayoutProps {
  title: string;
  description?: string;
  sidebar?: ReactNode;
  children: ReactNode;
}

export function AssetPageLayout({ title, description, sidebar, children }: AssetPageLayoutProps) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-foreground text-2xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">{children}</section>
        {sidebar && (
          <aside className="space-y-4">
            <div className="bg-card rounded-xl border p-4 shadow-sm">
              <h2 className="text-foreground mb-3 text-sm font-semibold">Gerar novo</h2>
              {sidebar}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
