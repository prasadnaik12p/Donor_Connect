const Ambulance = require("../models/Ambulance");
const User = require("../models/User");
const Emergency = require("../models/Emergency");

// Store connected users and ambulances
const connectedUsers = new Map();
const connectedAmbulances = new Map();
const activeEmergencies = new Map();

const socketController = (io) => {
  io.on("connection", (socket) => {
    console.log(" User connected:", socket.id);

    // User joins
    socket.on("user-join", (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      socket.join(`user-${userId}`);
      console.log(` User ${userId} joined`);
    });

    //  NEW: Donor joins blood donation room
    socket.on("donor-join", async (userId) => {
      try {
        socket.userId = userId;
        socket.join("blood-donors");
        connectedUsers.set(`donor-${userId}`, socket.id);

        const bloodDonorsCount =
          io.sockets.adapter.rooms.get("blood-donors")?.size || 0;

        console.log(
          ` Donor ${userId} joined blood-donors room (${bloodDonorsCount} donors online)`,
        );

        // Notify donor of successful connection
        socket.emit("donor-connected", {
          message: "Connected to blood donation network",
          onlineDonors: bloodDonorsCount,
          timestamp: new Date(),
        });

        // Broadcast donor online status to all others in the room
        socket.to("blood-donors").emit("donor-online", {
          message: "A new donor is now available",
          onlineDonors: bloodDonorsCount,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error donor joining:", error);
        socket.emit("connection-error", {
          message: "Error connecting to blood donation network",
        });
      }
    });

    // Handle blood donation request acceptance
    socket.on("accept-blood-request", async (data) => {
      try {
        const { requestId, donorId } = data;
        console.log(` Donor ${donorId} accepting blood request ${requestId}`);

        socket.to("blood-donors").emit("blood-request-taken", {
          requestId: requestId,
          message: "Blood request was already accepted by another donor",
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error handling blood request acceptance:", error);
      }
    });

    //  Update donor status (available, busy, offline)
    socket.on("update-donor-status", async (data) => {
      try {
        const { userId, newStatus } = data;

        if (newStatus === "available") {
          socket.join("blood-donors");
          console.log(` Donor ${userId} is now AVAILABLE`);
        } else {
          socket.leave("blood-donors");
          console.log(` Donor ${userId} status changed to ${newStatus}`);
        }

        // Notify the donor
        socket.emit("status-updated", {
          status: newStatus,
          message: `You are now ${newStatus}`,
        });

        // Notify other donors
        socket.to("blood-donors").emit("donor-status-changed", {
          message: `Donor count: ${io.sockets.adapter.rooms.get("blood-donors")?.size || 0}`,
        });
      } catch (error) {
        console.error("Error updating donor status:", error);
      }
    });

    // Ambulance joins emergency room
    socket.on("ambulance-join", async (ambulanceId) => {
      try {
        const ambulance = await Ambulance.findById(ambulanceId);
        if (ambulance && ambulance.isApproved) {
          socket.ambulanceId = ambulanceId;
          socket.join(`ambulance-${ambulanceId}`);
          connectedAmbulances.set(ambulanceId, socket.id);

          if (ambulance.status === "available") {
            socket.join("emergency-room");
            console.log(
              ` Ambulance ${ambulanceId} (${ambulance.name}) is AVAILABLE - joined emergency room for requests`,
            );
          } else {
            console.log(
              ` Ambulance ${ambulanceId} (${ambulance.name}) status: ${ambulance.status} - NOT receiving requests`,
            );
          }

          // Get count of ambulances in emergency room (only available ones)
          const emergencyRoomSockets =
            io.sockets.adapter.rooms.get("emergency-room");
          const ambulanceCount = emergencyRoomSockets
            ? emergencyRoomSockets.size
            : 0;

          // Notify ambulance of successful connection
          socket.emit("ambulance-connected", {
            message: "Connected to emergency system",
            status: ambulance.status,
            canReceiveRequests: ambulance.status === "available",
            ambulancesInRoom: ambulanceCount,
          });

          // Broadcast ambulance status if available
          if (ambulance.status === "available") {
            socket.to("emergency-room").emit("ambulance-online", {
              ambulanceId,
              ambulanceName: ambulance.name,
              status: ambulance.status,
              totalAmbulances: ambulanceCount,
            });
          }
        } else {
          console.warn(
            ` Ambulance ${ambulanceId} rejected: ${!ambulance ? "not found" : "not approved"}`,
          );
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

        console.log(" New emergency request:", {
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

        // Update emergency in database
        const emergency = await Emergency.findById(emergencyId);
        if (!emergency) {
          socket.emit("accept-error", {
            message: "Emergency no longer available",
          });
          return;
        }

        if (emergency.status !== "pending") {
          socket.emit("accept-error", {
            message: "Emergency already assigned",
          });
          return;
        }

        const ambulance = await Ambulance.findById(ambulanceId);
        if (!ambulance) {
          socket.emit("accept-error", { message: "Ambulance not found" });
          return;
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

        // Remove emergency from active list (if using in-memory)
        activeEmergencies.delete(emergencyId);

        socket.to("emergency-room").emit("emergency-taken", {
          emergencyId,
          ambulanceId,
          ambulanceName: ambulance.name,
          ambulancePhone: ambulance.phone,
        });

        // Notify the user who requested
        io.to(`user-${emergency.userId}`).emit("emergency-accepted", {
          emergencyId,
          ambulanceId: ambulance._id,
          ambulanceName: ambulance.name,
          ambulancePhone: ambulance.phone,
          driverName: ambulance.driverName,
          estimatedTime: "5-10 minutes",
          message: "Ambulance is on the way to your location!",
        });

        // Confirm to accepting ambulance
        socket.emit("emergency-accepted-confirm", {
          emergencyId,
          userLocation: emergency.location,
          userCoordinates: emergency.coordinates,
          userName: emergency.userId.name || "User",
          userPhone: emergency.userId.phone || "N/A",
          message: "Emergency accepted! Please proceed to the location.",
        });

        console.log(
          ` Ambulance ${ambulanceId} accepted emergency ${emergencyId}`,
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

          //  FIXED: Join emergency room when status changes to available
          socket.join("emergency-room");
          console.log(
            ` Ambulance ${ambulanceId} is now AVAILABLE - joined emergency room`,
          );

          socket.emit("emergency-completed", {
            message: "Emergency completed successfully",
          });

          console.log(` Ambulance ${ambulanceId} completed emergency`);
        }
      } catch (error) {
        console.error("Error completing emergency:", error);
      }
    });

    //  Handle ambulance status updates
    socket.on("update-ambulance-status", async (data) => {
      try {
        const { ambulanceId, newStatus } = data;
        const ambulance = await Ambulance.findById(ambulanceId);

        if (ambulance) {
          const oldStatus = ambulance.status;
          ambulance.status = newStatus;
          await ambulance.save();

          console.log(
            ` Ambulance ${ambulanceId} status changed: ${oldStatus} → ${newStatus}`,
          );

          //  Manage emergency-room room membership based on status
          if (newStatus === "available") {
            socket.join("emergency-room");
            console.log(
              ` Ambulance ${ambulanceId} status is now AVAILABLE - joined emergency room`,
            );
          } else {
            socket.leave("emergency-room");
            console.log(
              ` Ambulance ${ambulanceId} status is now ${newStatus} - left emergency room`,
            );
          }

          // Broadcast status change to all connected clients
          io.emit("ambulance-status-changed", {
            ambulanceId,
            oldStatus,
            newStatus,
            ambulanceName: ambulance.name,
          });

          socket.emit("status-updated", {
            message: `Status updated to ${newStatus}`,
            status: newStatus,
          });
        }
      } catch (error) {
        console.error("Error updating ambulance status:", error);
        socket.emit("status-update-error", {
          message: "Failed to update ambulance status",
        });
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
          if (ambulance) {
            if (ambulance.status === "available") {
              ambulance.status = "offline";
              await ambulance.save();
              console.log(
                ` Ambulance ${socket.ambulanceId} set to OFFLINE (was available)`,
              );
            } else {
              console.log(
                ` Ambulance ${socket.ambulanceId} disconnected but status remains ${ambulance.status}`,
              );
            }
          }
        } catch (error) {
          console.error(
            "Error updating ambulance status on disconnect:",
            error,
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
        console.log(` Emergency ${emergencyId} expired`);
      }
    }
  }, 30000); // Check every 30 seconds
};

module.exports = socketController;