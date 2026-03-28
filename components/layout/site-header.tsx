import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Overview" },
  { href: "/create-vault", label: "Create Vault" },
  { href: "/submit-progress", label: "Submit Progress" },
] as const;

type SiteHeaderProps = {
  pathname: string;
};

export function SiteHeader({ pathname }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[rgba(10,13,18,0.9)] px-3 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_16px_48px_rgba(0,0,0,0.34)] backdrop-blur">
          <div className="flex items-center gap-3">
            <Link className="pl-2 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-foreground)]" href="/">
              Proof of Shipping
            </Link>
            <span className="hidden rounded-sm border border-[rgba(96,165,250,0.16)] bg-[rgba(96,165,250,0.08)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-strong)] sm:inline-flex">
              Crypto x AI
            </span>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  className={cn(
                    "shrink-0 rounded-sm px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "border border-[rgba(96,165,250,0.18)] bg-[rgba(96,165,250,0.08)] text-[var(--color-foreground)]"
                      : "text-[var(--color-muted)] hover:bg-white/4 hover:text-[var(--color-foreground)]",
                  )}
                  href={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Button className="hidden sm:inline-flex" href="/create-vault" variant="primary">
            New Vault
          </Button>
        </div>
      </div>
    </header>
  );
}
