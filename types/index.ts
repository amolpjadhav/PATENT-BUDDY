export interface InterviewAnswers {
  // Step 0: Basic Info
  inventionTitle?: string;
  inventorName?: string;
  inventionField?: string;
  problemSolved?: string;

  // Step 1: How It Works
  howItWorks?: string;
  keyComponents?: string;
  keySteps?: string;
  materials?: string;

  // Step 2: Novel Aspects
  novelAspects?: string;
  advantages?: string;
  differentiators?: string;

  // Step 3: Embodiments
  primaryEmbodiment?: string;
  alternativeEmbodiments?: string;
  optionalFeatures?: string;

  // Step 4: Context
  targetUsers?: string;
  useEnvironment?: string;
  priorArtKnown?: string;
  priorArtDescription?: string;
}

export type SectionType =
  | "title"
  | "field"
  | "background"
  | "summary"
  | "brief_description"
  | "detailed_description"
  | "claims"
  | "abstract";

export interface SectionDraft {
  type: SectionType;
  title: string;
  content: string;
  order: number;
}

export interface ClaimDraft {
  number: number;
  claimType: "independent" | "dependent";
  content: string;
  dependsOn?: number;
}

export interface QualityIssue {
  severity: "error" | "warning" | "info";
  category: "antecedent_basis" | "term_consistency" | "missing_support" | "completeness";
  message: string;
  location?: string;
}

export interface ProjectWithRelations {
  id: string;
  token: string;
  title: string;
  inventorName: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  interview: {
    answers: string;
    currentStep: number;
    completed: boolean;
  } | null;
  sections: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    order: number;
    updatedAt: Date;
  }>;
  claims: Array<{
    id: string;
    number: number;
    claimType: string;
    content: string;
    dependsOn: number | null;
    updatedAt: Date;
  }>;
  qualityCheck: {
    results: string;
    runAt: Date;
  } | null;
}
