import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { buildQualityCheckPrompt } from "@/lib/prompts/quality";
import type { QualityIssue } from "@/types";
import type { Prisma } from "@prisma/client";

function getTokenList(req: NextRequest): string[] {
  const raw = req.cookies.get("patent_buddy_session")?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

type ProjectWithSectionsAndClaims = Prisma.ProjectGetPayload<{
  include: {
    sections: true;
    claims: true;
  };
}>;

// POST /api/quality/[id] - run quality checks
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const tokens = getTokenList(req);

  const project: ProjectWithSectionsAndClaims | null =
    await prisma.project.findUnique({
      where: { id },
      include: {
        sections: { orderBy: { order: "asc" } },
        claims: { orderBy: { number: "asc" } },
      },
    });

  if (!project || !tokens.includes(project.token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (project.sections.length === 0) {
    return NextResponse.json(
      { error: "No draft generated yet" },
      { status: 400 }
    );
  }

  const sectionsText = project.sections
    .map((s) => `[${s.title.toUpperCase()}]\n${s.content}`)
    .join("\n\n---\n\n");

  const claimsText = project.claims
    .map((c) => `Claim ${c.number}: ${c.content}`)
    .join("\n\n");

  const ai = getAIProvider();
  let issues: QualityIssue[] = [];

  try {
    const raw = await ai.complete(
      [
        {
          role: "system",
          content: "You are a patent quality checker. Return only valid JSON.",
        },
        {
          role: "user",
          content: buildQualityCheckPrompt(sectionsText, claimsText),
        },
      ],
      { temperature: 0.2, maxTokens: 2048 }
    );

    const cleaned = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed: unknown = JSON.parse(cleaned);

    // Be defensive about AI output shape
    const parsedIssues =
      typeof parsed === "object" &&
      parsed !== null &&
      "issues" in parsed &&
      Array.isArray((parsed as any).issues)
        ? ((parsed as any).issues as QualityIssue[])
        : [];

    issues = parsedIssues;
  } catch (err) {
    console.error("Quality check failed:", err);
    // Fall back to heuristic checks
    issues = runHeuristicChecks(project.sections, project.claims);
  }

  // Also run heuristic checks and merge
  const heuristicIssues = runHeuristicChecks(project.sections, project.claims);
  const allIssues = [...issues, ...heuristicIssues];

  // Deduplicate by message
  const seen = new Set<string>();
  const deduplicated = allIssues.filter((issue) => {
    if (seen.has(issue.message)) return false;
    seen.add(issue.message);
    return true;
  });

  // Save results
  await prisma.qualityCheck.upsert({
    where: { projectId: id },
    create: {
      projectId: id,
      results: JSON.stringify(deduplicated),
      runAt: new Date(),
    },
    update: {
      results: JSON.stringify(deduplicated),
      runAt: new Date(),
    },
  });

  return NextResponse.json({ issues: deduplicated });
}

function runHeuristicChecks(
  sections: Array<{ type: string; title: string; content: string }>,
  claims: Array<{ number: number; content: string }>
): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // Check required sections exist
  const requiredTypes = ["field", "background", "detailed_description", "abstract"];
  const existingTypes = new Set(sections.map((s) => s.type));

  for (const required of requiredTypes) {
    if (!existingTypes.has(required)) {
      issues.push({
        severity: "error",
        category: "completeness",
        message: `Missing required section: ${required.replace(/_/g, " ")}`,
      });
    }
  }

  // Check detailed description isn't too thin
  const detailedDesc = sections.find((s) => s.type === "detailed_description");
  if (detailedDesc && detailedDesc.content.length < 500) {
    issues.push({
      severity: "warning",
      category: "completeness",
      message:
        "Detailed description is very short. Consider adding more detail about how the invention works.",
      location: "Detailed Description",
    });
  }

  // Antecedent basis heuristic
  for (const claim of claims) {
    const theMatches = [
      ...claim.content.matchAll(
        /\bthe\s+([a-z][a-z\s]{1,30}?)(?:\s+of|\s+in|\s+for|[,;.])/gi
      ),
    ];
    const saidMatches = [
      ...claim.content.matchAll(
        /\bsaid\s+([a-z][a-z\s]{1,30}?)(?:\s+of|\s+in|\s+for|[,;.])/gi
      ),
    ];

    for (const match of [...theMatches, ...saidMatches]) {
      const term = match[1].trim().toLowerCase();

      const claimLower = claim.content.toLowerCase();
      const refIndex = claimLower.indexOf(match[0].toLowerCase());

      const aIndex = claimLower.indexOf(`a ${term}`);
      const anIndex = claimLower.indexOf(`an ${term}`);

      const hasAntecedent =
        (aIndex !== -1 && aIndex < refIndex) ||
        (anIndex !== -1 && anIndex < refIndex);

      if (
        !hasAntecedent &&
        term.length > 2 &&
        !["claim", "invention", "device", "method", "system"].includes(term)
      ) {
        issues.push({
          severity: "warning",
          category: "antecedent_basis",
          message: `Claim ${claim.number} may have antecedent basis issue with "${match[0].trim()}"`,
          location: `Claim ${claim.number}`,
        });
        break; // One warning per claim to avoid spam
      }
    }
  }

  // Check abstract length (note: 150 words ≠ 1500 chars; keeping your original heuristic but improving wording)
  const abstract = sections.find((s) => s.type === "abstract");
  if (abstract && abstract.content.length > 1500) {
    issues.push({
      severity: "info",
      category: "completeness",
      message:
        "Abstract may be too long. USPTO typically requires abstracts under ~150 words.",
      location: "Abstract",
    });
  }

  return issues;
}
