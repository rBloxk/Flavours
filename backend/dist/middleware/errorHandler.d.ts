import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
    code?: string;
    details?: any;
    retryable?: boolean;
}
export declare class CustomError extends Error implements AppError {
    statusCode: number;
    isOperational: boolean;
    code: string;
    details?: any;
    retryable: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean, code?: string, details?: any, retryable?: boolean);
}
export declare class ValidationError extends CustomError {
    constructor(message: string, details?: any);
}
export declare class AuthenticationError extends CustomError {
    constructor(message?: string);
}
export declare class AuthorizationError extends CustomError {
    constructor(message?: string);
}
export declare class NotFoundError extends CustomError {
    constructor(resource?: string);
}
export declare class ConflictError extends CustomError {
    constructor(message: string, details?: any);
}
export declare class RateLimitError extends CustomError {
    constructor(message?: string);
}
export declare class PaymentError extends CustomError {
    constructor(message: string, details?: any);
}
export declare class DatabaseError extends CustomError {
    constructor(message: string, details?: any);
}
export declare class ExternalServiceError extends CustomError {
    constructor(service: string, message: string, details?: any);
}
export declare const errorHandler: (error: AppError, req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const handleUnhandledRejection: (reason: any, promise: Promise<any>) => void;
export declare const handleUncaughtException: (error: Error) => void;
export declare const errorRecovery: (req: Request, res: Response, next: NextFunction) => void;
export declare const gracefulShutdown: (signal: string) => never;
//# sourceMappingURL=errorHandler.d.ts.map