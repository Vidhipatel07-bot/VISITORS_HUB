const express = require("express");
const mongoose = require("mongoose");

const Visitor = require("../models/Visitor");
const User = require("../models/User");
const TrustedVisitor = require("../models/TrustedVisitor");

const jwt = require("jsonwebtoken");

// =====================================================
// LOCAL AUTH MIDDLEWARE
// =====================================================

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7).trim()
      : "";

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // =================================================
    // DEMO TOKENS
    // =================================================

    if (token === "demo-token-admin") {
      req.user = {
        id: "demo-admin",
        _id: "demo-admin",
        role: "admin",
      };

      return next();
    }

    if (token === "demo-token-guard") {
      req.user = {
        id: "demo-guard",
        _id: "demo-guard",
        role: "guard",
      };

      return next();
    }

    if (token === "demo-token-resident") {
      req.user = {
        id: "demo-resident",
        _id: "demo-resident",
        role: "resident",
      };

      return next();
    }

    // =================================================
    // NORMAL JWT
    // =================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "visitors-hub-secret-key"
    );

    req.user = decoded;

    next();
  } catch (error) {
    console.error(
      "Visitor authentication error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

// =====================================================
// ROLE AUTHORIZATION
// =====================================================

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    next();
  };
};

// =====================================================
// ROUTER
// =====================================================

const router = express.Router();

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getUserId = (user) => {
  return user?._id || user?.id;
};

const getTodayName = () => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });
};

const getCurrentTime = () => {
  const now = new Date();

  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
};

const isTimeAllowed = (current, start, end) => {
  if (!start || !end) {
    return false;
  }

  if (start <= end) {
    return current >= start && current <= end;
  }

  // Overnight timing e.g. 22:00 - 06:00
  return current >= start || current <= end;
};

const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1;
};

// =====================================================
// CREATE VISITOR
// PUBLIC - Visitor QR Registration
// =====================================================

router.post("/", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request data is required.",
      });
    }

    const {
      name,
      mobile,
      phone,
      flat,
      purpose,
      photo,
      vehicle,
      source = "qr",
      notes,
    } = req.body;

    const cleanName =
      typeof name === "string"
        ? name.trim()
        : "";

    const visitorPhone =
      typeof (mobile || phone) === "string"
        ? String(mobile || phone).trim()
        : "";

    const cleanFlat =
      typeof flat === "string"
        ? flat.trim().toUpperCase()
        : "";

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Valid visitor name is required.",
      });
    }

    if (!/^\d{10}$/.test(visitorPhone)) {
      return res.status(400).json({
        success: false,
        message:
          "Valid 10-digit mobile number is required.",
      });
    }

    if (!/^[A-Z]-\d{3}$/.test(cleanFlat)) {
      return res.status(400).json({
        success: false,
        message: "Valid flat number is required.",
      });
    }

    const validPurposes = [
      "Personal Visit",
      "Delivery",
      "Service / Repair",
      "Work / Business",
      "Driver",
      "Household Staff",
      "Other",
    ];

    if (
      !purpose ||
      !validPurposes.includes(purpose)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid purpose of visit is required.",
      });
    }

    // -----------------------------
    // DATABASE CHECK
    // -----------------------------

    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database is not connected.",
      });
    }

    // -----------------------------
    // FIND RESIDENT
    // -----------------------------

    const resident = await User.findOne({
      role: "resident",
      flat: cleanFlat,
      isActive: true,
    });

    if (!resident) {
      return res.status(404).json({
        success: false,
        message:
          "No active resident found for this flat.",
      });
    }

    // =================================================
    // TRUSTED VISITOR CHECK
    // =================================================

    const today = getTodayName();
    const currentTime = getCurrentTime();

    const trustedVisitor =
      await TrustedVisitor.findOne({
        phone: visitorPhone,
        flat: cleanFlat,
        isActive: true,
      });

    let visitorStatus = "pending";
    let trustedVisitorId = null;

    if (trustedVisitor) {
      const allowedDay =
        Array.isArray(
          trustedVisitor.allowedDays
        ) &&
        trustedVisitor.allowedDays.includes(
          today
        );

      const allowedTime = isTimeAllowed(
        currentTime,
        trustedVisitor.startTime,
        trustedVisitor.endTime
      );

      if (allowedDay && allowedTime) {
        visitorStatus = "trusted-approved";
        trustedVisitorId =
          trustedVisitor._id;
      }
    }

    // =================================================
    // EXPIRY TIME
    // =================================================

    const expiresAt = new Date(
      Date.now() + 2 * 60 * 1000
    );

    // =================================================
    // CREATE VISITOR
    // =================================================

    const visitor = await Visitor.create({
      name: cleanName,

      mobile: visitorPhone,

      phone: visitorPhone,

      flat: cleanFlat,

      purpose,

      photo: photo || "",

      vehicle: vehicle || "",

      source,

      status: visitorStatus,

      residentId: resident._id,

      trustedVisitorId,

      expiryTime: expiresAt,

      notes: notes || "",

      approvalTime: null,

      rejectionTime: null,

      entryTime: null,

      exitTime: null,

      guardVerified: false,
    });

    return res.status(201).json({
      success: true,

      message:
        visitorStatus === "trusted-approved"
          ? "Trusted visitor automatically approved."
          : "Visitor registration submitted successfully.",

      data: visitor,

      visitor,
    });
  } catch (error) {
    console.error(
      "Create visitor error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to register visitor.",
      error: error.message,
    });
  }
});

