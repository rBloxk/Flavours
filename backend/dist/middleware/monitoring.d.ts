import { Request, Response, NextFunction } from 'express';
export interface Metrics {
    requests_total: number;
    requests_duration_ms: number;
    requests_by_status: Record<number, number>;
    requests_by_method: Record<string, number>;
    requests_by_endpoint: Record<string, number>;
    active_connections: number;
    memory_usage: NodeJS.MemoryUsage;
    uptime: number;
}
declare class MetricsCollector {
    private metrics;
    private startTime;
    incrementRequest(method: string, endpoint: string, status: number, duration: number): void;
    getMetrics(): Metrics;
    getAverageResponseTime(): number;
    getRequestsPerMinute(): number;
    reset(): void;
}
export declare const metricsCollector: MetricsCollector;
export declare const requestMonitoring: (req: Request, res: Response, next: NextFunction) => void;
export declare const healthCheck: (req: Request, res: Response) => void;
export declare const metricsEndpoint: (req: Request, res: Response) => void;
export declare const performanceMonitoring: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorTracking: (error: any, req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=monitoring.d.ts.map