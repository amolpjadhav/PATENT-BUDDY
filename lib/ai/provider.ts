export interface GenerateTextOptions {
  /** System-level instructions for the model */
  system: string;
  /** User-facing prompt / task */
  prompt: string;
  /** Sampling temperature (0 = deterministic, 1 = creative). Default: 0.4 */
  temperature?: number;
}

export interface AIProvider {
  generateText(options: GenerateTextOptions): Promise<string>;
}
