const mongoose = require("mongoose");

const hospitalBedSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    // General beds
    generalBeds: {
      total: { type: Number, default: 0 },
      occupied: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
    },
    // ICU beds
    icuBeds: {
      total: { type: Number, default: 0 },
      occupied: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
    },
    // Ventilator beds
    ventilatorBeds: {
      total: { type: Number, default: 0 },
      occupied: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
    },
    // Pediatric ICU beds
    pediatricIcuBeds: {
      total: { type: Number, default: 0 },
      occupied: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
    },
    // Reserved beds (temporary holds)
    reservedBeds: [
      {
        bedType: { type: String, enum: ["general", "icu", "ventilator", "pediatricICU"] },
        reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reservedUntil: { type: Date },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Legacy fields for backward compatibility
    totalBeds: {
      type: Number,
      default: function () {
        return (
          this.generalBeds.total +
          this.icuBeds.total +
          this.ventilatorBeds.total +
          this.pediatricIcuBeds.total
        );
      },
    },
    occupiedBeds: {
      type: Number,
      default: function () {
        return (
          this.generalBeds.occupied +
          this.icuBeds.occupied +
          this.ventilatorBeds.occupied +
          this.pediatricIcuBeds.occupied
        );
      },
    },
    availableBeds: {
      type: Number,
      default: function () {
        return (
          this.generalBeds.available +
          this.icuBeds.available +
          this.ventilatorBeds.available +
          this.pediatricIcuBeds.available
        );
      },
    },
  },
  { timestamps: true }
);

// Calculate available beds before saving
hospitalBedSchema.pre("save", function (next) {
  this.generalBeds.available = this.generalBeds.total - this.generalBeds.occupied;
  this.icuBeds.available = this.icuBeds.total - this.icuBeds.occupied;
  this.ventilatorBeds.available = this.ventilatorBeds.total - this.ventilatorBeds.occupied;
  this.pediatricIcuBeds.available = this.pediatricIcuBeds.total - this.pediatricIcuBeds.occupied;
  next();
});

module.exports = mongoose.model("HospitalBed", hospitalBedSchema);
