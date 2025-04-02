const admin = require("firebase-admin");
require("dotenv").config();

// Initialize Firebase Admin SDK (only initialize once)
if (!admin.apps.length) {
  let credentials;

  // Use environment variables if available
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL
  ) {
    console.log("Using Firebase credentials from environment variables");
    credentials = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      // Replace escaped newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
  } else {
    // Otherwise use the service account JSON file
    console.log("Using Firebase credentials from privateKey.json");
    credentials = require("./privateKey.json");
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);

    // Use mock mode if Firebase fails to initialize
    console.log("⚠️ WARNING: Firebase initialization failed. Using mock mode.");
  }
}

const auth = admin.auth(); // ✅ Export Firebase Authentication
const db = admin.firestore(); // ✅ Export Firestore database

module.exports = { auth, db };
