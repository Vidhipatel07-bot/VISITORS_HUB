const mongoose = require("mongoose");

// =====================================================
// VALID OPTIONS
// =====================================================

const VALID_STATUSES = [
  "pending",
  "approved",
  "trusted-approved",
  "inside",
  "exited",
  "rejected",
  "expired",
];

const VALID_PURPOSES = [
  "Personal Visit",
  "Delivery",
  "Service / Repair",
  "Work / Business",
  "Driver",
  "Household Staff",
  "Other",
  "Pre-Registered Guest",
];

const VALID_SOURCES = [
  "gate-registration",
  "trusted-visitor",
  "guest-pass",
  "security-guard",
];

// =====================================================
// VISITOR SCHEMA
// =====================================================

const visitorSchema = new mongoose.Schema(
  {
    // =================================================
    // BASIC VISITOR DETAILS
    // =================================================

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^\d{10}$/,
        "Mobile number must contain 10 digits.",
      ],
    },

    // Kept for compatibility with APIs/frontends
    phone: {
      type: String,
      trim: true,
      default: null,
    },

    flat: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^[AB]-\d{3}$/,
        "Invalid flat number.",
      ],
    },

    purpose: {
      type: String,
      required: true,
      trim: true,
      enum: {
        values: VALID_PURPOSES,
        message: "Invalid visitor purpose.",
      },
    },

    // =================================================
    // PHOTO
    // =================================================

    photo: {
      type: String,
      default: null,
    },

    // =================================================
    // VEHICLE
    // =================================================

    vehicleNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
      maxlength: 20,
    },

    vehicleType: {
      type: String,
      trim: true,
      default: null,
      maxlength: 50,
    },

    // =================================================
    // VISITOR SOURCE
    // =================================================

    source: {
      type: String,
      enum: {
        values: VALID_SOURCES,
        message: "Invalid visitor source.",
      },
      default: "gate-registration",
    },

    // =================================================
    // STATUS
    // =================================================

    status: {
      type: String,
      enum: {
        values: VALID_STATUSES,
        message: "Invalid visitor status.",
      },
      default: "pending",
      index: true,
    },

    // =================================================
    // RESIDENT APPROVAL
    // =================================================

    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    expiredAt: {
      type: Date,
      default: null,
    },

    // =================================================
    // GUARD VERIFICATION
    // =================================================

    guardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    guardVerified: {
      type: Boolean,
      default: false,
    },

    verifiedByGuard: {
      type: Boolean,
      default: false,
    },

    guardVerifiedAt: {
      type: Date,
      default: null,
    },

    // =================================================
    // ENTRY DETAILS
    // =================================================

    entryTime: {
      type: Date,
      default: null,
    },

    entryDate: {
      type: Date,
      default: null,
    },

    // =================================================
    // EXIT DETAILS
    // =================================================

    exitTime: {
      type: Date,
      default: null,
    },

    exitDate: {
      type: Date,
      default: null,
    },

    // =================================================
    // GUEST PASS CONNECTION
    // =================================================

    guestPassId: {
      type: String,
      trim: true,
      default: null,
    },

    // =================================================
    // TRUSTED VISITOR CONNECTION
    // =================================================

    trustedVisitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrustedVisitor",
      default: null,
    },

    // =================================================
    // NOTES
    // =================================================

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    // =================================================
    // LAST UPDATE
    // =================================================

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

visitorSchema.index({
  flat: 1,
  status: 1,
});

visitorSchema.index({
  mobile: 1,
});

visitorSchema.index({
  createdAt: -1,
});

visitorSchema.index({
  entryTime: -1,
});

visitorSchema.index({
  exitTime: -1,
});

// =====================================================
// KEEP PHONE & MOBILE IN SYNC
// =====================================================

visitorSchema.pre("validate", function (next) {
  if (!this.mobile && this.phone) {
    this.mobile = this.phone;
  }

  if (!this.phone && this.mobile) {
    this.phone = this.mobile;
  }

  next();
});

// =====================================================
// EXPORT
// =====================================================

module.exports = mongoose.model(
  "Visitor",
  visitorSchema
);