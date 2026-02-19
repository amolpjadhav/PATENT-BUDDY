export function buildQualityCheckPrompt(sections: string, claims: string): string {
  return `You are a patent quality checker. Analyze the following patent draft for common issues.

SPECIFICATION SECTIONS:
${sections}

CLAIMS:
${claims}

Check for these issues:
1. ANTECEDENT BASIS: Claims use "the X" or "said X" without first introducing "a X" (or "an X")
2. TERM CONSISTENCY: Terms used in claims that are NOT defined or used in the detailed description
3. MISSING SUPPORT: Claim elements or features not described anywhere in the specification
4. COMPLETENESS: Missing required sections or very thin sections

Return EXACTLY this JSON:
{
  "issues": [
    {
      "severity": "error",
      "category": "antecedent_basis",
      "message": "Claim 2 uses 'the widget' but 'a widget' is never introduced",
      "location": "Claim 2"
    }
  ]
}

Severity levels:
- "error": Definite problem that must be fixed (antecedent basis, undefined terms)
- "warning": Potential problem (weak support, vague language)
- "info": Suggestion for improvement

Categories: "antecedent_basis", "term_consistency", "missing_support", "completeness"

Be thorough but concise. Find real issues, not trivial ones.
Return ONLY valid JSON, no markdown fences.`;
}
