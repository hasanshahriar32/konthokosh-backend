import { eq, inArray, ilike } from 'drizzle-orm';
import { productCategories } from '../../db/schema/products';
import db from '../../db/db';
import { getPaginatedData, getPagination } from '../../utils/common';
import { ListQuery } from '../../types/types';

export async function getProductCategories(filters: ListQuery) {
  const pagination = getPagination({
    page: filters.page as number,
    size: filters.size as number,
  });
  let whereClause = undefined;
  if (filters.keyword) {
    whereClause = ilike(productCategories.name, `%${filters.keyword}%`);
  }
  const data = await db
    .select()
    .from(productCategories)
    .where(whereClause)
    .limit(pagination.limit)
    .offset(pagination.offset);
  return data;
}

export async function getProductCategory(id: string | number) {
  const category = await db
    .select()
    .from(productCategories)
    .where(eq(productCategories.id, Number(id)));
  return category[0] || null;
}

export async function createProductCategory(
  data: typeof productCategories.$inferInsert
) {
  const [created] = await db.insert(productCategories).values(data).returning();
  return created;
}

export async function createMultiProductCategories(
  data: Array<typeof productCategories.$inferInsert>
) {
  return db.insert(productCategories).values(data).returning();
}

export async function updateProductCategory({
  id,
  data,
}: {
  id: string | number;
  data: Partial<typeof productCategories.$inferInsert>;
}) {
  const [updated] = await db
    .update(productCategories)
    .set(data)
    .where(eq(productCategories.id, Number(id)))
    .returning();
  return updated;
}

export async function deleteProductCategory(id: string | number) {
  const [deleted] = await db
    .delete(productCategories)
    .where(eq(productCategories.id, Number(id)))
    .returning();
  return deleted;
}

export async function deleteMultiProductCategories(ids: Array<number>) {
  return db
    .delete(productCategories)
    .where(inArray(productCategories.id, ids))
    .returning();
}

export async function softDeleteProductCategory(id: string | number) {
  const [updated] = await db
    .update(productCategories)
    .set({ isDeleted: true })
    .where(eq(productCategories.id, Number(id)))
    .returning();
  return updated;
}

export async function softDeleteMultiProductCategories(ids: Array<number>) {
  return db
    .update(productCategories)
    .set({ isDeleted: true })
    .where(inArray(productCategories.id, ids))
    .returning();
}

export async function getExistingProductCategory(
  data: Partial<typeof productCategories.$inferInsert>
) {
  // Example: find by name
  const category = await db
    .select()
    .from(productCategories)
    .where(eq(productCategories.name, data.name!));
  return category[0] || null;
}
