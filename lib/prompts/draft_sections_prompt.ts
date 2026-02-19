/**
 * Prompt builder for the 6 patent specification sections.
 * CLAIMS are generated separately via claims_prompt.ts.
 *
 * Returns JSON: { "sections": { "TITLE": "...", "BACKGROUND": "...", ... } }
 *
 * DISCLAIMER: Output is a draft for informational purposes only — not legal advice.
 */

export function buildDraftSectionsPrompt(context: string): string {
  return `\
You are drafting the specification sections of a US provisional patent application.

INVENTION DISCLOSURE (JSON):
${context}

Generate EXACTLY the following 6 patent specification sections as a single JSON object.
The JSON must have a top-level key "sections" containing exactly these keys:
TITLE, BACKGROUND, SUMMARY, DRAWINGS, DETAILED_DESC, ABSTRACT.

────────────────────────────────────────────────────────
SECTION REQUIREMENTS
────────────────────────────────────────────────────────

TITLE
  • 5–15 words. Descriptive. No articles ("A", "An") at the start. No quotation marks.
  • Example: "Gravity-Fed Moisture-Responsive Plant Watering System"

BACKGROUND
  • 3–5 paragraphs. Use present tense.
  • Paragraph 1: Technical field (one sentence, "The present invention relates to…").
  • Paragraph 2–3: Problem description. Who experiences it? How often? What are the consequences?
  • Paragraph 4–5: Shortcomings of existing solutions. Be specific; do NOT describe the invention yet.
  • Separate paragraphs with a blank line (\\n\\n).

SUMMARY
  • 2–3 paragraphs. Briefly describe the invention and key advantages.
  • Start with: "The present invention provides…"
  • Do NOT repeat claims verbatim. Do NOT include reference numerals.
  • Separate paragraphs with a blank line (\\n\\n).

DRAWINGS
  • One sentence per figure: "FIG. N is a [type] view of [subject]."
  • Use the figures listed in drawings_list. If none, write: "No drawings are included with this provisional application."
  • Separate figures with a newline (\\n).

DETAILED_DESC
  • 6–10 paragraphs. This is the MOST IMPORTANT section — be thorough.
  • Assign reference numerals to ALL physical components: component (numeral), e.g., "reservoir (100)".
  • Cover: all components and their functions; how components interact; complete operating cycle;
    all embodiments described by the inventor; edge cases and failure modes.
  • Use EXACT component names consistently across all paragraphs.
  • Separate paragraphs with a blank line (\\n\\n).

ABSTRACT
  • One paragraph, 150 words maximum.
  • Summarise the invention and its principal advantages.
  • Do NOT include reference numerals.
  • End with: "(CONFIDENTIAL — Draft for informational purposes only. Not legal advice.)"

────────────────────────────────────────────────────────
DISCLAIMER REMINDER
────────────────────────────────────────────────────────
This draft is for informational purposes only and does not constitute legal advice.
All content must be reviewed by a registered patent attorney before filing.

────────────────────────────────────────────────────────
OUTPUT FORMAT — STRICT
────────────────────────────────────────────────────────
Return ONLY the following JSON (no markdown fences, no extra text before or after):

{
  "sections": {
    "TITLE": "...",
    "BACKGROUND": "...",
    "SUMMARY": "...",
    "DRAWINGS": "...",
    "DETAILED_DESC": "...",
    "ABSTRACT": "..."
  }
}`;
}
