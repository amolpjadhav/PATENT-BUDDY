import OpenAI from "openai";
import { AIMessage, AIOptions, AIProvider } from "./provider";

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey?: string, model = "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey: apiKey ?? process.env.OPENAI_API_KEY });
    this.model = model;
  }

  async complete(messages: AIMessage[], options: AIOptions = {}): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options.temperature ?? 0.4,
      max_tokens: options.maxTokens ?? 4096,
    });
    return response.choices[0]?.message?.content ?? "";
  }
}
