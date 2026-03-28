import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-md border border-[var(--color-border)] bg-[rgba(6,7,10,0.88)] px-4 text-sm text-[var(--color-foreground)] outline-none transition placeholder:text-[rgba(138,148,167,0.82)] focus:border-[var(--color-border-strong)] focus:bg-[rgba(10,13,18,0.98)] focus:ring-2 focus:ring-[rgba(96,165,250,0.12)]",
        className,
      )}
      {...props}
    />
  );
}
