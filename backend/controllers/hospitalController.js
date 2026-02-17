const Hospital = require("../models/Hospital");
const FundRequest = require("../models/FundRequest");
const HospitalBed = require("../models/HospitalBed");
const Ambulance = require("../models/Ambulance");

exports.registerHospital = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      city,
      state,
      registrationNumber,
      location,
    } = req.body;

    console.log("Received hospital registration data:", req.body);

    const existing = await Hospital.findOne({
      $or: [{ email: email }, { registrationNumber: registrationNumber }],
    });
    if (existing) {
      return res.status(400).json({
        message:
          "Hospital already registered with this email or registration number",
      });
    }

    const requiredFields = [
      "name",
      "email",
      "password",
      "phone",
      "address",
      "city",
      "state",
      "registrationNumber",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (
      !location?.coordinates ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        message:
          "Valid location coordinates are required [longitude, latitude]",
      });
    }

    const hospital = await Hospital.create({
      name,
      email,
      password,
      phone,
      address,
      city,
      state,
      registrationNumber,
      location: {
        type: "Point",
        coordinates: location.coordinates,
      },
      isApprovedByAdmin: false,
    });

    console.log("Hospital created successfully:", hospital._id);

    res.status(201).json({
      message: "Hospital registered successfully. Awaiting admin approval.",
      hospital: {
        id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        city: hospital.city,
      },
    });
  } catch (error) {
    console.error("Error registering hospital:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Hospital validation failed",
        errors: errors.join(", "),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Hospital with this email or registration number already exists",
      });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hospital = await Hospital.findOne({ email });
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found" });

    if (!hospital.isApprovedByAdmin) {
      return res
        .status(403)
        .json({ message: "Hospital not yet approved by admin" });
    }

    const isMatch = await hospital.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = hospital.generateToken();
    res.json({
      message: "Login successful",
      token,
      hospital: {
        id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        city: hospital.city,
        phone: hospital.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.logoutHospital = async (req, res) => {
  try {
    console.log(`Hospital ${req.user.id} logged out`);
    res.json({
      success: true,
      message: "Hospital logout successful",
    });
  } catch (error) {
    console.error("Hospital logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

exports.requestFund = async (req, res) => {
  try {
    const { patientName, patientId, amountRequired, purpose, contactInfo } =
      req.body;

    const hospital = await Hospital.findById(req.user.id);
    if (!hospital)
      return res
        .status(403)
        .json({ message: "Only approved hospitals can request funds" });

    const fundRequest = await FundRequest.create({
      hospital: hospital._id,
      patientName,
      patientId,
      purpose,
      amountRequired,
      contactInfo,
      amountCollected: 0,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Fund request created successfully",
      fundRequest,
    });
  } catch (error) {
    console.error("Fund request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.requestBlood = async (req, res) => {
  try {
    const { bloodGroup, unitsRequired, patientName, urgency } = req.body;

    const hospital = await Hospital.findById(req.user.id);
    if (!hospital)
      return res
        .status(403)
        .json({ message: "Only hospitals can request blood" });

    const io = req.app.get("io");
    io.emit("bloodRequest", {
      hospital: hospital.name,
      city: hospital.city,
      bloodGroup,
      unitsRequired,
      patientName,
      urgency,
    });

    res.json({
      success: true,
      message: "Blood request broadcasted to donors",
    });
  } catch (error) {
    console.error("Blood request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateBeds = async (req, res) => {
  try {
    const { generalBeds, icuBeds, ventilatorBeds, pediatricIcuBeds } = req.body;
    const hospitalId = req.user.id;

    let bedData = await HospitalBed.findOne({ hospital: hospitalId });

    if (!bedData) {
      // Create new bed data with proper structure
      bedData = await HospitalBed.create({
        hospital: hospitalId,
        generalBeds: {
          total: generalBeds?.total || 0,
          occupied: generalBeds?.occupied || 0,
          available: Math.max(
            0,
            (generalBeds?.total || 0) - (generalBeds?.occupied || 0),
          ),
        },
        icuBeds: {
          total: icuBeds?.total || 0,
          occupied: icuBeds?.occupied || 0,
          available: Math.max(
            0,
            (icuBeds?.total || 0) - (icuBeds?.occupied || 0),
          ),
        },
        ventilatorBeds: {
          total: ventilatorBeds?.total || 0,
          occupied: ventilatorBeds?.occupied || 0,
          available: Math.max(
            0,
            (ventilatorBeds?.total || 0) - (ventilatorBeds?.occupied || 0),
          ),
        },
        pediatricIcuBeds: {
          total: pediatricIcuBeds?.total || 0,
          occupied: pediatricIcuBeds?.occupied || 0,
          available: Math.max(
            0,
            (pediatricIcuBeds?.total || 0) - (pediatricIcuBeds?.occupied || 0),
          ),
        },
      });
    } else {
      // Update existing bed data with proper calculations
      if (generalBeds) {
        bedData.generalBeds = {
          total:
            generalBeds.total !== undefined
              ? generalBeds.total
              : bedData.generalBeds.total,
          occupied:
            generalBeds.occupied !== undefined
              ? generalBeds.occupied
              : bedData.generalBeds.occupied,
          available: Math.max(
            0,
            (generalBeds.total !== undefined
              ? generalBeds.total
              : bedData.generalBeds.total) -
              (generalBeds.occupied !== undefined
                ? generalBeds.occupied
                : bedData.generalBeds.occupied),
          ),
        };
      }

      if (icuBeds) {
        bedData.icuBeds = {
          total:
            icuBeds.total !== undefined ? icuBeds.total : bedData.icuBeds.total,
          occupied:
            icuBeds.occupied !== undefined
              ? icuBeds.occupied
              : bedData.icuBeds.occupied,
          available: Math.max(
            0,
            (icuBeds.total !== undefined
              ? icuBeds.total
              : bedData.icuBeds.total) -
              (icuBeds.occupied !== undefined
                ? icuBeds.occupied
                : bedData.icuBeds.occupied),
          ),
        };
      }

      if (ventilatorBeds) {
        bedData.ventilatorBeds = {
          total:
            ventilatorBeds.total !== undefined
              ? ventilatorBeds.total
              : bedData.ventilatorBeds.total,
          occupied:
            ventilatorBeds.occupied !== undefined
              ? ventilatorBeds.occupied
              : bedData.ventilatorBeds.occupied,
          available: Math.max(
            0,
            (ventilatorBeds.total !== undefined
              ? ventilatorBeds.total
              : bedData.ventilatorBeds.total) -
              (ventilatorBeds.occupied !== undefined
                ? ventilatorBeds.occupied
                : bedData.ventilatorBeds.occupied),
          ),
        };
      }

      if (pediatricIcuBeds) {
        bedData.pediatricIcuBeds = {
          total:
            pediatricIcuBeds.total !== undefined
              ? pediatricIcuBeds.total
              : bedData.pediatricIcuBeds.total,
          occupied:
            pediatricIcuBeds.occupied !== undefined
              ? pediatricIcuBeds.occupied
              : bedData.pediatricIcuBeds.occupied,
          available: Math.max(
            0,
            (pediatricIcuBeds.total !== undefined
              ? pediatricIcuBeds.total
              : bedData.pediatricIcuBeds.total) -
              (pediatricIcuBeds.occupied !== undefined
                ? pediatricIcuBeds.occupied
                : bedData.pediatricIcuBeds.occupied),
          ),
        };
      }

      // Calculate overall totals
      bedData.totalBeds =
        bedData.generalBeds.total +
        bedData.icuBeds.total +
        bedData.ventilatorBeds.total +
        bedData.pediatricIcuBeds.total;

      bedData.occupiedBeds =
        bedData.generalBeds.occupied +
        bedData.icuBeds.occupied +
        bedData.ventilatorBeds.occupied +
        bedData.pediatricIcuBeds.occupied;

      bedData.availableBeds = Math.max(
        0,
        bedData.totalBeds - bedData.occupiedBeds,
      );

      await bedData.save();
    }

    const io = req.app.get("io");
    io.emit("bedAvailabilityUpdate", {
      hospitalId,
      hospitalName: req.user.name,
      bedData,
    });

    res.json({
      success: true,
      message: "Bed availability updated successfully",
      bedData,
    });
  } catch (error) {
    console.error("Bed update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getHospitalsWithBeds = async (req, res) => {
  try {
    const { city, bedType } = req.query;

    let query = {};
    if (city) query.city = new RegExp(city, "i");

    const hospitals = await Hospital.find(query)
      .select("name email phone address city state location isApprovedByAdmin")
      .lean();

    const allBedData = await HospitalBed.find().populate("hospital", "name");

    let hospitalsWithBeds = hospitals.map((hospital) => {
      const bedData = allBedData.find(
        (bed) => bed.hospital._id.toString() === hospital._id.toString(),
      );

      const calculateAvailableBeds = (bedTypeData) => {
        if (!bedTypeData) return { total: 0, occupied: 0, available: 0 };

        const total = bedTypeData.total || 0;
        const occupied = bedTypeData.occupied || 0;
        const available = Math.max(0, total - occupied);

        return {
          total,
          occupied,
          available,
        };
      };

      return {
        ...hospital,
        bedAvailability: bedData
          ? {
              general: calculateAvailableBeds(bedData.generalBeds),
              icu: calculateAvailableBeds(bedData.icuBeds),
              ventilator: calculateAvailableBeds(bedData.ventilatorBeds),
              pediatricICU: calculateAvailableBeds(bedData.pediatricIcuBeds),
            }
          : {
              general: { total: 0, occupied: 0, available: 0 },
              icu: { total: 0, occupied: 0, available: 0 },
              ventilator: { total: 0, occupied: 0, available: 0 },
              pediatricICU: { total: 0, occupied: 0, available: 0 },
            },
      };
    });

    // Filter by bed type if specified
    if (bedType) {
      hospitalsWithBeds = hospitalsWithBeds.filter((hospital) => {
        const bedTypeKey =
          bedType === "general"
            ? "general"
            : bedType === "icu"
              ? "icu"
              : bedType === "ventilator"
                ? "ventilator"
                : "pediatricICU";
        return hospital.bedAvailability[bedTypeKey]?.available > 0;
      });
    }

    console.log(` Found ${hospitalsWithBeds.length} hospitals with beds`);

    res.json({
      success: true,
      count: hospitalsWithBeds.length,
      hospitals: hospitalsWithBeds,
    });
  } catch (error) {
    console.error("Error fetching hospitals with beds:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.reserveBed = async (req, res) => {
  try {
    const { hospitalId, bedType, durationMinutes = 30 } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User must be authenticated" });
    }

    const bedData = await HospitalBed.findOne({ hospital: hospitalId });
    if (!bedData) {
      return res.status(404).json({ message: "Hospital bed data not found" });
    }

    const bedTypeKey = `${
      bedType === "general"
        ? "general"
        : bedType === "icu"
          ? "icu"
          : bedType === "ventilator"
            ? "ventilator"
            : "pediatricICU"
    }Beds`;

    if (bedData[bedTypeKey].available <= 0) {
      return res.status(400).json({ message: `No ${bedType} beds available` });
    }

    const existingReservation = bedData.reservedBeds.find(
      (r) =>
        r.bedType === bedType &&
        r.reservedBy.toString() === userId.toString() &&
        new Date(r.reservedUntil) > new Date(),
    );

    if (existingReservation) {
      return res
        .status(400)
        .json({ message: "You already have a reservation for this bed type" });
    }

    const reservedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
    bedData.reservedBeds.push({
      bedType,
      reservedBy: userId,
      reservedUntil,
    });

    await bedData.save();

    res.json({
      success: true,
      message: `Bed reserved for ${durationMinutes} minutes`,
      reservation: {
        bedType,
        reservedUntil,
        hospitalId,
      },
    });
  } catch (error) {
    console.error("Error reserving bed:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getHospitalDashboard = async (req, res) => {
  try {
    const hospitalId = req.user.id;

    const hospital = await Hospital.findById(hospitalId).select("-password");
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // Get dashboard stats with proper queries
    const [bedData, fundRequests, ambulances] = await Promise.all([
      HospitalBed.findOne({ hospital: hospitalId }),
      FundRequest.find({ hospital: hospitalId }).sort({ createdAt: -1 }),
      Ambulance.find({ hospital: hospitalId }).sort({ createdAt: -1 }),
    ]);

    // Calculate stats
    const stats = {
      totalBeds: bedData?.totalBeds || 0,
      availableBeds: bedData?.availableBeds || 0,
      totalFundRequests: fundRequests.length,
      activeFundRequests: fundRequests.filter(
        (req) => req.status === "Pending" || req.status === "Approved",
      ).length,
      totalAmbulances: ambulances.length,
      approvedAmbulances: ambulances.filter((amb) => amb.isApproved).length,
      isApproved: hospital.isApprovedByAdmin,
    };

    res.json({
      success: true,
      hospital,
      stats,
      recentFundRequests: fundRequests.slice(0, 5),
      ambulances: ambulances.slice(0, 5),
      bedData: bedData || {
        generalBeds: { total: 0, occupied: 0, available: 0 },
        icuBeds: { total: 0, occupied: 0, available: 0 },
        ventilatorBeds: { total: 0, occupied: 0, available: 0 },
        pediatricIcuBeds: { total: 0, occupied: 0, available: 0 },
        totalBeds: 0,
        occupiedBeds: 0,
        availableBeds: 0,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateHospitalProfile = async (req, res) => {
  try {
    const hospitalId = req.user.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.email;
    delete updates.registrationNumber;
    delete updates.isApprovedByAdmin;

    const hospital = await Hospital.findByIdAndUpdate(hospitalId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!hospital) {
      return res.status(404).json({
        message: "Hospital not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      hospital,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};