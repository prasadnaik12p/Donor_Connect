const express = require("express");
const router = express.Router();
const {
  registerHospital,
  loginHospital,
  logoutHospital,
  requestFund,
  requestBlood,
  updateBeds,
  getHospitalsWithBeds,
  reserveBed,
  getHospitalDashboard,
  updateHospitalProfile,
} = require("../controllers/hospitalController");
const { protectHospital } = require("../middleware/authHospital");
const { auth } = require("../middleware/auth");

// Auth routes
router.post("/register", registerHospital);
router.post("/login", loginHospital);
router.post("/logout", protectHospital, logoutHospital);

// Public routes
router.get("/beds", getHospitalsWithBeds);

// Authenticated hospital routes
router.get("/dashboard", protectHospital, getHospitalDashboard);
router.put("/profile", protectHospital, updateHospitalProfile);
router.post("/request-fund", protectHospital, requestFund);
router.post("/request-blood", protectHospital, requestBlood);
router.put("/update-beds", protectHospital, updateBeds);

// User routes (for bed reservation)
router.post("/reserve-bed", auth, reserveBed);

module.exports = router;