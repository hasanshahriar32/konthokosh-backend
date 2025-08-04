import { Router } from 'express';
import {
  createSubModules,
  createOneSubModule,
  deleteSubModules,
  deleteOneSubModule,
  getAllSubModules,
  getOneSubModule,
  softDeleteSubModules,
  softDeleteOneSubModule,
  updateOneSubModule,
} from './sub-module.controller';
import { validateRequest } from '../../../middlewares/validation';
import validator from './sub-module.validator';
import verifyRBAC from '../../../middlewares/rbac';
import { ACTIONS, MODULES, ROLES, SUB_MODULES } from '../../../configs/rbac';

const subModuleRoutes = Router();

// =========================
// GET /sub-modules
// - Get all sub-modules
// - Requires ADMIN role with VIEW permission
// =========================
subModuleRoutes.get(
  '/sub-modules',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.select),
  getAllSubModules
);

// =========================
// GET /sub-modules/:id
// - Get a specific sub-module by ID
// - Requires ADMIN role with VIEW permission
// =========================
subModuleRoutes.get(
  '/sub-modules/:id',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.detail),
  getOneSubModule
);

// =========================
// POST /sub-modules/create
// - Create a single sub-module
// - Requires ADMIN role with CREATE permission
// =========================
subModuleRoutes.post(
  '/sub-modules/create',
  verifyRBAC({
    action: ACTIONS.CREATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.create),
  createOneSubModule
);

// =========================
// POST /sub-modules/create-multi
// - Create multiple sub-modules
// - Requires ADMIN role with CREATE permission
// =========================
subModuleRoutes.post(
  '/sub-modules/create-multi',
  verifyRBAC({
    action: ACTIONS.CREATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.createMulti),
  createSubModules
);

// =========================
// PATCH /sub-modules/update/:id
// - Update a sub-module by ID
// - Requires ADMIN role with UPDATE permission
// =========================
subModuleRoutes.patch(
  '/sub-modules/update/:id',
  verifyRBAC({
    action: ACTIONS.UPDATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.update),
  updateOneSubModule
);

// =========================
// DELETE /sub-modules/delete/:id
// - Hard delete a specific sub-module by ID
// - Requires ADMIN role with DELETE permission
// =========================
subModuleRoutes.delete(
  '/sub-modules/delete/:id',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.delete),
  deleteOneSubModule
);

// =========================
// POST /sub-modules/delete-multi
// - Hard delete multiple sub-modules
// - Requires ADMIN role with DELETE permission
// =========================
subModuleRoutes.post(
  '/sub-modules/delete-multi',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.deleteMulti),
  deleteSubModules
);

// =========================
// DELETE /sub-modules/soft-delete/:id
// - Soft delete a specific sub-module by ID
// - Requires ADMIN role with DELETE permission
// =========================
subModuleRoutes.delete(
  '/sub-modules/soft-delete/:id',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.delete),
  softDeleteOneSubModule
);

// =========================
// POST /sub-modules/soft-delete-multi
// - Soft delete multiple sub-modules
// - Requires ADMIN role with DELETE permission
// =========================
subModuleRoutes.post(
  '/sub-modules/soft-delete-multi',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.deleteMulti),
  softDeleteSubModules
);

export default subModuleRoutes;
