const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const {
  authMiddleware,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "visitors-hub-secret-key";

// =====================================================
// CONSTANTS
// =====================================================

const PHONE_PATTERN = /^\d{10}$/;

const VALID_ROLES = [
  "resident",
  "guard",
  "admin",
];

// =====================================================
// 7 FLOORS × 8 FLATS = 56 FLATS
// =====================================================

const createFlatList = () => {
  const flats = [];

  for (let floor = 1; floor <= 7; floor++) {
    for (let room = 1; room <= 8; room++) {
      flats.push(`${floor}${String(room).padStart(2, "0")}`);
    }
  }

  return flats;
};

const ALL_FLATS = createFlatList();

// =====================================================
// PRE-LISTED RESIDENTS
// =====================================================
//
// IMPORTANT:
// Replace the empty names with your actual resident names.
//
// Example:
//
// {
//   name: "Vidhi Patel",
//   flat: "101"
// }
//
// Do NOT change the flat numbers.
//

const PRELISTED_RESIDENTS = [
  // FLOOR 1
  { name: "", flat: "101" },
  { name: "", flat: "102" },
  { name: "", flat: "103" },
  { name: "", flat: "104" },
  { name: "", flat: "105" },
  { name: "", flat: "106" },
  { name: "", flat: "107" },
  { name: "", flat: "108" },

  // FLOOR 2
  { name: "", flat: "201" },
  { name: "", flat: "202" },
  { name: "", flat: "203" },
  { name: "", flat: "204" },
  { name: "", flat: "205" },
  { name: "", flat: "206" },
  { name: "", flat: "207" },
  { name: "", flat: "208" },

  // FLOOR 3
  { name: "", flat: "301" },
  { name: "", flat: "302" },
  { name: "", flat: "303" },
  { name: "", flat: "304" },
  { name: "", flat: "305" },
  { name: "", flat: "306" },
  { name: "", flat: "307" },
  { name: "", flat: "308" },

  // FLOOR 4
  { name: "", flat: "401" },
  { name: "", flat: "402" },
  { name: "", flat: "403" },
  { name: "", flat: "404" },
  { name: "", flat: "405" },
  { name: "", flat: "406" },
  { name: "", flat: "407" },
  { name: "", flat: "408" },

  // FLOOR 5
  { name: "", flat: "501" },
  { name: "", flat: "502" },
  { name: "", flat: "503" },
  { name: "", flat: "504" },
  { name: "", flat: "505" },
  { name: "", flat: "506" },
  { name: "", flat: "507" },
  { name: "", flat: "508" },

  // FLOOR 6
  { name: "", flat: "601" },
  { name: "", flat: "602" },
  { name: "", flat: "603" },
  { name: "", flat: "604" },
  { name: "", flat: "605" },
  { name: "", flat: "606" },
  { name: "", flat: "607" },
  { name: "", flat: "608" },

  // FLOOR 7
  { name: "", flat: "701" },
  { name: "", flat: "702" },
  { name: "", flat: "703" },
  { name: "", flat: "704" },
  { name: "", flat: "705" },
  { name: "", flat: "706" },
  { name: "", flat: "707" },
  { name: "", flat: "708" },
];

// =====================================================
// DATABASE CHECK
// =====================================================

const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1;
};

// =====================================================
// CREATE JWT
// =====================================================

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email || null,
      flat: user.flat || null,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// =====================================================
// SAFE USER RESPONSE
// =====================================================

