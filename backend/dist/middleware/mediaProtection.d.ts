import { Request, Response, NextFunction } from 'express';
export interface MediaProtectionConfig {
    enableDRM: boolean;
    enableWatermarking: boolean;
    enableStreamingProtection: boolean;
    enableAccessLogging: boolean;
    maxConcurrentStreams: number;
    tokenExpirationMinutes: number;
    allowedDomains: string[];
    blockedUserAgents: string[];
}
export declare class MediaProtectionMiddleware {
    private config;
    private activeStreams;
    private accessLogs;
    constructor(config: MediaProtectionConfig);
    validateMediaAccess: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    private validateToken;
    private checkConcurrentStreams;
    private isBlockedUserAgent;
    private addSecurityHeaders;
    private logAccessAttempt;
    private decryptToken;
    getSecurityStats(): any;
    getAccessLogs(limit?: number): any[];
}
export declare const mediaProtection: MediaProtectionMiddleware;
//# sourceMappingURL=mediaProtection.d.ts.map