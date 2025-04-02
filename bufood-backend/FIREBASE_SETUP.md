# Firebase Service Account Setup

## Issue

The application is encountering a Firebase credential error due to an invalid or revoked service account key:

```
"invalid_grant: Invalid JWT Signature."
```

This occurs because either:

1. The server time is not properly synced
2. The Firebase service account key file has been revoked or is invalid

## Solution

### Option 1: Generate a new Firebase service account key

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `bufood-bca8e`
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key" button
5. Download the JSON file
6. Replace the contents of `privateKey.json` in the project root with the contents of the downloaded file
7. Restart the server

### Option 2: Configure environment variables (more secure)

Instead of storing the private key directly in the file, you can use environment variables:

1. Generate a new private key as described in Option 1
2. Open your `.env` file and add these variables:
   ```
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@bufood-bca8e.iam.gserviceaccount.com"
   ```
3. Modify the `firebase.js` file to use environment variables instead of the JSON file:
   ```javascript
   if (!admin.apps.length) {
     admin.initializeApp({
       credential: admin.credential.cert({
         projectId: process.env.FIREBASE_PROJECT_ID,
         privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
       }),
     });
   }
   ```

## Temporary Workaround

Until you generate a new service account key, the application has been modified to automatically use "mock mode" when Firebase credential errors occur. This allows testing the application's functionality without requiring immediate Firebase configuration.

To deliberately use mock mode, add `?mock=true` to any URL in the application.
