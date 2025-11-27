const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  resendVerification,
} = require("../controllers/authController");

// Public routes
router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification); // Add this line
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

module.exports = router;