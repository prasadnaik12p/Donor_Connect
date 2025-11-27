const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ambulanceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: false,
  },
  driverName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  status: {
    type: String,
    enum: ["available", "onDuty", "offline"],
    default: "offline",
  },
  assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: {
      type: [Number],
      default: [0, 0],
      index: "2dsphere",
    }, // [lng, lat]
  },
  isApproved: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },
  emergencyCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
ambulanceSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
ambulanceSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update lastActive on save
ambulanceSchema.pre("save", function (next) {
  this.lastActive = new Date();
  next();
});

// Geospatial index
ambulanceSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Ambulance", ambulanceSchema);