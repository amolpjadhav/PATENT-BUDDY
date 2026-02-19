export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProvider {
  complete(messages: AIMessage[], options?: AIOptions): Promise<string>;
}

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
}
