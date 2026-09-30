const mongoose = require("mongoose");

// =====================================================
// VALID OPTIONS
// =====================================================

const VALID_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "held",
  "completed",
];

const VALID_TYPES = [
  "Food Delivery",
  "E-commerce",
  "Grocery",
  "Courier",
  "Medicine",
  "Other",
];

// =====================================================
// DELIVERY SCHEMA
// =====================================================

const deliverySchema = new mongoose.Schema(
  {
    // =================================================
    // DELIVERY PERSON
    // =================================================

    personName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    // Compatibility with older frontend/backend fields
    deliveryPerson: {
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

    // =================================================
    // RESIDENT / FLAT
    // =================================================

    flat: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^[AB]-\d{3}$/,
        "Invalid flat number.",
      ],
      index: true,
    },

    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // =================================================
    // DELIVERY TYPE
    // =================================================

    deliveryType: {
      type: String,
      required: true,
      trim: true,
      enum: {
        values: VALID_TYPES,
        message: "Invalid delivery type.",
      },
    },

    // Compatibility field
    type: {
      type: String,
      trim: true,
      default: null,
    },

    // =================================================
    // COMPANY / TRACKING
    // =================================================

    company: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },

    trackingNumber: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },

    // =================================================
    // DESCRIPTION
    // =================================================

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    // =================================================
    // STATUS
    // =================================================

    status: {
      type: String,
      enum: {
        values: VALID_STATUSES,
        message: "Invalid delivery status.",
      },
      default: "pending",
      index: true,
    },

    // =================================================
    // SOURCE
    // =================================================

    source: {
      type: String,
      enum: [
        "security-guard",
        "guard",
        "admin",
        "resident",
        "other",
      ],
      default: "security-guard",
    },

    // =================================================
    // RESIDENT DECISION
    // =================================================

    decisionAt: {
      type: Date,
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    // =================================================
    // SECURITY DESK HOLD
    // =================================================

    heldAt: {
      type: Date,
      default: null,
    },

    holdReason: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },

    // =================================================
    // COMPLETION
    // =================================================

    completedAt: {
      type: Date,
      default: null,
    },

    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =================================================
    // CREATED BY
    // =================================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEXES
// =====================================================

deliverySchema.index({
  flat: 1,
  status: 1,
});

deliverySchema.index({
  createdAt: -1,
});

deliverySchema.index({
  residentId: 1,
  createdAt: -1,
});

// =====================================================
// KEEP DELIVERY PERSON FIELDS IN SYNC
// =====================================================

deliverySchema.pre("validate", function (next) {
  if (!this.personName && this.deliveryPerson) {
    this.personName = this.deliveryPerson;
  }

  if (!this.deliveryPerson && this.personName) {
    this.deliveryPerson = this.personName;
  }

  if (!this.deliveryType && this.type) {
    this.deliveryType = this.type;
  }

  if (!this.type && this.deliveryType) {
    this.type = this.deliveryType;
  }

  next();
});

// =====================================================
// EXPORT
// =====================================================

module.exports = mongoose.model(
  "Delivery",
  deliverySchema
);