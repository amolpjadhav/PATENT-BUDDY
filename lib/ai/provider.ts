export interface GenerateTextOptions {
  /** System-level instructions for the model */
  system: string;
  /** User-facing prompt / task */
  prompt: string;
  /** Sampling temperature (0 = deterministic, 1 = creative). Default: 0.4 */
  temperature?: number;
}

export interface TokenUsageData {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
}

export interface GenerateTextResult {
  content: string;
  usage: TokenUsageData;
}

export interface AIProvider {
  generateText(options: GenerateTextOptions): Promise<GenerateTextResult>;
}