const safeUser = (user) => {
  return {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email || null,
    phone: user.phone || null,
    role: user.role,
    flat: user.flat || null,
    isActive: user.isActive,
    isApproved: user.isApproved,
    residentRegistered:
      user.residentRegistered || false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// =====================================================
// GET PRE-LISTED RESIDENTS
// GET /api/users/resident-list
//
// Public route for Resident Signup page.
// Only residents with a name are shown.
// =====================================================

router.get("/resident-list", async (req, res) => {
  try {
    const residents = PRELISTED_RESIDENTS
      .filter((resident) => resident.name.trim() !== "")
      .map((resident) => ({
        name: resident.name,
        flat: resident.flat,
      }));

    return res.json({
      success: true,
      count: residents.length,
      totalFlats: ALL_FLATS.length,
      data: residents,
    });
  } catch (error) {
    console.error(
      "Resident list error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load resident list.",
    });
  }
});

// =====================================================
// GET ALL FLATS
// GET /api/users/flats
//
// Useful for Admin.
// =====================================================

router.get("/flats", async (req, res) => {
  return res.json({
    success: true,
    totalFlats: ALL_FLATS.length,
    floors: 7,
    flatsPerFloor: 8,
    data: ALL_FLATS,
  });
});

// =====================================================
// RESIDENT REGISTRATION
// POST /api/users/register
//
// New flow:
//
// 1. Resident selects pre-listed name.
// 2. Backend finds assigned flat.
// 3. Resident creates password.
// 4. Account is created.
//
// Email and phone are NOT required here.
// =====================================================

router.post("/register", async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        message:
          "Database is not connected. Resident registration is currently unavailable.",
      });
    }

    const {
      name,
      password,
      confirmPassword,
    } = req.body;

    const cleanName =
      typeof name === "string"
        ? name.trim()
        : "";

    const cleanPassword =
      typeof password === "string"
        ? password
        : "";

    const cleanConfirmPassword =
      typeof confirmPassword === "string"
        ? confirmPassword
        : "";

    // =================================================
    // REQUIRED FIELDS
    // =================================================

    if (!cleanName || !cleanPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Resident name and password are required.",
      });
    }

    // =================================================
    // PASSWORD
    // =================================================

    if (cleanPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters.",
      });
    }

    if (
      cleanConfirmPassword &&
      cleanPassword !== cleanConfirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Passwords do not match.",
      });
    }

    // =================================================
    // FIND PRE-LISTED RESIDENT
    // =================================================

    const resident = PRELISTED_RESIDENTS.find(
      (item) =>
        item.name.trim().toLowerCase() ===
        cleanName.toLowerCase()
    );

    if (!resident) {
      return res.status(404).json({
        success: false,
        message:
          "This resident name is not present in the pre-listed resident directory.",
      });
    }

    // =================================================
    // CHECK ASSIGNED FLAT
    // =================================================

    if (!ALL_FLATS.includes(resident.flat)) {
      return res.status(400).json({
        success: false,
        message:
          "The assigned flat is not valid.",
      });
    }

    // =================================================
    // CHECK EXISTING ACCOUNT BY NAME + FLAT
    // =================================================

    const existingResident =
      await User.findOne({
        name: {
          $regex: `^${cleanName.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}$`,
          $options: "i",
        },
        flat: resident.flat,
        role: "resident",
      });

    if (existingResident) {
      return res.status(409).json({
        success: false,
        message:
          "This resident already has an account. Please login.",
      });
    }

    // =================================================
    // CHECK FLAT
    // =================================================

    const existingFlat =
      await User.findOne({
        flat: resident.flat,
        role: "resident",
        isActive: true,
      });

    if (existingFlat) {
      return res.status(409).json({
        success: false,
        message:
          "This flat is already registered.",
      });
    }

    // =================================================
    // HASH PASSWORD
    // =================================================

    const hashedPassword =
      await bcrypt.hash(
        cleanPassword,
        10
      );

    // =================================================
    // CREATE RESIDENT
    // =================================================

    const user =
      await User.create({
        name: resident.name,
        email: undefined,
        phone: undefined,
        password: hashedPassword,
        role: "resident",
        flat: resident.flat,
        isActive: true,
        isApproved: true,
        residentRegistered: true,
        registeredAt: new Date(),
      });

    // =================================================
    // CREATE TOKEN
    // =================================================

    const token =
      createToken(user);

    return res.status(201).json({
      success: true,
      message:
        "Resident account created successfully.",
      token,
      user: safeUser(user),
    });

  } catch (error) {
    console.error(
      "Resident registration error:",
      error
    );

    // Duplicate MongoDB key
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This resident or flat is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create resident account.",
    });
  }
});

// =====================================================
// ADMIN CREATE USER
// POST /api/users/admin-create
//
// Keeps existing Admin functionality.
// =====================================================

