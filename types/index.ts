// ─── Section keys ────────────────────────────────────────────────────────────
export const SECTION_KEYS = [
  "TITLE",
  "BACKGROUND",
  "SUMMARY",
  "DRAWINGS",
  "DETAILED_DESC",
  "ABSTRACT",
  "CLAIMS",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_ORDER: SectionKey[] = [
  "TITLE",
  "BACKGROUND",
  "SUMMARY",
  "DRAWINGS",
  "DETAILED_DESC",
  "ABSTRACT",
  "CLAIMS",
];

export const SECTION_LABELS: Record<SectionKey, string> = {
  TITLE: "Title of Invention",
  BACKGROUND: "Background of the Invention",
  SUMMARY: "Summary of the Invention",
  DRAWINGS: "Brief Description of Drawings",
  DETAILED_DESC: "Detailed Description of Embodiments",
  ABSTRACT: "Abstract",
  CLAIMS: "Claims",
};

// ─── Quality issue enums ──────────────────────────────────────────────────────
export const QUALITY_ISSUE_TYPES = [
  "TERM_INCONSISTENCY",
  "ANTECEDENT_BASIS",
  "MISSING_SUPPORT",
  "VAGUE_TERM",
] as const;

export type QualityIssueType = (typeof QUALITY_ISSUE_TYPES)[number];

export const QUALITY_SEVERITIES = ["LOW", "MED", "HIGH"] as const;
export type QualityIssueSeverity = (typeof QUALITY_SEVERITIES)[number];

// ─── Interview answers ────────────────────────────────────────────────────────
// Keys must match the `key` fields in /lib/interview/questions.ts
export interface InterviewAnswers {
  // Step 1 — The Invention
  invention_title?: string;
  one_sentence_summary?: string;
  problem_statement?: string;
  // Step 2 — Prior Art & Novelty
  existing_solutions?: string;
  what_is_new?: string;
  // Step 3 — How It Works
  core_components?: string;
  system_overview?: string;
  main_flow_steps?: string;
  alternative_variations?: string;
  // Step 4 — Technical Details
  key_parameters?: string;
  data_inputs_outputs?: string;
  edge_cases_failures?: string;
  // Step 5 — Value & Context
  advantages?: string;
  example_use_case?: string;
  user_roles?: string;
  deployment_environment?: string;
  // Step 6 — Compliance & Reference
  security_privacy?: string;
  performance_constraints?: string;
  drawings_list?: string;
  definitions_glossary?: string;
}

// ─── DB row shapes ────────────────────────────────────────────────────────────
export interface DraftSectionRow {
  id: string;
  projectId: string;
  sectionKey: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityIssueRow {
  id: string;
  projectId: string;
  type: string;
  severity: string;
  message: string;
  metadata: string;
  createdAt: Date;
}

export interface InterviewAnswerRow {
  id: string;
  projectId: string;
  questionKey: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Action input types ───────────────────────────────────────────────────────
export interface QualityIssueInput {
  type: QualityIssueType;
  severity: QualityIssueSeverity;
  message: string;
  metadata?: Record<string, unknown>;
}

// ─── Intake pipeline types ────────────────────────────────────────────────────

export interface ExtractedInventionJson {
  problem: string;
  solution: string;
  novelty: string;
  system_components: string;
  method_steps: string;
  alternatives: string;
  advantages: string;
  use_cases: string;
  keywords: string;
  potential_prior_art: string;
}

export type ArtifactType = "NOTES" | "PDF" | "AUDIO" | "VIDEO" | "TRANSCRIPT";
export type AnswerType = "TEXT" | "BULLETS" | "LONGTEXT";

export interface InterviewQuestionRow {
  id: string;
  projectId: string;
  order: number;
  category: string;
  prompt: string;
  helpText: string | null;
  answerType: AnswerType;
  required: boolean;
  createdAt: Date;
}

export interface GeneratedQuestion {
  order: number;
  category: string;
  prompt: string;
  helpText?: string;
  answerType: AnswerType;
  required: boolean;
}
