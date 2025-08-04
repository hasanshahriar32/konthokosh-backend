import { Router } from 'express';
import validator from './product-category.validator';
import { validateRequest } from '../../middlewares/validation';
import {
  createOneProductCategory,
  createProductCategories,
  deleteOneProductCategory,
  deleteProductCategories,
  getAllProductCategories,
  getOneProductCategory,
  softDeleteOneProductCategory,
  softDeleteProductCategories,
  updateOneProductCategory,
} from './product-category.controller';
import verifyRBAC from '../../middlewares/rbac';
import { ACTIONS, MODULES, ROLES, SUB_MODULES } from '../../configs/rbac';

const productCategoryRoutes = Router();

// =========================
// GET /product-categories
// - Get all product categories
// - Requires ADMIN role with VIEW permission
// =========================
productCategoryRoutes.get(
  '/product-categories',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT_CATEGORY,
  }),
  validateRequest(validator.select),
  getAllProductCategories
);

// =========================
// GET /product-categories/:id
// - Get a product category by ID
// - Requires ADMIN role with VIEW permission
// =========================
productCategoryRoutes.get(
  '/product-categories/:id',
  verifyRBAC({
    action: ACTIONS.VIEW,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT_CATEGORY,
  }),
  validateRequest(validator.detail),
  getOneProductCategory
);

// =========================
// POST /product-categories
// - Create a new product category
// - Requires ADMIN role with CREATE permission
// =========================
productCategoryRoutes.post(
  '/product-categories',
  verifyRBAC({
    action: ACTIONS.CREATE,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT_CATEGORY,
  }),
  validateRequest(validator.create),
  createOneProductCategory
);

// =========================
// POST /product-categories/create-multi
// - Create multiple product categories
// - Requires ADMIN role with CREATE permission
// =========================
productCategoryRoutes.post(
  '/product-categories/create-multi',
  verifyRBAC({
    action: ACTIONS.CREATE,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT_CATEGORY,
  }),
  validateRequest(validator.createMulti),
  createProductCategories
);

// =========================
// PATCH /product-categories/:id
// - Update a product category by ID
// - Requires ADMIN role with UPDATE permission
// =========================
productCategoryRoutes.patch(
  '/product-categories/:id',
  verifyRBAC({
    action: ACTIONS.UPDATE,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT_CATEGORY,
  }),
  validateRequest(validator.update),
  updateOneProductCategory
);

// =========================
// DELETE /product-categories/:id
// - Hard delete a product category by ID
// - Requires ADMIN role with DELETE permission
// =========================
productCategoryRoutes.delete(
  '/product-categories/:id',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT_CATEGORY,
  }),
  validateRequest(validator.delete),
  deleteOneProductCategory
);

// =========================
// POST /product-categories/delete-multi
// - Hard delete multiple product categories
// - Requires ADMIN role with DELETE permission
// =========================
productCategoryRoutes.post(
  '/product-categories/delete-multi',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT_CATEGORY,
  }),
  validateRequest(validator.deleteMulti),
  deleteProductCategories
);

// =========================
// DELETE /product-categories/soft-delete/:id
// - Soft delete a product category by ID
// - Requires ADMIN role with DELETE permission
// =========================
productCategoryRoutes.delete(
  '/product-categories/soft-delete/:id',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT_CATEGORY,
  }),
  validateRequest(validator.delete),
  softDeleteOneProductCategory
);

// =========================
// POST /product-categories/soft-delete-multi
// - Soft delete multiple product categories
// - Requires ADMIN role with DELETE permission
// =========================
productCategoryRoutes.post(
  '/product-categories/soft-delete-multi',
  verifyRBAC({
    action: ACTIONS.DELETE,
    roles: [ROLES.ADMIN],
    module: MODULES.PRODUCT,
    subModule: SUB_MODULES.PRODUCT_CATEGORY,
  }),
  validateRequest(validator.deleteMulti),
  softDeleteProductCategories
);

export default productCategoryRoutes;