router.post(
  "/admin-create",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      if (!isDatabaseConnected()) {
        return res.status(503).json({
          success: false,
          message:
            "Database is not connected.",
        });
      }

      const {
        name,
        email,
        phone,
        password,
        role,
        flat,
      } = req.body;

      const cleanName =
        typeof name === "string"
          ? name.trim()
          : "";

      const cleanEmail =
        typeof email === "string"
          ? email.trim().toLowerCase()
          : "";

      const cleanPhone =
        typeof phone === "string"
          ? phone.trim()
          : "";

      const cleanPassword =
        typeof password === "string"
          ? password
          : "";

      const cleanRole =
        typeof role === "string"
          ? role.trim().toLowerCase()
          : "";

      const cleanFlat =
        typeof flat === "string"
          ? flat.trim()
          : null;

      // =================================================
      // REQUIRED
      // =================================================

      if (
        !cleanName ||
        !cleanEmail ||
        !cleanPhone ||
        !cleanPassword ||
        !cleanRole
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name, email, phone, password and role are required.",
        });
      }

      // =================================================
      // ROLE
      // =================================================

      if (!VALID_ROLES.includes(cleanRole)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user role.",
        });
      }

      // =================================================
      // EMAIL
      // =================================================

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid email address.",
        });
      }

      // =================================================
      // PHONE
      // =================================================

      if (!PHONE_PATTERN.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message:
            "Phone number must contain exactly 10 digits.",
        });
      }

      // =================================================
      // PASSWORD
      // =================================================

      if (cleanPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 6 characters.",
        });
      }

      // =================================================
      // RESIDENT FLAT
      // =================================================

      let userFlat = null;

      if (cleanRole === "resident") {
        if (!cleanFlat) {
          return res.status(400).json({
            success: false,
            message:
              "Flat number is required for residents.",
          });
        }

        if (!ALL_FLATS.includes(cleanFlat)) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid flat number.",
          });
        }

        userFlat = cleanFlat;

        const existingFlat =
          await User.findOne({
            flat: cleanFlat,
            role: "resident",
            isActive: true,
          });

        if (existingFlat) {
          return res.status(409).json({
            success: false,
            message:
              "This flat already has an active resident account.",
          });
        }
      }

      // =================================================
      // DUPLICATE EMAIL
      // =================================================

      const existingEmail =
        await User.findOne({
          email: cleanEmail,
        });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists.",
        });
      }

      // =================================================
      // DUPLICATE PHONE
      // =================================================

      const existingPhone =
        await User.findOne({
          phone: cleanPhone,
        });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this phone number already exists.",
        });
      }

      // =================================================
      // HASH
      // =================================================

      const hashedPassword =
        await bcrypt.hash(
          cleanPassword,
          10
        );

      // =================================================
      // CREATE
      // =================================================

      const user =
        await User.create({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          password: hashedPassword,
          role: cleanRole,
          flat: userFlat,
          isActive: true,
          isApproved: true,
          residentRegistered:
            cleanRole === "resident",
          registeredAt:
            cleanRole === "resident"
              ? new Date()
              : null,
        });

      return res.status(201).json({
        success: true,
        message:
          `${cleanRole} account created successfully.`,
        data: safeUser(user),
      });

    } catch (error) {
      console.error(
        "Admin create user error:",
        error
      );

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "An account with these details already exists.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to create user.",
      });
    }
  }
);

// =====================================================
// LOGIN
// POST /api/users/login
//
// Supports:
//
// Resident:
// name + password
//
// Admin / Guard:
// email + password
//
// For backward compatibility, email login
// also remains supported.
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      name,
      password,
      role,
    } = req.body;

    const cleanEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    const cleanName =
      typeof name === "string"
        ? name.trim()
        : "";

    const cleanPassword =
      typeof password === "string"
        ? password
        : "";

    const cleanRole =
      typeof role === "string"
        ? role.trim().toLowerCase()
        : "";

    if (!cleanPassword || !cleanRole) {
      return res.status(400).json({
        success: false,
        message:
          "Password and role are required.",
      });
    }

    if (!VALID_ROLES.includes(cleanRole)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid login role.",
      });
    }

    // =================================================
    // DEMO LOGIN
    // =================================================

    if (!isDatabaseConnected()) {
      if (
        cleanPassword === "123456" &&
        (
          cleanEmail === "test@gmail.com" ||
          cleanName.toLowerCase() ===
            "demo resident" ||
          cleanName.toLowerCase() ===
            "demo guard" ||
          cleanName.toLowerCase() ===
            "demo admin"
        )
      ) {
        const demoUser = {
          _id:
            `demo-${cleanRole}-001`,

          id:
            `demo-${cleanRole}-001`,

          name:
            cleanRole === "resident"
              ? "Demo Resident"
              : cleanRole === "guard"
              ? "Demo Guard"
              : "Demo Admin",

          email:
            "test@gmail.com",

          phone:
            "9876543210",

          role:
            cleanRole,

          flat:
            cleanRole === "resident"
              ? "101"
              : null,

          isActive: true,

          isApproved: true,
        };

        return res.json({
          success: true,
          message:
            "Demo login successful.",
          token:
            `demo-${cleanRole}-token`,
          user: demoUser,
        });
      }

      return res.status(503).json({
        success: false,
        message:
          "Database is not connected.",
      });
    }

    // =================================================
    // FIND USER
    // =================================================

    let user = null;

    // Resident can login using name
    if (
      cleanRole === "resident" &&
      cleanName
    ) {
      user =
        await User.findOne({
          name: {
            $regex: `^${cleanName.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            )}$`,
            $options: "i",
          },
          role: "resident",
        });
    }

    // Admin / Guard / backward-compatible login
    if (!user && cleanEmail) {
      user =
        await User.findOne({
          email: cleanEmail,
        });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid name/email or password.",
      });
    }

    // =================================================
    // ROLE
    // =================================================

    if (user.role !== cleanRole) {
      return res.status(403).json({
        success: false,
        message:
          `This account is registered as ${user.role}.`,
      });
    }

    // =================================================
    // ACTIVE
    // =================================================

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is currently inactive.",
      });
    }

    // =================================================
    // APPROVED
    // =================================================

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has not been approved yet.",
      });
    }

    // =================================================
    // PASSWORD
    // =================================================

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message:
          "This account does not have a password yet.",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        cleanPassword,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid name/email or password.",
      });
    }

    // =================================================
    // TOKEN
    // =================================================

    const token =
      createToken(user);

    return res.json({
      success: true,
      message:
        "Login successful.",
      token,
      user: safeUser(user),
    });

  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Login failed.",
    });
  }
});

