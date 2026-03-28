export type MilestoneStatus = "pending" | "approved" | "rejected" | "unlocked";

export type MilestoneVerdict = {
  status: "APPROVE" | "REJECT" | "NEED_MORE_EVIDENCE";
  confidence: number;
  explanation: string;
  matchedSignals: string[];
  missingSignals: string[];
};

export type EvidenceSubmission = {
  id: string;
  milestoneId: string;
  summary: string;
  prTitle?: string;
  diffSummary?: string;
  changelog?: string;
  demoNotes?: string;
  createdAt: string;
};

export type Milestone = {
  id: string;
  title: string;
  description: string;
  trancheAmount: number;
  status: MilestoneStatus;
  evidenceSubmissions: EvidenceSubmission[];
  verdict?: MilestoneVerdict;
};

export type Vault = {
  id: string;
  projectName: string;
  contributors: string[];
  totalAmount: number;
  releasedAmount: number;
  milestones: Milestone[];
};
