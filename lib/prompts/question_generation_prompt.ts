/**
 * Builds the question generation prompt that produces a tailored interview
 * question set from the structured extraction JSON.
 */
export function buildQuestionGenerationPrompt(
  extractedJson: string,
  originalNotes: string
): string {
  return `You are a patent interview specialist. Based on the structured invention analysis below, generate a tailored set of 12–20 interview questions that will gather the information needed to draft a strong US provisional patent application.

STRUCTURED INVENTION ANALYSIS:
${extractedJson}

ORIGINAL INVENTOR NOTES (for context):
${originalNotes.slice(0, 2000)}

REQUIREMENTS:
- Generate 12–20 questions ordered from high-level/conceptual to detailed/technical
- Cover these categories as appropriate: Background, Problem, Solution, Novelty, Components, Flow/Steps, Variations, Edge Cases, Claims Support, Drawings
- Skip categories where the inventor's notes already provide thorough detail
- Add extra depth to areas that are sparse or unclear in the notes
- Mark questions as required=true only if they are essential for a complete patent draft
- answerType: use "TEXT" for short answers (name, title), "BULLETS" for lists, "LONGTEXT" for detailed descriptions

Output ONLY a valid JSON array with no markdown fences or explanation:
[
  {
    "order": 1,
    "category": "Background",
    "prompt": "The specific question to ask the inventor",
    "helpText": "Guidance or example to help the inventor answer well",
    "answerType": "TEXT" | "BULLETS" | "LONGTEXT",
    "required": true | false
  }
]`;
}
