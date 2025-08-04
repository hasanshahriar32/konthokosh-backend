import { Router } from 'express';
import validator from './product.validator';
import { validateRequest } from '../../middlewares/validation';
import {
  createOneProduct,
  createProducts,
  deleteOneProduct,
  deleteProducts,
  getAllProducts,
  getOneProduct,
  softDeleteOneProduct,
  softDeleteProducts,
  updateOneProduct,
} from './product.controller';
import verifyRBAC from '../../middlewares/rbac';
import { ACTIONS, MODULES, ROLES, SUB_MODULES } from '../../configs/rbac';

const productRoutes = Router();

// =========================
// GET /products
// - Get all products
// - Requires ADMIN role with VIEW permission on PRODUCT module
// =========================
productRoutes.get(
  '/products',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT,
  }),
  validateRequest(validator.select),
  getAllProducts
);

// =========================
// GET /products/:id
// - Get a single product by ID
// - Requires ADMIN role with VIEW permission
// =========================
productRoutes.get(
  '/products/:id',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT,
  }),
  validateRequest(validator.detail),
  getOneProduct
);

// =========================
// POST /products
// - Create a new product
// - Requires ADMIN role with CREATE permission
// =========================
productRoutes.post(
  '/products',
  verifyRBAC({
    action: ACTIONS.CREATE,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT,
  }),
  validateRequest(validator.create),
  createOneProduct
);

// =========================
// POST /products/create-multi
// - Create multiple products in bulk
// - Requires ADMIN role with CREATE permission
// =========================
productRoutes.post(
  '/products/create-multi',
  verifyRBAC({
    action: ACTIONS.CREATE,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT,
  }),
  validateRequest(validator.createMulti),
  createProducts
);

// =========================
// PATCH /products/:id
// - Update a product by ID
// - Requires ADMIN role with UPDATE permission
// =========================
productRoutes.patch(
  '/products/:id',
  verifyRBAC({
    action: ACTIONS.UPDATE,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT,
  }),
  validateRequest(validator.update),
  updateOneProduct
);

// =========================
// DELETE /products/:id
// - Hard delete a product by ID
// - Requires ADMIN role with DELETE permission
// =========================
productRoutes.delete(
  '/products/:id',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT,
  }),
  validateRequest(validator.delete),
  deleteOneProduct
);

// =========================
// POST /products/delete-multi
// - Hard delete multiple products
// - Requires ADMIN role with DELETE permission
// =========================
productRoutes.post(
  '/products/delete-multi',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT,
  }),
  validateRequest(validator.deleteMulti),
  deleteProducts
);

// =========================
// DELETE /products/soft-delete/:id
// - Soft delete a product by ID (mark as inactive instead of removing)
// - Requires ADMIN role with DELETE permission
// =========================
productRoutes.delete(
  '/products/soft-delete/:id',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT,
  }),
  validateRequest(validator.delete),
  softDeleteOneProduct
);

// =========================
// POST /products/soft-delete-multi
// - Soft delete multiple products
// - Requires ADMIN role with DELETE permission
// =========================
productRoutes.post(
  '/products/soft-delete-multi',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT,
  }),
  validateRequest(validator.deleteMulti),
  softDeleteProducts
);

export default productRoutes;
