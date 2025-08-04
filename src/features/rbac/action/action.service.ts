import { eq, inArray, ilike } from 'drizzle-orm';
import { actions } from '../../../db/schema/rbac';
import db from '../../../db/db';
import { getPaginatedData, getPagination } from '../../../utils/common';
import { ListQuery } from '../../../types/types';

export async function getActions(filters: ListQuery) {
  const pagination = getPagination({
    page: filters.page as number,
    size: filters.size as number,
  });
  let whereClause = undefined;
  if (filters.keyword) {
    whereClause = ilike(actions.name, `%${filters.keyword}%`);
  }
  const data = await db
    .select()
    .from(actions)
    .where(whereClause)
    .limit(pagination.limit)
    .offset(pagination.offset);
  return data;
}

export async function getAction(id: string | number) {
  const action = await db
    .select()
    .from(actions)
    .where(eq(actions.id, Number(id)));
  return action[0] || null;
}

export async function createAction(data: typeof actions.$inferInsert) {
  const [created] = await db.insert(actions).values(data).returning();
  return created;
}

export async function createMultiActions(
  data: Array<typeof actions.$inferInsert>
) {
  return db.insert(actions).values(data).returning();
}

export async function updateAction({
  id,
  data,
}: {
  id: string | number;
  data: Partial<typeof actions.$inferInsert>;
}) {
  const [updated] = await db
    .update(actions)
    .set(data)
    .where(eq(actions.id, Number(id)))
    .returning();
  return updated;
}

export async function deleteAction(id: string | number) {
  const [deleted] = await db
    .delete(actions)
    .where(eq(actions.id, Number(id)))
    .returning();
  return deleted;
}

export async function deleteMultiActions(ids: Array<number>) {
  return db.delete(actions).where(inArray(actions.id, ids)).returning();
}

export async function softDeleteAction(id: string | number) {
  // No is_deleted in schema, so just delete
  return deleteAction(id);
}

export async function softDeleteMultiActions(ids: Array<number>) {
  // No is_deleted in schema, so just delete
  return deleteMultiActions(ids);
}

export async function getExistingAction(
  data: Partial<typeof actions.$inferInsert>
) {
  // Example: find by name
  const action = await db
    .select()
    .from(actions)
    .where(eq(actions.name, data.name!));
  return action[0] || null;
}
