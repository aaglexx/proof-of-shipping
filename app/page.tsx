import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VaultPreviewCard } from "@/components/vault/vault-preview-card";
import { listVaults } from "@/lib/store/vault-store";

export default function HomePage() {
  const vaults = listVaults();
  const totalPool = vaults.reduce((sum, vault) => sum + vault.totalAmount, 0);
  const totalReleased = vaults.reduce((sum, vault) => sum + vault.releasedAmount, 0);
  const pendingMilestones = vaults.reduce(
    (sum, vault) => sum + vault.milestones.filter((milestone) => milestone.status === "pending").length,
    0,
  );

  const heroStats = [
    { label: "Vaults", value: String(vaults.length) },
    { label: "Capital pooled", value: `${totalPool} SOL` },
    { label: "Released", value: `${totalReleased} SOL` },
    { label: "Pending milestones", value: String(pendingMilestones) },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 pb-10 lg:gap-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="relative overflow-hidden p-8 sm:p-10">
          <div className="absolute inset-y-0 left-0 w-px bg-[linear-gradient(180deg,transparent,rgba(96,165,250,0.45),transparent)]" />
          <div className="absolute right-8 top-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.14),transparent_70%)] blur-2xl" />
          <div className="relative max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--color-primary-strong)]">
              Milestone-native capital orchestration
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-[-0.07em] text-white sm:text-6xl lg:text-7xl">
              AI releases capital when teams actually ship
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              Shared vaults collect capital, builders attach proof, and an AI reviewer decides whether the next
              onchain tranche deserves to move.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button className="shadow-[0_0_0_1px_rgba(96,165,250,0.1),0_0_28px_rgba(59,130,246,0.14)]" href="/create-vault">
                Create Vault
              </Button>
              <Button href="/submit-progress" variant="secondary">
                Submit Progress
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {heroStats.map((stat) => (
            <Card key={stat.label} className="border-[rgba(96,165,250,0.08)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_12px_28px_rgba(0,0,0,0.24)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">{stat.label}</p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white">{stat.value}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-primary-strong)]">Live vaults</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Shared capital under review</h2>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vaults.map((vault) => (
          <VaultPreviewCard key={vault.id} vault={vault} />
        ))}
      </section>
    </div>
  );
}
