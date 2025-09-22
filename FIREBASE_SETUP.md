# Firebase Setup for Organization Account

This guide will help you set up Firebase with your organization account without needing service account keys.

## 🚀 Quick Setup

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login --no-localhost
```

### 3. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `Flavours Production`
4. Enter project ID: `flavours-production` (or your preferred ID)
5. Enable Google Analytics (optional)
6. Click "Create project"

### 4. Run Setup Script
```bash
./scripts/setup-firebase.sh flavours-production
```

## 🔧 Manual Setup (Alternative)

If you prefer to set up Firebase manually:

### 1. Initialize Firebase in your project
```bash
firebase init
```

### 2. Select services to configure:
- ✅ Firestore
- ✅ Storage
- ✅ Hosting
- ✅ Functions (optional)

### 3. Configure each service:
- **Firestore**: Use existing rules and indexes
- **Storage**: Use existing rules
- **Hosting**: Use `out` as public directory
- **Functions**: Use `functions` directory

### 4. Deploy configuration
```bash
firebase deploy
```

## 📋 Get Configuration Values

After setup, get your Firebase configuration:

```bash
firebase apps:sdkconfig web
```

This will output something like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "flavours-production.firebaseapp.com",
  projectId: "flavours-production",
  storageBucket: "flavours-production.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

## 🔐 Environment Variables

Update your environment variables with the Firebase configuration:

```bash
# Frontend (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=flavours-production.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=flavours-production
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=flavours-production.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Backend (env.production)
FIREBASE_PROJECT_ID=flavours-production
FIREBASE_STORAGE_BUCKET=flavours-production.appspot.com
FIREBASE_DATABASE_URL=https://flavours-production-default-rtdb.firebaseio.com
```

## 🚀 Deploy to Production

Once Firebase is configured, deploy your application:

```bash
# Deploy Firebase configuration
firebase deploy

# Deploy to GCP
./scripts/deploy-gcp.sh production us-central1 us-central1-a flavours.club
```

## 🔍 Verify Setup

1. **Firebase Console**: https://console.firebase.google.com/project/flavours-production
2. **Firestore**: Check database rules and data
3. **Storage**: Check storage rules and files
4. **Hosting**: Check hosting configuration
5. **Authentication**: Check auth providers

## 🛠️ Troubleshooting

### Common Issues:

1. **Authentication Error**: Make sure you're logged in with the correct account
   ```bash
   firebase logout
   firebase login --no-localhost
   ```

2. **Project Not Found**: Create the project in Firebase Console first
   ```bash
   firebase projects:list
   ```

3. **Permission Denied**: Make sure you have the right permissions in your organization
   - Contact your organization admin
   - Request Firebase project access

4. **Configuration Error**: Verify your project ID matches
   ```bash
   firebase use --add
   ```

## 📞 Support

If you encounter issues:
1. Check Firebase Console for error messages
2. Review Firebase documentation
3. Contact your organization's Firebase admin
4. Check GCP Console for related services

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [GCP Console](https://console.cloud.google.com/)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
