import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getFunctions } from 'firebase-admin/functions'
import { logger } from '../utils/logger'

interface FirebaseConfig {
  projectId: string
  privateKey: string
  clientEmail: string
  storageBucket: string
  databaseURL?: string
}

class FirebaseManager {
  private app: any
  private auth: any
  private firestore: any
  private storage: any
  private functions: any
  private config: FirebaseConfig

  constructor() {
    this.config = {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      databaseURL: process.env.FIREBASE_DATABASE_URL
    }

    this.initializeFirebase()
  }

  private initializeFirebase() {
    try {
      // Check if Firebase is already initialized
      if (getApps().length === 0) {
        // Try to initialize with service account credentials first
        if (this.config.privateKey && this.config.clientEmail) {
          this.app = initializeApp({
            credential: cert({
              projectId: this.config.projectId,
              privateKey: this.config.privateKey,
              clientEmail: this.config.clientEmail
            }),
            storageBucket: this.config.storageBucket,
            databaseURL: this.config.databaseURL
          })
          logger.info('Firebase Admin SDK initialized with service account credentials')
        } else {
          // Fallback to Application Default Credentials (ADC)
          // This works with Firebase CLI authentication
          this.app = initializeApp({
            projectId: this.config.projectId,
            storageBucket: this.config.storageBucket,
            databaseURL: this.config.databaseURL
          })
          logger.info('Firebase Admin SDK initialized with Application Default Credentials')
        }
      } else {
        this.app = getApps()[0]
        logger.info('Using existing Firebase app instance')
      }

      // Initialize services
      this.auth = getAuth(this.app)
      this.firestore = getFirestore(this.app)
      this.storage = getStorage(this.app)
      this.functions = getFunctions(this.app)

      logger.info('Firebase services initialized', {
        projectId: this.config.projectId,
        storageBucket: this.config.storageBucket
      })
    } catch (error) {
      logger.error('Failed to initialize Firebase:', error)
      throw error
    }
  }

  // Authentication methods
  public async createUser(userData: {
    email: string
    password: string
    displayName?: string
    photoURL?: string
    disabled?: boolean
  }) {
    try {
      const userRecord = await this.auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        disabled: userData.disabled || false
      })

      logger.info('User created successfully', { uid: userRecord.uid })
      return userRecord
    } catch (error) {
      logger.error('Failed to create user:', error)
      throw error
    }
  }

  public async getUser(uid: string) {
    try {
      const userRecord = await this.auth.getUser(uid)
      return userRecord
    } catch (error) {
      logger.error('Failed to get user:', error)
      throw error
    }
  }

  public async updateUser(uid: string, updateData: any) {
    try {
      const userRecord = await this.auth.updateUser(uid, updateData)
      logger.info('User updated successfully', { uid })
      return userRecord
    } catch (error) {
      logger.error('Failed to update user:', error)
      throw error
    }
  }

  public async deleteUser(uid: string) {
    try {
      await this.auth.deleteUser(uid)
      logger.info('User deleted successfully', { uid })
    } catch (error) {
      logger.error('Failed to delete user:', error)
      throw error
    }
  }

  public async verifyIdToken(idToken: string) {
    try {
      const decodedToken = await this.auth.verifyIdToken(idToken)
      return decodedToken
    } catch (error) {
      logger.error('Failed to verify ID token:', error)
      throw error
    }
  }

  public async createCustomToken(uid: string, additionalClaims?: any) {
    try {
      const customToken = await this.auth.createCustomToken(uid, additionalClaims)
      return customToken
    } catch (error) {
      logger.error('Failed to create custom token:', error)
      throw error
    }
  }

  // Firestore methods
  public async createDocument(collection: string, data: any, docId?: string) {
    try {
      const docRef = docId 
        ? this.firestore.collection(collection).doc(docId)
        : this.firestore.collection(collection).doc()
      
      await docRef.set({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      logger.info('Document created successfully', { collection, docId: docRef.id })
      return docRef.id
    } catch (error) {
      logger.error('Failed to create document:', error)
      throw error
    }
  }

  public async getDocument(collection: string, docId: string) {
    try {
      const doc = await this.firestore.collection(collection).doc(docId).get()
      if (doc.exists) {
        return { id: doc.id, ...doc.data() }
      }
      return null
    } catch (error) {
      logger.error('Failed to get document:', error)
      throw error
    }
  }

  public async updateDocument(collection: string, docId: string, data: any) {
    try {
      await this.firestore.collection(collection).doc(docId).update({
        ...data,
        updatedAt: new Date()
      })

      logger.info('Document updated successfully', { collection, docId })
    } catch (error) {
      logger.error('Failed to update document:', error)
      throw error
    }
  }

  public async deleteDocument(collection: string, docId: string) {
    try {
      await this.firestore.collection(collection).doc(docId).delete()
      logger.info('Document deleted successfully', { collection, docId })
    } catch (error) {
      logger.error('Failed to delete document:', error)
      throw error
    }
  }

  public async queryCollection(collection: string, filters: any[] = [], limit?: number) {
    try {
      let query = this.firestore.collection(collection)

      // Apply filters
      filters.forEach(filter => {
        query = query.where(filter.field, filter.operator, filter.value)
      })

      // Apply limit
      if (limit) {
        query = query.limit(limit)
      }

      const snapshot = await query.get()
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return documents
    } catch (error) {
      logger.error('Failed to query collection:', error)
      throw error
    }
  }

  // Storage methods
  public async uploadFile(bucketName: string, fileName: string, fileBuffer: Buffer, metadata?: any) {
    try {
      const bucket = this.storage.bucket(bucketName)
      const file = bucket.file(fileName)

      await file.save(fileBuffer, {
        metadata: {
          contentType: metadata?.contentType || 'application/octet-stream',
          ...metadata
        }
      })

      // Make file publicly accessible if needed
      if (metadata?.public) {
        await file.makePublic()
      }

      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`
      
      logger.info('File uploaded successfully', { fileName, bucketName })
      return publicUrl
    } catch (error) {
      logger.error('Failed to upload file:', error)
      throw error
    }
  }

  public async deleteFile(bucketName: string, fileName: string) {
    try {
      const bucket = this.storage.bucket(bucketName)
      await bucket.file(fileName).delete()
      
      logger.info('File deleted successfully', { fileName, bucketName })
    } catch (error) {
      logger.error('Failed to delete file:', error)
      throw error
    }
  }

  public async getSignedUrl(bucketName: string, fileName: string, expiresIn: number = 3600) {
    try {
      const bucket = this.storage.bucket(bucketName)
      const file = bucket.file(fileName)

      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000
      })

      return signedUrl
    } catch (error) {
      logger.error('Failed to get signed URL:', error)
      throw error
    }
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      // Test Firestore connection
      await this.firestore.collection('_health').doc('test').get()
      
      // Test Auth connection
      await this.auth.listUsers(1)
      
      logger.info('Firebase health check passed')
      return true
    } catch (error) {
      logger.error('Firebase health check failed:', error)
      return false
    }
  }

  // Get service instances
  public getAuth() { return this.auth }
  public getFirestore() { return this.firestore }
  public getStorage() { return this.storage }
  public getFunctions() { return this.functions }
  public getApp() { return this.app }
}

// Singleton instance
export const firebaseManager = new FirebaseManager()

// Export individual services for convenience
export const firebaseAuth = firebaseManager.getAuth()
export const firebaseFirestore = firebaseManager.getFirestore()
export const firebaseStorage = firebaseManager.getStorage()
export const firebaseFunctions = firebaseManager.getFunctions()
