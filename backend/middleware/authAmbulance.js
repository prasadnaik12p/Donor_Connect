const jwt = require('jsonwebtoken');
const Ambulance = require('../models/Ambulance');

const protectAmbulance = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Log for debugging
    console.log(
      "Authorization header:",
      req.headers.authorization?.substring(0, 20) + "...",
    );
    console.log("Extracted token:", token?.substring(0, 20) + "...");

    if (!token || token.trim() === "") {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route - no token provided",
      });
    }

    try {
      // Verify token with JWT_SECRET
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET not set in environment variables!");
        return res.status(500).json({
          success: false,
          message: "Server configuration error",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("✅ Token verified successfully");
      console.log("Decoded token:", decoded);

      // Check if the token is for an ambulance
      if (decoded.role !== "ambulance") {
        return res.status(401).json({
          success: false,
          message: "Not authorized as ambulance - invalid token role",
        });
      }

      // Find ambulance and attach to request
      const ambulance = await Ambulance.findById(decoded.id).select(
        "-password",
      );

      if (!ambulance) {
        return res.status(401).json({
          success: false,
          message: "Ambulance not found in database",
        });
      }

      if (!ambulance.isApproved) {
        return res.status(403).json({
          success: false,
          message: "Ambulance not approved by admin yet",
        });
      }

      req.user = ambulance;
      console.log("✅ Ambulance authenticated:", ambulance.email);
      next();
    } catch (error) {
      console.error("❌ Token verification error:", error.message);
      console.error("Error type:", error.name);
      console.error("Token value:", token);

      return res.status(401).json({
        success: false,
        message: "Token is not valid: " + error.message,
      });
    }
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};
  

module.exports = { protectAmbulance };