// =====================================================
// GET ALL VISITORS
// RESIDENT / GUARD / ADMIN
// =====================================================

router.get(
  "/",
  authenticateToken,
  authorizeRoles(
    "resident",
    "guard",
    "admin"
  ),
  async (req, res) => {
    try {
      if (!isDatabaseConnected()) {
        return res.status(503).json({
          success: false,
          message:
            "Database is not connected.",
          visitors: [],
        });
      }

      const filter = {};

      const userId = getUserId(req.user);

      if (req.user.role === "resident") {
        filter.residentId = userId;
      }

      const visitors =
        await Visitor.find(filter)
          .sort({ createdAt: -1 })
          .populate(
            "residentId",
            "name email phone flat"
          )
          .populate(
            "trustedVisitorId",
            "name phone relation"
          );

      return res.json({
        success: true,
        count: visitors.length,
        visitors,
        data: visitors,
      });
    } catch (error) {
      console.error(
        "Get visitors error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch visitors.",
        error: error.message,
      });
    }
  }
);

// =====================================================
// GET SINGLE VISITOR
// RESIDENT / GUARD / ADMIN
// =====================================================

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "resident",
    "guard",
    "admin"
  ),
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
            "Invalid visitor ID.",
        });
      }

      const visitor =
        await Visitor.findById(
          req.params.id
        )
          .populate(
            "residentId",
            "name email phone flat"
          )
          .populate(
            "trustedVisitorId",
            "name phone relation"
          );

      if (!visitor) {
        return res.status(404).json({
          success: false,
          message:
            "Visitor not found.",
        });
      }

      const userId = getUserId(req.user);

      if (
        req.user.role === "resident" &&
        String(
          visitor.residentId?._id ||
          visitor.residentId
        ) !== String(userId)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only access visitors for your flat.",
        });
      }

      return res.json({
        success: true,
        visitor,
        data: visitor,
      });
    } catch (error) {
      console.error(
        "Get visitor error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch visitor.",
        error: error.message,
      });
    }
  }
);

// =====================================================
// UPDATE VISITOR STATUS
// RESIDENT / GUARD / ADMIN
// =====================================================

