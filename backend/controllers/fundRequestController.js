const FundRequest = require("../models/FundRequest");
const Hospital = require("../models/Hospital");

/**
 * @desc    Create a new fund request (only hospital can request)
 * @route   POST /api/funds
 */
module.exports.createFundRequest = async (req, res) => {
  try {
    const { patientName, patientId, amountRequired, purpose, contactInfo } = req.body;

    // Validate hospital
    const hospitalId = req.user?.id; // assuming hospital is authenticated
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(403).json({ message: "Only hospitals can create fund requests" });
    }

    // Create new fund request
    const fundRequest = await FundRequest.create({
      hospital: hospital._id,
      patientName,
      patientId,
      amountRequired,
      purpose,
      contactInfo,
      status: "Pending",
      amountCollected: 0,
    });

    res.status(201).json({
      message: "✅ Fund request created successfully",
      fundRequest,
    });
  } catch (error) {
    console.error("❌ Error creating fund request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get all fund requests (optional: filter by hospital)
 * @route   GET /api/funds
 */
module.exports.getFundRequests = async (req, res) => {
  try {
    const { hospitalId } = req.query;

    const query = hospitalId ? { hospital: hospitalId } : {};

    const fundRequests = await FundRequest.find(query)
      .populate("hospital", "name email contactNumber")
      .sort({ createdAt: -1 });

    res.json({ fundRequests });
  } catch (error) {
    console.error("❌ Error fetching fund requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update fund request status (Admin or Hospital only)
 * @route   PUT /api/funds/:id/status
 */
module.exports.updateFundRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g. "Approved", "Rejected", "Completed"

    const fundRequest = await FundRequest.findById(id);
    if (!fundRequest)
      return res.status(404).json({ message: "Fund request not found" });

    fundRequest.status = status;
    await fundRequest.save();

    res.json({ message: "✅ Fund request status updated", fundRequest });
  } catch (error) {
    console.error("❌ Error updating fund request status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete a fund request (only hospital that created it)
 * @route   DELETE /api/funds/:id
 */
module.exports.deleteFundRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user?.id;

    const fundRequest = await FundRequest.findById(id);
    if (!fundRequest)
      return res.status(404).json({ message: "Fund request not found" });

    // Ensure the same hospital is deleting
    if (fundRequest.hospital.toString() !== hospitalId) {
      return res.status(403).json({ message: "Not authorized to delete this request" });
    }

    await fundRequest.deleteOne();

    res.json({ message: "✅ Fund request deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting fund request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Donate to a fund request
 * @route   POST /api/funds/donate
 */
module.exports.donateToFundRequest = async (req, res) => {
  try {
    const {
      fundRequestId,
      donorName,
      donorEmail,
      amount,
      paymentMethod = "UPI",
      transactionId,
      paymentId,
    } = req.body;

    const fundRequest = await FundRequest.findById(fundRequestId);
    if (!fundRequest)
      return res.status(404).json({ message: "Fund request not found" });

    // Allow donations to Pending and Approved requests, but not Rejected or Completed
    if (fundRequest.status === "Rejected") {
      return res
        .status(400)
        .json({ message: "This fund request has been rejected" });
    }

    if (fundRequest.status === "Completed") {
      return res
        .status(400)
        .json({ message: "This fund request has already reached its goal" });
    }

    // Auto-approve if still pending (optional - you can remove this if you want manual approval)
    if (fundRequest.status === "Pending") {
      fundRequest.status = "Approved";
    }

    // Validate amount
    const donationAmount = Number(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      return res.status(400).json({ message: "Invalid donation amount" });
    }

    // Initialize amountCollected if not set
    if (!fundRequest.amountCollected) {
      fundRequest.amountCollected = 0;
    }

    // Check if adding this donation would exceed required amount
    const remainingAmount =
      fundRequest.amountRequired - fundRequest.amountCollected;
    if (donationAmount > remainingAmount) {
      return res.status(400).json({
        message: `Cannot donate more than remaining amount. Maximum allowed: ₹${remainingAmount}`,
      });
    }

    // Record donation
    const donation = {
      donorName: donorName || "Anonymous",
      donorEmail: donorEmail || "",
      amount: donationAmount,
      paymentMethod,
      transactionId: transactionId || `TXN${Date.now()}`,
      paymentId: paymentId || `PAY${Date.now()}`,
      donationType: "online",
      donatedAt: new Date(),
    };

    // Initialize donations array if not exists
    if (!fundRequest.donations) {
      fundRequest.donations = [];
    }

    fundRequest.donations.push(donation);

    // Update donation progress
    fundRequest.amountCollected =
      (fundRequest.amountCollected || 0) + donationAmount;

    // Check if goal is reached
    if (fundRequest.amountCollected >= fundRequest.amountRequired) {
      fundRequest.status = "Completed";
    }

    await fundRequest.save();

    console.log(
      `💰 Donor ${donorName} donated ₹${amount} to ${fundRequest.patientName}`
    );

    res.json({ message: "✅ Donation successful", fundRequest, donation });
  } catch (error) {
    console.error("❌ Error processing donation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Record cash donation for fund request (Hospital only)
 * @route   POST /api/funds/:id/cash-donation
 */
module.exports.recordCashDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, donorName, description, receivedBy, receivedAt } = req.body;
    const hospitalId = req.user?.id;

    const fundRequest = await FundRequest.findById(id);
    if (!fundRequest)
      return res.status(404).json({ message: "Fund request not found" });

    // Check if hospital owns this fund request
    if (fundRequest.hospital.toString() !== hospitalId) {
      return res.status(403).json({
        message: "Not authorized to record cash donations for this request",
      });
    }

    // Check if request is already fully funded
    if (fundRequest.status === "Completed") {
      return res.status(400).json({
        message: "Fund request is already fully funded",
      });
    }

    // Validate amount
    const donationAmount = Number(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      return res.status(400).json({ message: "Invalid donation amount" });
    }

    // Check if adding this donation would exceed required amount
    const remainingAmount =
      fundRequest.amountRequired - fundRequest.amountCollected;
    if (donationAmount > remainingAmount) {
      return res.status(400).json({
        message: `Cannot record donation. Maximum allowed: ₹${remainingAmount}`,
      });
    }

    // Record cash donation
    const cashDonation = {
      donorName: donorName || "Anonymous",
      amount: donationAmount,
      description: description || "Cash donation received at hospital",
      receivedBy: receivedBy || "Hospital Staff",
      receivedAt: new Date(receivedAt) || new Date(),
      donationType: "cash",
      transactionId: `CASH${Date.now()}`,
    };

    // Initialize cashDonations array if not exists
    if (!fundRequest.cashDonations) {
      fundRequest.cashDonations = [];
    }

    fundRequest.cashDonations.push(cashDonation);

    // Update donation progress
    fundRequest.amountCollected =
      (fundRequest.amountCollected || 0) + donationAmount;

    // Auto-approve if still pending
    if (fundRequest.status === "Pending") {
      fundRequest.status = "Approved";
    }

    // Check if goal is reached
    if (fundRequest.amountCollected >= fundRequest.amountRequired) {
      fundRequest.status = "Completed";
    }

    await fundRequest.save();

    console.log(
      `💰 Cash donation recorded: ₹${amount} from ${donorName} for ${fundRequest.patientName}`
    );

    res.json({
      success: true,
      message: "✅ Cash donation recorded successfully",
      fundRequest,
      cashDonation,
    });
  } catch (error) {
    console.error("❌ Error recording cash donation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get donation report for a fund request
 * @route   GET /api/funds/:id/report
 */
module.exports.getFundRequestReport = async (req, res) => {
  try {
    const { id } = req.params;

    const fundRequest = await FundRequest.findById(id)
      .populate("hospital", "name email contactNumber")
      .populate("verifiedBy", "name email");

    if (!fundRequest)
      return res.status(404).json({ message: "Fund request not found" });

    const report = {
      fundRequest: {
        id: fundRequest._id,
        patientName: fundRequest.patientName,
        patientId: fundRequest.patientId,
        purpose: fundRequest.purpose,
        amountRequired: fundRequest.amountRequired,
        amountCollected: fundRequest.amountCollected,
        status: fundRequest.status,
        hospital: fundRequest.hospital,
        isVerified: fundRequest.isVerified,
        verifiedBy: fundRequest.verifiedBy,
        verifiedAt: fundRequest.verifiedAt,
        createdAt: fundRequest.createdAt,
      },
      donations: fundRequest.donations || [],
      cashDonations: fundRequest.cashDonations || [],
      totalDonations:
        (fundRequest.donations?.length || 0) +
        (fundRequest.cashDonations?.length || 0),
      progress: (
        (fundRequest.amountCollected / fundRequest.amountRequired) *
        100
      ).toFixed(2),
      verifiedDocuments: fundRequest.verifiedDocuments || [],
    };

    res.json({ success: true, report });
  } catch (error) {
    console.error("❌ Error fetching fund request report:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Verify fund request documents (Admin/Hospital only)
 * @route   POST /api/funds/:id/verify
 */
module.exports.verifyFundRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, documentUrl } = req.body;
    const verifiedBy = req.user?.id || req.user?._id;

    const fundRequest = await FundRequest.findById(id);
    if (!fundRequest)
      return res.status(404).json({ message: "Fund request not found" });

    if (documentType && documentUrl) {
      fundRequest.verifiedDocuments.push({
        documentType,
        documentUrl,
        verifiedBy,
        verifiedAt: new Date(),
      });
    }

    fundRequest.isVerified = true;
    fundRequest.verifiedBy = verifiedBy;
    fundRequest.verifiedAt = new Date();
    fundRequest.status = "Approved";

    await fundRequest.save();

    res.json({ message: "✅ Fund request verified successfully", fundRequest });
  } catch (error) {
    console.error("❌ Error verifying fund request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update a fund request (only hospital that created it)
 * @route   PUT /api/funds/:id
 */
module.exports.updateFundRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { patientName, patientId, amountRequired, purpose, contactInfo } =
      req.body;
    const hospitalId = req.user?.id;

    const fundRequest = await FundRequest.findById(id);
    if (!fundRequest)
      return res.status(404).json({ message: "Fund request not found" });

    // Ensure the same hospital is updating
    if (fundRequest.hospital.toString() !== hospitalId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this request" });
    }

    // Only allow updates for pending requests
    if (fundRequest.status !== "Pending") {
      return res.status(400).json({
        message:
          "Cannot update fund request after it has been approved or rejected",
      });
    }

    // Update fields
    if (patientName) fundRequest.patientName = patientName;
    if (patientId) fundRequest.patientId = patientId;
    if (amountRequired) fundRequest.amountRequired = amountRequired;
    if (purpose) fundRequest.purpose = purpose;
    if (contactInfo) fundRequest.contactInfo = contactInfo;

    await fundRequest.save();

    res.json({
      success: true,
      message: "✅ Fund request updated successfully",
      fundRequest,
    });
  } catch (error) {
    console.error("❌ Error updating fund request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get fund requests for specific hospital
 * @route   GET /api/funds/hospital/my-requests
 */
module.exports.getMyFundRequests = async (req, res) => {
  try {
    const hospitalId = req.user?.id;

    const fundRequests = await FundRequest.find({ hospital: hospitalId })
      .populate("hospital", "name email contactNumber")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      fundRequests,
    });
  } catch (error) {
    console.error("❌ Error fetching hospital fund requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};