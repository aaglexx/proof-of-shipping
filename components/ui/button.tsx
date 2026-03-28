import type { Route } from "next";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = {
  primary:
    "border border-[rgba(96,165,250,0.34)] bg-[linear-gradient(180deg,rgba(96,165,250,0.24),rgba(37,99,235,0.14))] text-white shadow-[0_0_0_1px_rgba(96,165,250,0.08),0_10px_24px_rgba(37,99,235,0.18)] hover:border-[rgba(147,197,253,0.55)] hover:bg-[linear-gradient(180deg,rgba(96,165,250,0.3),rgba(37,99,235,0.18))] hover:text-white",
  secondary:
    "border border-[var(--color-border)] bg-[rgba(15,19,26,0.88)] text-[var(--color-foreground)] hover:border-[var(--color-border-strong)] hover:bg-[rgba(20,26,34,0.96)] hover:text-white",
  ghost:
    "bg-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-white/4",
};

type BaseButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof buttonVariants;
};

type ButtonAsButton = BaseButtonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof BaseButtonProps> & {
    href?: never;
  };

type LinkRestProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">;

type ButtonAsLink = BaseButtonProps & {
  href: Route;
} & LinkRestProps;

export function Button(props: ButtonAsButton): ReactNode;
export function Button(props: ButtonAsLink): ReactNode;
export function Button(props: ButtonAsButton | ButtonAsLink) {
  const classes = cn(
    "inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-semibold tracking-[0.02em] transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(96,165,250,0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:border-[var(--color-border)] disabled:bg-[rgba(15,19,26,0.72)] disabled:text-[rgba(247,250,252,0.42)] disabled:shadow-none",
    buttonVariants[props.variant ?? "primary"],
    props.className,
  );

  if ("href" in props) {
    const linkProps = props as ButtonAsLink;
    const { href, className, children, variant, ...rest } = linkProps;
    void className;
    void variant;

    return (
      <Link className={classes} href={href} {...rest}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  const { className, children, variant, type = "button", ...rest } = buttonProps;
  void className;
  void variant;

  return (
    <button className={classes} type={type} {...rest}>
      {children}
    </button>
  );
}
