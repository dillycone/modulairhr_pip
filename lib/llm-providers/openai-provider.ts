import OpenAI from 'openai';
import { env } from '@/lib/env';
import { LLMProvider, LLMRequestOptions } from './provider-interface';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private modelName: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
    this.modelName = env.OPENAI_MODEL || "gpt-4o";
  }

  async makeTextRequest<T>(
    prompt: string,
    options: LLMRequestOptions = {},
    processResponse?: (response: string) => T
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const response = await this.client.chat.completions.create({
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

      const responseText = response.choices[0]?.message?.content;
      
      if (responseText) {
        if (processResponse) {
          return { success: true, data: processResponse(responseText) };
        }
        return { success: true, data: responseText as unknown as T };
      } else {
        console.error("Error extracting text from OpenAI response:", response);
        return { success: false, error: 'Failed to extract text from response' };
      }
    } catch (error: any) {
      console.error('Error making OpenAI LLM request:', error);
      return { success: false, error: error.message || 'Unknown error in OpenAI LLM request' };
    }
  }

  async makeMultimodalRequest<T>(
    parts: any[],
    options: LLMRequestOptions = {},
    processResponse?: (response: string) => T
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      // Transform parts to OpenAI's format
      const content = parts.map(part => {
        if (part.text) {
          return { type: 'text', text: part.text };
        } else if (part.inlineData) {
          return {
            type: 'image_url',
            image_url: {
              url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
            }
          };
        }
        return null;
      }).filter(Boolean);

      const response = await this.client.chat.completions.create({
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

      const responseText = response.choices[0]?.message?.content;
      
      if (responseText) {
        if (processResponse) {
          return { success: true, data: processResponse(responseText) };
        }
        return { success: true, data: responseText as unknown as T };
      } else {
        console.error("Error extracting text from OpenAI response:", response);
        return { success: false, error: 'Failed to extract text from response' };
      }
    } catch (error: any) {
      console.error('Error making OpenAI multimodal LLM request:', error);
      return { success: false, error: error.message || 'Unknown error in OpenAI LLM request' };
    }
  }
}