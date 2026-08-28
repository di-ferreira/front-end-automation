"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const assetLinks = [
  { href: "/assets/music", label: "Música" },
  { href: "/assets/thumbnail", label: "Thumbnail" },
  { href: "/assets/background", label: "Background" },
  { href: "/assets/description", label: "Descrição" },
  { href: "/assets/video", label: "Vídeo" },
];

export function AssetSubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1" aria-label="Asset Studio">
      {assetLinks.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "focus-visible:ring-ring/50 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
