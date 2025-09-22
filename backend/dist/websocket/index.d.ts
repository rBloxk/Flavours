import { Server } from 'socket.io';
export declare function setupWebSocket(io: Server): {
    io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
    sendNotification: (userId: string, notification: any) => void;
    sendNotificationToUsers: (userIds: string[], notification: any) => void;
    broadcastToStream: (streamId: string, event: string, data: any) => void;
    broadcastToChatSession: (sessionId: string, event: string, data: any) => void;
    getOnlineUsersCount: () => Promise<number>;
};
//# sourceMappingURL=index.d.ts.map