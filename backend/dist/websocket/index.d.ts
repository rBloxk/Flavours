import { Server } from 'socket.io';
interface UserPresence {
    userId: string;
    status: 'online' | 'away' | 'busy' | 'offline';
    lastSeen: Date;
    currentActivity?: string;
}
interface NotificationData {
    id: string;
    type: 'like' | 'comment' | 'subscription' | 'message' | 'stream_start' | 'gift_received';
    title: string;
    message: string;
    userId: string;
    metadata?: any;
    timestamp: Date;
    read: boolean;
}
export declare function setupWebSocket(io: Server): {
    io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
    sendNotification: (userId: string, notification: any) => void;
    sendNotificationToUsers: (userIds: string[], notification: any) => void;
    broadcastToStream: (streamId: string, event: string, data: any) => void;
    broadcastToChatSession: (sessionId: string, event: string, data: any) => void;
    getOnlineUsersCount: () => Promise<number>;
    updateUserPresence: (userId: string, status: string, activity?: string) => Promise<void>;
    createNotification: (notification: Omit<NotificationData, "id" | "timestamp" | "read">) => Promise<any>;
    getRealtimeAnalytics: () => Promise<{
        onlineUsers: number;
        activeStreams: number;
        totalConnections: number;
        systemHealth: "healthy" | "warning" | "critical";
    }>;
    notifyFollowersOfPresenceChange: (userId: string, presence: UserPresence) => Promise<void>;
};
export {};
//# sourceMappingURL=index.d.ts.map