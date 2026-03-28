import type { Route } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Milestone, Vault } from "@/lib/domain/types";

function getNextMilestone(vault: Vault) {
  return vault.milestones.find((milestone) => milestone.status !== "unlocked") ?? vault.milestones[0];
}

function getStatusVariant(status: Milestone["status"]) {
  switch (status) {
    case "unlocked":
      return "success";
    case "rejected":
      return "warning";
    case "approved":
      return "primary";
    default:
      return "neutral";
  }
}

function getStatusLabel(status: Milestone["status"]) {
  switch (status) {
    case "unlocked":
      return "Unlocked";
    case "rejected":
      return "Rejected";
    case "approved":
      return "Approved";
    default:
      return "Pending";
  }
}

type VaultPreviewCardProps = {
  vault: Vault;
};

export function VaultPreviewCard({ vault }: VaultPreviewCardProps) {
  const nextMilestone = getNextMilestone(vault);

  return (
    <Card className="flex h-full flex-col gap-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-strong)]">Shared vault</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{vault.projectName}</h3>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{nextMilestone.title}</p>
        </div>

        <Badge variant={getStatusVariant(nextMilestone.status)}>{getStatusLabel(nextMilestone.status)}</Badge>
      </div>

      <p className="text-sm leading-7 text-[var(--color-muted)]">{nextMilestone.description}</p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">Total Pool</p>
          <p className="mt-2 text-xl font-semibold text-white">{vault.totalAmount} SOL</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">Contributors</p>
          <p className="mt-2 text-xl font-semibold text-white">{vault.contributors.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">Next Tranche</p>
          <p className="mt-2 text-xl font-semibold text-white">{nextMilestone.trancheAmount} SOL</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">Released</p>
          <p className="mt-2 text-xl font-semibold text-white">{vault.releasedAmount} SOL</p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4 text-sm">
        <span className="text-[var(--color-muted)]">
          {nextMilestone.evidenceSubmissions.length} evidence submission
          {nextMilestone.evidenceSubmissions.length === 1 ? "" : "s"}
        </span>
        <Link className="font-semibold text-[var(--color-primary-strong)]" href={`/vault/${vault.id}` as Route}>
          Open vault
        </Link>
      </div>
    </Card>
  );
}
