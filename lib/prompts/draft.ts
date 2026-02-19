import { InterviewAnswers } from "@/types";

export const DRAFT_SYSTEM_PROMPT = `You are a patent drafting assistant helping solo inventors write US provisional patent applications.
You write clear, detailed, and legally structured patent specification sections.
Use consistent terminology throughout all sections.
Write in formal patent language but keep it understandable.
Do NOT provide legal advice - your output is a draft for informational purposes only.
IMPORTANT: Mark this as CONFIDENTIAL in all outputs.`;

export function buildDraftPrompt(answers: InterviewAnswers): string {
  return `Based on the following invention disclosure, generate a complete US provisional patent application specification.

INVENTION DETAILS:
Title: ${answers.inventionTitle ?? "Untitled Invention"}
Field: ${answers.inventionField ?? "Not specified"}
Problem Solved: ${answers.problemSolved ?? "Not specified"}
How It Works: ${answers.howItWorks ?? "Not specified"}
Key Components: ${answers.keyComponents ?? "Not specified"}
Key Steps/Process: ${answers.keySteps ?? "Not specified"}
Materials Used: ${answers.materials ?? "Not specified"}
Novel Aspects: ${answers.novelAspects ?? "Not specified"}
Advantages: ${answers.advantages ?? "Not specified"}
Differentiators from Prior Art: ${answers.differentiators ?? "Not specified"}
Primary Embodiment: ${answers.primaryEmbodiment ?? "Not specified"}
Alternative Embodiments: ${answers.alternativeEmbodiments ?? "Not specified"}
Optional Features: ${answers.optionalFeatures ?? "Not specified"}
Target Users: ${answers.targetUsers ?? "Not specified"}
Use Environment: ${answers.useEnvironment ?? "Not specified"}

Generate EXACTLY the following JSON structure with these sections:
{
  "sections": [
    {
      "type": "title",
      "title": "Title of Invention",
      "content": "...",
      "order": 0
    },
    {
      "type": "field",
      "title": "Field of the Invention",
      "content": "...",
      "order": 1
    },
    {
      "type": "background",
      "title": "Background of the Invention",
      "content": "...",
      "order": 2
    },
    {
      "type": "summary",
      "title": "Summary of the Invention",
      "content": "...",
      "order": 3
    },
    {
      "type": "brief_description",
      "title": "Brief Description",
      "content": "...",
      "order": 4
    },
    {
      "type": "detailed_description",
      "title": "Detailed Description of Embodiments",
      "content": "...",
      "order": 5
    },
    {
      "type": "abstract",
      "title": "Abstract",
      "content": "...",
      "order": 6
    }
  ]
}

Guidelines:
- Field: 1-2 sentences describing the technical field
- Background: 2-4 paragraphs describing the problem and existing solutions' shortcomings
- Summary: 2-3 paragraphs summarizing the invention and its benefits
- Brief Description: List figures if applicable, or note "no drawings" for text-only
- Detailed Description: This is the most important section. Write 4-8 detailed paragraphs covering all components, how they work together, and all embodiments. Use reference numerals like "first component (100)" consistently
- Abstract: 1 paragraph, 150 words max

Return ONLY valid JSON, no markdown fences.`;
}

export function buildClaimsPrompt(answers: InterviewAnswers, detailedDescription: string): string {
  return `Based on this invention and its detailed description, generate a patent claim set.

INVENTION TITLE: ${answers.inventionTitle ?? "Untitled"}
NOVEL ASPECTS: ${answers.novelAspects ?? "Not specified"}
KEY COMPONENTS: ${answers.keyComponents ?? "Not specified"}
HOW IT WORKS: ${answers.howItWorks ?? "Not specified"}

DETAILED DESCRIPTION (for consistency):
${detailedDescription.slice(0, 2000)}

Generate EXACTLY this JSON:
{
  "claims": [
    {
      "number": 1,
      "claimType": "independent",
      "content": "A [device/method/system] comprising: ...",
      "dependsOn": null
    },
    {
      "number": 2,
      "claimType": "dependent",
      "content": "The [device/method/system] of claim 1, wherein ...",
      "dependsOn": 1
    }
  ]
}

Rules:
- Write 1-3 independent claims covering different aspects (device, method, system if applicable)
- Write 3-8 dependent claims that narrow down specific features
- Independent claims must use "comprising" language
- Dependent claims must reference their parent claim explicitly
- Use the EXACT same terms as in the detailed description
- Each claim should be one sentence ending with a period
- Claim 1 is the broadest independent claim

Return ONLY valid JSON, no markdown fences.`;
}
