const User = require('../models/User');
const { createSecretToken } = require('../utils/tokenGenerator');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, bloodType } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and phone are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      role: role || "donor",
      bloodType: bloodType || null,
    });

    // Generate email verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    // Send verification email
    // In the register function, update this line:
    const verificationLink = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/verify-email?token=${verificationToken}`;

    try {
      await sendEmail(
        user.email,
        "Verify Your Email - Donor Connect",
        emailTemplates.verificationEmail(user.name, verificationLink),
      );
    } catch (emailError) {}

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email for verification.",
      verificationLink:
        process.env.NODE_ENV === "development" ? verificationLink : undefined,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    // First, check if a user with this token exists (even if expired)
    let user = await User.findOne({
      $or: [{ emailVerificationToken: token }, { isVerified: true }],
    });

    // If user found, check if already verified
    if (user && user.isVerified) {
      // Generate token for already verified user
      const authToken = createSecretToken(user._id, user.role);

      return res.status(200).json({
        success: true,
        message: "Email is already verified",
        alreadyVerified: true,
        token: authToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bloodType: user.bloodType,
          isVerified: user.isVerified,
        },
      });
    }

    // Check if token is expired
    if (user && user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Verification token has expired. Please request a new one.",
        expired: true,
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token",
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Generate auth token immediately after verification
    const authToken = createSecretToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodType: user.bloodType,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during email verification",
    });
  }
};

// Login user - FIXED VERSION
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = createSecretToken(user._id, user.role);

    // Remove password from user object before sending response
    const userWithoutPassword = { ...user._doc };
    delete userWithoutPassword.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bloodType: user.bloodType,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, a password reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save();

    // Send reset email
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await sendEmail(
      user.email,
      "Reset Your Password - Donor Connect",
      emailTemplates.passwordReset(user.name, resetLink),
    );

    res.status(200).json({
      success: true,
      message: "If the email exists, a password reset link has been sent",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during password reset request",
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    // req.user is set by auth middleware - it contains the JWT payload
    // The token was created with { id, role }, so use req.user.id
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodType: user.bloodType,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      "name",
      "phone",
      "bloodType",
      "location",
      "healthInfo",
      "avatar",
    ];
    const updates = Object.keys(req.body);

    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid updates. Only these fields can be updated: " +
          allowedUpdates.join(", "),
      });
    }

    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    updates.forEach((update) => {
      user[update] = req.body[update];
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodType: user.bloodType,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

// Resend verification email
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, a verification link has been sent",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    // Send verification email
    const verificationLink = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/verify-email?token=${verificationToken}`;

    try {
      await sendEmail(
        user.email,
        "Verify Your Email - Donor Connect",
        emailTemplates.verificationEmail(user.name, verificationLink),
      );
    } catch (emailError) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }

    res.status(200).json({
      success: true,
      message: "If the email exists, a verification link has been sent",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during verification resend",
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  resendVerification,
};