// =====================================================
// GET CURRENT USER
// GET /api/users/me
// =====================================================

router.get(
  "/me",
  authMiddleware,
  async (req, res) => {
    try {
      if (!isDatabaseConnected()) {
        return res.json({
          success: true,
          user: req.user,
        });
      }

      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      return res.json({
        success: true,
        user: safeUser(user),
      });

    } catch (error) {
      console.error(
        "Get current user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch current user.",
      });
    }
  }
);

// =====================================================
// GET ALL USERS
// GET /api/users
// ADMIN ONLY
// =====================================================

router.get(
  "/",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      if (!isDatabaseConnected()) {
        return res.json({
          success: true,
          count: 0,
          data: [],
        });
      }

      const filter = {};

      if (
        req.query.role &&
        VALID_ROLES.includes(
          req.query.role
        )
      ) {
        filter.role =
          req.query.role;
      }

      if (
        req.query.active === "true"
      ) {
        filter.isActive = true;
      }

      if (
        req.query.active === "false"
      ) {
        filter.isActive = false;
      }

      const users =
        await User.find(filter)
          .select("-password")
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json({
        success: true,
        count: users.length,
        data: users,
      });

    } catch (error) {
      console.error(
        "Get users error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch users.",
      });
    }
  }
);

// =====================================================
// GET USER BY ID
// GET /api/users/:id
// ADMIN ONLY
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      if (!isDatabaseConnected()) {
        return res.status(503).json({
          success: false,
          message:
            "Database is not connected.",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user ID.",
        });
      }

      const user =
        await User.findById(
          req.params.id
        )
          .select("-password")
          .lean();

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      return res.json({
        success: true,
        data: user,
      });

    } catch (error) {
      console.error(
        "Get user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch user.",
      });
    }
  }
);

// =====================================================
// UPDATE USER STATUS
// PUT /api/users/:id/status
// ADMIN ONLY
// =====================================================

router.put(
  "/:id/status",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      if (!isDatabaseConnected()) {
        return res.status(503).json({
          success: false,
          message:
            "Database is not connected.",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user ID.",
        });
      }

      const update = {};

      if (
        typeof req.body.isActive ===
        "boolean"
      ) {
        update.isActive =
          req.body.isActive;
      }

      if (
        typeof req.body.isApproved ===
        "boolean"
      ) {
        update.isApproved =
          req.body.isApproved;
      }

      if (
        Object.keys(update).length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Provide isActive or isApproved.",
        });
      }

      const user =
        await User.findByIdAndUpdate(
          req.params.id,
          {
            $set: update,
          },
          {
            new: true,
            runValidators: true,
          }
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "User status updated successfully.",
        data: user,
      });

    } catch (error) {
      console.error(
        "Update user status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update user status.",
      });
    }
  }
);

// =====================================================
// DELETE USER
// DELETE /api/users/:id
// ADMIN ONLY
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      if (!isDatabaseConnected()) {
        return res.status(503).json({
          success: false,
          message:
            "Database is not connected.",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user ID.",
        });
      }

      if (
        req.params.id.toString() ===
        req.user.id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot delete your own admin account.",
        });
      }

      const user =
        await User.findByIdAndDelete(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "User deleted successfully.",
      });

    } catch (error) {
      console.error(
        "Delete user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete user.",
      });
    }
  }
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;