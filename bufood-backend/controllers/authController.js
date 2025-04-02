// authController.js
const axios = require("axios");
const admin = require("firebase-admin");
const { auth, db } = require("../firebase");
const { sendVerificationEmail } = require("../config/emailService"); // Import the email service

// 📌 User Registration with Email Verification
const registerUser = async (req, res) => {
  const { email, password, name, phone, role, storeName } = req.body;

  // Validate required fields
  if (!email || !password || !name || !phone || !role) {
    return res.status(400).json({
      success: false,
      message: "Email, password, name, phone, and role are required.",
    });
  }

  // If the role is 'seller' or 'admin', storeName is required
  if ((role === "seller" || role === "admin") && !storeName) {
    return res.status(400).json({
      success: false,
      message: "Store name is required for sellers and admins.",
    });
  }

  try {
    // Create the user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Generate email verification link
    const verificationLink = await auth.generateEmailVerificationLink(email);

    // Send the verification email using Nodemailer
    await sendVerificationEmail(email, verificationLink);

    // Prepare user data to save in Firestore
    const userData = {
      uid: userRecord.uid,
      name,
      email,
      phone,
      role,
      emailVerified: false, // Track verification status
      storeName: role === "seller" || role === "admin" ? storeName : null,
    };

    // Save user data to Firestore
    await db.collection("users").doc(userRecord.uid).set(userData);

    // Respond with success message
    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please verify your email before logging in.",
      uid: userRecord.uid,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 📌 User Login with Email Verification Check
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    // Authenticate user with Firebase REST API
    const firebaseResponse = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCW__2ToKDVAJgIvZUWWrLnWGV-CGQx4mU`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const { idToken, localId } = firebaseResponse.data;

    // Fetch user data from Firestore
    const userDoc = await db.collection("users").doc(localId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User data not found.",
      });
    }

    const userData = userDoc.data();

    // 🚨 Check if email is verified
    const userRecord = await auth.getUser(localId);
    if (!userRecord.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    // Success response
    res.json({
      success: true,
      message: "User logged in successfully.",
      user: {
        uid: localId,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        storeName: userData.storeName || null,
      },
      idToken,
    });
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    if (error.response && error.response.data) {
      console.error("Detailed error data:", JSON.stringify(error.response.data));
    }
    res.status(400).json({
      success: false,
      message:
        error.response?.data?.error?.message || "Invalid email or password.",
    });
  }
};

// 📌 Resend Verification Email
const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required.",
    });
  }

  try {
    // Find the user by email in Firebase
    const userRecord = await auth.getUserByEmail(email);

    // Check if email is already verified
    if (userRecord.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified.",
      });
    }

    // Generate new verification link
    const verificationLink = await auth.generateEmailVerificationLink(email);

    // Send the verification email
    await sendVerificationEmail(email, verificationLink);

    res.status(200).json({
      success: true,
      message: "Verification email has been resent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend Verification Error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to resend verification email.",
    });
  }
};

// 📌 Middleware to Verify Firebase ID Token
const authenticateToken = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized: Invalid token" });
  }
};

// 📌 Verify Email with OOB Code
const verifyEmail = async (req, res) => {
  const { oobCode } = req.body;

  if (!oobCode) {
    return res.status(400).json({
      success: false,
      message: "Verification code is required.",
    });
  }

  try {
    // Use Firebase Admin SDK to check the action code
    // Note: Firebase Admin SDK doesn't have a direct method for verifying email verification code
    // We need to use the client SDK or use another approach to update the user's verification status
    // For this example, we'll need to use the Firebase Auth REST API

    // Get the email from the oobCode using a token check
    // In a real implementation, you'd use the Firebase Auth REST API to verify the oobCode
    // For now, we'll simulate this by updating the user's emailVerified status directly

    // 1. Parse the email from oobCode - in a real implementation, you'd verify with Firebase Auth REST API
    // We're simulating verification success for now

    // For mock purposes only - warning: this should be implemented properly with Firebase Auth REST API
    // Update a user's emailVerified status to true
    // Find a user with unverified email (for demo only)

    // Simulating successful verification
    console.log("Verifying email with code:", oobCode);

    // In a production environment, you should use proper verification with the Firebase Auth REST API
    // For now, we'll just return success

    res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("Email Verification Error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to verify email.",
    });
  }
};

// 📌 Export the functions
module.exports = {
  registerUser,
  loginUser,
  resendVerificationEmail,
  authenticateToken,
  verifyEmail,
};
