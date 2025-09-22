export interface ChatSession {
    id: string;
    userId: string;
    interests: string[];
    ageRange?: {
        min: number;
        max: number;
    };
    location?: string;
    gender?: 'male' | 'female' | 'non-binary' | 'other';
    chatType: 'text' | 'audio' | 'video';
    status: 'waiting' | 'matched' | 'active' | 'ended';
    matchedUserId?: string;
    matchedAt?: string;
    endedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface ChatMessage {
    id: string;
    sessionId: string;
    userId: string;
    message: string;
    type: 'text' | 'image' | 'emoji';
    timestamp: string;
    isRead: boolean;
    profile: {
        username: string;
        displayName: string;
        avatarUrl?: string;
    };
}
export interface ChatMatch {
    sessionId: string;
    matchedUserId: string;
    matchedAt: string;
    compatibility: number;
    sharedInterests: string[];
    profile: {
        username: string;
        displayName: string;
        avatarUrl?: string;
        age?: number;
        location?: string;
    };
}
export interface ChatPreferences {
    id: string;
    userId: string;
    interests: string[];
    ageRange: {
        min: number;
        max: number;
    };
    location?: string;
    gender?: 'male' | 'female' | 'non-binary' | 'other';
    chatType: 'text' | 'audio' | 'video';
    autoSkip: boolean;
    skipDelay: number;
    createdAt: string;
    updatedAt: string;
}
export interface ChatHistory {
    id: string;
    sessionId: string;
    matchedUserId: string;
    duration: number;
    messageCount: number;
    endedAt: string;
    profile: {
        username: string;
        displayName: string;
        avatarUrl?: string;
    };
}
export interface ChatStats {
    totalSessions: number;
    totalMatches: number;
    totalMessages: number;
    averageSessionDuration: number;
    favoriteInterests: string[];
    blockedUsers: number;
    reportedUsers: number;
}
export interface ChatReport {
    id: string;
    sessionId: string;
    reporterId: string;
    reportedUserId: string;
    reason: 'inappropriate' | 'spam' | 'harassment' | 'underage' | 'fake' | 'other';
    description?: string;
    status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
    createdAt: string;
}
export interface CallSession {
    id: string;
    sessionId: string;
    callType: 'audio' | 'video';
    status: 'initiated' | 'ringing' | 'active' | 'ended';
    startedAt: string;
    endedAt?: string;
    duration?: number;
}
declare class FlavoursTalkService {
    createChatSession(data: {
        userId: string;
        interests: string[];
        ageRange?: {
            min: number;
            max: number;
        };
        location?: string;
        gender?: 'male' | 'female' | 'non-binary' | 'other';
        chatType: 'text' | 'audio' | 'video';
    }): Promise<ChatSession>;
    findMatch(sessionId: string, userId: string): Promise<ChatMatch | null>;
    getActiveSession(userId: string): Promise<ChatSession | null>;
    endChatSession(sessionId: string, userId: string): Promise<void>;
    skipMatch(sessionId: string, userId: string, reason?: string): Promise<void>;
    sendMessage(data: {
        sessionId: string;
        userId: string;
        message: string;
        type: 'text' | 'image' | 'emoji';
    }): Promise<ChatMessage>;
    getChatMessages(sessionId: string, userId: string, options: {
        limit: number;
        offset: number;
    }): Promise<ChatMessage[]>;
    reportUser(data: {
        sessionId: string;
        reporterId: string;
        reason: 'inappropriate' | 'spam' | 'harassment' | 'underage' | 'fake' | 'other';
        description?: string;
    }): Promise<ChatReport>;
    blockUser(sessionId: string, userId: string, blockedUserId: string, reason?: string): Promise<void>;
    updatePreferences(userId: string, preferences: Partial<ChatPreferences>): Promise<ChatPreferences>;
    getPreferences(userId: string): Promise<ChatPreferences | null>;
    getChatHistory(userId: string, options: {
        limit: number;
        offset: number;
    }): Promise<ChatHistory[]>;
    getChatStats(userId: string): Promise<ChatStats>;
    getAvailableInterests(): Promise<string[]>;
    getOnlineUsersCount(): Promise<number>;
    startCall(sessionId: string, userId: string, callType: 'audio' | 'video'): Promise<CallSession>;
    endCall(sessionId: string, userId: string): Promise<void>;
    private calculateCompatibility;
    private mapSessionData;
    private mapMessageData;
    private mapPreferencesData;
    private mapHistoryData;
    private mapReportData;
    private mapCallData;
}
export declare const flavourstalkService: FlavoursTalkService;
export {};
//# sourceMappingURL=flavourstalkService.d.ts.map