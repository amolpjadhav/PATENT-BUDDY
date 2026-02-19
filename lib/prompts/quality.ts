export function buildQualityCheckPrompt(draftText: string): string {
  return `You are a patent quality checker. Analyze the following patent draft and find real, specific issues.

PATENT DRAFT:
${draftText}

Check for:
1. ANTECEDENT_BASIS — a claim uses "the X" or "said X" without first introducing "a X" or "an X"
2. TERM_INCONSISTENCY — a term used in claims differs from how it's named in the detailed description
3. MISSING_SUPPORT — a claim element or feature is not described anywhere in the specification
4. VAGUE_TERM — a term is too vague to define the scope of protection (e.g., "about", "substantially", undefined relative terms)

For each real issue found, return JSON. Severity: HIGH = definite legal problem, MED = likely problem, LOW = suggestion.

Return EXACTLY this JSON (no markdown fences):
{
  "issues": [
    {
      "type": "ANTECEDENT_BASIS",
      "severity": "HIGH",
      "message": "Claim 2 references 'the sensor' but 'a sensor' is not introduced in Claim 1 or earlier in the same claim",
      "metadata": { "location": "Claim 2" }
    }
  ]
}

type values: ANTECEDENT_BASIS, TERM_INCONSISTENCY, MISSING_SUPPORT, VAGUE_TERM
severity values: HIGH, MED, LOW

Be specific. If no real issues, return { "issues": [] }.
Return ONLY valid JSON.`;
}
