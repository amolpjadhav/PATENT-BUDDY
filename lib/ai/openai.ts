/**
 * OpenAI provider — uses the standard OpenAI API.
 * Requires OPENAI_API_KEY environment variable.
 * Not used by default; GeminiProvider is the active provider.
 * Swap in index.ts if you prefer OpenAI over Gemini.
 */
import OpenAI from "openai";
import type { AIProvider, GenerateTextOptions } from "./provider";

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey?: string, model = "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey: apiKey ?? process.env.OPENAI_API_KEY });
    this.model = model;
  }

  async generateText({ system, prompt, temperature = 0.4 }: GenerateTextOptions): Promise<string> {
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
  }
}
