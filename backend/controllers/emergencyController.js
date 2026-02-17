const Emergency = require("../models/Emergency");
const Ambulance = require("../models/Ambulance");
const User = require("../models/User");

// Get nearby emergencies for ambulance
exports.getNearbyEmergencies = async (req, res) => {
  try {
    const { lat, lng, radius = 10, ambulanceId } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Location coordinates are required",
      });
    }

    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);
    const maxDistance = parseFloat(radius) * 1000; // Convert km to meters

    // Find emergencies within radius that are not assigned
    const emergencies = await Emergency.find({
      status: "pending",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance,
        },
      },
    })
      .sort({ createdAt: -1 })
      .populate("userId");
    console.log("emergencies ", emergencies);

    // Filter out emergencies that might have been assigned but not updated yet
    const availableEmergencies = emergencies.filter(
      (emergency) => !emergency.assignedAmbulance,
    );

    res.json({
      success: true,
      emergencies: availableEmergencies,
      count: availableEmergencies.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Ambulance accepts emergency
exports.acceptEmergency = async (req, res) => {
  try {
    const { emergencyId, ambulanceId } = req.body;
    const io = req.app.get("io");

    const emergency = await Emergency.findById(emergencyId).populate("userId");
    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    if (emergency.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Emergency already assigned",
      });
    }

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: "Ambulance not found",
      });
    }

    // Update emergency
    emergency.status = "assigned";
    emergency.assignedAmbulance = ambulanceId;
    emergency.acceptedAt = new Date();
    await emergency.save();

    // Update ambulance
    ambulance.status = "onDuty";
    ambulance.assignedUser = emergency.userId;
    await ambulance.save();

    //  EMIT REAL-TIME EVENT: Notify all other ambulances that this emergency is taken
    if (io) {
      io.to("emergency-room").emit("emergency-taken", {
        emergencyId: emergency._id,
        ambulanceId: ambulance._id,
        ambulanceName: ambulance.name,
        ambulancePhone: ambulance.phone,
        message: `Emergency has been assigned to ${ambulance.name}`,
      });

      // Notify the user that ambulance accepted
      io.to(`user-${emergency.userId._id}`).emit("emergency-accepted", {
        emergencyId: emergency._id,
        ambulanceId: ambulance._id,
        ambulanceName: ambulance.name,
        ambulancePhone: ambulance.phone,
        driverName: ambulance.driverName,
        estimatedTime: "5-10 minutes",
        message: "Ambulance is on the way to your location!",
      });
    }

    res.json({
      success: true,
      message: "Emergency accepted successfully",
      emergency,
      ambulance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// User creates emergency
exports.createEmergency = async (req, res) => {
  try {
    const { userId, location, coordinates, emergencyType, notes } = req.body;
    const io = req.app.get("io");

    const userDetails = await User.findById(userId);

    const emergency = await Emergency.create({
      userId,
      location,
      coordinates: {
        type: "Point",
        coordinates: [coordinates.lng, coordinates.lat],
      },
      emergencyType: emergencyType || "Medical Emergency",
      notes,
      status: "pending",
    });

    // Populate user details for the response
    const populatedEmergency = await emergency.populate("userId", "name phone");

    // EMIT REAL-TIME EVENT: Broadcast new emergency ONLY to AVAILABLE ambulances
    if (io) {
      // FIXED: Query database for ONLY available ambulances
      const availableAmbulances = await Ambulance.find({
        status: "available",
        isApproved: true,
      });

      // Only send to ambulances with "available" status
      availableAmbulances.forEach((ambulance) => {
        io.to(`ambulance-${ambulance._id}`).emit("new-emergency", {
          _id: emergency._id,
          userId: populatedEmergency.userId,
          location: emergency.location,
          coordinates: emergency.coordinates,
          emergencyType: emergency.emergencyType,
          notes: emergency.notes,
          status: emergency.status,
          createdAt: emergency.createdAt,
          message: `New emergency request at ${location}`,
        });
      });

      // Also broadcast to emergency-room for any other listeners
      io.to("emergency-room").emit("new-emergency", {
        _id: emergency._id,
        userId: populatedEmergency.userId,
        location: emergency.location,
        coordinates: emergency.coordinates,
        emergencyType: emergency.emergencyType,
        notes: emergency.notes,
        status: emergency.status,
        createdAt: emergency.createdAt,
        message: `New emergency request at ${location}`,
      });
    } else {
      console.error("Socket.io not available for broadcasting emergency");
    }

    res.status(201).json({
      success: true,
      message: "Emergency request created",
      emergency: populatedEmergency,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get emergency status
exports.getEmergencyStatus = async (req, res) => {
  try {
    const { emergencyId } = req.params;

    const emergency = await Emergency.findById(emergencyId).populate(
      "assignedAmbulance",
      "name driverName phone",
    );

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    res.json({
      success: true,
      emergency,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};