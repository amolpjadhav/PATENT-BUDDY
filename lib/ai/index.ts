import { AIProvider } from "./provider";
import { OpenAIProvider } from "./openai";

let _provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!_provider) {
    _provider = new OpenAIProvider();
  }
  return _provider;
}

export type { AIProvider, AIMessage, AIOptions } from "./provider";
