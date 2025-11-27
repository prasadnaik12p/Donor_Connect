const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  phone: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastDonation: Date,
  totalDonations: {
    type: Number,
    default: 0,
  },
  createdAt: { type: Date, default: Date.now },
  lastLocationUpdate: { type: Date, default: Date.now },
});

donorSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Donor", donorSchema);