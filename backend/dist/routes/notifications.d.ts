declare const router: import("express-serve-static-core").Router;
export declare function createNotification(userId: string, type: string, title: string, message: string, context?: any, actorId?: string, deliveryMethods?: string[]): Promise<any>;
export declare function sendBulkNotification(userIds: string[], type: string, title: string, message: string, context?: any, actorId?: string): Promise<any[]>;
export declare function sendNotificationToFollowers(userId: string, type: string, title: string, message: string, context?: any): Promise<any[]>;
export declare function sendNotificationToSubscribers(creatorId: string, type: string, title: string, message: string, context?: any): Promise<any[]>;
export default router;
//# sourceMappingURL=notifications.d.ts.map