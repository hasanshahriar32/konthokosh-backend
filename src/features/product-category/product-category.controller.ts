import { NextFunction, Request, Response } from 'express';
import { AppError, responseData } from '../../utils/http';
import { MESSAGES } from '../../configs/messages';
import {
  createMultiProductCategories,
  createProductCategory,
  deleteMultiProductCategories,
  deleteProductCategory,
  getExistingProductCategory,
  getProductCategory,
  getProductCategories,
  softDeleteMultiProductCategories,
  softDeleteProductCategory,
  updateProductCategory,
} from './product-category.service';
import { ListQuery } from '../../types/types';
import { v4 as uuidv4 } from 'uuid';

export async function getAllProductCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getProductCategories(
      req.query as unknown as ListQuery
    );

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.RETRIVE,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOneProductCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const product = await getProductCategory(Number(req.params.id));

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.RETRIVE,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function createOneProductCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const existingProductCategory = await getExistingProductCategory({
      name: req.body.name,
    });
    if (existingProductCategory)
      return next(new AppError(`${req.body.name} is already existed!`, 400));

    const payload = {
      name: req.body.name,
      created_by: req.body.user.id,
    };
    const createdProductCategory = await createProductCategory(payload);

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.CREATE,
      data: createdProductCategory,
    });
  } catch (error) {
    next(error);
  }
}

export async function createProductCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = req.body.productCategories.map(
      (pd: Record<string, unknown>) => ({
        name: pd.name,
        created_by: req.body.user.id,
      })
    );
    const createdProductCategories =
      await createMultiProductCategories(payload);

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.CREATE,
      data: createdProductCategories,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOneProductCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = {
      name: req.body.name,
      updated_by: req.body.user.id,
    };
    const updatedProductCategory = await updateProductCategory({
      id: Number(req.params.id),
      data: payload,
    });

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.UPDATE,
      data: updatedProductCategory,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteOneProductCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deletedProductCategory = await deleteProductCategory(
      Number(req.params.id)
    );

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedProductCategory,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProductCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deletedProductCategories = await deleteMultiProductCategories(
      req.body.ids.map((id: string | number) => Number(id))
    );

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedProductCategories,
    });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteOneProductCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const isExistedProductCategory = await getExistingProductCategory({
      name: req.body.name,
    });

    if (!isExistedProductCategory) return next(new AppError(MESSAGES.ERROR.BAD_REQUEST, 400));

    const deletedProductCategory = await softDeleteProductCategory(
      Number(req.params.id)
    );

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedProductCategory,
    });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteProductCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deletedProductCategories = await softDeleteMultiProductCategories(
      req.body.ids.map((id: string | number) => Number(id))
    );

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedProductCategories,
    });
  } catch (error) {
    next(error);
  }
}
