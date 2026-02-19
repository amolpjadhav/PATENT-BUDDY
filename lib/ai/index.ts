/**
 * AI provider factory.
 *
 * Priority:
 *   1. GEMINI_API_KEY set  → GeminiProvider  (gemini-2.0-flash via OpenAI-compatible endpoint)
 *   2. No key              → MockAIProvider  (local dev placeholder — logs a warning)
 *
 * To use OpenAI instead, import OpenAIProvider from "./openai" and check OPENAI_API_KEY.
 */
import type { AIProvider } from "./provider";
import { GeminiProvider } from "./gemini";
import { MockAIProvider } from "./mock";

let _provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (_provider) return _provider;

  const geminiKey = process.env.GEMINI_API_KEY;
  const isRealKey = geminiKey && geminiKey.startsWith("AIza") && geminiKey.length > 20;
  if (isRealKey) {
    _provider = new GeminiProvider(geminiKey);
  } else {
    if (geminiKey && !isRealKey) {
      console.warn(
        "[PatentBuddy AI] GEMINI_API_KEY looks like a placeholder — falling back to MockAIProvider. " +
          "Get a real key at https://aistudio.google.com/apikey and update your .env file."
      );
    } else {
      console.warn(
        "[PatentBuddy AI] No GEMINI_API_KEY found — falling back to MockAIProvider. " +
          "Set GEMINI_API_KEY in your .env to enable real AI generation."
      );
    }
    _provider = new MockAIProvider();
  }

  return _provider;
}

export type { AIProvider, GenerateTextOptions } from "./provider";
