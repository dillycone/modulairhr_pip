import { env } from '@/lib/env';
import { LLMProvider } from './provider-interface';
import { GoogleProvider } from './google-provider';
import { AnthropicProvider } from './anthropic-provider';
import { OpenAIProvider } from './openai-provider';
import { BedrockProvider } from './bedrock-provider';

export function createLLMProvider(): LLMProvider {
  const provider = env.LLM_PROVIDER || 'google';
  
  switch (provider) {
    case 'anthropic':
      return new AnthropicProvider();
    case 'openai':
      return new OpenAIProvider();
    case 'bedrock':
      return new BedrockProvider();
    case 'google':
    default:
      return new GoogleProvider();
  }
}

// We'll also export a pre-created instance for convenience
export const llmProvider = createLLMProvider();