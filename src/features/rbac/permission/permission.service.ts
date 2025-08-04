import { eq, inArray, and } from 'drizzle-orm';
import {
  permissions,
  actions,
  modules,
  subModules,
  roles,
  rolePermissions,
  userRoles,
} from '../../../db/schema/rbac';
import db from '../../../db/db';
import { getPaginatedData, getPagination } from '../../../utils/common';
import { ListQuery } from '../../../types/types';

export async function getRolesOnChannelData(
  filters: ListQuery & { role_id?: string; channel_id?: string }
) {
  // NOTE: Channel support is not in the schema above, so this is a placeholder for future extension
  // For now, just return roles
  const userRoleRows = await db
    .select({ roleId: userRoles.roleId })
    .from(userRoles);
  const roleIds = userRoleRows.map((ur) => ur.roleId);
  const roleRows = await db
    .select({ id: roles.id, name: roles.name })
    .from(roles)
    .where(
      inArray(
        roles.id,
        roleIds.filter((id): id is number => id !== null)
      )
    );
  return roleRows;
}

export async function getPermissions(filters: Record<string, unknown>) {
  // Example: get all permissions with action/module/submodule names
  const perms = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      action: actions.name,
      module: modules.name,
      subModule: subModules.name,
      description: permissions.description,
      createdAt: permissions.createdAt,
    })
    .from(permissions)
    .innerJoin(actions, eq(permissions.actionId, actions.id))
    .innerJoin(modules, eq(permissions.moduleId, modules.id))
    .innerJoin(subModules, eq(permissions.subModuleId, subModules.id));
  return perms;
}

export async function getPermissionsByUser(userId: number) {
  // Get all roles for user
  const userRoleRows = await db
    .select({ roleId: userRoles.roleId })
    .from(userRoles)
    .where(eq(userRoles.userId, userId));
  const userRoleIds = userRoleRows.map((ur) => ur.roleId);
  if (!userRoleIds.length) return [];
  // Get permissions for these roles
  const perms = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      action: actions.name,
      module: modules.name,
      subModule: subModules.name,
      description: permissions.description,
      createdAt: permissions.createdAt,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .innerJoin(actions, eq(permissions.actionId, actions.id))
    .innerJoin(modules, eq(permissions.moduleId, modules.id))
    .innerJoin(subModules, eq(permissions.subModuleId, subModules.id))
    .where(
      inArray(
        rolePermissions.roleId,
        userRoleIds.filter((id): id is number => id !== null)
      )
    );
  return perms;
}

export async function getPermission(id: number) {
  const perm = await db
    .select()
    .from(permissions)
    .where(eq(permissions.id, id));
  return perm[0] || null;
}

export async function createPermission(
  data: Omit<typeof permissions.$inferInsert, 'id'>
) {
  return db.insert(permissions).values(data).returning();
}

export async function createMultiPermissions(
  data: Array<Omit<typeof permissions.$inferInsert, 'id'>>
) {
  return db.insert(permissions).values(data).returning();
}

export async function updatePermission({
  id,
  data,
}: {
  id: number;
  data: Partial<typeof permissions.$inferInsert>;
}) {
  return db
    .update(permissions)
    .set(data)
    .where(eq(permissions.id, id))
    .returning();
}

export async function deletePermission(id: number) {
  return db.delete(permissions).where(eq(permissions.id, id)).returning();
}

export async function deleteMultiPermissions(ids: number[]) {
  return db.delete(permissions).where(inArray(permissions.id, ids)).returning();
}

export async function getExistingPermission(
  data: Partial<typeof permissions.$inferInsert>
) {
  // Find by unique fields
  const perm = await db
    .select()
    .from(permissions)
    .where(
      and(
        eq(permissions.actionId, data.actionId!),
        eq(permissions.moduleId, data.moduleId!),
        eq(permissions.subModuleId, data.subModuleId!)
      )
    );
  return perm[0] || null;
}
