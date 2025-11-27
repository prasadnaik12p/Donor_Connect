const express = require("express");
const router = express.Router();
const {
  registerAmbulance,
  loginAmbulance,
  logoutAmbulance,
  updateLocation,
  getNearbyAmbulances,
  getAmbulanceDashboard,
  updateStatus,
  getNearbyEmergencies,
  acceptEmergency,
  completeEmergency,
  getEmergencyHistory,
} = require("../controllers/ambulanceController");
const { protectAmbulance } = require("../middleware/authAmbulance");

// Public routes
router.post("/register", registerAmbulance);
router.post("/login", loginAmbulance);
router.get("/nearby", getNearbyAmbulances);

// Protected routes - using ambulance-specific middleware
router.post("/logout", protectAmbulance, logoutAmbulance);
router.put("/update-location", protectAmbulance, updateLocation);
router.get("/dashboard", protectAmbulance, getAmbulanceDashboard);
router.put("/update-status", protectAmbulance, updateStatus);

// Emergency routes
router.get("/emergencies/nearby", protectAmbulance, getNearbyEmergencies);
router.post("/emergencies/accept", protectAmbulance, acceptEmergency);
router.post("/emergencies/complete", protectAmbulance, completeEmergency);
router.get("/emergencies/history", protectAmbulance, getEmergencyHistory);

module.exports = router;