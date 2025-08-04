import { eq, inArray, and, ilike } from 'drizzle-orm';
import { products, productCategories } from '../../db/schema/products';
import db from '../../db/db';
import { getPaginatedData, getPagination } from '../../utils/common';
import { ListQuery } from '../../types/types';

export async function getProducts(filters: ListQuery) {
  const pagination = getPagination({
    page: filters.page as number,
    size: filters.size as number,
  });
  let whereClause = undefined;
  if (filters.keyword) {
    whereClause = ilike(products.name, `%${filters.keyword}%`);
  }
  const data = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      isDeleted: products.isDeleted,
      categoryId: products.categoryId,
    })
    .from(products)
    .where(whereClause)
    .limit(pagination.limit)
    .offset(pagination.offset);
  return data;
}

export async function getProduct(id: string | number) {
  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(id)));
  return product[0] || null;
}

export async function createProduct(data: typeof products.$inferInsert) {
  const [created] = await db.insert(products).values(data).returning();
  return created;
}

export async function createMultiProducts(
  data: Array<typeof products.$inferInsert>
) {
  return db.insert(products).values(data).returning();
}

export async function updateProduct({
  id,
  data,
}: {
  id: string | number;
  data: Partial<typeof products.$inferInsert>;
}) {
  const [updated] = await db
    .update(products)
    .set(data)
    .where(eq(products.id, Number(id)))
    .returning();
  return updated;
}

export async function deleteProduct(id: string | number) {
  const [deleted] = await db
    .delete(products)
    .where(eq(products.id, Number(id)))
    .returning();
  return deleted;
}

export async function deleteMultiProducts(ids: Array<number>) {
  return db.delete(products).where(inArray(products.id, ids)).returning();
}

export async function softDeleteProduct(id: string | number) {
  const [updated] = await db
    .update(products)
    .set({ isDeleted: true })
    .where(eq(products.id, Number(id)))
    .returning();
  return updated;
}

export async function softDeleteMultiProducts(ids: Array<number>) {
  return db
    .update(products)
    .set({ isDeleted: true })
    .where(inArray(products.id, ids))
    .returning();
}

export async function getExistingProduct(
  data: Partial<typeof products.$inferInsert>
) {
  // Example: find by name
  const product = await db
    .select()
    .from(products)
    .where(eq(products.name, data.name!));
  return product[0] || null;
}
