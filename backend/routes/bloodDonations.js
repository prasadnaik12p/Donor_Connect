const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const bloodDonationController = require("../controllers/bloodDonationController");

// PUBLIC ROUTES

// Blood Requests
router.get("/requests", bloodDonationController.getAllRequests);

// Donors
router.get("/donors", bloodDonationController.getDonors);

// Blood Banks - Multiple search options
router.get("/bloodbanks/nearby", bloodDonationController.getNearbyBloodBanks);
router.get("/bloodbanks/search", bloodDonationController.getNearbyBloodBanks); // Alternative endpoint
router.get(
  "/bloodbanks/city/:city",
  bloodDonationController.getNearbyBloodBanks
); // City-specific


// PROTECTED ROUTES (Authentication required)


// Blood Request Management
router.post("/request", auth, bloodDonationController.createBloodRequest);
router.get("/my-requests", auth, bloodDonationController.getMyBloodRequests);
router.put(
  "/requests/:id/accept",
  auth,
  bloodDonationController.acceptBloodRequest
);
router.put(
  "/requests/:id/complete",
  auth,
  bloodDonationController.completeBloodRequest
);
router.put("/requests/:id", auth, bloodDonationController.updateRequest);
router.delete("/requests/:id", auth, bloodDonationController.deleteRequest);

// Notification Management
router.get(
  "/notifications",
  auth,
  bloodDonationController.getUserNotifications
);
router.put(
  "/notifications/:id/read",
  auth,
  bloodDonationController.markNotificationAsRead
);
router.delete(
  "/notifications/clear",
  auth,
  bloodDonationController.clearAllNotifications
);


// BLOOD BANK SPECIFIC PROTECTED ROUTES



router.get(
  "/my-nearby-bloodbanks",
  auth,
  bloodDonationController.getNearbyBloodBanks
);



module.exports = router;