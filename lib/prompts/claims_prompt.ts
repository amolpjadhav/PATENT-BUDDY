/**
 * Prompt builder for the patent claims section.
 * Claims are generated separately from specification sections so the model
 * can focus exclusively on claim structure and breadth.
 *
 * Returns plain numbered text (not JSON).
 *
 * DISCLAIMER: Output is a draft for informational purposes only — not legal advice.
 */

export function buildClaimsPrompt(context: string): string {
  return `\
You are drafting the claims section of a US provisional patent application.

INVENTION DISCLOSURE (JSON):
${context}

Write a complete, well-structured patent claim set. Follow every rule below exactly.

────────────────────────────────────────────────────────
CLAIM DRAFTING RULES
────────────────────────────────────────────────────────

STRUCTURE
  • Write 1–3 INDEPENDENT claims (broad scope, stand alone).
  • Write 5–10 DEPENDENT claims that progressively narrow the independent claims.
  • Total claim count: 8–12 claims.

INDEPENDENT CLAIM FORMAT
  Each independent claim must follow this exact structure (one sentence, ending with a period):
  "[Claim number]. A [device / method / system / apparatus] comprising:
    [first element];
    [second element]; and
    [last element]."

  For METHOD claims use: "A method of [doing X], comprising: [step 1]; [step 2]; and [step N]."

DEPENDENT CLAIM FORMAT
  "[Claim number]. The [device / method / system] of claim [N], wherein [limitation]."

  For adding an element: "…further comprising [element]."

CRITICAL RULES
  1. EACH CLAIM IS EXACTLY ONE SENTENCE ending with a period.
  2. Use "comprising" for independent claims (open-ended — does not exclude additional elements).
  3. Use exact terminology from the DETAILED_DESC — do NOT introduce new terms.
  4. Claims must be fully supported by the invention disclosure above.
  5. Make independent claims as BROAD as the disclosure supports.
  6. Do NOT use "means for…" functional language without defining supporting structure.
  7. Do NOT include claim charts, explanations, commentary, or analysis — claims only.
  8. Number claims sequentially: 1, 2, 3, …
  9. Leave ONE blank line between each claim.
  10. If the invention is both a device AND a method, include at least one independent claim for each.

────────────────────────────────────────────────────────
DISCLAIMER (include verbatim as the final line)
────────────────────────────────────────────────────────
(CONFIDENTIAL — These claims are a preliminary draft for informational purposes only.
They do not constitute legal advice and must be reviewed by a registered patent attorney
or agent before filing with the USPTO or any other patent office.)

────────────────────────────────────────────────────────
OUTPUT FORMAT — STRICT
────────────────────────────────────────────────────────
Return ONLY the numbered claims followed by the disclaimer, as plain text.
No JSON. No markdown. No headers. No explanatory paragraphs.

Example format:
1. A [device] comprising: [element A]; [element B]; and [element C].

2. The [device] of claim 1, wherein [limitation].

3. The [device] of claim 1, further comprising [element].

(CONFIDENTIAL — These claims are a preliminary draft for informational purposes only.
They do not constitute legal advice and must be reviewed by a registered patent attorney
or agent before filing with the USPTO or any other patent office.)`;
}
