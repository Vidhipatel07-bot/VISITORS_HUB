const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // =====================================================
    // BASIC INFORMATION
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    // =====================================================
    // LOGIN INFORMATION
    // Admin / Guard ke liye email and phone use ho sakte hain.
    // Resident ke liye ye optional hain.
    // =====================================================

    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      unique: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address.",
      ],
    },

    phone: {
      type: String,
      trim: true,
      match: [
        /^\d{10}$/,
        "Phone number must contain 10 digits.",
      ],
    },

    password: {
      type: String,
      minlength: 6,
    },

    // =====================================================
    // ROLE
    // =====================================================

    role: {
      type: String,
      enum: [
        "resident",
        "guard",
        "admin",
      ],
      default: "resident",
      required: true,
    },

    // =====================================================
    // ASSIGNED FLAT
    // =====================================================

    flat: {
      type: String,
      trim: true,
      default: null,
    },

    // =====================================================
    // ACCOUNT STATUS
    // =====================================================

    isActive: {
      type: Boolean,
      default: true,
    },

    isApproved: {
      type: Boolean,
      default: true,
    },

    // =====================================================
    // RESIDENT REGISTRATION
    // =====================================================

    residentRegistered: {
      type: Boolean,
      default: false,
    },

    registeredAt: {
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

// Email unique only when an email exists.
userSchema.index(
  { email: 1 },
  {
    unique: true,
    sparse: true,
  }
);

// One active resident account per flat.
userSchema.index(
  { flat: 1, role: 1 },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);