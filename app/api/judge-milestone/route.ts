import { NextResponse } from "next/server";

import type { MilestoneVerdict } from "@/lib/domain/types";
import { getVaultById, setMilestoneVerdict } from "@/lib/store";

const OPENAI_MODEL = "gpt-4o-mini";

const verdictSchema = {
  type: "object",
  additionalProperties: false,
  required: ["status", "confidence", "explanation", "matchedSignals", "missingSignals"],
  properties: {
    status: {
      type: "string",
      enum: ["APPROVE", "REJECT", "NEED_MORE_EVIDENCE"],
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
    explanation: {
      type: "string",
    },
    matchedSignals: {
      type: "array",
      items: { type: "string" },
    },
    missingSignals: {
      type: "array",
      items: { type: "string" },
    },
  },
};

function fallbackVerdict(explanation: string): MilestoneVerdict {
  return {
    status: "NEED_MORE_EVIDENCE",
    confidence: 0.2,
    explanation,
    matchedSignals: [],
    missingSignals: ["Structured AI verdict was unavailable or incomplete."],
  };
}

function parseVerdictPayload(value: unknown): MilestoneVerdict | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<MilestoneVerdict>;

  if (
    (candidate.status !== "APPROVE" && candidate.status !== "REJECT" && candidate.status !== "NEED_MORE_EVIDENCE") ||
    typeof candidate.confidence !== "number" ||
    typeof candidate.explanation !== "string" ||
    !Array.isArray(candidate.matchedSignals) ||
    !Array.isArray(candidate.missingSignals)
  ) {
    return null;
  }

  return {
    status: candidate.status,
    confidence: Math.max(0, Math.min(1, candidate.confidence)),
    explanation: candidate.explanation,
    matchedSignals: candidate.matchedSignals.filter((item): item is string => typeof item === "string"),
    missingSignals: candidate.missingSignals.filter((item): item is string => typeof item === "string"),
  };
}

function extractText(responseBody: Record<string, unknown>) {
  if (typeof responseBody.output_text === "string" && responseBody.output_text.trim()) {
    return responseBody.output_text;
  }

  const output = Array.isArray(responseBody.output) ? responseBody.output : [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const content = Array.isArray((item as { content?: unknown[] }).content) ? (item as { content: unknown[] }).content : [];

    for (const part of content) {
      if (!part || typeof part !== "object") {
        continue;
      }

      const text = (part as { text?: unknown }).text;
      if (typeof text === "string" && text.trim()) {
        return text;
      }
    }
  }

  return "";
}

export async function POST(request: Request) {
  const { vaultId, milestoneId } = (await request.json()) as {
    vaultId?: string;
    milestoneId?: string;
  };

  if (!vaultId || !milestoneId) {
    return NextResponse.json({ error: "vaultId and milestoneId are required" }, { status: 400 });
  }

  const vault = getVaultById(vaultId);

  if (!vault) {
    return NextResponse.json({ error: "Vault not found" }, { status: 404 });
  }

  const milestone = vault.milestones.find((item) => item.id === milestoneId);

  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  const latestEvidence = milestone.evidenceSubmissions[milestone.evidenceSubmissions.length - 1];

  if (!latestEvidence) {
    const verdict = fallbackVerdict("No evidence submission was found for this milestone.");
    setMilestoneVerdict(vaultId, milestoneId, verdict);
    return NextResponse.json({ verdict });
  }

  if (!process.env.OPENAI_API_KEY) {
    const verdict = fallbackVerdict("OPENAI_API_KEY is not configured, so AI review could not run.");
    setMilestoneVerdict(vaultId, milestoneId, verdict);
    return NextResponse.json({ verdict });
  }

  const systemPrompt =
    "You are an AI evaluating whether a startup has completed a milestone and deserves release of funds from a decentralized funding pool. Be strict. Only approve if real, concrete progress is clearly demonstrated.";

  const userPrompt = [
    "Milestone:",
    `Title: ${milestone.title}`,
    `Description: ${milestone.description}`,
    "",
    "Evidence:",
    `Summary: ${latestEvidence.summary}`,
    `PR title: ${latestEvidence.prTitle ?? "Not provided"}`,
    `Diff summary: ${latestEvidence.diffSummary ?? "Not provided"}`,
    `Changelog: ${latestEvidence.changelog ?? "Not provided"}`,
    `Demo notes: ${latestEvidence.demoNotes ?? "Not provided"}`,
    "",
    "Return STRICT JSON:",
    JSON.stringify(
      {
        status: "APPROVE | REJECT | NEED_MORE_EVIDENCE",
        confidence: 0.5,
        explanation: "string",
        matchedSignals: ["string"],
        missingSignals: ["string"],
      },
      null,
      2,
    ),
  ].join("\n");

  let verdict = fallbackVerdict("AI review returned an invalid response.");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: [
          { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
          { role: "user", content: [{ type: "input_text", text: userPrompt }] },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "milestone_verdict",
            schema: verdictSchema,
            strict: true,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      verdict = fallbackVerdict(`OpenAI request failed: ${errorText || response.statusText}`);
    } else {
      const responseBody = (await response.json()) as Record<string, unknown>;
      const rawText = extractText(responseBody);

      try {
        const parsed = parseVerdictPayload(JSON.parse(rawText));
        verdict = parsed ?? fallbackVerdict("AI review returned JSON that did not match the required verdict schema.");
      } catch {
        verdict = fallbackVerdict("AI review returned non-JSON output, so more evidence is required.");
      }
    }
  } catch (error) {
    verdict = fallbackVerdict(
      error instanceof Error ? `AI review failed: ${error.message}` : "AI review failed unexpectedly.",
    );
  }

  setMilestoneVerdict(vaultId, milestoneId, verdict);

  return NextResponse.json({ verdict });
}
