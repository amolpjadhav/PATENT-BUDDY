/**
 * Builds the extraction prompt that distills freeform inventor notes
 * (+ optional PDF text and voice transcript) into a structured JSON object.
 */
export function buildExtractionPrompt(
  notes: string,
  pdfText?: string,
  transcript?: string
): string {
  const sections: string[] = [`INVENTOR NOTES:\n${notes.trim()}`];
  if (pdfText?.trim()) sections.push(`PDF DOCUMENT TEXT:\n${pdfText.trim()}`);
  if (transcript?.trim()) sections.push(`VOICE TRANSCRIPT:\n${transcript.trim()}`);

  return `You are a patent intake specialist. An inventor has provided the following raw description of their invention. Extract the key technical signals and output ONLY a valid JSON object with exactly these keys. Use "unknown" for any field not evident in the input — never omit a key.

${sections.join("\n\n---\n\n")}

Output exactly this JSON structure (no markdown, no explanation):
{
  "problem": "The specific problem or pain point this invention solves",
  "solution": "The core technical solution / what the invention is",
  "novelty": "What is genuinely new or non-obvious about this invention",
  "system_components": "Major physical or logical components of the invention",
  "method_steps": "Step-by-step process or method if applicable",
  "alternatives": "Alternative configurations or embodiments mentioned",
  "advantages": "Concrete benefits over existing solutions",
  "use_cases": "Real-world scenarios where this invention would be used",
  "keywords": "Key technical terms and domain keywords",
  "potential_prior_art": "Existing products, patents, or approaches that might be similar"
}`;
}
