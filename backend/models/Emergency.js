const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  emergencyType: {
    type: String,
    default: "Medical Emergency"
  },
  notes: String,
  status: {
    type: String,
    enum: ["pending", "assigned", "completed", "cancelled"],
    default: "pending"
  },
  assignedAmbulance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ambulance"
  },
  acceptedAt: Date,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Auto delete after 24 hours
  }
});

// Geospatial index
emergencySchema.index({ coordinates: "2dsphere" });
emergencySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model("Emergency", emergencySchema);