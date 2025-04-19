import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { env } from '@/lib/env';
import { LLMProvider, LLMRequestOptions } from './provider-interface';

export class BedrockProvider implements LLMProvider {
  private client: BedrockRuntimeClient;
  private modelId: string;

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY,
        secretAccessKey: env.AWS_SECRET_KEY,
      },
    });
    this.modelId = env.AWS_BEDROCK_MODEL || "anthropic.claude-3-5-sonnet-20240620";
  }

  async makeTextRequest<T>(
    prompt: string,
    options: LLMRequestOptions = {},
    processResponse?: (response: string) => T
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      let requestBody: any;
      
      // Format request based on model provider
      if (this.modelId.startsWith('anthropic.')) {
        // Anthropic model format
        requestBody = {
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.2,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt }
              ]
            }
          ]
        };
      } else if (this.modelId.startsWith('amazon.')) {
        // Amazon Titan model format
        requestBody = {
          inputText: prompt,
          textGenerationConfig: {
            maxTokenCount: options.maxTokens || 1000,
            temperature: options.temperature || 0.2,
          }
        };
      } else if (this.modelId.startsWith('cohere.')) {
        // Cohere model format
        requestBody = {
          prompt: prompt,
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.2,
        };
      } else {
        throw new Error(`Unsupported Bedrock model: ${this.modelId}`);
      }

      const command = new InvokeModelCommand({
        modelId: this.modelId,
        body: JSON.stringify(requestBody),
        contentType: "application/json",
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      let responseText = '';
      
      // Extract response text based on model provider
      if (this.modelId.startsWith('anthropic.')) {
        responseText = responseBody.content[0]?.text || '';
      } else if (this.modelId.startsWith('amazon.')) {
        responseText = responseBody.results[0]?.outputText || '';
      } else if (this.modelId.startsWith('cohere.')) {
        responseText = responseBody.generations[0]?.text || '';
      }
      
      if (responseText) {
        if (processResponse) {
          return { success: true, data: processResponse(responseText) };
        }
        return { success: true, data: responseText as unknown as T };
      } else {
        console.error("Error extracting text from Bedrock response:", responseBody);
        return { success: false, error: 'Failed to extract text from response' };
      }
    } catch (error: any) {
      console.error('Error making Bedrock LLM request:', error);
      return { success: false, error: error.message || 'Unknown error in Bedrock LLM request' };
    }
  }

  async makeMultimodalRequest<T>(
    parts: any[],
    options: LLMRequestOptions = {},
    processResponse?: (response: string) => T
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      if (!this.modelId.startsWith('anthropic.')) {
        return {
          success: false,
          error: `Multimodal requests are only supported for Anthropic models in Bedrock. Current model: ${this.modelId}`
        };
      }
      
      // Transform parts to Anthropic's format for Bedrock
      const content = parts.map(part => {
        if (part.text) {
          return { type: "text", text: part.text };
        } else if (part.inlineData) {
          return {
            type: "image",
            source: {
              type: "base64",
              media_type: part.inlineData.mimeType,
              data: part.inlineData.data
            }
          };
        }
        return null;
      }).filter(Boolean);

      const requestBody = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.2,
        messages: [
          {
            role: "user",
            content
          }
        ]
      };

      const command = new InvokeModelCommand({
        modelId: this.modelId,
        body: JSON.stringify(requestBody),
        contentType: "application/json",
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      const responseText = responseBody.content[0]?.text || '';
      
      if (responseText) {
        if (processResponse) {
          return { success: true, data: processResponse(responseText) };
        }
        return { success: true, data: responseText as unknown as T };
      } else {
        console.error("Error extracting text from Bedrock response:", responseBody);
        return { success: false, error: 'Failed to extract text from response' };
      }
    } catch (error: any) {
      console.error('Error making Bedrock multimodal LLM request:', error);
      return { success: false, error: error.message || 'Unknown error in Bedrock LLM request' };
    }
  }
}