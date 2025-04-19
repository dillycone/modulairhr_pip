/**
 * Common interface for all LLM providers
 */
export interface LLMRequestOptions {
  maxTokens?: number;
  temperature?: number;
  responseMimeType?: string;
  // Other parameters as needed
}

export interface LLMProvider {
  makeTextRequest<T>(
    prompt: string,
    options?: LLMRequestOptions,
    processResponse?: (response: string) => T
  ): Promise<{ success: boolean; data?: T; error?: string }>;
  
  makeMultimodalRequest<T>(
    parts: any[],
    options?: LLMRequestOptions,
    processResponse?: (response: string) => T
  ): Promise<{ success: boolean; data?: T; error?: string }>;
}