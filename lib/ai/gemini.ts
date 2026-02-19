/**
 * Gemini provider — uses Google's Gemini API via its OpenAI-compatible endpoint.
 * Requires GEMINI_API_KEY environment variable.
 * Model: gemini-2.0-flash (fast, high-quality, free tier available).
 */
import OpenAI from "openai";
import type { AIProvider, GenerateTextOptions } from "./provider";

export class GeminiProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = "gemini-2.5-flash") {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
    this.model = model;
  }

  async generateText({ system, prompt, temperature = 0.4 }: GenerateTextOptions): Promise<string> {
    const maxRetries = 3;
    let lastError: unknown;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
          temperature,
          max_tokens: 8192,
        });
        return response.choices[0]?.message?.content ?? "";
      } catch (err: unknown) {
        lastError = err;
        const status = (err as { status?: number })?.status;
        if (status === 429) {
          const delay = (attempt + 1) * 5000; // 5s, 10s, 15s
          console.warn(`[GeminiProvider] Rate limited (429). Retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw err; // non-429 errors are not retried
      }
    }

    throw lastError;
  }
}
