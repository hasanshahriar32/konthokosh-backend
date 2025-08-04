import { Router } from 'express';
import {
  createChannels,
  createOneChannel,
  deleteChannels,
  deleteOneChannel,
  getAllChannels,
  getOneChannel,
  softDeleteChannels,
  softDeleteOneChannel,
  updateOneChannel,
} from './channel.controller';
import { validateRequest } from '../../../middlewares/validation';
import validator from './channel.validator';
import verifyRBAC from '../../../middlewares/rbac';
import { ACTIONS, MODULES, ROLES, SUB_MODULES } from '../../../configs/rbac';

const channelRoutes = Router();

// =========================
// GET /channels
// - Get all channels
// - Requires ADMIN role with VIEW permission
// =========================
channelRoutes.get(
  '/channels',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.select),
  getAllChannels
);

// =========================
// GET /channels/:id
// - Get a specific channel by ID
// - Requires ADMIN role with VIEW permission
// =========================
channelRoutes.get(
  '/channels/:id',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.detail),
  getOneChannel
);

// =========================
// POST /channels/create
// - Create a single channel
// - Requires ADMIN role with CREATE permission
// =========================
channelRoutes.post(
  '/channels/create',
  verifyRBAC({
    action: ACTIONS.CREATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.create),
  createOneChannel
);

// =========================
// POST /channels/create-multi
// - Create multiple channels
// - Requires ADMIN role with CREATE permission
// =========================
channelRoutes.post(
  '/channels/create-multi',
  verifyRBAC({
    action: ACTIONS.CREATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.createMulti),
  createChannels
);

// =========================
// PATCH /channels/update/:id
// - Update a channel by ID
// - Requires ADMIN role with UPDATE permission
// =========================
channelRoutes.patch(
  '/channels/update/:id',
  verifyRBAC({
    action: ACTIONS.UPDATE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.update),
  updateOneChannel
);

// =========================
// DELETE /channels/delete/:id
// - Hard delete a specific channel by ID
// - Requires ADMIN role with DELETE permission
// =========================
channelRoutes.delete(
  '/channels/delete/:id',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.delete),
  deleteOneChannel
);

// =========================
// POST /channels/delete-multi
// - Hard delete multiple channels
// - Requires ADMIN role with DELETE permission
// =========================
channelRoutes.post(
  '/channels/delete-multi',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.deleteMulti),
  deleteChannels
);

// =========================
// DELETE /channels/soft-delete/:id
// - Soft delete a specific channel by ID
// - Requires ADMIN role with DELETE permission
// =========================
channelRoutes.delete(
  '/channels/soft-delete/:id',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.delete),
  softDeleteOneChannel
);

// =========================
// POST /channels/soft-delete-multi
// - Soft delete multiple channels
// - Requires ADMIN role with DELETE permission
// =========================
channelRoutes.post(
  '/channels/soft-delete-multi',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.USER_MANAGEMENT,
    subModule: SUB_MODULES.USER_ROLE_ASSIGN,
  }),
  validateRequest(validator.deleteMulti),
  softDeleteChannels
);

export default channelRoutes;
