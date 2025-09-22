declare class FirebaseManager {
    private app;
    private auth;
    private firestore;
    private storage;
    private functions;
    private config;
    constructor();
    private initializeFirebase;
    createUser(userData: {
        email: string;
        password: string;
        displayName?: string;
        photoURL?: string;
        disabled?: boolean;
    }): Promise<any>;
    getUser(uid: string): Promise<any>;
    updateUser(uid: string, updateData: any): Promise<any>;
    deleteUser(uid: string): Promise<void>;
    verifyIdToken(idToken: string): Promise<any>;
    createCustomToken(uid: string, additionalClaims?: any): Promise<any>;
    createDocument(collection: string, data: any, docId?: string): Promise<any>;
    getDocument(collection: string, docId: string): Promise<any>;
    updateDocument(collection: string, docId: string, data: any): Promise<void>;
    deleteDocument(collection: string, docId: string): Promise<void>;
    queryCollection(collection: string, filters?: any[], limit?: number): Promise<any>;
    uploadFile(bucketName: string, fileName: string, fileBuffer: Buffer, metadata?: any): Promise<string>;
    deleteFile(bucketName: string, fileName: string): Promise<void>;
    getSignedUrl(bucketName: string, fileName: string, expiresIn?: number): Promise<any>;
    healthCheck(): Promise<boolean>;
    getAuth(): any;
    getFirestore(): any;
    getStorage(): any;
    getFunctions(): any;
    getApp(): any;
}
export declare const firebaseManager: FirebaseManager;
export declare const firebaseAuth: any;
export declare const firebaseFirestore: any;
export declare const firebaseStorage: any;
export declare const firebaseFunctions: any;
export {};
//# sourceMappingURL=firebase.d.ts.map