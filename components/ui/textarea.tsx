import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-md border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(6,7,10,0.92),rgba(10,13,18,0.88))] px-4 py-3 text-sm leading-6 text-[var(--color-foreground)] outline-none transition placeholder:text-[rgba(138,148,167,0.82)] focus:border-[var(--color-border-strong)] focus:bg-[rgba(10,13,18,0.98)] focus:ring-2 focus:ring-[rgba(96,165,250,0.12)]",
        className,
      )}
      {...props}
    />
  );
}
