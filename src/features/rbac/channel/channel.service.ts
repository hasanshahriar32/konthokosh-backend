import { eq, inArray, ilike } from 'drizzle-orm';
import { channels } from '../../../db/schema/channels';
import db from '../../../db/db';
import { getPaginatedData, getPagination } from '../../../utils/common';
import { ListQuery } from '../../../types/types';

export async function getChannels(filters: ListQuery) {
  const pagination = getPagination({
    page: filters.page as number,
    size: filters.size as number,
  });
  let whereClause = undefined;
  if (filters.keyword) {
    whereClause = ilike(channels.name, `%${filters.keyword}%`);
  }
  const data = await db
    .select()
    .from(channels)
    .where(whereClause)
    .limit(pagination.limit)
    .offset(pagination.offset);
  return data;
}

export async function getChannel(id: string | number) {
  const channel = await db
    .select()
    .from(channels)
    .where(eq(channels.id, Number(id)));
  return channel[0] || null;
}

export async function createChannel(data: typeof channels.$inferInsert) {
  const [created] = await db.insert(channels).values(data).returning();
  return created;
}

export async function createMultiChannels(
  data: Array<typeof channels.$inferInsert>
) {
  return db.insert(channels).values(data).returning();
}

export async function updateChannel({
  id,
  data,
}: {
  id: string | number;
  data: Partial<typeof channels.$inferInsert>;
}) {
  const [updated] = await db
    .update(channels)
    .set(data)
    .where(eq(channels.id, Number(id)))
    .returning();
  return updated;
}

export async function deleteChannel(id: string | number) {
  const [deleted] = await db
    .delete(channels)
    .where(eq(channels.id, Number(id)))
    .returning();
  return deleted;
}

export async function deleteMultiChannels(ids: Array<number>) {
  return db.delete(channels).where(inArray(channels.id, ids)).returning();
}

export async function softDeleteChannel(id: string | number) {
  const [updated] = await db
    .update(channels)
    .set({ isDeleted: true })
    .where(eq(channels.id, Number(id)))
    .returning();
  return updated;
}

export async function softDeleteMultiChannels(ids: Array<number>) {
  return db
    .update(channels)
    .set({ isDeleted: true })
    .where(inArray(channels.id, ids))
    .returning();
}

export async function getExistingChannel(
  data: Partial<typeof channels.$inferInsert>
) {
  // Example: find by name
  const channel = await db
    .select()
    .from(channels)
    .where(eq(channels.name, data.name!));
  return channel[0] || null;
}
