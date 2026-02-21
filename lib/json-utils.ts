/**
 * Robustly extracts a JSON object or array from raw AI response text.
 *
 * Handles:
 * - Markdown code fences (```json ... ```)
 * - Preamble/postamble text before/after the JSON
 * - Thinking-token contamination (e.g. Gemini 2.5 Flash leaking budget tokens)
 *
 * Strategy (in order):
 * 1. Strip markdown fences, try JSON.parse on the full trimmed string.
 * 2. Find the first '{' or '[' and the matching closing brace/bracket, then parse that slice.
 * 3. Throw with a truncated sample of the raw content to aid debugging.
 */
export function extractJsonFromText<T = unknown>(raw: string, label = "AI response"): T {
  // ── Step 1: strip markdown fences ────────────────────────────────────────────
  const stripped = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  if (stripped) {
    try {
      return JSON.parse(stripped) as T;
    } catch {
      // fall through to step 2
    }
  }

  // ── Step 2: find the first JSON object or array ───────────────────────────────
  const openChar = raw.includes("{") ? "{" : "[";
  const closeChar = openChar === "{" ? "}" : "]";
  const start = raw.indexOf(openChar);
  if (start !== -1) {
    // Walk from the end to find the last matching close character
    const end = raw.lastIndexOf(closeChar);
    if (end > start) {
      const slice = raw.slice(start, end + 1);
      try {
        return JSON.parse(slice) as T;
      } catch {
        // fall through to error
      }
    }
  }

  // ── Step 3: throw with diagnostic info ───────────────────────────────────────
  const preview = raw.slice(0, 500).replace(/\n/g, "\\n");
  throw new SyntaxError(
    `${label}: could not extract valid JSON. Raw content preview (first 500 chars): ${preview}`
  );
}
