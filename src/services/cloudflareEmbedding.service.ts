import OpenAI from "openai";
import { envConfig } from "../configs/envConfig";

interface CloudflareEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

class CloudflareEmbeddingService {
  private openai: OpenAI;
  private model = "@cf/baai/bge-m3";

  constructor() {
    if (!envConfig.CLOUDFLARE_API_KEY || !envConfig.CLOUDFLARE_ACCOUNT_ID) {
      throw new Error('Cloudflare API key and account ID are required for embedding service');
    }

    this.openai = new OpenAI({
      apiKey: envConfig.CLOUDFLARE_API_KEY,
      baseURL: `https://api.cloudflare.com/client/v4/accounts/${envConfig.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
    });
  }

  /**
   * Create embeddings for given text using Cloudflare Workers AI
   * @param input - Text or array of texts to create embeddings for
   * @returns Promise<number[][]> - Array of embedding vectors
   */
  async createEmbeddings(input: string | string[]): Promise<number[][]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: input,
      });

      // Extract embedding vectors from the response
      const embeddings = response.data.map(item => item.embedding);
      return embeddings;
    } catch (error) {
      console.error('Error creating embeddings with Cloudflare Workers AI:', error);
      throw new Error(`Failed to create embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a single embedding for one text
   * @param text - Text to create embedding for
   * @returns Promise<number[]> - Embedding vector
   */
  async createSingleEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.createEmbeddings(text);
    return embeddings[0];
  }

  /**
   * Get the model being used
   */
  getModel(): string {
    return this.model;
  }
}

export const cloudflareEmbeddingService = new CloudflareEmbeddingService();
