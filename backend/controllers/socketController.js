const Ambulance = require("../models/Ambulance");
const User = require("../models/User");

// Store connected users and ambulances
const connectedUsers = new Map();
const connectedAmbulances = new Map();
const activeEmergencies = new Map();

const socketController = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    // User joins
    socket.on("user-join", (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`👤 User ${userId} joined`);
    });

    // Ambulance joins emergency room
    socket.on("ambulance-join", async (ambulanceId) => {
      try {
        const ambulance = await Ambulance.findById(ambulanceId);
        if (ambulance && ambulance.isApproved) {
          socket.join("emergency-room");
          socket.ambulanceId = ambulanceId;
          connectedAmbulances.set(ambulanceId, socket.id);

          // Update ambulance status to available if not already
          if (ambulance.status !== "available") {
            ambulance.status = "available";
            await ambulance.save();
          }

          console.log(
            `🚑 Ambulance ${ambulanceId} (${ambulance.name}) joined emergency room`
          );

          // Notify ambulance of successful connection
          socket.emit("ambulance-connected", {
            message: "Connected to emergency system",
            status: "available",
          });
        } else {
          socket.emit("connection-error", {
            message: "Ambulance not approved or not found",
          });
        }
      } catch (error) {
        console.error("Error joining ambulance:", error);
        socket.emit("connection-error", {
          message: "Error connecting to emergency system",
        });
      }
    });

    // User requests emergency
    socket.on("emergency-request", async (emergencyData) => {
      try {
        const user = await User.findById(emergencyData.userId);
        if (!user) {
          socket.emit("emergency-error", { message: "User not found" });
          return;
        }

        const emergencyId = `emergency_${Date.now()}_${emergencyData.userId}`;
        const enhancedEmergencyData = {
          ...emergencyData,
          emergencyId,
          userName: user.name,
          userPhone: user.phone,
          timestamp: new Date(),
          status: "pending",
        };

        // Store emergency
        activeEmergencies.set(emergencyId, enhancedEmergencyData);

        console.log("🚨 New emergency request:", {
          emergencyId,
          userName: user.name,
          location: emergencyData.location,
        });

        // Broadcast to all available ambulances
        io.to("emergency-room").emit("new-emergency", enhancedEmergencyData);

        // Confirm to user
        socket.emit("emergency-sent", {
          emergencyId,
          message: "Emergency request sent to nearby ambulances",
        });

        // Set timeout to auto-expire emergency after 2 minutes
        setTimeout(() => {
          if (activeEmergencies.has(emergencyId)) {
            activeEmergencies.delete(emergencyId);
            io.to("emergency-room").emit("emergency-expired", { emergencyId });
            socket.emit("emergency-expired", { emergencyId });
          }
        }, 120000); // 2 minutes
      } catch (error) {
        console.error("Error processing emergency:", error);
        socket.emit("emergency-error", {
          message: "Failed to process emergency",
        });
      }
    });

    // Ambulance accepts emergency
    socket.on("accept-emergency", async (data) => {
      try {
        const { emergencyId, ambulanceId } = data;
        const emergency = activeEmergencies.get(emergencyId);

        if (!emergency) {
          socket.emit("accept-error", {
            message: "Emergency no longer available",
          });
          return;
        }

        const ambulance = await Ambulance.findById(ambulanceId);
        if (!ambulance) {
          socket.emit("accept-error", { message: "Ambulance not found" });
          return;
        }

        // Update ambulance status
        ambulance.status = "onDuty";
        await ambulance.save();

        // Remove emergency from active list
        activeEmergencies.delete(emergencyId);

        // Notify all other ambulances that this emergency is taken
        socket.to("emergency-room").emit("emergency-taken", {
          emergencyId,
          ambulanceId,
          ambulanceName: ambulance.name,
          ambulancePhone: ambulance.phone,
        });

        // Notify the user who requested
        const userSocketId = connectedUsers.get(emergency.userId);
        if (userSocketId) {
          io.to(userSocketId).emit("emergency-accepted", {
            emergencyId,
            ambulanceId: ambulance._id,
            ambulanceName: ambulance.name,
            ambulancePhone: ambulance.phone,
            driverName: ambulance.driverName,
            estimatedTime: "5-10 minutes", // You can calculate this based on distance
            message: "Ambulance is on the way to your location!",
          });
        }

        // Confirm to accepting ambulance
        socket.emit("emergency-accepted-confirm", {
          emergencyId,
          userLocation: emergency.location,
          userCoordinates: emergency.coordinates,
          userName: emergency.userName,
          userPhone: emergency.userPhone,
          message: "Emergency accepted! Please proceed to the location.",
        });

        console.log(
          `✅ Ambulance ${ambulanceId} accepted emergency ${emergencyId}`
        );
      } catch (error) {
        console.error("Error accepting emergency:", error);
        socket.emit("accept-error", { message: "Failed to accept emergency" });
      }
    });

    // Ambulance updates location
    socket.on("update-ambulance-location", async (data) => {
      try {
        const { ambulanceId, coordinates, status } = data;
        const ambulance = await Ambulance.findById(ambulanceId);

        if (ambulance) {
          ambulance.location.coordinates = coordinates;
          if (status) ambulance.status = status;
          await ambulance.save();

          // Broadcast location update to relevant users
          socket.to("emergency-room").emit("ambulance-location-updated", {
            ambulanceId,
            coordinates,
            status: ambulance.status,
          });
        }
      } catch (error) {
        console.error("Error updating ambulance location:", error);
      }
    });

    // Ambulance completes emergency
    socket.on("complete-emergency", async (data) => {
      try {
        const { ambulanceId, emergencyId } = data;
        const ambulance = await Ambulance.findById(ambulanceId);

        if (ambulance) {
          ambulance.status = "available";
          await ambulance.save();

          socket.emit("emergency-completed", {
            message: "Emergency completed successfully",
          });

          console.log(`🏁 Ambulance ${ambulanceId} completed emergency`);
        }
      } catch (error) {
        console.error("Error completing emergency:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log("🔌 User disconnected:", socket.id);

      // Remove from connected users
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
      }

      // Handle ambulance disconnection
      if (socket.ambulanceId) {
        connectedAmbulances.delete(socket.ambulanceId);

        try {
          const ambulance = await Ambulance.findById(socket.ambulanceId);
          if (ambulance && ambulance.status === "available") {
            ambulance.status = "offline";
            await ambulance.save();
            console.log(`🚑 Ambulance ${socket.ambulanceId} set to offline`);
          }
        } catch (error) {
          console.error(
            "Error updating ambulance status on disconnect:",
            error
          );
        }
      }
    });

    // Error handling
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  // Periodic cleanup of expired emergencies
  setInterval(() => {
    const now = new Date();
    for (const [emergencyId, emergency] of activeEmergencies.entries()) {
      const emergencyTime = new Date(emergency.timestamp);
      const diffMinutes = (now - emergencyTime) / (1000 * 60);

      if (diffMinutes > 2) {
        // 2 minutes expiry
        activeEmergencies.delete(emergencyId);
        io.to("emergency-room").emit("emergency-expired", { emergencyId });
        console.log(`🕐 Emergency ${emergencyId} expired`);
      }
    }
  }, 30000); // Check every 30 seconds
};

module.exports = socketController;