router.put(
  "/:id/status",
  authenticateToken,
  authorizeRoles(
    "resident",
    "guard",
    "admin"
  ),
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
            "Invalid visitor ID.",
        });
      }

      const { status } = req.body;

      const allowedStatuses = [
        "pending",
        "approved",
        "rejected",
        "expired",
        "trusted-approved",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid visitor status.",
        });
      }

      const visitor =
        await Visitor.findById(
          req.params.id
        );

      if (!visitor) {
        return res.status(404).json({
          success: false,
          message:
            "Visitor not found.",
        });
      }

      const userId = getUserId(req.user);

      // -----------------------------
      // RESIDENT OWN FLAT CHECK
      // -----------------------------

      if (
        req.user.role === "resident" &&
        String(visitor.residentId) !==
          String(userId)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only manage visitors for your flat.",
        });
      }

      // -----------------------------
      // RESIDENT STATUS RULES
      // -----------------------------

      if (
        req.user.role === "resident" &&
        ![
          "approved",
          "rejected",
          "expired",
        ].includes(status)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Resident can only approve, reject or expire a visitor.",
        });
      }

      // -----------------------------
      // GUARD STATUS RULES
      // -----------------------------

      if (
        req.user.role === "guard" &&
        ![
          "approved",
          "rejected",
          "trusted-approved",
          "expired",
        ].includes(status)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Invalid guard visitor status update.",
        });
      }

      visitor.status = status;

      if (status === "approved") {
        visitor.approvalTime =
          new Date();

        visitor.rejectionTime = null;
      }

      if (status === "rejected") {
        visitor.rejectionTime =
          new Date();
      }

      if (status === "expired") {
        visitor.expiryTime =
          new Date();
      }

      visitor.updatedBy = userId;

      await visitor.save();

      return res.json({
        success: true,
        message:
          "Visitor status updated successfully.",
        visitor,
        data: visitor,
      });
    } catch (error) {
      console.error(
        "Update visitor status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update visitor status.",
        error: error.message,
      });
    }
  }
);

// =====================================================
// MARK ENTRY
// GUARD / ADMIN
// =====================================================

router.put(
  "/:id/entry",
  authenticateToken,
  authorizeRoles(
    "guard",
    "admin"
  ),
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
            "Invalid visitor ID.",
        });
      }

      const visitor =
        await Visitor.findById(
          req.params.id
        );

      if (!visitor) {
        return res.status(404).json({
          success: false,
          message:
            "Visitor not found.",
        });
      }

      if (
        ![
          "approved",
          "trusted-approved",
        ].includes(visitor.status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Visitor must be approved before entry.",
        });
      }

      const now = new Date();
      const userId = getUserId(req.user);

      visitor.status = "inside";

      visitor.entryTime = now;

      visitor.entryDate = now;

      visitor.guardVerified = true;

      visitor.verifiedByGuard = userId;

      visitor.guardVerifiedAt = now;

      visitor.guardId = userId;

      visitor.updatedBy = userId;

      await visitor.save();

      return res.json({
        success: true,
        message:
          "Visitor entry recorded.",
        visitor,
        data: visitor,
      });
    } catch (error) {
      console.error(
        "Visitor entry error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to record visitor entry.",
        error: error.message,
      });
    }
  }
);

// =====================================================
// MARK EXIT
// GUARD / ADMIN
// =====================================================

router.put(
  "/:id/exit",
  authenticateToken,
  authorizeRoles(
    "guard",
    "admin"
  ),
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
            "Invalid visitor ID.",
        });
      }

      const visitor =
        await Visitor.findById(
          req.params.id
        );

      if (!visitor) {
        return res.status(404).json({
          success: false,
          message:
            "Visitor not found.",
        });
      }

      if (
        visitor.status !== "inside"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only visitors currently inside can be marked exited.",
        });
      }

      const now = new Date();
      const userId = getUserId(req.user);

      visitor.status = "exited";

      visitor.exitTime = now;

      visitor.exitDate = now;

      visitor.updatedBy = userId;

      await visitor.save();

      return res.json({
        success: true,
        message:
          "Visitor exit recorded.",
        visitor,
        data: visitor,
      });
    } catch (error) {
      console.error(
        "Visitor exit error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to record visitor exit.",
        error: error.message,
      });
    }
  }
);

// =====================================================
// DELETE VISITOR
// ADMIN ONLY
// =====================================================

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
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
            "Invalid visitor ID.",
        });
      }

      const visitor =
        await Visitor.findByIdAndDelete(
          req.params.id
        );

      if (!visitor) {
        return res.status(404).json({
          success: false,
          message:
            "Visitor not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Visitor deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete visitor error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete visitor.",
        error: error.message,
      });
    }
  }
);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;