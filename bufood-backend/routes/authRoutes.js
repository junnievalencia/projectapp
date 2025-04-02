// routes/authRoutes.js
const express = require("express");
const {
  registerUser,
  loginUser,
  resendVerificationEmail,
  authenticateToken,
  verifyEmail,
} = require("../controllers/authController");

const router = express.Router();

// User registration route
router.post("/register", registerUser);

// User login route
router.post("/login", loginUser);

// Resend verification email route
router.post("/resend-verification", resendVerificationEmail);

// Verify email route
router.post("/verify-email", verifyEmail);

// Token validation route
router.get("/validate-token", authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    message: "Token is valid",
    user: req.user
  });
});

// Example protected route
router.get("/protected", authenticateToken, (req, res) => {
  res.send(`Hello ${req.user.email}, you are authenticated!`);
});

// Export the router
module.exports = router;
