const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Admin Authentication
router.post("/register", adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);

// Admin Dashboard
router.get("/dashboard/stats", adminController.getDashboardStats);
router.get("/dashboard/all-data", adminController.getAllData);

// Hospitals
router.get("/hospitals/pending", adminController.getPendingHospitals);
router.post("/hospitals/approve/:hospitalId", adminController.approveHospital);
router.delete("/hospitals/reject/:hospitalId", adminController.rejectHospital);
router.get("/hospitals/all", adminController.getAllHospitals);
router.get("/hospitals/with-beds", adminController.getHospitalsWithBeds);

// Ambulances
router.get("/ambulances/pending", adminController.getPendingAmbulances);
router.post(
  "/ambulances/approve/:ambulanceId",
  adminController.approveAmbulance
);
router.delete(
  "/ambulances/reject/:ambulanceId",
  adminController.rejectAmbulance
);

// Fund & Blood Requests
router.get("/fund-requests", adminController.getAllFundRequests);
router.get("/blood-requests", adminController.getAllBloodRequests);
router.patch("/fund-requests/:fundId/status", adminController.updateFundStatus);

module.exports = router;