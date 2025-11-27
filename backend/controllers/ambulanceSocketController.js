const Ambulance = require("../models/Ambulance");

const ambulanceSocketController = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    socket.on("registerAmbulance", (ambulanceId) => {
      socket.join(ambulanceId);
      console.log(`🚑 Ambulance ${ambulanceId} joined WebSocket`);
    });

    socket.on("emergencyTriggered", async ({ userId, location }) => {
      const nearby = await Ambulance.find({
        status: "available",
        isApproved: true,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [location.lng, location.lat] },
            $maxDistance: 5000,
          },
        },
      });

      nearby.forEach((amb) => {
        io.to(amb._id.toString()).emit("emergencyRequest", { userId, userLocation: location });
      });
    });

    socket.on("acceptEmergency", async ({ ambulanceId, userId }) => {
      const ambulance = await Ambulance.findById(ambulanceId);
      if (!ambulance) return;

      ambulance.status = "onDuty";
      ambulance.assignedUser = userId;
      await ambulance.save();

      io.to(userId).emit("ambulanceAssigned", {
        ambulanceId,
        driverName: ambulance.driverName,
        phone: ambulance.phone,
      });

      socket.join(userId);
    });

    socket.on("updateLocation", ({ id, coordinates, type }) => {
      if (type === "ambulance") io.to(id).emit("locationUpdate", { type, coordinates });
      if (type === "user") io.to(id).emit("locationUpdate", { type, coordinates });
    });

    socket.on("disconnect", () => console.log("🔴 Client disconnected:", socket.id));
  });
};

module.exports = ambulanceSocketController;
