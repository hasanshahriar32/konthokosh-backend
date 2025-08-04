import { NextFunction, Request, Response } from 'express';
import { AppError, responseData } from '../../utils/http';
import { MESSAGES } from '../../configs/messages';
import {
  createMultiProducts,
  createProduct,
  deleteMultiProducts,
  deleteProduct,
  getExistingProduct,
  getProduct,
  getProducts,
  softDeleteMultiProducts,
  softDeleteProduct,
  updateProduct,
} from './product.service';
import db from '../../db/db';
import { ListQuery } from '../../types/types';
import { v4 as uuidv4 } from 'uuid';

export async function getAllProducts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getProducts(req.query as unknown as ListQuery);

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

export async function getOneProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const product = await getProduct(req.params.id);

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

export async function createOneProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const existingProduct = await getExistingProduct({ name: req.body.name });
    if (existingProduct)
      return next(new AppError(`${req.body.name} is already existed!`, 400));

    const payload = {
      name: req.body.name,
      price: req.body.price,
      categoryId: req.body.categoryId,
      createdBy: req.body.user.id,
    };
    const createdProduct = await createProduct(payload);

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.CREATE,
      data: createdProduct,
    });
  } catch (error) {
    next(error);
  }
}

export async function createProducts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = req.body.products.map((pd: Record<string, unknown>) => ({
      name: pd.name,
      price: pd.price,
      categoryId: pd.categoryId,
      createdBy: req.body.user.id,
    }));
    const createdProducts = await createMultiProducts(payload);

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.CREATE,
      data: createdProducts,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOneProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = {
      name: req.body.name,
      price: req.body.price,
      categoryId: req.body.categoryId,
      updatedBy: req.body.user.id,
    };
    const updatedProduct = await updateProduct({
      id: req.params.id,
      data: payload,
    });

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.UPDATE,
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteOneProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deletedProduct = await deleteProduct(req.params.id);

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedProduct,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProducts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deletedProducts = await deleteMultiProducts(req.body.ids);

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedProducts,
    });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteOneProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const isExistedProduct = await getExistingProduct({
      id: Number(req.params.id),
    });

    if (!isExistedProduct) return next(new AppError(MESSAGES.ERROR.BAD_REQUEST, 400));

    const deletedProduct = await softDeleteProduct(req.params.id);

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedProduct,
    });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteProducts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deletedProducts = await softDeleteMultiProducts(req.body.ids);

    responseData({
      res,
      status: 200,
      message: MESSAGES.SUCCESS.DELETE,
      data: deletedProducts,
    });
  } catch (error) {
    next(error);
  }
}
