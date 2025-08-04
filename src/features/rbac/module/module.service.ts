import { eq, inArray, ilike } from 'drizzle-orm';
import { modules } from '../../../db/schema/rbac';
import db from '../../../db/db';
import { getPaginatedData, getPagination } from '../../../utils/common';
import { ListQuery } from '../../../types/types';

export async function getModules(filters: ListQuery) {
  const pagination = getPagination({
    page: filters.page as number,
    size: filters.size as number,
  });
  let whereClause = undefined;
  if (filters.keyword) {
    whereClause = ilike(modules.name, `%${filters.keyword}%`);
  }
  const data = await db
    .select()
    .from(modules)
    .where(whereClause)
    .limit(pagination.limit)
    .offset(pagination.offset);
  return data;
}

export async function getModule(id: string | number) {
  const module = await db
    .select()
    .from(modules)
    .where(eq(modules.id, Number(id)));
  return module[0] || null;
}

export async function createModule(data: typeof modules.$inferInsert) {
  const [created] = await db.insert(modules).values(data).returning();
  return created;
}

export async function createMultiModules(
  data: Array<typeof modules.$inferInsert>
) {
  return db.insert(modules).values(data).returning();
}

export async function updateModule({
  id,
  data,
}: {
  id: string | number;
  data: Partial<typeof modules.$inferInsert>;
}) {
  const [updated] = await db
    .update(modules)
    .set(data)
    .where(eq(modules.id, Number(id)))
    .returning();
  return updated;
}

export async function deleteModule(id: string | number) {
  const [deleted] = await db
    .delete(modules)
    .where(eq(modules.id, Number(id)))
    .returning();
  return deleted;
}

export async function deleteMultiModules(ids: Array<number>) {
  return db.delete(modules).where(inArray(modules.id, ids)).returning();
}

export async function softDeleteModule(id: string | number) {
  const [updated] = await db
    .update(modules)
    .set({ isActive: false })
    .where(eq(modules.id, Number(id)))
    .returning();
  return updated;
}

export async function softDeleteMultiModules(ids: Array<number>) {
  return db
    .update(modules)
    .set({ isActive: false })
    .where(inArray(modules.id, ids))
    .returning();
}

export async function getExistingModule(
  data: Partial<typeof modules.$inferInsert>
) {
  // Example: find by name
  const module = await db
    .select()
    .from(modules)
    .where(eq(modules.name, data.name!));
  return module[0] || null;
}
