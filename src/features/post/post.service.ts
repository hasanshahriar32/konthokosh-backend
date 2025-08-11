import { eq, and, desc, ilike, sql, inArray } from 'drizzle-orm';
import db from '../../db/db';
import { getPaginatedData, getPagination } from '../../utils/common';
import { ListQuery } from '../../types/types';
import { posts } from '../../db/schema/posts';
import { users } from '../../db/schema/users';
import EmbeddingService from '../../services/embeddingService';

export async function getPosts(filters: ListQuery & { isApproved?: boolean; userId?: number; myPosts?: boolean }) {
  const page = Number(filters.page) || 1;
  const size = Number(filters.size) || 10;
  const offset = (page - 1) * size;

  // Build where conditions
  let whereConditions = [
    eq(posts.isDeleted, false),
    eq(posts.isActive, true)
  ];

  // Add keyword filter
  if (filters.keyword) {
    whereConditions.push(ilike(posts.post, `%${filters.keyword}%`));
  }

  // Add user filter
  if (filters.userId !== undefined && filters.userId !== null) {
    // Handle both string and number userId from query parameters
    const userIdNumber = typeof filters.userId === 'string' ? Number(filters.userId) : filters.userId;
    if (!isNaN(userIdNumber) && userIdNumber > 0) {
      whereConditions.push(eq(posts.userId, userIdNumber));
    }
  }

  // Add approval filter
  if (filters.isApproved !== undefined) {
    const isApprovedValue = typeof filters.isApproved === 'string' 
      ? (filters.isApproved as string).toLowerCase() === 'true'
      : Boolean(filters.isApproved);
    whereConditions.push(eq(posts.isApproved, isApprovedValue));
  } else {
    // Check if we have a valid userId filter applied
    const hasValidUserId = filters.userId !== undefined && 
                          filters.userId !== null && 
                          !isNaN(typeof filters.userId === 'string' ? Number(filters.userId) : filters.userId) &&
                          (typeof filters.userId === 'string' ? Number(filters.userId) : filters.userId) > 0;
    
    if (!hasValidUserId) {
      // Default: show only approved posts for public listing (when not filtering by specific user)
      whereConditions.push(eq(posts.isApproved, true));
    }
  }

  const whereClause = whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];

  // Get the data
  const data = await db
    .select({
      id: posts.id,
      post: posts.post,
      userId: posts.userId,
      isApproved: posts.isApproved,
      imagesId: posts.imagesId,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      userFirstName: users.firstName,
      userLastName: users.lastName,
      userImageUrl: users.imageUrl,
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .where(whereClause)
    .orderBy(desc(posts.createdAt))
    .limit(size)
    .offset(offset);

  // Get the total count
  const countResult = await db
    .select({ count: sql`count(*)::int` })
    .from(posts)
    .where(whereClause);

  const totalCount = Number(countResult[0]?.count) || 0;
  const totalPages = Math.ceil(totalCount / size);

  return {
    data,
    pagination: {
      page: page.toString(),
      size: size.toString(),
      totalCount: totalCount.toString(),
      totalPages
    }
  };
}

export async function getPost(id: string | number) {
  const post = await db
    .select({
      id: posts.id,
      post: posts.post,
      userId: posts.userId,
      isApproved: posts.isApproved,
      imagesId: posts.imagesId,
      isActive: posts.isActive,
      isDeleted: posts.isDeleted,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username,
        imageUrl: users.imageUrl,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.id, Number(id)));
  
  return post[0] || null;
}

export async function createPost(data: typeof posts.$inferInsert) {
  // First, save the post to database
  const [created] = await db.insert(posts).values({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  // After saving the post, generate and save embeddings asynchronously
  // We don't await this to avoid blocking the response
  EmbeddingService.createPostEmbedding(created.id)
    .then(() => {
      console.log(`✅ Embeddings generated successfully for post ${created.id}`);
    })
    .catch((error) => {
      console.error(`❌ Failed to generate embeddings for post ${created.id}:`, error);
      // In production, you might want to add this to a retry queue
    });

  return created;
}

export async function updatePost({
  id,
  data,
}: {
  id: string | number;
  data: Partial<typeof posts.$inferInsert>;
}) {
  const [updated] = await db
    .update(posts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, Number(id)))
    .returning();
  return updated;
}

export async function deletePost(id: string | number) {
  const [deleted] = await db
    .update(posts)
    .set({
      isDeleted: true,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, Number(id)))
    .returning();
  return deleted;
}

export async function approvePost(id: string | number) {
  const [approved] = await db
    .update(posts)
    .set({
      isApproved: true,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, Number(id)))
    .returning();
  return approved;
}

export async function unapprovePost(id: string | number) {
  const [unapproved] = await db
    .update(posts)
    .set({
      isApproved: false,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, Number(id)))
    .returning();
  return unapproved;
}
