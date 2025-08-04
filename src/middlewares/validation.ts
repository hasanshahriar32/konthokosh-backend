import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { AppError } from '../utils/http';

interface ValidationSchemas {
  body?: Schema;
  query?: Schema;
  params?: Schema;
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Validate body
    if (schemas.body) {
      // Clone the request body to avoid mutating the original request
      const bodyToValidate = { ...req.body };

      // If the user object is optional and not present, remove it from the validation
      if (bodyToValidate.user) {
        delete bodyToValidate.user;
      }

      // Validate the modified body
      const { error } = schemas.body.validate(bodyToValidate);
      if (error) {
        return next(new AppError(`${error.details[0].message} in body`, 400));
      }
    }

    // Validate query
    if (schemas.query) {
      const { error } = schemas.query.validate(req.query);
      if (error) {
        return next(new AppError(`${error.details[0].message} in query`, 400));
      }
    }

    // Validate params
    if (schemas.params) {
      const { error } = schemas.params.validate(req.params);
      if (error) {
        return next(new AppError(`${error.details[0].message} in params`, 400));
      }
    }

    next();
  };
};
