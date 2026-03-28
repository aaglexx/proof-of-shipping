"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MilestoneStatus, MilestoneVerdict } from "@/lib/domain/types";
import { getVaultById, setMilestoneVerdict, unlockTranche } from "@/lib/store";

type ActivityItem = {
  id: string;
  tone: "neutral" | "success" | "warning" | "primary";
  title: string;
  detail: string;
};

function getStatusVariant(status: MilestoneStatus) {
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

function getStatusLabel(status: MilestoneStatus) {
  switch (status) {
    case "unlocked":
      return "UNLOCKED";
    case "rejected":
      return "REJECTED";
    case "approved":
      return "APPROVED";
    default:
      return "PENDING";
  }
}

function getVerdictVariant(status: MilestoneVerdict["status"]) {
  switch (status) {
    case "APPROVE":
      return "success";
    case "REJECT":
      return "danger";
    default:
      return "warning";
  }
}

type VaultDetailViewProps = {
  id: string;
};

export function VaultDetailView({ id }: VaultDetailViewProps) {
  const [, forceRefresh] = useState(0);
  const [reviewingMilestoneId, setReviewingMilestoneId] = useState<string | null>(null);
  const [unlockingMilestoneId, setUnlockingMilestoneId] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState("");
  const [unlockMessage, setUnlockMessage] = useState("");
  const [highlightMilestoneId, setHighlightMilestoneId] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const vault = getVaultById(id);

  function pushActivity(item: Omit<ActivityItem, "id">) {
    setActivity((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...item,
      },
      ...current,
    ]);
  }

  async function handleReviewWithAi(milestoneId: string) {
    if (!vault) {
      return;
    }

    setReviewError("");
    setUnlockMessage("");
    setReviewingMilestoneId(milestoneId);

    try {
      const response = await fetch("/api/judge-milestone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vaultId: vault.id,
          milestoneId,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        verdict?: MilestoneVerdict;
      };

      if (!response.ok || !payload.verdict) {
        throw new Error(payload.error ?? "AI review failed.");
      }

      setMilestoneVerdict(vault.id, milestoneId, payload.verdict);
      pushActivity({
        tone: payload.verdict.status === "APPROVE" ? "success" : payload.verdict.status === "REJECT" ? "warning" : "primary",
        title: `AI reviewed milestone`,
        detail: `${payload.verdict.status} with ${Math.round(payload.verdict.confidence * 100)}% confidence.`,
      });
      forceRefresh((value) => value + 1);
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "AI review failed.");
    } finally {
      setReviewingMilestoneId(null);
    }
  }

  function handleForceApprove(milestoneId: string) {
    if (!vault) {
      return;
    }

    setMilestoneVerdict(vault.id, milestoneId, {
      status: "APPROVE",
      confidence: 0.99,
      explanation: "Demo override enabled. Milestone marked approved for showcase purposes.",
      matchedSignals: ["Demo override applied"],
      missingSignals: [],
    });
    pushActivity({
      tone: "warning",
      title: "Demo force approve",
      detail: "Milestone approved manually to continue the demo unlock flow.",
    });
    forceRefresh((value) => value + 1);
  }

  async function handleUnlockTranche(milestoneId: string) {
    if (!vault) {
      return;
    }

    const milestone = vault.milestones.find((item) => item.id === milestoneId);

    if (!milestone || milestone.status !== "approved") {
      return;
    }

    setReviewError("");
    setUnlockMessage("");
    setUnlockingMilestoneId(milestoneId);

    await new Promise((resolve) => setTimeout(resolve, 900));

    try {
      unlockTranche(vault.id, milestoneId);
      setHighlightMilestoneId(milestoneId);
      setUnlockMessage("Tranche unlocked successfully");
      pushActivity({
        tone: "success",
        title: "Tranche unlocked",
        detail: `+${milestone.trancheAmount} SOL released after approval.`,
      });
      forceRefresh((value) => value + 1);
      window.setTimeout(() => setHighlightMilestoneId((current) => (current === milestoneId ? null : current)), 1800);
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "Unlock failed.");
    } finally {
      setUnlockingMilestoneId(null);
    }
  }

  if (!vault) {
    return (
      <Card className="max-w-2xl p-7">
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">Vault not found</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
          This in-memory vault may have been reset. Return home and open one of the available seeded vaults.
        </p>
        <div className="mt-6">
          <Button href="/">Back home</Button>
        </div>
      </Card>
    );
  }

  const nextMilestone = vault.milestones.find((item) => item.status !== "unlocked") ?? vault.milestones[0];
  const remainingCapital = vault.totalAmount - vault.releasedAmount;

  return (
    <div className="grid flex-1 gap-6 xl:grid-cols-[1.22fr_0.78fr]">
      <Card className="relative overflow-hidden p-7 lg:p-8">
        <div className="absolute inset-y-0 left-0 w-px bg-[linear-gradient(180deg,transparent,rgba(96,165,250,0.45),transparent)]" />
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary-strong)]">Vault centerpiece</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white lg:text-5xl">{vault.projectName}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
              Shared capital sits in one pool, milestones define unlock logic, evidence proves execution, and AI review
              decides whether the next tranche deserves to move.
            </p>
          </div>

          <Badge className="self-start" variant={getStatusVariant(nextMilestone.status)}>{getStatusLabel(nextMilestone.status)}</Badge>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <div className="border border-[var(--color-border)] bg-[rgba(255,255,255,0.025)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Total pool</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white">{vault.totalAmount} SOL</p>
          </div>
          <div className="border border-[var(--color-border)] bg-[rgba(255,255,255,0.025)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Released capital</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white">{vault.releasedAmount} SOL</p>
          </div>
          <div className="border border-[var(--color-border)] bg-[rgba(255,255,255,0.025)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Remaining capital</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white">{remainingCapital} SOL</p>
          </div>
        </div>

        {reviewError ? (
          <div className="mt-6 border border-[rgba(248,113,113,0.16)] bg-[rgba(248,113,113,0.08)] p-4">
            <p className="text-sm font-semibold text-[rgb(248,113,113)]">{reviewError}</p>
          </div>
        ) : null}

        {unlockMessage ? (
          <div className="mt-6 border border-[rgba(34,197,94,0.16)] bg-[rgba(34,197,94,0.08)] p-4 shadow-[0_0_28px_rgba(34,197,94,0.08)]">
            <p className="text-sm font-semibold text-[var(--color-success)]">{unlockMessage}</p>
          </div>
        ) : null}

        <div className="mt-10">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-primary-strong)]">Milestone review lane</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Evidence and verdicts</h2>
            </div>
            <span className="text-sm text-[var(--color-muted)]">{vault.contributors.length} contributors</span>
          </div>

          <div className="mt-5 grid gap-4">
            {vault.milestones.map((milestone, index) => {
              const canUnlock = milestone.status === "approved" && milestone.verdict?.status === "APPROVE";
              const isHighlighted = highlightMilestoneId === milestone.id;

              return (
                <div
                  key={milestone.id}
                  className={[
                    "border border-[var(--color-border)] bg-[rgba(255,255,255,0.02)] p-5 transition duration-300",
                    isHighlighted ? "shadow-[0_0_0_1px_rgba(34,197,94,0.2),0_0_40px_rgba(34,197,94,0.12)] border-[rgba(34,197,94,0.26)]" : "",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        Milestone {index + 1}
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{milestone.title}</h3>
                    </div>
                    <Badge variant={getStatusVariant(milestone.status)}>{getStatusLabel(milestone.status)}</Badge>
                  </div>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">{milestone.description}</p>

                  <div className="mt-5 grid gap-3 border-t border-[var(--color-border)] pt-5 md:grid-cols-2">
                    <div className="border border-[var(--color-border)] bg-[rgba(255,255,255,0.025)] p-4 text-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">Tranche amount</p>
                      <p className="mt-2 text-lg font-semibold text-white">{milestone.trancheAmount} SOL</p>
                    </div>
                    <div className="border border-[var(--color-border)] bg-[rgba(255,255,255,0.025)] p-4 text-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">Evidence submissions</p>
                      <p className="mt-2 text-lg font-semibold text-white">{milestone.evidenceSubmissions.length}</p>
                    </div>
                  </div>

                  {milestone.evidenceSubmissions.length > 0 ? (
                    <div className="mt-5 border-t border-[var(--color-border)] pt-5">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-primary-strong)]">
                          Evidence submissions
                        </h4>
                        <Link className="text-sm font-semibold text-[var(--color-primary-strong)]" href="/submit-progress">
                          Add more proof
                        </Link>
                      </div>

                      <div className="mt-4 grid gap-3">
                        {milestone.evidenceSubmissions.map((submission) => (
                          <div key={submission.id} className="border border-[var(--color-border)] bg-[rgba(255,255,255,0.025)] p-4">
                            <p className="text-sm font-semibold leading-7 text-white">{submission.summary}</p>
                            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                              {new Date(submission.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-5 border-t border-[var(--color-border)] pt-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-[rgba(255,255,255,0.025)] p-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-strong)]">AI reviewer</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                          Run the strict judging prompt against the latest evidence bundle.
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:items-end">
                        <Button
                          disabled={milestone.evidenceSubmissions.length === 0 || reviewingMilestoneId === milestone.id || milestone.status === "unlocked"}
                          onClick={() => handleReviewWithAi(milestone.id)}
                          type="button"
                        >
                          {reviewingMilestoneId === milestone.id ? "Reviewing..." : "Review with AI"}
                        </Button>
                        {milestone.status !== "approved" && milestone.status !== "unlocked" ? (
                          <button
                            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-warning)] transition hover:text-white"
                            onClick={() => handleForceApprove(milestone.id)}
                            type="button"
                          >
                            Force approve (demo)
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {milestone.verdict ? (
                    <div className="mt-5 border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(15,19,26,0.98),rgba(10,13,18,0.96))] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">Decision output</p>
                          <div className="mt-3 flex items-center gap-3">
                            <Badge className="px-3 py-1.5 text-[11px]" variant={getVerdictVariant(milestone.verdict.status)}>{milestone.verdict.status}</Badge>
                            <p className="text-sm font-semibold text-white">
                              AI confidence: {Math.round(milestone.verdict.confidence * 100)}%
                            </p>
                          </div>
                        </div>
                        {canUnlock ? (
                          <Button
                            className={unlockingMilestoneId === milestone.id ? "shadow-none" : "shadow-[0_0_24px_rgba(34,197,94,0.12)]"}
                            onClick={() => handleUnlockTranche(milestone.id)}
                            type="button"
                          >
                            {unlockingMilestoneId === milestone.id ? "Executing on-chain action..." : "Unlock Tranche"}
                          </Button>
                        ) : null}
                      </div>
                      <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">{milestone.verdict.explanation}</p>
                      {(milestone.verdict.matchedSignals.length > 0 || milestone.verdict.missingSignals.length > 0) ? (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-strong)]">Matched signals</p>
                            <div className="mt-3 space-y-2">
                              {milestone.verdict.matchedSignals.length > 0 ? milestone.verdict.matchedSignals.map((signal) => (
                                <div key={signal} className="border border-[rgba(34,197,94,0.16)] bg-[rgba(34,197,94,0.06)] px-3 py-2 text-sm text-[var(--color-foreground)]">
                                  {signal}
                                </div>
                              )) : <p className="text-sm text-[var(--color-muted)]">No matched signals returned.</p>}
                            </div>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-warning)]">Missing signals</p>
                            <div className="mt-3 space-y-2">
                              {milestone.verdict.missingSignals.length > 0 ? milestone.verdict.missingSignals.map((signal) => (
                                <div key={signal} className="border border-[rgba(217,164,65,0.16)] bg-[rgba(217,164,65,0.06)] px-3 py-2 text-sm text-[var(--color-foreground)]">
                                  {signal}
                                </div>
                              )) : <p className="text-sm text-[var(--color-muted)]">No missing signals returned.</p>}
                            </div>
                          </div>
                        </div>
                      ) : null}
                      {milestone.status === "unlocked" ? (
                        <div className="mt-4 border border-[rgba(34,197,94,0.18)] bg-[rgba(34,197,94,0.08)] p-4 shadow-[0_0_24px_rgba(34,197,94,0.08)]">
                          <p className="text-sm font-semibold text-[var(--color-success)]">{milestone.trancheAmount} SOL released</p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid gap-6">
        <Card className="h-fit p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-strong)]">
            Next unlock decision
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">{nextMilestone.trancheAmount} SOL</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">{nextMilestone.description}</p>

          <div className="mt-6 flex flex-col gap-3">
            <Button href="/submit-progress">Submit more evidence</Button>
            <Button type="button" variant="secondary">
              Simulate tranche unlock
            </Button>
          </div>
        </Card>

        <Card className="h-fit p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-strong)]">Activity</p>
          <div className="mt-4 space-y-3">
            {activity.length > 0 ? activity.map((item) => (
              <div key={item.id} className="border border-[var(--color-border)] bg-[rgba(255,255,255,0.025)] p-4">
                <div className="flex items-center gap-3">
                  <Badge variant={item.tone}>{item.tone}</Badge>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{item.detail}</p>
              </div>
            )) : (
              <p className="text-sm leading-6 text-[var(--color-muted)]">No activity yet. Submit evidence, run AI review, and unlock a tranche to populate the log.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

