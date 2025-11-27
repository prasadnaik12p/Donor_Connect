const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  bloodType: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
  },
  units: {
    type: Number,
    required: true,
    min: 1,
    max: 2,
  },
  status: {
    type: String,
    enum: ["pending", "matched", "completed", "cancelled"],
    default: "pending",
  },
  urgency: {
    type: String,
    enum: ["low", "medium", "critical", "high"],
    default: "medium",
  },
  location: {
    address: String,
    city: String,
    hospital: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  scheduledDate: Date,
  completedDate: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for better query performance
bloodRequestSchema.index({ status: 1, createdAt: -1 });
bloodRequestSchema.index({ recipient: 1 });
bloodRequestSchema.index({ donor: 1 });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);