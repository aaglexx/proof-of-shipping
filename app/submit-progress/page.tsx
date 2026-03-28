"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { listVaults, submitEvidence } from "@/lib/store";

export default function SubmitProgressPage() {
  const vaults = listVaults();
  const [selectedVaultId, setSelectedVaultId] = useState(vaults[0]?.id ?? "");
  const selectedVault = vaults.find((vault) => vault.id === selectedVaultId) ?? vaults[0];
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(selectedVault?.milestones[0]?.id ?? "");
  const [summary, setSummary] = useState("");
  const [prTitle, setPrTitle] = useState("");
  const [diffSummary, setDiffSummary] = useState("");
  const [changelog, setChangelog] = useState("");
  const [demoNotes, setDemoNotes] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMilestone = selectedVault?.milestones.find((milestone) => milestone.id === selectedMilestoneId);
  const isSubmitDisabled = !summary.trim() || !selectedVault || !selectedMilestone || isSubmitting;

  function handleVaultChange(nextVaultId: string) {
    const nextVault = vaults.find((vault) => vault.id === nextVaultId);
    setSelectedVaultId(nextVaultId);
    setSelectedMilestoneId(nextVault?.milestones[0]?.id ?? "");
    setSuccessMessage("");
    setSubmitError("");
  }

  function resetForm() {
    setSummary("");
    setPrTitle("");
    setDiffSummary("");
    setChangelog("");
    setDemoNotes("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedVault || !selectedMilestone || !summary.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    const payload = {
      vaultId: selectedVault.id,
      milestoneId: selectedMilestone.id,
      summary: summary.trim(),
      prTitle: prTitle.trim() || undefined,
      diffSummary: diffSummary.trim() || undefined,
      changelog: changelog.trim() || undefined,
      demoNotes: demoNotes.trim() || undefined,
    };

    try {
      const response = await fetch("/api/submit-evidence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to submit progress.");
      }

      submitEvidence(payload.vaultId, payload.milestoneId, payload);
      resetForm();
      setSuccessMessage("Progress submitted. Ready for AI review.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit progress.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="p-7 lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="primary">Builder proof</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white">Submit milestone progress</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
              Package clear shipping evidence for the AI reviewer. Strong proof here increases confidence that the next
              tranche should actually move.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">Pipeline output</p>
            <p className="mt-2 text-sm font-semibold text-white">Evidence bundle</p>
          </div>
        </div>

        {successMessage ? (
          <div className="mt-6 rounded-[1.25rem] border border-[rgba(74,222,128,0.16)] bg-[rgba(74,222,128,0.08)] p-4">
            <p className="text-sm font-semibold text-[var(--color-success)]">{successMessage}</p>
            {selectedVault ? (
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Review it on the vault page:{" "}
                <Link className="font-semibold text-[var(--color-primary-strong)]" href={`/vault/${selectedVault.id}` as Route}>
                  Open vault
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        {submitError ? (
          <div className="mt-6 rounded-[1.25rem] border border-[rgba(248,113,113,0.16)] bg-[rgba(248,113,113,0.08)] p-4">
            <p className="text-sm font-semibold text-[rgb(248,113,113)]">{submitError}</p>
          </div>
        ) : null}

        <form className="mt-8 grid gap-7" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[var(--color-foreground)]">
              Vault
              <Select value={selectedVaultId} onChange={(event) => handleVaultChange(event.target.value)}>
                {vaults.map((vault) => (
                  <option key={vault.id} value={vault.id}>
                    {vault.projectName}
                  </option>
                ))}
              </Select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[var(--color-foreground)]">
              Milestone
              <Select value={selectedMilestoneId} onChange={(event) => setSelectedMilestoneId(event.target.value)}>
                {selectedVault?.milestones.map((milestone) => (
                  <option key={milestone.id} value={milestone.id}>
                    {milestone.title}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <div className="grid gap-5">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary-strong)]">Proof payload</h2>
              <span className="rounded-full border border-[rgba(251,191,36,0.14)] bg-[rgba(251,191,36,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-warning)]">
                Summary required
              </span>
            </div>

            <label className="grid gap-2 text-sm font-medium text-[var(--color-foreground)]">
              Progress summary *
              <Textarea
                className="min-h-36"
                placeholder="Describe exactly what shipped, what users can now do, and why this is enough evidence for milestone review."
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[var(--color-foreground)]">
                PR title
                <Input
                  placeholder="feat: ship wallet connect flow"
                  value={prTitle}
                  onChange={(event) => setPrTitle(event.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[var(--color-foreground)]">
                Changelog
                <Textarea
                  placeholder="User-facing capabilities or shipped improvements."
                  value={changelog}
                  onChange={(event) => setChangelog(event.target.value)}
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-[var(--color-foreground)]">
              Diff summary
              <Textarea
                placeholder="Highlight meaningful code changes and implementation signals."
                value={diffSummary}
                onChange={(event) => setDiffSummary(event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[var(--color-foreground)]">
              Demo notes / Loom transcript
              <Textarea
                placeholder="Paste demo notes, timestamps, or transcript fragments that help an evaluator verify the milestone fast."
                value={demoNotes}
                onChange={(event) => setDemoNotes(event.target.value)}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button disabled={isSubmitDisabled} type="submit">
              {isSubmitting ? "Submitting..." : "Submit Progress"}
            </Button>
            <p className="max-w-md text-sm leading-6 text-[var(--color-muted)]">
              Evidence is written to the in-memory vault immediately, so the AI review flow can be tested end-to-end.
            </p>
          </div>
        </form>
      </Card>

      <div className="grid gap-6">
        <Card className="h-fit p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-strong)]">Current target</p>
          {selectedVault && selectedMilestone ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">Vault</p>
                <p className="mt-2 text-xl font-semibold text-white">{selectedVault.projectName}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">Milestone</p>
                <p className="mt-2 text-lg font-semibold text-white">{selectedMilestone.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{selectedMilestone.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">Tranche</p>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedMilestone.trancheAmount} SOL</p>
                </div>
                <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">Evidence count</p>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedMilestone.evidenceSubmissions.length}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">Create a vault first to submit evidence.</p>
          )}
        </Card>

        <Card className="h-fit p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-strong)]">Strong submissions</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-muted)]">
            <p>State what changed in the product, not what the team spent time on.</p>
            <p>Reference implementation signals like PRs, shipped flows, and user-visible outputs.</p>
            <p>Include concise demo notes so judges and the AI reviewer can verify the milestone quickly.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
