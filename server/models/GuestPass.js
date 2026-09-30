const mongoose = require("mongoose");

// =====================================================
// GUEST PASS SCHEMA
// =====================================================

const guestPassSchema = new mongoose.Schema(
  {
    // Unique QR pass ID
    passId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    // Guest details
    guestName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    // Kept for compatibility with older records
    name: {
      type: String,
      trim: true,
      default: null,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^\d{10}$/,
        "Phone number must contain 10 digits.",
      ],
    },

    // Resident's flat
    flat: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^[AB]-\d{3}$/,
        "Invalid flat number.",
      ],
    },

    // Guest visit date
    date: {
      type: String,
      required: true,
      trim: true,
    },

    // Allowed entry time
    startTime: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Invalid start time.",
      ],
    },

    // Allowed exit time
    endTime: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Invalid end time.",
      ],
    },

    // Purpose of visit
    purpose: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    // Resident who created the pass
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Whether the pass is currently usable
    isActive: {
      type: Boolean,
      default: true,
    },

    // Set when security guard uses the pass
    usedAt: {
      type: Date,
      default: null,
    },

    // Optional guard who verified the pass
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    // Optional deactivation information
    deactivatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

guestPassSchema.index({
  flat: 1,
  date: 1,
});

guestPassSchema.index({
  residentId: 1,
  createdAt: -1,
});

// =====================================================
// EXPORT
// =====================================================

module.exports = mongoose.model(
  "GuestPass",
  guestPassSchema
);