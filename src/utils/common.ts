import { ListQuery } from '../types/types';
import db from '../db/db';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';

export const base64Encode = (data: string): string => {
  return Buffer.from(data).toString('base64');
};

export const getPagination = ({
  page,
  size,
}: {
  page: number;
  size: number;
}) => {
  const limit = size;
  const offset = page * size;
  return { offset, limit };
};

// Reusable function to get paginated data
export async function getPaginatedData<T>(
  query: any,
  countQuery: any,
  filters: ListQuery,
  pagination: { limit: number; offset: number }
): Promise<{
  data: T[];
  pagination: {
    page: number;
    size: number;
    totalCount: number;
    totalPages: number;
  };
}> {
  // Execute the queries concurrently
  const [data, countResult]: any = await Promise.all([query, countQuery]);

  // Calculate pagination data
  const totalCount = countResult[0].count;
  const totalPages = Math.ceil(totalCount / pagination.limit);

  // Return the paginated data with pagination information
  return {
    data,
    pagination: {
      page: filters.page,
      size: filters.size,
      totalCount,
      totalPages,
    },
  };
}

/**
 * Looks up the local integer user ID from a Clerk user ID (sub/id from JWT)
 * Returns the local user ID (number) or undefined if not found
 */
export async function getLocalUserIdFromClerkUID(clerkUID: string): Promise<number | undefined> {
  if (!clerkUID) return undefined;
  const userRow = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUID, clerkUID));
  return userRow[0]?.id;
}
