import type { EvidenceSubmission, Milestone, MilestoneVerdict, Vault } from "@/lib/domain/types";

type CreateVaultInput = {
  id?: string;
  projectName: string;
  contributors?: string[];
  totalAmount?: number;
  milestone: {
    id?: string;
    title: string;
    description: string;
    trancheAmount: number;
  };
};

type SubmitEvidenceInput = Omit<EvidenceSubmission, "id" | "milestoneId" | "createdAt"> & {
  id?: string;
  createdAt?: string;
};

const vaults: Vault[] = [];

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function findVault(vaultId: string) {
  return vaults.find((vault) => vault.id === vaultId);
}

function findMilestone(vault: Vault, milestoneId: string) {
  return vault.milestones.find((milestone) => milestone.id === milestoneId);
}

export function createVault(data: CreateVaultInput) {
  const milestone: Milestone = {
    id: data.milestone.id ?? createId("milestone"),
    title: data.milestone.title,
    description: data.milestone.description,
    trancheAmount: data.milestone.trancheAmount,
    status: "pending",
    evidenceSubmissions: [],
  };

  const vault: Vault = {
    id: data.id ?? createId("vault"),
    projectName: data.projectName,
    contributors: data.contributors ?? [],
    totalAmount: data.totalAmount ?? 0,
    releasedAmount: 0,
    milestones: [milestone],
  };

  vaults.push(vault);
  return vault;
}

export function getVaultById(id: string) {
  return findVault(id);
}

export function listVaults() {
  return vaults;
}

export function depositToVault(vaultId: string, contributor: string, amount: number) {
  const vault = findVault(vaultId);

  if (!vault) {
    throw new Error(`Vault not found: ${vaultId}`);
  }

  if (!vault.contributors.includes(contributor)) {
    vault.contributors.push(contributor);
  }

  vault.totalAmount += amount;
  return vault;
}

export function submitEvidence(vaultId: string, milestoneId: string, evidence: SubmitEvidenceInput) {
  const vault = findVault(vaultId);

  if (!vault) {
    throw new Error(`Vault not found: ${vaultId}`);
  }

  const milestone = findMilestone(vault, milestoneId);

  if (!milestone) {
    throw new Error(`Milestone not found: ${milestoneId}`);
  }

  const submission: EvidenceSubmission = {
    id: evidence.id ?? createId("evidence"),
    milestoneId,
    summary: evidence.summary,
    prTitle: evidence.prTitle,
    diffSummary: evidence.diffSummary,
    changelog: evidence.changelog,
    demoNotes: evidence.demoNotes,
    createdAt: evidence.createdAt ?? new Date().toISOString(),
  };

  milestone.evidenceSubmissions.push(submission);
  return submission;
}

export function setMilestoneVerdict(vaultId: string, milestoneId: string, verdict: MilestoneVerdict) {
  const vault = findVault(vaultId);

  if (!vault) {
    throw new Error(`Vault not found: ${vaultId}`);
  }

  const milestone = findMilestone(vault, milestoneId);

  if (!milestone) {
    throw new Error(`Milestone not found: ${milestoneId}`);
  }

  milestone.verdict = verdict;

  if (verdict.status === "APPROVE") {
    milestone.status = "approved";
  }

  if (verdict.status === "REJECT") {
    milestone.status = "rejected";
  }

  return milestone;
}

export function unlockTranche(vaultId: string, milestoneId: string) {
  const vault = findVault(vaultId);

  if (!vault) {
    throw new Error(`Vault not found: ${vaultId}`);
  }

  const milestone = findMilestone(vault, milestoneId);

  if (!milestone) {
    throw new Error(`Milestone not found: ${milestoneId}`);
  }

  if (milestone.status !== "approved") {
    throw new Error(`Milestone is not approved: ${milestoneId}`);
  }

  vault.releasedAmount += milestone.trancheAmount;
  milestone.status = "unlocked";

  return vault;
}

const demoVault = createVault({
  id: "vault-ai-wallet-startup",
  projectName: "AI Wallet Startup",
  contributors: ["user1", "user2"],
  totalAmount: 10,
  milestone: {
    id: "milestone-wallet-connect-dashboard",
    title: "Ship wallet connect + dashboard",
    description: "Release wallet connection, a usable dashboard, and enough evidence for AI-based milestone review.",
    trancheAmount: 2,
  },
});

submitEvidence(demoVault.id, demoVault.milestones[0].id, {
  summary: "Wallet connect flow is integrated and the dashboard shell is ready for review.",
  prTitle: "feat: ship wallet connect and dashboard foundation",
  diffSummary: "Adds wallet session flow, dashboard route, and transaction summary widgets.",
  changelog: "Users can connect a wallet and view a lightweight treasury dashboard.",
  demoNotes: "Demo runs locally with seeded vault data and placeholder verdict logic.",
  createdAt: "2026-03-28T00:19:07.000Z",
});
