import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/lib/env';
import { LLMProvider, LLMRequestOptions } from './provider-interface';

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private modelName: string;

  constructor() {
    this.client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });
    this.modelName = env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20240620";
  }

  async makeTextRequest<T>(
    prompt: string,
    options: LLMRequestOptions = {},
    processResponse?: (response: string) => T
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const response = await this.client.messages.create({
        model: this.modelName,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.2,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const responseText = response.content.find(c => c.type === 'text')?.text;
      
      if (responseText) {
        if (processResponse) {
          return { success: true, data: processResponse(responseText) };
        }
        return { success: true, data: responseText as unknown as T };
      } else {
        console.error("Error extracting text from Anthropic response:", response);
        return { success: false, error: 'Failed to extract text from response' };
      }
    } catch (error: any) {
      console.error('Error making Anthropic LLM request:', error);
      return { success: false, error: error.message || 'Unknown error in Anthropic LLM request' };
    }
  }

  async makeMultimodalRequest<T>(
    parts: any[],
    options: LLMRequestOptions = {},
    processResponse?: (response: string) => T
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      // Transform parts to Anthropic's format
      const content = parts.map(part => {
        if (part.text) {
          return { type: 'text', text: part.text };
        } else if (part.inlineData) {
          return {
            type: 'image',
            source: {
              type: 'base64',
              media_type: part.inlineData.mimeType,
              data: part.inlineData.data
            }
          };
        }
        return null;
      }).filter(Boolean);

      const response = await this.client.messages.create({
        model: this.modelName,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.2,
        messages: [
          {
            role: 'user',
            content
          }
        ]
      });

      const responseText = response.content.find(c => c.type === 'text')?.text;
      
      if (responseText) {
        if (processResponse) {
          return { success: true, data: processResponse(responseText) };
        }
        return { success: true, data: responseText as unknown as T };
      } else {
        console.error("Error extracting text from Anthropic response:", response);
        return { success: false, error: 'Failed to extract text from response' };
      }
    } catch (error: any) {
      console.error('Error making Anthropic multimodal LLM request:', error);
      return { success: false, error: error.message || 'Unknown error in Anthropic LLM request' };
    }
  }
}