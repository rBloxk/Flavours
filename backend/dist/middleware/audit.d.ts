import { Request, Response, NextFunction } from 'express';
export interface AuditLog {
    id?: string;
    user_id?: string;
    action: string;
    resource: string;
    resource_id?: string;
    details: any;
    ip_address: string;
    user_agent: string;
    timestamp: string;
    status: 'success' | 'failure' | 'error';
    error_message?: string;
}
export declare const auditLogger: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const logAuditEntry: (auditData: AuditLog) => Promise<void>;
export declare const auditSensitiveOperation: (operation: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const auditPaymentOperation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const auditAuthOperation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=audit.d.ts.map