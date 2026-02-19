/**
 * High-level AI generation functions for patent drafting.
 *
 * DISCLAIMER: All AI-generated output is a preliminary draft for informational
 * and educational purposes only. It does NOT constitute legal advice and must
 * be reviewed by a registered patent attorney before filing.
 */

import path from "path";
import fs from "fs";
import { getAIProvider } from "./index";
import { buildDraftSectionsPrompt } from "@/lib/prompts/draft_sections_prompt";
import { buildClaimsPrompt } from "@/lib/prompts/claims_prompt";
import type { InterviewAnswers } from "@/types";

// ─── System prompt (lazy-loaded + cached) ────────────────────────────────────

let _systemPrompt: string | null = null;

function getSystemPrompt(): string {
  if (_systemPrompt) return _systemPrompt;
  const filePath = path.join(process.cwd(), "lib", "prompts", "system_patent_writer.txt");
  _systemPrompt = fs.readFileSync(filePath, "utf-8").trim();
  return _systemPrompt;
}

// ─── Valid section keys for draft sections (CLAIMS handled separately) ────────

const DRAFT_SECTION_KEYS = ["TITLE", "BACKGROUND", "SUMMARY", "DRAWINGS", "DETAILED_DESC", "ABSTRACT"] as const;
type DraftSectionKey = (typeof DRAFT_SECTION_KEYS)[number];

// ─── buildInventionContext ────────────────────────────────────────────────────

/**
 * Converts InterviewAnswers into a compact, structured JSON string that is
 * injected into each AI prompt as the invention disclosure context.
 */
export function buildInventionContext(answers: InterviewAnswers): string {
  const ctx = {
    // Step 1 — The Invention
    invention_title: answers.invention_title?.trim() || "Untitled Invention",
    one_sentence_summary: answers.one_sentence_summary?.trim() || "",
    problem_statement: answers.problem_statement?.trim() || "",
    // Step 2 — Prior Art & Novelty
    existing_solutions: answers.existing_solutions?.trim() || "",
    what_is_new: answers.what_is_new?.trim() || "",
    // Step 3 — How It Works
    core_components: answers.core_components?.trim() || "",
    system_overview: answers.system_overview?.trim() || "",
    main_flow_steps: answers.main_flow_steps?.trim() || "",
    alternative_variations: answers.alternative_variations?.trim() || "",
    // Step 4 — Technical Details
    key_parameters: answers.key_parameters?.trim() || "",
    data_inputs_outputs: answers.data_inputs_outputs?.trim() || "",
    edge_cases_failures: answers.edge_cases_failures?.trim() || "",
    // Step 5 — Value & Context
    advantages: answers.advantages?.trim() || "",
    example_use_case: answers.example_use_case?.trim() || "",
    user_roles: answers.user_roles?.trim() || "",
    deployment_environment: answers.deployment_environment?.trim() || "",
    // Step 6 — Compliance & Reference
    security_privacy: answers.security_privacy?.trim() || "",
    performance_constraints: answers.performance_constraints?.trim() || "",
    drawings_list: answers.drawings_list?.trim() || "",
    definitions_glossary: answers.definitions_glossary?.trim() || "",
  };
  return JSON.stringify(ctx, null, 2);
}

// ─── generateDraftSections ────────────────────────────────────────────────────

/**
 * Calls the AI to generate the 6 patent specification sections
 * (TITLE, BACKGROUND, SUMMARY, DRAWINGS, DETAILED_DESC, ABSTRACT).
 * Claims are generated separately via generateClaims().
 *
 * @param context - Output of buildInventionContext()
 * @returns Record mapping each section key to its generated content string
 */
export async function generateDraftSections(
  context: string
): Promise<Record<DraftSectionKey, string>> {
  const ai = getAIProvider();
  const raw = await ai.generateText({
    system: getSystemPrompt(),
    prompt: buildDraftSectionsPrompt(context),
    temperature: 0.4,
  });

  // Strip any accidental markdown fences
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```\s*$/, "").trim();

  let parsed: { sections: Record<string, string> };
  try {
    parsed = JSON.parse(cleaned) as { sections: Record<string, string> };
  } catch {
    throw new Error(
      `AI returned invalid JSON for draft sections. Raw output (first 300 chars): ${raw.slice(0, 300)}`
    );
  }

  // Only keep valid known keys; fill missing ones with an empty string
  const result = {} as Record<DraftSectionKey, string>;
  for (const key of DRAFT_SECTION_KEYS) {
    result[key] = (parsed.sections?.[key] ?? "").trim();
  }
  return result;
}

// ─── generateClaims ──────────────────────────────────────────────────────────

/**
 * Calls the AI to generate the numbered patent claims as plain text.
 * Lower temperature (0.3) for more deterministic, rule-compliant output.
 *
 * @param context - Output of buildInventionContext()
 * @returns Numbered claims as a plain-text string
 */
export async function generateClaims(context: string): Promise<string> {
  const ai = getAIProvider();
  const raw = await ai.generateText({
    system: getSystemPrompt(),
    prompt: buildClaimsPrompt(context),
    temperature: 0.3,
  });
  return raw.trim();
}
