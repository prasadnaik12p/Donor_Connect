// controllers/donorController.js
const Donor = require("../models/Donor");
const User = require("../models/User");

// 🩸 Register a new donor
// 🩸 Register a new donor - UPDATED VERSION
module.exports.registerDonor = async (req, res) => {
  try {
    const { username, phone, bloodGroup, city, state, coordinates } = req.body;

    console.log("Registering donor with data:", req.body);

    // Find user to get userId
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already a donor
    const existingDonor = await Donor.findOne({ userId: user._id });
    if (existingDonor) {
      return res
        .status(400)
        .json({ message: "User is already a registered donor" });
    }

    const donor = await Donor.create({
      username: user.username || user.email,
      userId: user._id,
      phone,
      bloodGroup,
      city,
      state,
      location: {
        type: "Point",
        coordinates: coordinates || [0, 0],
      },
    });

    // Update user role to donor
    await User.findByIdAndUpdate(user._id, {
      role: "donor",
      bloodType: bloodGroup,
      phone: phone,
    });

    res.status(201).json({
      message: "Donor registered successfully",
      donor,
    });
  } catch (error) {
    console.error("Error registering donor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✏️ Update donor info (like phone, bloodGroup, etc.)
module.exports.updateDonorInfo = async (req, res) => {
  try {
    const { donorId } = req.params;
    const updatedData = req.body;

    console.log(`Updating donor ${donorId} with:`, updatedData);

    const donor = await Donor.findByIdAndUpdate(donorId, updatedData, {
      new: true,
    });

    if (!donor) return res.status(404).json({ message: "Donor not found" });

    // Notify donor about update
    const io = req.app.get("io");
    io.to(donorId).emit("donorInfoUpdated", donor);

    res.json({
      message: "Donor info updated successfully",
      donor,
    });
  } catch (error) {
    console.error("Error updating donor:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📍 Update donor live location (auto when website opened)
module.exports.updateLocation = async (req, res) => {
  try {
    const { donorId, coordinates } = req.body;

    console.log(`Updating location for donor ${donorId}:`, coordinates);

    if (!donorId || !coordinates || coordinates.length !== 2)
      return res.status(400).json({
        message:
          "Donor ID and valid coordinates [longitude, latitude] are required",
      });

    const donor = await Donor.findByIdAndUpdate(
      donorId,
      {
        location: {
          type: "Point",
          coordinates: [coordinates[0], coordinates[1]],
        },
        lastLocationUpdate: new Date(),
      },
      { new: true }
    );

    if (!donor) return res.status(404).json({ message: "Donor not found" });

    // Also update user location if exists
    await User.findByIdAndUpdate(donorId, {
      "location.coordinates": coordinates,
    });

    // Emit real-time update
    const io = req.app.get("io");
    io.emit("locationUpdated", {
      donorId,
      location: donor.location,
    });

    res.json({
      message: "Location updated successfully",
      donor: {
        id: donor._id,
        location: donor.location,
      },
    });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
