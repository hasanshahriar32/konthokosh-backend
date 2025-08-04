import { eq, inArray, ilike, and } from 'drizzle-orm';
import { subModules } from '../../../db/schema/rbac';
import db from '../../../db/db';
import { getPaginatedData, getPagination } from '../../../utils/common';
import { ListQuery } from '../../../types/types';

export async function getSubModules(
  filters: ListQuery & { module_id?: string }
) {
  const pagination = getPagination({
    page: filters.page as number,
    size: filters.size as number,
  });
  let whereClauses = [];
  if (filters.keyword) {
    whereClauses.push(ilike(subModules.name, `%${filters.keyword}%`));
  }
  if (filters.module_id) {
    whereClauses.push(eq(subModules.moduleId, Number(filters.module_id)));
  }
  const data = await db
    .select()
    .from(subModules)
    .where(whereClauses.length ? and(...whereClauses) : undefined)
    .limit(pagination.limit)
    .offset(pagination.offset);
  return data;
}

export async function getSubModule(id: string | number) {
  const subModule = await db
    .select()
    .from(subModules)
    .where(eq(subModules.id, Number(id)));
  return subModule[0] || null;
}

export async function createSubModule(data: typeof subModules.$inferInsert) {
  const [created] = await db.insert(subModules).values(data).returning();
  return created;
}

export async function createMultiSubModules(
  data: Array<typeof subModules.$inferInsert>
) {
  return db.insert(subModules).values(data).returning();
}

export async function updateSubModule({
  id,
  data,
}: {
  id: string | number;
  data: Partial<typeof subModules.$inferInsert>;
}) {
  const [updated] = await db
    .update(subModules)
    .set(data)
    .where(eq(subModules.id, Number(id)))
    .returning();
  return updated;
}

export async function deleteSubModule(id: string | number) {
  const [deleted] = await db
    .delete(subModules)
    .where(eq(subModules.id, Number(id)))
    .returning();
  return deleted;
}

export async function deleteMultiSubModules(ids: Array<number>) {
  return db.delete(subModules).where(inArray(subModules.id, ids)).returning();
}

export async function softDeleteSubModule(id: string | number) {
  const [updated] = await db
    .update(subModules)
    .set({ isActive: false })
    .where(eq(subModules.id, Number(id)))
    .returning();
  return updated;
}

export async function softDeleteMultiSubModules(ids: Array<number>) {
  return db
    .update(subModules)
    .set({ isActive: false })
    .where(inArray(subModules.id, ids))
    .returning();
}

export async function getExistingSubModule(
  data: Partial<typeof subModules.$inferInsert>
) {
  // Example: find by name
  const subModule = await db
    .select()
    .from(subModules)
    .where(eq(subModules.name, data.name!));
  return subModule[0] || null;
}
