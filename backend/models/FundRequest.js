const mongoose = require("mongoose");

const fundRequestSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientId: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    amountRequired: {
      type: Number,
      required: true,
      min: 1,
    },
    amountCollected: {
      type: Number,
      default: 0,
    },
    contactInfo: {
      phone: String,
      email: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed"],
      default: "Pending",
    },
    // Payment and verification
    donations: [
      {
        donorName: String,
        donorEmail: String,
        amount: Number,
        paymentId: String,
        paymentMethod: { type: String, enum: ["UPI", "Card", "NetBanking", "Wallet"], default: "UPI" },
        transactionId: String,
        donatedAt: { type: Date, default: Date.now },
      },
    ],
    verifiedDocuments: [
      {
        documentType: { type: String, enum: ["Medical Bill", "Hospital Certificate", "Identity Proof", "Other"] },
        documentUrl: String,
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        verifiedAt: Date,
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("FundRequest", fundRequestSchema);
