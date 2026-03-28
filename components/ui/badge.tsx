import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = {
  neutral: "border border-white/8 bg-white/4 text-[var(--color-foreground)]",
  success: "border border-[rgba(34,197,94,0.18)] bg-[rgba(34,197,94,0.1)] text-[var(--color-success)]",
  warning: "border border-[rgba(217,164,65,0.18)] bg-[rgba(217,164,65,0.1)] text-[var(--color-warning)]",
  danger: "border border-[rgba(220,38,38,0.18)] bg-[rgba(220,38,38,0.08)] text-[rgb(239,68,68)]",
  primary: "border border-[rgba(96,165,250,0.18)] bg-[rgba(96,165,250,0.1)] text-[var(--color-primary-strong)]",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof badgeVariants;
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
