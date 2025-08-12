import { CLOUDFLARE_API_KEY, CLOUDFLARE_ACCOUNT_ID } from '../configs/envConfig';
import db from '../db/db';
import { postEmbeddings } from '../db/schema/postEmbeddings';
import { posts } from '../db/schema/posts';
import { eq, sql } from 'drizzle-orm';

// Cloudflare Workers AI configuration
const CLOUDFLARE_API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/v1`;

interface CloudflareEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
}

export class EmbeddingService {
  private static readonly MODEL = '@cf/baai/bge-m3';

  /**
   * Generate embeddings for a text using Cloudflare Workers AI (Direct HTTP)
   * @param text The text to generate embeddings for
   * @returns Promise<number[]> The embedding vector
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    console.log(`🔍 Generating embedding for text: ${text.substring(0, 50)}...`);
    
    try {
      const response = await fetch(`${CLOUDFLARE_API_URL}/embeddings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.MODEL,
          input: text.trim(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudflare API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: CloudflareEmbeddingResponse = await response.json();
      
      if (!data.data || data.data.length === 0) {
        throw new Error("No embedding data received from Cloudflare API");
      }

      const embedding = data.data[0].embedding;
      console.log(`✅ Embedding generated successfully, dimensions: ${embedding.length}`);
      
      // Check if embedding is all zeros (indicates API issue)
      const nonZeroCount = embedding.filter(val => val !== 0).length;
      console.log(`📊 Non-zero values: ${nonZeroCount}/${embedding.length}`);
      
      if (nonZeroCount === 0) {
        throw new Error("Received all-zero embedding from Cloudflare API - this indicates an API issue");
      }
      
      return embedding;
      
    } catch (error) {
      console.error('❌ Error generating embedding:', error);
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
   * @param excludePostId Post ID to exclude from results (usually the current post)
   * @returns Promise<Array> Array of similar posts with similarity scores
   */
  static async findSimilarPosts(queryText: string, limit: number = 10, threshold: number = 0.7, excludePostId?: number) {
    try {
      // Generate embedding for the query text
      const queryEmbedding = await this.generateEmbedding(queryText);
      
      // Convert embedding array to string format for PostgreSQL vector
      const embeddingString = `[${queryEmbedding.join(',')}]`;
      
      console.log(`🔍 Searching for similar posts with embedding length: ${queryEmbedding.length}, excluding post: ${excludePostId || 'none'}`);
      
      // Build WHERE conditions
      let whereConditions = `
        p.is_deleted = false 
        AND p.is_active = true
        AND p.is_approved = true
      `;
      
      if (excludePostId) {
        whereConditions += ` AND pe.post_id != ${excludePostId}`;
      }
      
      // Use raw SQL with proper vector casting
      const result = await db.execute(sql`
        SELECT 
          pe.post_id,
          pe.text_content,
          pe.created_at,
          p.post,
          p.is_approved,
          p.user_id,
          1 - (pe.embedding <=> ${embeddingString}::vector) as similarity
        FROM post_embeddings pe
        JOIN posts p ON pe.post_id = p.id
        WHERE ${sql.raw(whereConditions)}
        ORDER BY pe.embedding <=> ${embeddingString}::vector
        LIMIT ${limit * 2}
      `);
      
      // Filter by threshold after getting results (to avoid complex SQL)
      const filteredResults = result.rows.filter((row: any) => 
        parseFloat(row.similarity) >= threshold
      ).slice(0, limit); // Apply limit after filtering
      
      console.log(`📊 Found ${result.rows.length} total posts, ${filteredResults.length} above threshold ${threshold}`);
      
      if (filteredResults.length > 0) {
        console.log(`📈 Similarity scores: ${filteredResults.map((r: any) => parseFloat(r.similarity).toFixed(3)).join(', ')}`);
      }
      
      return filteredResults;
    } catch (error) {
      console.error('Error finding similar posts:', error);
      // Return empty array instead of throwing error to not break post creation
      console.log('🚨 Returning empty similar posts due to error');
      return [];
    }
  }
}

export default EmbeddingService;
