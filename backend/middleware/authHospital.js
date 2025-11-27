const jwt = require("jsonwebtoken");
const Hospital = require("../models/Hospital");

const protectHospital = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const hospital = await Hospital.findById(decoded.id).select("-password");

      if (!hospital) {
        return res.status(401).json({
          success: false,
          message: "Hospital not found",
        });
      }

      if (!hospital.isApprovedByAdmin) {
        return res.status(403).json({
          success: false,
          message: "Hospital not approved by admin",
        });
      }

      req.user = hospital;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

module.exports = { protectHospital };
