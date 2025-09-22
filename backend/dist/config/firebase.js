"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseFunctions = exports.firebaseStorage = exports.firebaseFirestore = exports.firebaseAuth = exports.firebaseManager = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const functions_1 = require("firebase-admin/functions");
const logger_1 = require("../utils/logger");
class FirebaseManager {
    constructor() {
        this.config = {
            projectId: process.env.FIREBASE_PROJECT_ID || '',
            privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
            databaseURL: process.env.FIREBASE_DATABASE_URL
        };
        this.initializeFirebase();
    }
    initializeFirebase() {
        try {
            if ((0, app_1.getApps)().length === 0) {
                if (this.config.privateKey && this.config.clientEmail) {
                    this.app = (0, app_1.initializeApp)({
                        credential: (0, app_1.cert)({
                            projectId: this.config.projectId,
                            privateKey: this.config.privateKey,
                            clientEmail: this.config.clientEmail
                        }),
                        storageBucket: this.config.storageBucket,
                        databaseURL: this.config.databaseURL
                    });
                    logger_1.logger.info('Firebase Admin SDK initialized with service account credentials');
                }
                else {
                    this.app = (0, app_1.initializeApp)({
                        projectId: this.config.projectId,
                        storageBucket: this.config.storageBucket,
                        databaseURL: this.config.databaseURL
                    });
                    logger_1.logger.info('Firebase Admin SDK initialized with Application Default Credentials');
                }
            }
            else {
                this.app = (0, app_1.getApps)()[0];
                logger_1.logger.info('Using existing Firebase app instance');
            }
            this.auth = (0, auth_1.getAuth)(this.app);
            this.firestore = (0, firestore_1.getFirestore)(this.app);
            this.storage = (0, storage_1.getStorage)(this.app);
            this.functions = (0, functions_1.getFunctions)(this.app);
            logger_1.logger.info('Firebase services initialized', {
                projectId: this.config.projectId,
                storageBucket: this.config.storageBucket
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize Firebase:', error);
            throw error;
        }
    }
    async createUser(userData) {
        try {
            const userRecord = await this.auth.createUser({
                email: userData.email,
                password: userData.password,
                displayName: userData.displayName,
                photoURL: userData.photoURL,
                disabled: userData.disabled || false
            });
            logger_1.logger.info('User created successfully', { uid: userRecord.uid });
            return userRecord;
        }
        catch (error) {
            logger_1.logger.error('Failed to create user:', error);
            throw error;
        }
    }
    async getUser(uid) {
        try {
            const userRecord = await this.auth.getUser(uid);
            return userRecord;
        }
        catch (error) {
            logger_1.logger.error('Failed to get user:', error);
            throw error;
        }
    }
    async updateUser(uid, updateData) {
        try {
            const userRecord = await this.auth.updateUser(uid, updateData);
            logger_1.logger.info('User updated successfully', { uid });
            return userRecord;
        }
        catch (error) {
            logger_1.logger.error('Failed to update user:', error);
            throw error;
        }
    }
    async deleteUser(uid) {
        try {
            await this.auth.deleteUser(uid);
            logger_1.logger.info('User deleted successfully', { uid });
        }
        catch (error) {
            logger_1.logger.error('Failed to delete user:', error);
            throw error;
        }
    }
    async verifyIdToken(idToken) {
        try {
            const decodedToken = await this.auth.verifyIdToken(idToken);
            return decodedToken;
        }
        catch (error) {
            logger_1.logger.error('Failed to verify ID token:', error);
            throw error;
        }
    }
    async createCustomToken(uid, additionalClaims) {
        try {
            const customToken = await this.auth.createCustomToken(uid, additionalClaims);
            return customToken;
        }
        catch (error) {
            logger_1.logger.error('Failed to create custom token:', error);
            throw error;
        }
    }
    async createDocument(collection, data, docId) {
        try {
            const docRef = docId
                ? this.firestore.collection(collection).doc(docId)
                : this.firestore.collection(collection).doc();
            await docRef.set({
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            logger_1.logger.info('Document created successfully', { collection, docId: docRef.id });
            return docRef.id;
        }
        catch (error) {
            logger_1.logger.error('Failed to create document:', error);
            throw error;
        }
    }
    async getDocument(collection, docId) {
        try {
            const doc = await this.firestore.collection(collection).doc(docId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        }
        catch (error) {
            logger_1.logger.error('Failed to get document:', error);
            throw error;
        }
    }
    async updateDocument(collection, docId, data) {
        try {
            await this.firestore.collection(collection).doc(docId).update({
                ...data,
                updatedAt: new Date()
            });
            logger_1.logger.info('Document updated successfully', { collection, docId });
        }
        catch (error) {
            logger_1.logger.error('Failed to update document:', error);
            throw error;
        }
    }
    async deleteDocument(collection, docId) {
        try {
            await this.firestore.collection(collection).doc(docId).delete();
            logger_1.logger.info('Document deleted successfully', { collection, docId });
        }
        catch (error) {
            logger_1.logger.error('Failed to delete document:', error);
            throw error;
        }
    }
    async queryCollection(collection, filters = [], limit) {
        try {
            let query = this.firestore.collection(collection);
            filters.forEach(filter => {
                query = query.where(filter.field, filter.operator, filter.value);
            });
            if (limit) {
                query = query.limit(limit);
            }
            const snapshot = await query.get();
            const documents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return documents;
        }
        catch (error) {
            logger_1.logger.error('Failed to query collection:', error);
            throw error;
        }
    }
    async uploadFile(bucketName, fileName, fileBuffer, metadata) {
        try {
            const bucket = this.storage.bucket(bucketName);
            const file = bucket.file(fileName);
            await file.save(fileBuffer, {
                metadata: {
                    contentType: metadata?.contentType || 'application/octet-stream',
                    ...metadata
                }
            });
            if (metadata?.public) {
                await file.makePublic();
            }
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
            logger_1.logger.info('File uploaded successfully', { fileName, bucketName });
            return publicUrl;
        }
        catch (error) {
            logger_1.logger.error('Failed to upload file:', error);
            throw error;
        }
    }
    async deleteFile(bucketName, fileName) {
        try {
            const bucket = this.storage.bucket(bucketName);
            await bucket.file(fileName).delete();
            logger_1.logger.info('File deleted successfully', { fileName, bucketName });
        }
        catch (error) {
            logger_1.logger.error('Failed to delete file:', error);
            throw error;
        }
    }
    async getSignedUrl(bucketName, fileName, expiresIn = 3600) {
        try {
            const bucket = this.storage.bucket(bucketName);
            const file = bucket.file(fileName);
            const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + expiresIn * 1000
            });
            return signedUrl;
        }
        catch (error) {
            logger_1.logger.error('Failed to get signed URL:', error);
            throw error;
        }
    }
    async healthCheck() {
        try {
            await this.firestore.collection('_health').doc('test').get();
            await this.auth.listUsers(1);
            logger_1.logger.info('Firebase health check passed');
            return true;
        }
        catch (error) {
            logger_1.logger.error('Firebase health check failed:', error);
            return false;
        }
    }
    getAuth() { return this.auth; }
    getFirestore() { return this.firestore; }
    getStorage() { return this.storage; }
    getFunctions() { return this.functions; }
    getApp() { return this.app; }
}
exports.firebaseManager = new FirebaseManager();
exports.firebaseAuth = exports.firebaseManager.getAuth();
exports.firebaseFirestore = exports.firebaseManager.getFirestore();
exports.firebaseStorage = exports.firebaseManager.getStorage();
exports.firebaseFunctions = exports.firebaseManager.getFunctions();
//# sourceMappingURL=firebase.js.map