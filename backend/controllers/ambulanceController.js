const Ambulance = require("../models/Ambulance");
const Emergency = require("../models/Emergency"); 
const jwt = require("jsonwebtoken");

// Register ambulance with pending admin approval
exports.registerAmbulance = async (req, res) => {
  try {
    const { name, hospital, driverName, phone, email, password, location } = req.body;

    const exists = await Ambulance.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already exists" });

    const ambulance = await Ambulance.create({
      name,
      hospital,
      driverName,
      phone,
      email,
      password,
      location: location || { type: "Point", coordinates: [0, 0] },
    });

    res.status(201).json({
      success: true,
      message: "Registration submitted. Waiting admin approval.",
      ambulance: {
        id: ambulance._id,
        name: ambulance.name,
        email: ambulance.email,
        driverName: ambulance.driverName,
        status: ambulance.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Login ambulance 
exports.loginAmbulance = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const ambulance = await Ambulance.findOne({ email });
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: "Ambulance not found",
      });
    }

    if (!ambulance.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Waiting admin approval",
      });
    }

    const isMatch = await ambulance.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: ambulance._id, role: "ambulance" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      ambulance: {
        id: ambulance._id,
        name: ambulance.name,
        email: ambulance.email,
        driverName: ambulance.driverName,
        phone: ambulance.phone,
        status: ambulance.status,
        isApproved: ambulance.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get ambulance dashboard data with emergencies
exports.getAmbulanceDashboard = async (req, res) => {
  try {
    const ambulanceId = req.user._id;

    const ambulance = await Ambulance.findById(ambulanceId)
      .select("-password")
      .populate("hospital", "name city phone address");

    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: "Ambulance not found",
      });
    }

    // Ensure location coordinates are numbers, not strings
    let ambulanceCoordinates = [0, 0];
    if (ambulance.location && ambulance.location.coordinates) {
      ambulanceCoordinates = [
        parseFloat(ambulance.location.coordinates[0]) || 0,
        parseFloat(ambulance.location.coordinates[1]) || 0,
      ];
    }

    // Get nearby emergencies for this ambulance 
    let nearbyEmergencies = [];
    if (ambulanceCoordinates[0] !== 0 && ambulanceCoordinates[1] !== 0) {
      nearbyEmergencies = await Emergency.find({
        status: "pending",
        coordinates: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: ambulanceCoordinates,
            },
            $maxDistance: 10000, // 10km radius
          },
        },
      })
        .populate("userId", "name phone")
        .sort({ createdAt: -1 })
        .limit(10);
    }

    // Get assigned emergency if any
    const assignedEmergency = await Emergency.findOne({
      assignedAmbulance: ambulanceId,
      status: "assigned",
    }).populate("userId", "name phone");

    // Get stats for dashboard
    const totalAssignments = await Emergency.countDocuments({
      assignedAmbulance: ambulanceId,
      status: { $in: ["assigned", "completed"] },
    });

    const completedEmergencies = await Emergency.countDocuments({
      assignedAmbulance: ambulanceId,
      status: "completed",
    });

    res.json({
      success: true,
      ambulance,
      stats: {
        totalAssignments,
        completedEmergencies,
        pendingEmergencies: nearbyEmergencies.length,
        currentStatus: ambulance.status,
        isApproved: ambulance.isApproved,
      },
      nearbyEmergencies,
      assignedEmergency,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get nearby emergencies for ambulance
exports.getNearbyEmergencies = async (req, res) => {
  try {
    const ambulanceId = req.user._id;
    const { radius = 10000 } = req.query; // Default 10km radius

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: "Ambulance not found",
      });
    }

    // Ensure coordinates are numbers
    let ambulanceCoordinates = [0, 0];
    if (ambulance.location && ambulance.location.coordinates) {
      ambulanceCoordinates = [
        parseFloat(ambulance.location.coordinates[0]) || 0,
        parseFloat(ambulance.location.coordinates[1]) || 0,
      ];
    }

    let emergencies = [];
    if (ambulanceCoordinates[0] !== 0 && ambulanceCoordinates[1] !== 0) {
      // Get emergencies within radius that are pending
      emergencies = await Emergency.find({
        status: "pending",
        coordinates: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: ambulanceCoordinates,
            },
            $maxDistance: parseInt(radius),
          },
        },
      })
        .populate("userId", "name phone")
        .sort({ createdAt: -1 });
    }

    // Calculate distance for each emergency
    const emergenciesWithDistance = emergencies.map((emergency) => {
      // Ensure emergency coordinates are numbers too
      const emergencyCoords = emergency.coordinates.coordinates.map((coord) =>
        parseFloat(coord),
      );
      const distance = calculateDistance(
        ambulanceCoordinates[1], // lat
        ambulanceCoordinates[0], // lng
        emergencyCoords[1], // emergency lat
        emergencyCoords[0], // emergency lng
      );

      return {
        ...emergency.toObject(),
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      };
    });

    res.json({
      success: true,
      emergencies: emergenciesWithDistance,
      count: emergenciesWithDistance.length,
      ambulanceLocation: ambulanceCoordinates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Accept emergency
exports.acceptEmergency = async (req, res) => {
  try {
    const ambulanceId = req.user._id;
    const { emergencyId } = req.body;

    if (!emergencyId) {
      return res.status(400).json({
        success: false,
        message: "Emergency ID is required",
      });
    }

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: "Ambulance not found",
      });
    }

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    // Check if emergency is already assigned
    if (emergency.status === "assigned") {
      const assignedAmbulance = await Ambulance.findById(
        emergency.assignedAmbulance,
      );
      const driverName = assignedAmbulance
        ? assignedAmbulance.driverName || assignedAmbulance.name
        : "Another ambulance driver";

      

      return res.status(409).json({
        success: false,
        code: "ALREADY_ACCEPTED",
        message: `Request already accepted by ${driverName}`,
        assignedAmbulance: {
          id: emergency.assignedAmbulance,
          name: assignedAmbulance?.name || "Unknown",
          driverName: driverName,
        },
      });
    }

    if (emergency.status === "completed") {
      return res.status(409).json({
        success: false,
        code: "ALREADY_COMPLETED",
        message: "This emergency has already been completed",
      });
    }

    if (emergency.status !== "pending") {
      return res.status(409).json({
        success: false,
        code: "INVALID_STATUS",
        message: `Cannot accept emergency with status: ${emergency.status}`,
      });
    }

    // Check if ambulance already has an assigned emergency
    const existingAssignment = await Emergency.findOne({
      assignedAmbulance: ambulanceId,
      status: "assigned",
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        code: "ALREADY_ASSIGNED_OTHER",
        message: "You already have an assigned emergency. Complete it first.",
      });
    }

    // Update emergency
    emergency.status = "assigned";
    emergency.assignedAmbulance = ambulanceId;
    emergency.acceptedAt = new Date();
    await emergency.save();

    // Update ambulance status
    ambulance.status = "onDuty";
    ambulance.assignedUser = emergency.userId;
    await ambulance.save();

    // EMIT REAL-TIME UPDATES
    const io = req.app.get("io");
    if (io) {
      // Notify all other ambulances that this emergency is taken
      io.to("emergency-room").emit("emergency-taken", {
        emergencyId: emergency._id,
        ambulanceId: ambulance._id,
        ambulanceName: ambulance.name,
        ambulancePhone: ambulance.phone,
        message: `Emergency has been assigned to ${ambulance.name}`,
      });

      // Notify the user that ambulance accepted
      io.to(`user-${emergency.userId}`).emit("emergency-accepted", {
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
      ambulance: {
        id: ambulance._id,
        name: ambulance.name,
        status: ambulance.status,
      },
    });
  } catch (error) {
    console.error("Accept emergency error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Complete emergency
exports.completeEmergency = async (req, res) => {
  try {
    const ambulanceId = req.user._id;
    const { emergencyId } = req.body;

    if (!emergencyId) {
      return res.status(400).json({
        success: false,
        message: "Emergency ID is required",
      });
    }

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: "Ambulance not found",
      });
    }

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found",
      });
    }

    // Check if ambulance is assigned to this emergency
    console.log("Complete Emergency Debug:");
    console.log("  Ambulance ID:", ambulanceId);
    console.log("  Assigned Ambulance:", emergency.assignedAmbulance);
    console.log("  Emergency Status:", emergency.status);

    // Properly compare MongoDB ObjectIds
    if (
      !emergency.assignedAmbulance ||
      !emergency.assignedAmbulance.equals(ambulanceId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to complete this emergency",
        debug: {
          assignedTo: emergency.assignedAmbulance?.toString() || null,
          requestedBy: ambulanceId.toString(),
          match: emergency.assignedAmbulance?.equals(ambulanceId) || false,
        },
      });
    }

    // Update emergency
    emergency.status = "completed";
    emergency.completedAt = new Date();
    await emergency.save();

    // Update ambulance status
    ambulance.status = "available";
    ambulance.assignedUser = null;
    await ambulance.save();

    res.json({
      success: true,
      message: "Emergency completed successfully",
      emergency,
    });
  } catch (error) {
    console.error("Complete emergency error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update ambulance status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ambulanceId = req.user._id;

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: "Ambulance not found",
      });
    }

    // If setting to available, check if there's an assigned emergency
    if (status === "available") {
      const assignedEmergency = await Emergency.findOne({
        assignedAmbulance: ambulanceId,
        status: "assigned",
      });

      if (assignedEmergency) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot set status to available while assigned to an emergency",
        });
      }
    }

    ambulance.status = status;
    await ambulance.save();

    // Emit update via WebSocket
    const io = req.app.get("io");
    if (io) {
      io.to("emergency-room").emit("ambulance-status-update", {
        ambulanceId,
        status,
        ambulanceName: ambulance.name,
      });
    }

    res.json({
      success: true,
      message: "Status updated successfully",
      ambulance,
    });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update ambulance location and status
