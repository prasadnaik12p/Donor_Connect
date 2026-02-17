const Hospital = require("../models/Hospital");
const Ambulance = require("../models/Ambulance");
const FundRequest = require("../models/FundRequest");
const BloodRequest = require("../models/BloodRequest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ---------------- Admin Registration ----------------
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (email === process.env.ADMIN_EMAIL) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    res.status(201).json({
      message: "Admin registration successful",
      admin: {
        email: email,
        name: name,
        role: "admin",
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- Admin Login ----------------
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH,
    );
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { role: "admin", email: email },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        role: "admin",
        email: email,
        name: "System Administrator",
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- Admin Dashboard Stats ----------------
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalHospitals,
      pendingHospitals,
      totalAmbulances,
      pendingAmbulances,
      totalFundRequests,
      totalBloodRequests,
      approvedHospitals,
    ] = await Promise.all([
      Hospital.countDocuments(),
      Hospital.countDocuments({ isApprovedByAdmin: false }),
      Ambulance.countDocuments(),
      Ambulance.countDocuments({ isApproved: false }),
      FundRequest.countDocuments(),
      BloodRequest.countDocuments(),
      Hospital.countDocuments({ isApprovedByAdmin: true }),
    ]);

    res.json({
      stats: {
        totalHospitals,
        pendingHospitals,
        totalAmbulances,
        pendingAmbulances,
        totalFundRequests,
        totalBloodRequests,
        approvedHospitals,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- Get All Data for Admin ----------------
exports.getAllData = async (req, res) => {
  try {
    const [hospitals, ambulances, fundRequests, bloodRequests] =
      await Promise.all([
        Hospital.find().select("-password"),
        Ambulance.find().select("-password"),
        FundRequest.find().populate("hospital", "name email phone"),
        BloodRequest.find()
          .populate("donor", "name email")
          .populate("recipient", "name email"),
      ]);

    res.json({
      hospitals,
      ambulances,
      fundRequests,
      bloodRequests,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getPendingHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isApprovedByAdmin: false });
    res.json({ hospitals });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.approveHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    hospital.isApprovedByAdmin = true;
    await hospital.save();

    const io = req.app.get("io");
    if (io) {
      io.to(hospitalId).emit("approvalStatus", { approved: true });
    }

    res.json({ message: "Hospital approved successfully", hospital });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.rejectHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const hospital = await Hospital.findByIdAndDelete(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const io = req.app.get("io");
    if (io) {
      io.to(hospitalId).emit("approvalStatus", { approved: false });
    }

    res.json({ message: "Hospital rejected and removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getPendingAmbulances = async (req, res) => {
  try {
    const ambulances = await Ambulance.find({ isApproved: false });
    res.json({ ambulances });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.approveAmbulance = async (req, res) => {
  try {
    const { ambulanceId } = req.params;
    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({ message: "Ambulance not found" });
    }

    ambulance.isApproved = true;
    await ambulance.save();

    const io = req.app.get("io");
    if (io) {
      io.to(ambulanceId).emit("approvalStatus", { approved: true });
    }

    res.json({ message: "Ambulance approved successfully", ambulance });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.rejectAmbulance = async (req, res) => {
  try {
    const { ambulanceId } = req.params;
    const ambulance = await Ambulance.findByIdAndDelete(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({ message: "Ambulance not found" });
    }

    const io = req.app.get("io");
    if (io) {
      io.to(ambulanceId).emit("approvalStatus", { approved: false });
    }

    res.json({ message: "Ambulance rejected and removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllFundRequests = async (req, res) => {
  try {
    const fundRequests = await FundRequest.find().populate(
      "hospital",
      "name city address",
    );
    res.json({ fundRequests });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllBloodRequests = async (req, res) => {
  try {
    const bloodRequests = await BloodRequest.find()
      .populate("hospital", "name city address")
      .populate("recipient", "name email")
      .populate("donor", "name email");
    res.json({ bloodRequests });
  } catch (err) {
    res.status(500).json({
      message: "Server error fetching blood requests",
      error: err.message,
    });
  }
};

exports.updateFundStatus = async (req, res) => {
  try {
    const { fundId } = req.params;
    const { status } = req.body;

    const fundRequest = await FundRequest.findByIdAndUpdate(
      fundId,
      { status },
      { new: true }
    ).populate("hospital", "name city address");

    if (!fundRequest) {
      return res.status(404).json({ message: "Fund request not found" });
    }

    res.json({
      message: "Fund request status updated successfully",
      fundRequest,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isApprovedByAdmin: true }).select(
      "name city state address phone registrationNumber location isApprovedByAdmin createdAt"
    );
    res.json({ hospitals });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getHospitalsWithBeds = async (req, res) => {
  try {
    const hospitals = await Hospital.find({
      isApprovedByAdmin: true,
    }).select("name city address phone location isApprovedByAdmin");

    res.json({ hospitals });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


