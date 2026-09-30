const express = require("express");
const router = express.Router();

const TrustedVisitor = require("../models/TrustedVisitor");
const User = require("../models/User");

const {
  authMiddleware,
  residentOrAdmin,
} = require("../middleware/authMiddleware");


// =====================================================
// HELPERS
// =====================================================

const VALID_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const isDatabaseConnected = () => {
  return TrustedVisitor.db.readyState === 1;
};

const isValidFlat = (flat) => {
  return /^[AB]-\d{3}$/.test(String(flat || ""));
};

const isValidPhone = (phone) => {
  return /^\d{10}$/.test(String(phone || ""));
};

const isValidTime = (time) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(
    String(time || "")
  );
};

const timeToMinutes = (time) => {
  const [hours, minutes] = String(time).split(":").map(Number);
  return hours * 60 + minutes;
};


// =====================================================
// 1. GET TRUSTED VISITORS
// RESIDENT → OWN TRUSTED VISITORS
// ADMIN → ALL
// =====================================================

router.get(
  "/",
  authMiddleware,
  residentOrAdmin,
  async (req, res) => {
    try {
      if (!isDatabaseConnected()) {
        return res.status(503).json({
          message: "Database is not connected.",
        });
      }

      const query = {};

      if (req.user.role === "resident") {
        query.$or = [
          { residentId: req.user.id },
          ...(req.user.flat
            ? [{ flat: req.user.flat }]
            : []),
        ];
      }

      const trustedVisitors = await TrustedVisitor.find(query)
        .sort({ createdAt: -1 })
        .limit(500)
        .lean();

      return res.json({
        trustedVisitors,
        count: trustedVisitors.length,
      });
    } catch (error) {
      console.error(
        "Get trusted visitors error:",
        error
      );

      return res.status(500).json({
        message: "Failed to fetch trusted visitors.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 2. GET SINGLE TRUSTED VISITOR
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  residentOrAdmin,
  async (req, res) => {
    try {
      if (!isDatabaseConnected()) {
        return res.status(503).json({
          message: "Database is not connected.",
        });
      }

      const visitor = await TrustedVisitor.findById(
        req.params.id
      ).lean();

      if (!visitor) {
        return res.status(404).json({
          message: "Trusted visitor not found.",
        });
      }

      // Resident ownership check
      if (req.user.role === "resident") {
        const ownsVisitor =
          String(visitor.residentId || "") ===
            String(req.user.id) ||
          String(visitor.flat || "") ===
            String(req.user.flat || "");

        if (!ownsVisitor) {
          return res.status(403).json({
            message:
              "You do not have permission to view this trusted visitor.",
          });
        }
      }

      return res.json({
        trustedVisitor: visitor,
      });
    } catch (error) {
      console.error(
        "Get trusted visitor error:",
        error
      );

      return res.status(500).json({
        message: "Failed to fetch trusted visitor.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 3. ADD TRUSTED VISITOR
// RESIDENT / ADMIN
// =====================================================

router.post(
  "/",
  authMiddleware,
  residentOrAdmin,
  async (req, res) => {
    try {
      const {
        name,
        phone,
        relation,
        flat,
        allowedDays,
        startTime,
        endTime,
        isActive = true,
      } = req.body;

      const finalName = String(name || "").trim();
      const finalPhone = String(phone || "").trim();
      const finalRelation = String(
        relation || ""
      ).trim();

      let finalFlat = String(flat || "").trim();

      // -----------------------------------------------
      // Basic validation
      // -----------------------------------------------

      if (finalName.length < 2) {
        return res.status(400).json({
          message: "Trusted visitor name is required.",
        });
      }

      if (!isValidPhone(finalPhone)) {
        return res.status(400).json({
          message:
            "Phone number must contain 10 digits.",
        });
      }

      if (finalRelation.length < 2) {
        return res.status(400).json({
          message: "Relation is required.",
        });
      }

      // Resident must use their own flat
      if (req.user.role === "resident") {
        finalFlat = req.user.flat || finalFlat;

        if (!finalFlat) {
          return res.status(400).json({
            message:
              "Your resident account does not have a flat assigned.",
          });
        }
      }

      if (!isValidFlat(finalFlat)) {
        return res.status(400).json({
          message: "Invalid flat number.",
        });
      }

      // -----------------------------------------------
      // Allowed days
      // -----------------------------------------------

      if (
        !Array.isArray(allowedDays) ||
        allowedDays.length === 0
      ) {
        return res.status(400).json({
          message:
            "Select at least one allowed day.",
        });
      }

      const invalidDay = allowedDays.some(
        (day) => !VALID_DAYS.includes(day)
      );

      if (invalidDay) {
        return res.status(400).json({
          message: "One or more allowed days are invalid.",
          allowedDays: VALID_DAYS,
        });
      }

      // -----------------------------------------------
      // Time validation
      // -----------------------------------------------

      if (!isValidTime(startTime)) {
        return res.status(400).json({
          message: "Invalid start time.",
        });
      }

      if (!isValidTime(endTime)) {
        return res.status(400).json({
          message: "Invalid end time.",
        });
      }

      if (
        timeToMinutes(startTime) >=
        timeToMinutes(endTime)
      ) {
        return res.status(400).json({
          message:
            "End time must be later than start time.",
        });
      }

      // -----------------------------------------------
      // Database
      // -----------------------------------------------

      if (!isDatabaseConnected()) {
        return res.status(503).json({
          message: "Database is not connected.",
        });
      }

      // -----------------------------------------------
      // Verify resident
      // -----------------------------------------------

      const resident = await User.findOne({
        role: "resident",
        flat: finalFlat,
        isActive: true,
      }).select("_id name email flat");

      if (!resident) {
        return res.status(404).json({
          message:
            "No active resident is registered for this flat.",
        });
      }

      // -----------------------------------------------
      // Duplicate check
      // -----------------------------------------------

      const duplicate = await TrustedVisitor.findOne({
        residentId: resident._id,
        phone: finalPhone,
        isActive: true,
      });

      if (duplicate) {
        return res.status(409).json({
          message:
            "This trusted visitor is already registered for the resident.",
        });
      }

      // -----------------------------------------------
      // Create trusted visitor
      // -----------------------------------------------

      const trustedVisitor =
        await TrustedVisitor.create({
          name: finalName,
          phone: finalPhone,
          relation: finalRelation,
          flat: finalFlat,

          allowedDays: [...new Set(allowedDays)],

          startTime,
          endTime,

          residentId: resident._id,

          isActive: Boolean(isActive),
        });

      return res.status(201).json({
        message:
          "Trusted visitor added successfully.",

        trustedVisitor,
      });
    } catch (error) {
      console.error(
        "Add trusted visitor error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to add trusted visitor.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 4. UPDATE TRUSTED VISITOR
// RESIDENT / ADMIN
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  residentOrAdmin,
  async (req, res) => {
    try {
      if (!isDatabaseConnected()) {
        return res.status(503).json({
          message: "Database is not connected.",
        });
      }

      const visitor =
        await TrustedVisitor.findById(req.params.id);

      if (!visitor) {
        return res.status(404).json({
          message: "Trusted visitor not found.",
        });
      }

      // Resident ownership
      if (req.user.role === "resident") {
        const ownsVisitor =
          String(visitor.residentId || "") ===
            String(req.user.id) ||
          String(visitor.flat || "") ===
            String(req.user.flat || "");

        if (!ownsVisitor) {
          return res.status(403).json({
            message:
              "You cannot modify this trusted visitor.",
          });
        }
      }

      const {
        name,
        phone,
        relation,
        allowedDays,
        startTime,
        endTime,
        isActive,
      } = req.body;

      // -----------------------------------------------
      // Update name
      // -----------------------------------------------

      if (name !== undefined) {
        const value = String(name).trim();

        if (value.length < 2) {
          return res.status(400).json({
            message:
              "Trusted visitor name must contain at least 2 characters.",
          });
        }

        visitor.name = value;
      }

      // -----------------------------------------------
      // Update phone
      // -----------------------------------------------

      if (phone !== undefined) {
        const value = String(phone).trim();

        if (!isValidPhone(value)) {
          return res.status(400).json({
            message:
              "Phone number must contain 10 digits.",
          });
        }

        visitor.phone = value;
      }

      // -----------------------------------------------
      // Update relation
      // -----------------------------------------------

      if (relation !== undefined) {
        const value = String(relation).trim();

        if (value.length < 2) {
          return res.status(400).json({
            message: "Relation is required.",
          });
        }

        visitor.relation = value;
      }

      // -----------------------------------------------
      // Update days
      // -----------------------------------------------

      if (allowedDays !== undefined) {
        if (
          !Array.isArray(allowedDays) ||
          allowedDays.length === 0
        ) {
          return res.status(400).json({
            message:
              "Select at least one allowed day.",
          });
        }

        const invalidDay = allowedDays.some(
          (day) => !VALID_DAYS.includes(day)
        );

        if (invalidDay) {
          return res.status(400).json({
            message:
              "One or more allowed days are invalid.",
          });
        }

        visitor.allowedDays = [
          ...new Set(allowedDays),
        ];
      }

      // -----------------------------------------------
      // Update time
      // -----------------------------------------------

      const finalStart =
        startTime !== undefined
          ? String(startTime)
          : visitor.startTime;

      const finalEnd =
        endTime !== undefined
          ? String(endTime)
          : visitor.endTime;

      if (!isValidTime(finalStart)) {
        return res.status(400).json({
          message: "Invalid start time.",
        });
      }

      if (!isValidTime(finalEnd)) {
        return res.status(400).json({
          message: "Invalid end time.",
        });
      }

      if (
        timeToMinutes(finalStart) >=
        timeToMinutes(finalEnd)
      ) {
        return res.status(400).json({
          message:
            "End time must be later than start time.",
        });
      }

      visitor.startTime = finalStart;
      visitor.endTime = finalEnd;

      // -----------------------------------------------
      // Active / inactive
      // -----------------------------------------------

      if (isActive !== undefined) {
        visitor.isActive = Boolean(isActive);
      }

      await visitor.save();

      return res.json({
        message:
          "Trusted visitor updated successfully.",
        trustedVisitor: visitor,
      });
    } catch (error) {
      console.error(
        "Update trusted visitor error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update trusted visitor.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 5. QUICK ACTIVATE / DEACTIVATE
// RESIDENT / ADMIN
// =====================================================

router.put(
  "/:id/status",
  authMiddleware,
  residentOrAdmin,
  async (req, res) => {
    try {
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          message:
            "isActive must be true or false.",
        });
      }

      if (!isDatabaseConnected()) {
        return res.status(503).json({
          message: "Database is not connected.",
        });
      }

      const visitor =
        await TrustedVisitor.findById(req.params.id);

      if (!visitor) {
        return res.status(404).json({
          message: "Trusted visitor not found.",
        });
      }

      if (req.user.role === "resident") {
        const ownsVisitor =
          String(visitor.residentId || "") ===
            String(req.user.id) ||
          String(visitor.flat || "") ===
            String(req.user.flat || "");

        if (!ownsVisitor) {
          return res.status(403).json({
            message:
              "You cannot modify this trusted visitor.",
          });
        }
      }

      visitor.isActive = isActive;

      await visitor.save();

      return res.json({
        message: isActive
          ? "Trusted visitor activated."
          : "Trusted visitor deactivated.",

        trustedVisitor: visitor,
      });
    } catch (error) {
      console.error(
        "Trusted visitor status error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update trusted visitor status.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 6. DELETE TRUSTED VISITOR
// RESIDENT / ADMIN
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  residentOrAdmin,
  async (req, res) => {
    try {
      if (!isDatabaseConnected()) {
        return res.status(503).json({
          message: "Database is not connected.",
        });
      }

      const visitor =
        await TrustedVisitor.findById(req.params.id);

      if (!visitor) {
        return res.status(404).json({
          message: "Trusted visitor not found.",
        });
      }

      if (req.user.role === "resident") {
        const ownsVisitor =
          String(visitor.residentId || "") ===
            String(req.user.id) ||
          String(visitor.flat || "") ===
            String(req.user.flat || "");

        if (!ownsVisitor) {
          return res.status(403).json({
            message:
              "You cannot delete this trusted visitor.",
          });
        }
      }

      await TrustedVisitor.findByIdAndDelete(
        req.params.id
      );

      return res.json({
        message:
          "Trusted visitor deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete trusted visitor error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to delete trusted visitor.",
        error: error.message,
      });
    }
  }
);


module.exports = router;