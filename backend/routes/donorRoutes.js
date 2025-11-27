// routes/donorRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerDonor,
  updateDonorInfo,
  updateLocation,
} = require("../controllers/donorController");

router.post("/register", registerDonor);
router.put("/:donorId", updateDonorInfo);
router.put("/location/update", updateLocation);

module.exports = router;
