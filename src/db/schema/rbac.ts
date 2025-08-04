// Drizzle ORM schema for RBAC (Postgres)
import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  primaryKey,
  unique,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 64 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const modules = pgTable('modules', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 64 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const subModules = pgTable('sub_modules', {
  id: serial('id').primaryKey(),
  moduleId: integer('module_id').references(() => modules.id),
  name: varchar('name', { length: 64 }).notNull(),
  description: varchar('description', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const actions = pgTable('actions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 64 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const permissions = pgTable(
  'permissions',
  {
    id: serial('id').primaryKey(),
    actionId: integer('action_id').references(() => actions.id),
    moduleId: integer('module_id').references(() => modules.id),
    subModuleId: integer('sub_module_id').references(() => subModules.id),
    name: varchar('name', { length: 128 }).notNull(),
    description: varchar('description', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    unique_action_module_submodule: unique().on(
      table.actionId,
      table.moduleId,
      table.subModuleId
    ),
  })
);

export const rolePermissions = pgTable(
  'role_permissions',
  {
    id: serial('id').primaryKey(),
    roleId: integer('role_id').references(() => roles.id),
    permissionId: integer('permission_id').references(() => permissions.id),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    unique_role_permission: unique().on(table.roleId, table.permissionId),
  })
);

export const userRoles = pgTable(
  'user_roles',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    roleId: integer('role_id').references(() => roles.id),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    unique_user_role: unique().on(table.userId, table.roleId),
  })
);
