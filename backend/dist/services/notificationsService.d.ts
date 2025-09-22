export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    createdAt: string;
    readAt?: string;
}
export interface NotificationPreferences {
    id: string;
    userId: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    notificationTypes: Record<string, boolean>;
    createdAt: string;
    updatedAt: string;
}
export interface PushSubscription {
    id: string;
    userId: string;
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    createdAt: string;
}
export interface NotificationType {
    id: string;
    name: string;
    description: string;
    defaultEnabled: boolean;
    category: string;
}
declare class NotificationsService {
    getUserNotifications(userId: string, options: {
        page: number;
        limit: number;
        unreadOnly?: boolean;
        type?: string;
    }): Promise<Notification[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationIds: string[], userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    deleteAllNotifications(userId: string): Promise<void>;
    getNotificationPreferences(userId: string): Promise<NotificationPreferences | null>;
    updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences>;
    sendNotification(data: {
        recipientId: string;
        type: string;
        title: string;
        message: string;
        data?: any;
    }): Promise<Notification>;
    getNotificationTypes(): Promise<NotificationType[]>;
    subscribeToPushNotifications(userId: string, subscription: {
        endpoint: string;
        keys: {
            p256dh: string;
            auth: string;
        };
    }): Promise<PushSubscription>;
    unsubscribeFromPushNotifications(userId: string): Promise<void>;
    private createDefaultPreferences;
    private sendPushNotification;
    private sendEmailNotification;
    private mapNotificationData;
    private mapPreferencesData;
    private mapPushSubscriptionData;
}
export declare const notificationsService: NotificationsService;
export {};
//# sourceMappingURL=notificationsService.d.ts.map