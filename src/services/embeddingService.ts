import OpenAI from 'openai';
import { CLOUDFLARE_API_KEY, CLOUDFLARE_ACCOUNT_ID } from '../configs/envConfig';
import db from '../db/db';
import { postEmbeddings } from '../db/schema/postEmbeddings';
import { posts } from '../db/schema/posts';
import { eq, sql } from 'drizzle-orm';

// Initialize OpenAI client for Cloudflare Workers AI
const openai = new OpenAI({
  apiKey: CLOUDFLARE_API_KEY,
  baseURL: `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
});

export class EmbeddingService {
  private static readonly MODEL = '@cf/baai/bge-m3';

  /**
   * Generate embeddings for a text using Cloudflare Workers AI
   * @param text The text to generate embeddings for
   * @returns Promise<number[]> The embedding vector
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: this.MODEL,
        input: text.trim(),
      });

      if (response.data && response.data.length > 0) {
        return response.data[0].embedding;
      } else {
        throw new Error('No embedding data received from Cloudflare Workers AI');
      }
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save post embeddings to database
   * @param postId The ID of the post
   * @param textContent The text content that was embedded
   * @param embedding The embedding vector
   * @returns Promise<PostEmbedding> The saved embedding record
   */
  static async savePostEmbedding(postId: number, textContent: string, embedding: any) {
    try {
      const [savedEmbedding] = await db.insert(postEmbeddings).values({
        postId,
        textContent,
        embedding: embedding, // Store as number[]
        model: this.MODEL,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return savedEmbedding;
    } catch (error) {
      console.error('Error saving post embedding:', error);
      throw new Error(`Failed to save post embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate and save embeddings for a post
   * @param postId The ID of the post
   * @returns Promise<PostEmbedding> The saved embedding record
   */
  static async createPostEmbedding(postId: number) {
    try {
      // First, get the post content
      const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
      
      if (!post.length) {
        throw new Error(`Post with ID ${postId} not found`);
      }

      const postContent = post[0].post;
      
      // Check if embedding already exists
      const existingEmbedding = await db.select()
        .from(postEmbeddings)
        .where(eq(postEmbeddings.postId, postId))
        .limit(1);

      if (existingEmbedding.length > 0) {
        console.log(`Embedding already exists for post ${postId}`);
        return existingEmbedding[0];
      }

      // Generate embedding
      const embedding = await this.generateEmbedding(postContent);
      
      // Save to database
      const savedEmbedding = await this.savePostEmbedding(postId, postContent, embedding);
      
      console.log(`Successfully created embedding for post ${postId}`);
      return savedEmbedding;
    } catch (error) {
      console.error(`Error creating post embedding for post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple posts
   * @param postIds Array of post IDs
   * @returns Promise<PostEmbedding[]> Array of saved embedding records
   */
  static async createMultiplePostEmbeddings(postIds: number[]) {
    const results = [];
    const errors = [];

    for (const postId of postIds) {
      try {
        const embedding = await this.createPostEmbedding(postId);
        results.push(embedding);
      } catch (error) {
        console.error(`Failed to create embedding for post ${postId}:`, error);
        errors.push({ postId, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return {
      successful: results,
      failed: errors,
      totalProcessed: postIds.length,
      successCount: results.length,
      failureCount: errors.length
    };
  }

  /**
   * Find similar posts using cosine similarity
   * @param queryText The text to find similar posts for
   * @param limit Maximum number of results to return
   * @param threshold Minimum similarity threshold (0-1)
   * @returns Promise<Array> Array of similar posts with similarity scores
   */
  static async findSimilarPosts(queryText: string, limit: number = 10, threshold: number = 0.7) {
    try {
      // Generate embedding for the query text
      const queryEmbedding = await this.generateEmbedding(queryText);
      
      // Use raw SQL with proper parameter binding for vector operations
      const result = await db.execute(sql`
        SELECT 
          pe.post_id,
          pe.text_content,
          pe.created_at,
          p.post,
          p.is_approved,
          p.user_id,
          1 - (pe.embedding <=> ${queryEmbedding}::vector) as similarity
        FROM post_embeddings pe
        JOIN posts p ON pe.post_id = p.id
        WHERE p.is_deleted = false 
          AND p.is_active = true
          AND 1 - (pe.embedding <=> ${queryEmbedding}::vector) >= ${threshold}
        ORDER BY pe.embedding <=> ${queryEmbedding}::vector
        LIMIT ${limit}
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error finding similar posts:', error);
      throw new Error(`Failed to find similar posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default EmbeddingService;
