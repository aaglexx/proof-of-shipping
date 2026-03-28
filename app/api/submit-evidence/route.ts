import { NextResponse } from "next/server";

import { submitEvidence } from "@/lib/store";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    vaultId?: string;
    milestoneId?: string;
    summary?: string;
    prTitle?: string;
    diffSummary?: string;
    changelog?: string;
    demoNotes?: string;
  };

  if (!body.vaultId || !body.milestoneId || !body.summary?.trim()) {
    return NextResponse.json({ error: "vaultId, milestoneId, and summary are required" }, { status: 400 });
  }

  try {
    const submission = submitEvidence(body.vaultId, body.milestoneId, {
      summary: body.summary.trim(),
      prTitle: body.prTitle?.trim() || undefined,
      diffSummary: body.diffSummary?.trim() || undefined,
      changelog: body.changelog?.trim() || undefined,
      demoNotes: body.demoNotes?.trim() || undefined,
    });

    return NextResponse.json({ submission });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit evidence" },
      { status: 400 },
    );
  }
}
