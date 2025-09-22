export interface Stream {
    id: string;
    creatorId: string;
    userId: string;
    title: string;
    description?: string;
    category: string;
    tags?: string[];
    privacy: 'public' | 'followers' | 'paid';
    price?: number;
    quality: '480p' | '720p' | '1080p' | '4K';
    bitrate: number;
    fps: number;
    audioQuality: 'low' | 'medium' | 'high';
    status: 'draft' | 'live' | 'ended' | 'archived';
    viewerCount: number;
    isLive: boolean;
    startTime?: string;
    endTime?: string;
    createdAt: string;
    updatedAt: string;
}
export interface StreamViewer {
    id: string;
    userId: string;
    streamId: string;
    joinedAt: string;
    lastSeen: string;
    isModerator: boolean;
    isBanned: boolean;
    profile: {
        username: string;
        displayName: string;
        avatarUrl?: string;
    };
}
export interface ChatMessage {
    id: string;
    streamId: string;
    userId: string;
    message: string;
    timestamp: string;
    isModerator: boolean;
    profile: {
        username: string;
        displayName: string;
        avatarUrl?: string;
    };
}
export interface StreamRecording {
    id: string;
    streamId: string;
    title: string;
    duration: number;
    fileSize: number;
    url: string;
    thumbnailUrl?: string;
    createdAt: string;
}
export interface StreamAnalytics {
    streamId: string;
    totalViewers: number;
    peakViewers: number;
    averageViewers: number;
    totalDuration: number;
    totalGifts: number;
    totalTips: number;
    totalChatMessages: number;
    engagementRate: number;
    retentionRate: number;
    demographics: {
        ageGroups: Record<string, number>;
        locations: Record<string, number>;
        devices: Record<string, number>;
    };
    timeline: Array<{
        timestamp: string;
        viewers: number;
        gifts: number;
        messages: number;
    }>;
}
export interface Gift {
    id: string;
    streamId: string;
    userId: string;
    giftType: 'heart' | 'star' | 'crown' | 'zap';
    amount: number;
    message?: string;
    createdAt: string;
    profile: {
        username: string;
        displayName: string;
        avatarUrl?: string;
    };
}
export interface StreamReport {
    id: string;
    streamId: string;
    reporterId: string;
    reason: 'inappropriate' | 'spam' | 'harassment' | 'underage' | 'other';
    description?: string;
    status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
    createdAt: string;
}
declare class CamsService {
    createStream(data: {
        creatorId: string;
        userId: string;
        title: string;
        description?: string;
        category: string;
        tags?: string[];
        privacy: 'public' | 'followers' | 'paid';
        price?: number;
        quality: '480p' | '720p' | '1080p' | '4K';
        bitrate: number;
        fps: number;
        audioQuality: 'low' | 'medium' | 'high';
    }): Promise<Stream>;
    getLiveStreams(options: {
        category?: string;
        search?: string;
        limit: number;
        offset: number;
    }): Promise<Stream[]>;
    getStreamById(id: string): Promise<Stream | null>;
    updateStreamSettings(streamId: string, userId: string, updates: Partial<Stream>): Promise<Stream>;
    startStream(streamId: string, userId: string): Promise<Stream>;
    stopStream(streamId: string, userId: string): Promise<Stream>;
    joinStream(streamId: string, userId: string): Promise<StreamViewer>;
    leaveStream(streamId: string, userId: string): Promise<void>;
    getStreamViewers(streamId: string, userId: string): Promise<StreamViewer[]>;
    sendGift(data: {
        streamId: string;
        userId: string;
        giftType: 'heart' | 'star' | 'crown' | 'zap';
        amount: number;
    }): Promise<Gift>;
    getStreamChat(streamId: string, options: {
        limit: number;
        offset: number;
    }): Promise<ChatMessage[]>;
    sendChatMessage(data: {
        streamId: string;
        userId: string;
        message: string;
    }): Promise<ChatMessage>;
    startRecording(streamId: string, userId: string): Promise<StreamRecording>;
    stopRecording(streamId: string, userId: string): Promise<StreamRecording>;
    getStreamRecordings(streamId: string, userId: string): Promise<StreamRecording[]>;
    getStreamAnalytics(streamId: string, userId: string): Promise<StreamAnalytics>;
    reportStream(data: {
        streamId: string;
        reporterId: string;
        reason: 'inappropriate' | 'spam' | 'harassment' | 'underage' | 'other';
        description?: string;
    }): Promise<StreamReport>;
    banViewer(streamId: string, userId: string, viewerId: string, reason?: string): Promise<void>;
    promoteToModerator(streamId: string, userId: string, viewerId: string): Promise<void>;
    private mapStreamData;
    private mapViewerData;
    private mapChatMessageData;
    private mapRecordingData;
    private mapGiftData;
    private mapReportData;
}
export declare const camsService: CamsService;
export {};
//# sourceMappingURL=camsService.d.ts.map