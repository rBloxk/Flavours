import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { z } from 'zod';
export declare const validateRequest: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateRequestJoi: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateQuery: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateParams: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateFileUpload: (options: {
    maxSize?: number;
    allowedTypes?: string[];
    required?: boolean;
}) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const commonSchemas: {
    uuid: Joi.StringSchema<string>;
    uuidOptional: Joi.StringSchema<string>;
    email: Joi.StringSchema<string>;
    emailOptional: Joi.StringSchema<string>;
    password: Joi.StringSchema<string>;
    username: Joi.StringSchema<string>;
    displayName: Joi.StringSchema<string>;
    bio: Joi.StringSchema<string>;
    url: Joi.StringSchema<string>;
    urlOptional: Joi.StringSchema<string>;
    phone: Joi.StringSchema<string>;
    date: Joi.DateSchema<Date>;
    dateOptional: Joi.DateSchema<Date>;
    pagination: Joi.ObjectSchema<any>;
    search: Joi.ObjectSchema<any>;
    file: Joi.ObjectSchema<any>;
    address: Joi.ObjectSchema<any>;
    creditCard: Joi.ObjectSchema<any>;
    amount: Joi.NumberSchema<number>;
    content: Joi.ObjectSchema<any>;
};
export declare const sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateRateLimit: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateContentType: (allowedTypes: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=validation.d.ts.map