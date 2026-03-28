import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CreateVaultPage() {
  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[0.72fr_1.28fr]">
      <Card className="h-fit p-7">
        <Badge variant="primary">Vault setup</Badge>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white">Create a shared funding vault</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
          Define the project, pool size, and release rubric once. The structure stays intentionally lean so the next
          iteration can add AI judging and onchain unlock logic without a rewrite.
        </p>

        <div className="mt-8 grid gap-3">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[var(--color-muted)]">
            Mock repository adapter for vault persistence
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[var(--color-muted)]">
            OpenAI milestone judging endpoint
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[var(--color-muted)]">
            Tranche unlock action with wallet flow
          </div>
        </div>
      </Card>

      <Card className="p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-strong)]">New vault</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Funding configuration</h2>
          </div>
          <div className="rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
            Demo draft
          </div>
        </div>

        <form className="mt-8 grid gap-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[var(--color-foreground)]">
              Vault name
              <Input placeholder="Proof Treasury Vault" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[var(--color-foreground)]">
              Team name
              <Input placeholder="Alpha Builders" />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-[var(--color-foreground)]">
            Funding summary
            <Textarea placeholder="Describe the mandate, capital plan, and how milestone completion should influence tranche release." />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[var(--color-foreground)]">
              Initial tranche
              <Input placeholder="$10,000 or 2 SOL equivalent" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[var(--color-foreground)]">
              Success metric
              <Input placeholder="3 active pilots with weekly retention evidence" />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-[var(--color-foreground)]">
            Milestones
            <Textarea placeholder={"1. Ship wallet connect\n2. Deliver dashboard\n3. Prove retention with evidence"} />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button>Save Draft Vault</Button>
            <Button type="button" variant="secondary">
              Generate AI Rubric Later
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
