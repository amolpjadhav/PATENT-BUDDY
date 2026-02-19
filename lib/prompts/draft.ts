import { InterviewAnswers } from "@/types";

export const DRAFT_SYSTEM_PROMPT = `You are a patent drafting assistant helping solo inventors write US provisional patent applications.
Write clear, detailed, legally structured patent specification sections using consistent terminology.
Write in formal patent language. Do NOT provide legal advice — this is a draft for informational purposes only.
Mark all outputs as CONFIDENTIAL.`;

export function buildDraftPrompt(answers: InterviewAnswers): string {
  return `Based on the following invention disclosure, generate a complete US provisional patent application.

INVENTION DETAILS:
Title: ${answers.invention_title ?? "Untitled Invention"}
Summary: ${answers.one_sentence_summary ?? "Not specified"}
Problem Solved: ${answers.problem_statement ?? "Not specified"}
Existing Solutions / Prior Art: ${answers.existing_solutions ?? "Not specified"}
Novel Aspects: ${answers.what_is_new ?? "Not specified"}
Core Components: ${answers.core_components ?? "Not specified"}
System Overview / How It Works: ${answers.system_overview ?? "Not specified"}
Step-by-Step Process: ${answers.main_flow_steps ?? "Not specified"}
Alternative Variations: ${answers.alternative_variations ?? "Not specified"}
Key Parameters & Specs: ${answers.key_parameters ?? "Not specified"}
Inputs & Outputs: ${answers.data_inputs_outputs ?? "Not specified"}
Edge Cases & Failure Modes: ${answers.edge_cases_failures ?? "Not specified"}
Advantages: ${answers.advantages ?? "Not specified"}
Example Use Case: ${answers.example_use_case ?? "Not specified"}
User Roles: ${answers.user_roles ?? "Not specified"}
Deployment Environment: ${answers.deployment_environment ?? "Not specified"}
Security & Privacy: ${answers.security_privacy ?? "Not specified"}
Performance Constraints: ${answers.performance_constraints ?? "Not specified"}
Drawings: ${answers.drawings_list ?? "Not specified"}
Definitions: ${answers.definitions_glossary ?? "Not specified"}

Generate EXACTLY this JSON structure (no markdown fences):
{
  "sections": [
    {
      "sectionKey": "TITLE",
      "content": "A short, descriptive title for the invention"
    },
    {
      "sectionKey": "BACKGROUND",
      "content": "2-4 paragraphs: the technical field, the problem, and shortcomings of existing solutions"
    },
    {
      "sectionKey": "SUMMARY",
      "content": "2-3 paragraphs summarizing the invention and its key benefits"
    },
    {
      "sectionKey": "DRAWINGS",
      "content": "Brief description of figures, e.g. 'FIG. 1 is a perspective view...'. If no drawings, write: 'No drawings are included with this provisional application.'"
    },
    {
      "sectionKey": "DETAILED_DESC",
      "content": "4-8 detailed paragraphs covering all components, how they interact, and all embodiments. Use reference numerals consistently, e.g. 'housing (100)', 'sensor module (102)'. This is the most important section."
    },
    {
      "sectionKey": "ABSTRACT",
      "content": "One paragraph, 150 words max, summarizing the invention"
    },
    {
      "sectionKey": "CLAIMS",
      "content": "Full numbered claim set. Format:\n1. A [device/method/system] comprising: ...\n2. The [device/method/system] of claim 1, wherein ...\n\nRules: 1-3 broad independent claims using 'comprising'; 4-8 narrowing dependent claims. Use exact terms from DETAILED_DESC. Each claim is one sentence ending with a period."
    }
  ]
}

Return ONLY valid JSON.`;
}
