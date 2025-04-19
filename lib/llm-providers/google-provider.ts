import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/lib/env';
import { LLMProvider, LLMRequestOptions } from './provider-interface';

export class GoogleProvider implements LLMProvider {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    this.modelName = env.GEMINI_MODEL || "gemini-2.5-pro-preview-03-25";
  }

  async makeTextRequest<T>(
    prompt: string,
    options: LLMRequestOptions = {},
    processResponse?: (response: string) => T
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.2,
          responseMimeType: options.responseMimeType,
        }
      });

      if (result.response) {
        const responseText = result.response.text();
        
        if (responseText) {
          if (processResponse) {
            return { success: true, data: processResponse(responseText) };
          }
          return { success: true, data: responseText as unknown as T };
        } else {
          console.error("Error extracting text from LLM response:", result.response);
          return { success: false, error: 'Failed to extract text from response' };
        }
      } else {
        console.error("Error generating content:", result);
        return { success: false, error: 'Failed to generate content' };
      }
    } catch (error: any) {
      console.error('Error making Google LLM request:', error);
      return { success: false, error: error.message || 'Unknown error in Google LLM request' };
    }
  }

  async makeMultimodalRequest<T>(
    parts: any[],
    options: LLMRequestOptions = {},
    processResponse?: (response: string) => T
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig: {
          maxOutputTokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.2,
          responseMimeType: options.responseMimeType || "text/plain",
        }
      });

      if (result.response) {
        const responseText = result.response.text();
        
        if (responseText) {
          if (processResponse) {
            return { success: true, data: processResponse(responseText) };
          }
          return { success: true, data: responseText as unknown as T };
        } else {
          console.error("Error extracting content from LLM response:", result.response);
          return { success: false, error: 'Failed to extract content from response' };
        }
      } else {
        console.error("Error generating content:", result);
        return { success: false, error: 'Failed to generate content' };
      }
    } catch (error: any) {
      console.error('Error making Google multimodal LLM request:', error);
      return { success: false, error: error.message || 'Unknown error in Google LLM request' };
    }
  }
}