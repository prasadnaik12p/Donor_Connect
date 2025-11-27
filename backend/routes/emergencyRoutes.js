const express = require("express");
const router = express.Router();
const { protectAmbulance } = require("../middleware/authAmbulance");
const {
  getNearbyEmergencies,
  acceptEmergency,
  createEmergency,
  getEmergencyStatus
} = require("../controllers/emergencyController");

// Ambulance routes
router.get("/nearby", protectAmbulance, getNearbyEmergencies);
router.post("/accept", protectAmbulance, acceptEmergency);

// User routes (for creating emergencies)
router.post("/create", createEmergency);
router.get("/status/:emergencyId", getEmergencyStatus);

module.exports = router;