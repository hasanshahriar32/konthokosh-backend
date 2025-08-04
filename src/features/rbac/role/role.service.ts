import { eq, inArray, ilike } from 'drizzle-orm';
import { roles } from '../../../db/schema/rbac';
import db from '../../../db/db';
import { getPaginatedData, getPagination } from '../../../utils/common';
import { ListQuery } from '../../../types/types';

export async function getRoles(filters: ListQuery) {
  const pagination = getPagination({
    page: filters.page as number,
    size: filters.size as number,
  });
  let whereClause = undefined;
  if (filters.keyword) {
    whereClause = ilike(roles.name, `%${filters.keyword}%`);
  }
  const data = await db
    .select()
    .from(roles)
    .where(whereClause)
    .limit(pagination.limit)
    .offset(pagination.offset);
  return data;
}

export async function getRole(id: string | number) {
  const role = await db
    .select()
    .from(roles)
    .where(eq(roles.id, Number(id)));
  return role[0] || null;
}

export async function createRole(data: typeof roles.$inferInsert) {
  const [created] = await db.insert(roles).values(data).returning();
  return created;
}

export async function createMultiRoles(data: Array<typeof roles.$inferInsert>) {
  return db.insert(roles).values(data).returning();
}

export async function updateRole({
  id,
  data,
}: {
  id: string | number;
  data: Partial<typeof roles.$inferInsert>;
}) {
  const [updated] = await db
    .update(roles)
    .set(data)
    .where(eq(roles.id, Number(id)))
    .returning();
  return updated;
}

export async function deleteRole(id: string | number) {
  const [deleted] = await db
    .delete(roles)
    .where(eq(roles.id, Number(id)))
    .returning();
  return deleted;
}

export async function deleteMultiRoles(ids: Array<number>) {
  return db.delete(roles).where(inArray(roles.id, ids)).returning();
}

export async function softDeleteRole(id: string | number) {
  const [updated] = await db
    .update(roles)
    .set({ isActive: false })
    .where(eq(roles.id, Number(id)))
    .returning();
  return updated;
}

export async function softDeleteMultiRoles(ids: Array<number>) {
  return db
    .update(roles)
    .set({ isActive: false })
    .where(inArray(roles.id, ids))
    .returning();
}

export async function getExistingRole(
  data: Partial<typeof roles.$inferInsert>
) {
  // Example: find by name
  const role = await db.select().from(roles).where(eq(roles.name, data.name!));
  return role[0] || null;
}
