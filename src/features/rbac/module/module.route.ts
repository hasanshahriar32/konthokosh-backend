import { Router } from 'express';
import {
  createModules,
  createOneModule,
  deleteModules,
  deleteOneModule,
  getAllModules,
  getOneModule,
  softDeleteModules,
  softDeleteOneModule,
  updateOneModule,
} from './module.controller';
import { validateRequest } from '../../../middlewares/validation';
import validator from './module.validator';
import verifyRBAC from '../../../middlewares/rbac';
import { ACTIONS, MODULES, ROLES, SUB_MODULES } from '../../../configs/rbac';

const moduleRoutes = Router();

// =========================
// GET /modules
// - Get all modules
// - Requires ADMIN role with VIEW permission
// =========================
moduleRoutes.get(
  '/modules',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.select),
  getAllModules
);

// =========================
// GET /modules/:id
// - Get a specific module by ID
// - Requires ADMIN role with VIEW permission
// =========================
moduleRoutes.get(
  '/modules/:id',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.detail),
  getOneModule
);

// =========================
// POST /modules/create
// - Create a single module
// - Requires ADMIN role with CREATE permission
// =========================
moduleRoutes.post(
  '/modules/create',
  verifyRBAC({
    action: ACTIONS.CREATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.create),
  createOneModule
);

// =========================
// POST /modules/create-multi
// - Create multiple modules
// - Requires ADMIN role with CREATE permission
// =========================
moduleRoutes.post(
  '/modules/create-multi',
  verifyRBAC({
    action: ACTIONS.CREATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.createMulti),
  createModules
);

// =========================
// PATCH /modules/update/:id
// - Update a module by ID
// - Requires ADMIN role with UPDATE permission
// =========================
moduleRoutes.patch(
  '/modules/update/:id',
  verifyRBAC({
    action: ACTIONS.UPDATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.update),
  updateOneModule
);

// =========================
// DELETE /modules/delete/:id
// - Hard delete a specific module by ID
// - Requires ADMIN role with DELETE permission
// =========================
moduleRoutes.delete(
  '/modules/delete/:id',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.delete),
  deleteOneModule
);

// =========================
// POST /modules/delete-multi
// - Hard delete multiple modules
// - Requires ADMIN role with DELETE permission
// =========================
moduleRoutes.post(
  '/modules/delete-multi',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.deleteMulti),
  deleteModules
);

// =========================
// DELETE /modules/soft-delete/:id
// - Soft delete a specific module by ID
// - Requires ADMIN role with DELETE permission
// =========================
moduleRoutes.delete(
  '/modules/soft-delete/:id',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.delete),
  softDeleteOneModule
);

// =========================
// POST /modules/soft-delete-multi
// - Soft delete multiple modules
// - Requires ADMIN role with DELETE permission
// =========================
moduleRoutes.post(
  '/modules/soft-delete-multi',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.deleteMulti),
  softDeleteModules
);

export default moduleRoutes;
