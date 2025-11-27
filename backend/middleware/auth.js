const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Hospital = require("../models/Hospital");

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");

    console.log("🔐 Auth check - Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const token = authHeader.replace("Bearer ", "");

    // Check if token exists and is not empty
    if (!token || token === "null" || token === "undefined") {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    console.log("🔐 Token received:", token.substring(0, 20) + "...");

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔐 Token decoded:", decoded);

    // Check if decoded has id
    if (!decoded.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Try to find user in User model first
    let user = await User.findById(decoded.id).select("-password");

    if (user) {
      req.user = user;
      req.userType = "user";
      console.log("✅ User authenticated:", user.email);
      return next();
    }

    // If not found in User model, try Hospital model
    user = await Hospital.findById(decoded.id).select("-password");

    if (user) {
      req.user = user;
      req.userType = "hospital";
      console.log("✅ Hospital authenticated:", user.email);
      return next();
    }

    return res
      .status(401)
      .json({ message: "Token is not valid - user not found" });
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    res.status(500).json({ message: "Server error in authentication" });
  }
};

module.exports = { auth };
