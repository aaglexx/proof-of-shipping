"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <>
      <SiteHeader pathname={pathname} />
      <main className="mx-auto flex min-h-[calc(100vh-104px)] max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
    </>
  );
}