// Update the updateLocation function to ensure coordinates are stored as numbers
exports.updateLocation = async (req, res) => {
  try {
    const { coordinates, status } = req.body;
    const ambulanceId = req.user._id;

    if (
      !coordinates ||
      !Array.isArray(coordinates) ||
      coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid coordinates array [lng, lat] is required",
      });
    }

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: "Ambulance not found",
      });
    }

    // Ensure coordinates are stored as numbers
    ambulance.location.coordinates = [
      parseFloat(coordinates[0]),
      parseFloat(coordinates[1]),
    ];

    if (status) ambulance.status = status;
    await ambulance.save();

    // Emit update via WebSocket
    const io = req.app.get("io");
    if (io) {
      io.emit("ambulanceLocationUpdate", {
        ambulanceId,
        coordinates: ambulance.location.coordinates,
        status,
      });
    }

    res.json({
      success: true,
      message: "Location updated successfully",
      ambulance,
    });
  } catch (error) {
    console.error("Location update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get nearby available ambulances 
exports.getNearbyAmbulances = async (req, res) => {
  try {
    let { lng, lat, radius = 10000, city } = req.query;

    // If coordinates provided, use geospatial query
    if (lng && lat) {
      const longitude = parseFloat(lng);
      const latitude = parseFloat(lat);
      const maxDistance = parseInt(radius);

      if (isNaN(longitude) || isNaN(latitude)) {
        return res.status(400).json({
          success: false,
          message: "Invalid coordinates provided",
        });
      }

      const ambulances = await Ambulance.find({
        status: "available",
        isApproved: true,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: maxDistance,
          },
        },
      }).populate("hospital", "name city address phone");

      return res.json({
        success: true,
        ambulances,
        searchType: "coordinates",
        coordinates: { lng: longitude, lat: latitude },
        radius: maxDistance,
      });
    }

    
    else if (city) {
      const ambulances = await Ambulance.find({
        status: "available",
        isApproved: true,
      })
        .populate({
          path: "hospital",
          match: {
            city: new RegExp(city, "i"),
          },
          select: "name city address phone",
        })
        .then((ambulances) =>
          ambulances.filter((amb) => amb.hospital !== null),
        );

      return res.json({
        success: true,
        ambulances,
        searchType: "city",
        city: city,
      });
    }

    // If no location provided, return all available ambulances
    else {
      const ambulances = await Ambulance.find({
        status: "available",
        isApproved: true,
      }).populate("hospital", "name city address phone");

      return res.json({
        success: true,
        ambulances,
        searchType: "all",
      });
    }
  } catch (error) {
    console.error("Nearby ambulances error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get ambulance emergency history
exports.getEmergencyHistory = async (req, res) => {
  try {
    const ambulanceId = req.user._id;

    const emergencies = await Emergency.find({
      assignedAmbulance: ambulanceId,
      status: "completed",
    })
      .populate("userId", "name phone")
      .sort({ completedAt: -1 })
      .limit(20);

    res.json({
      success: true,
      emergencies,
      count: emergencies.length,
    });
  } catch (error) {
    console.error("Emergency history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Logout ambulance
exports.logoutAmbulance = async (req, res) => {
  try {
    console.log(`Ambulance ${req.user._id} logged out`);
    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}