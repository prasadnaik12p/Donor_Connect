const express = require("express");
const router = express.Router();
const {
  createFundRequest,
  getFundRequests,
  updateFundRequestStatus,
  deleteFundRequest,
  donateToFundRequest,
  getFundRequestReport,
  verifyFundRequest,
  updateFundRequest,
  getMyFundRequests,
  recordCashDonation,
} = require("../controllers/fundRequestController");

const { protectHospital } = require("../middleware/authHospital");
const { auth } = require("../middleware/auth");

// Hospital-only routes
router.post("/", protectHospital, createFundRequest);
router.put("/:id", protectHospital, updateFundRequest);
router.delete("/:id", protectHospital, deleteFundRequest);
router.get("/hospital/my-requests", protectHospital, getMyFundRequests);
router.post("/:id/cash-donation", protectHospital, recordCashDonation);

// Public routes
router.get("/", getFundRequests);
router.get("/:id/report", getFundRequestReport);
router.put("/:id/status", updateFundRequestStatus);
router.post("/donate", donateToFundRequest);
router.post("/:id/verify", auth, verifyFundRequest);

module.exports = router;