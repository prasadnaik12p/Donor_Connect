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
        message: "Location coordinates are required"
      });
    }

    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);
    const maxDistance = parseFloat(radius) * 1000; // Convert km to meters

    // Find emergencies within radius that are not assigned
    const emergencies = await Emergency.find({
      status: 'pending',
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      }
    }).sort({ createdAt: -1 }).populate("userId");
    console.log("emergencies ",emergencies);
    
    // Filter out emergencies that might have been assigned but not updated yet
    const availableEmergencies = emergencies.filter(emergency => 
      !emergency.assignedAmbulance
    );

    res.json({
      success: true,
      emergencies: availableEmergencies,
      count: availableEmergencies.length
    });
  } catch (error) {
    console.error("Error getting nearby emergencies:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Ambulance accepts emergency
exports.acceptEmergency = async (req, res) => {
  try {
    const { emergencyId, ambulanceId } = req.body;
    
    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found"
      });
    }

    if (emergency.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Emergency already assigned"
      });
    }

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: "Ambulance not found"
      });
    }

    // Update emergency
    emergency.status = 'assigned';
    emergency.assignedAmbulance = ambulanceId;
    emergency.acceptedAt = new Date();
    await emergency.save();

    // Update ambulance
    ambulance.status = 'onDuty';
    ambulance.assignedUser = emergency.userId;
    await ambulance.save();

    res.json({
      success: true,
      message: "Emergency accepted successfully",
      emergency,
      ambulance
    });
  } catch (error) {
    console.error("Error accepting emergency:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// User creates emergency
exports.createEmergency = async (req, res) => {
  try {
    const { userId, location, coordinates, emergencyType, notes } = req.body;

    const emergency = await Emergency.create({
      userId,
      location,
      coordinates: {
        type: "Point",
        coordinates: [coordinates.lng, coordinates.lat]
      },
      emergencyType: emergencyType || 'Medical Emergency',
      notes,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: "Emergency request created",
      emergency
    });
  } catch (error) {
    console.error("Error creating emergency:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Get emergency status
exports.getEmergencyStatus = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    
    const emergency = await Emergency.findById(emergencyId)
      .populate('assignedAmbulance', 'name driverName phone');
    
    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found"
      });
    }

    res.json({
      success: true,
      emergency
    });
  } catch (error) {
    console.error("Error getting emergency status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};