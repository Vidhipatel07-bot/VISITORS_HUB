const express = require("express");
const router = express.Router();

const GuestPass = require("../models/GuestPass");
const Visitor = require("../models/Visitor");
const User = require("../models/User");

const {
  authMiddleware,
  residentOrAdmin,
  guardOrAdmin,
  residentGuardOrAdmin,
  adminOnly,
} = require("../middleware/authMiddleware");


// =====================================================
// HELPERS
// =====================================================

const VALID_PURPOSES = [
  "Personal Visit",
  "Delivery",
  "Service / Repair",
  "Work / Business",
  "Driver",
  "Household Staff",
  "Other",
];

const isDatabaseConnected = () => {
  return GuestPass.db.readyState === 1;
};

const isValidFlat = (flat) => {
  return /^[AB]-\d{3}$/.test(String(flat || ""));
};

const isValidPhone = (phone) => {
  return /^\d{10}$/.test(String(phone || ""));
};

const isValidDate = (date) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(date || ""));
};

const isValidTime = (time) => {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(
    String(time || "")
  );
};

const timeToMinutes = (time) => {
  const [hours, minutes] = String(time)
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
};


// =====================================================
// 1. GET ALL GUEST PASSES
// RESIDENT / GUARD / ADMIN
// =====================================================

router.get(
  "/",
  authMiddleware,
  residentGuardOrAdmin,
  async (req, res) => {
    try {
      if (!isDatabaseConnected()) {
        return res.status(503).json({
          message: "Database is not connected.",
        });
      }

      const query = {};

      // Resident → own passes only
      if (req.user.role === "resident") {
        if (req.user.flat) {
          query.flat = req.user.flat;
        } else {
          query.residentId = req.user.id;
        }
      }

      const passes = await GuestPass.find(query)
        .sort({ createdAt: -1 })
        .limit(500)
        .lean();

      return res.json({
        passes,
        count: passes.length,
      });
    } catch (error) {
      console.error("Get guest passes error:", error);

      return res.status(500).json({
        message: "Failed to fetch guest passes.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 2. VERIFY GUEST PASS
// GUARD / ADMIN
//
// IMPORTANT:
// This route MUST stay BEFORE /:id
// =====================================================

router.post(
  "/verify",
  authMiddleware,
  guardOrAdmin,
  async (req, res) => {
    try {
      const {
        passId,
        flat,
      } = req.body;

      const finalPassId = String(passId || "").trim();

      if (!finalPassId) {
        return res.status(400).json({
          message: "Guest pass ID is required.",
        });
      }

      if (!isDatabaseConnected()) {
        return res.status(503).json({
          message: "Database is not connected.",
        });
      }

      const pass = await GuestPass.findOne({
        passId: finalPassId,
      });

      if (!pass) {
        return res.status(404).json({
          valid: false,
          message: "Guest pass not found.",
        });
      }

      // -----------------------------------------------
      // Active check
      // -----------------------------------------------

      if (!pass.isActive) {
        return res.status(400).json({
          valid: false,
          message: "This guest pass has been deactivated.",
        });
      }

      // -----------------------------------------------
      // Used check
      // -----------------------------------------------

      if (pass.usedAt) {
        return res.status(400).json({
          valid: false,
          message: "This guest pass has already been used.",
          usedAt: pass.usedAt,
        });
      }

      // -----------------------------------------------
      // Flat check if provided
      // -----------------------------------------------

      if (
        flat &&
        String(flat).trim() !== String(pass.flat).trim()
      ) {
        return res.status(400).json({
          valid: false,
          message:
            "Guest pass flat number does not match.",
        });
      }

      // -----------------------------------------------
      // Date check
      // -----------------------------------------------

      const now = new Date();

      const currentDate =
        `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}-${String(
          now.getDate()
        ).padStart(2, "0")}`;

      if (String(pass.date) !== currentDate) {
        return res.status(400).json({
          valid: false,
          message:
            `This guest pass is valid only on ${pass.date}.`,
          passDate: pass.date,
          currentDate,
        });
      }

      // -----------------------------------------------
      // Time check
      // -----------------------------------------------

      const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

      const startMinutes =
        timeToMinutes(pass.startTime);

      const endMinutes =
        timeToMinutes(pass.endTime);

      if (
        currentMinutes < startMinutes ||
        currentMinutes > endMinutes
      ) {
        return res.status(400).json({
          valid: false,
          message:
            `Guest pass is valid only between ${pass.startTime} and ${pass.endTime}.`,
          startTime: pass.startTime,
          endTime: pass.endTime,
        });
      }

      // -----------------------------------------------
      // Valid
      // -----------------------------------------------

      return res.json({
        valid: true,
        message:
          "Guest pass verified successfully.",

        pass: {
          _id: pass._id,
          passId: pass.passId,
          guestName: pass.guestName,
          name: pass.name,
          phone: pass.phone,
          flat: pass.flat,
          date: pass.date,
          startTime: pass.startTime,
          endTime: pass.endTime,
          purpose: pass.purpose,
          isActive: pass.isActive,
        },
      });
    } catch (error) {
      console.error("Verify guest pass error:", error);

      return res.status(500).json({
        valid: false,
        message: "Failed to verify guest pass.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 3. GET SINGLE GUEST PASS
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  residentGuardOrAdmin,
  async (req, res) => {
    try {
      if (!isDatabaseConnected()) {
        return res.status(503).json({
          message: "Database is not connected.",
        });
      }

      const pass = await GuestPass.findById(
        req.params.id
      ).lean();

      if (!pass) {
        return res.status(404).json({
          message: "Guest pass not found.",
        });
      }

      // Resident ownership
      if (req.user.role === "resident") {
        const ownsPass =
          String(pass.residentId || "") ===
            String(req.user.id) ||
          String(pass.flat || "") ===
            String(req.user.flat || "");

        if (!ownsPass) {
          return res.status(403).json({
            message:
              "You do not have permission to view this guest pass.",
          });
        }
      }

      return res.json({
        pass,
      });
    } catch (error) {
      console.error(
        "Get guest pass error:",
        error
      );

      return res.status(500).json({
        message: "Failed to fetch guest pass.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 4. CREATE GUEST PASS
// RESIDENT / ADMIN
// =====================================================

router.post(
  "/",
  authMiddleware,
  residentOrAdmin,
  async (req, res) => {
    try {
      const {
        passId,
        guestName,
        name,
        phone,
        flat,
        date,
        startTime,
        endTime,
        purpose,
      } = req.body;

      const finalGuestName = String(
        guestName || name || ""
      ).trim();

      const finalPhone = String(phone || "").trim();

      const finalFlat = String(
        flat || ""
      ).trim();

      const finalPurpose =
        purpose || "Personal Visit";

      const finalPassId = String(
        passId || ""
      ).trim();

      // -----------------------------------------------
      // Validation
      // -----------------------------------------------

      if (!finalPassId) {
        return res.status(400).json({
          message: "Guest pass ID is required.",
        });
      }

      if (finalGuestName.length < 2) {
        return res.status(400).json({
          message: "Guest name is required.",
        });
      }

      if (!isValidPhone(finalPhone)) {
        return res.status(400).json({
          message:
            "Phone number must contain 10 digits.",
        });
      }

      if (!isValidFlat(finalFlat)) {
        return res.status(400).json({
          message: "Invalid flat number.",
        });
      }

      if (!isValidDate(date)) {
        return res.status(400).json({
          message:
            "Invalid date. Use YYYY-MM-DD format.",
        });
      }

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

      if (!VALID_PURPOSES.includes(finalPurpose)) {
        return res.status(400).json({
          message: "Invalid visit purpose.",
          allowedPurposes: VALID_PURPOSES,
        });
      }

      // -----------------------------------------------
      // Resident flat protection
      // -----------------------------------------------

      if (
        req.user.role === "resident" &&
        String(req.user.flat || "") !== finalFlat
      ) {
        return res.status(403).json({
          message:
            "You can only create guest passes for your own flat.",
        });
      }

      // -----------------------------------------------
      // Database
      // -----------------------------------------------

      if (!isDatabaseConnected()) {
        return res.status(503).json({
          message:
            "Database is not connected.",
        });
      }

      // -----------------------------------------------
      // Find resident
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
      // Duplicate pass ID
      // -----------------------------------------------

      const existingPass =
        await GuestPass.findOne({
          passId: finalPassId,
        });

      if (existingPass) {
        return res.status(409).json({
          message:
            "This guest pass ID already exists.",
        });
      }

      // -----------------------------------------------
      // Create pass
      // -----------------------------------------------

      const pass = await GuestPass.create({
        passId: finalPassId,

        guestName: finalGuestName,
        name: finalGuestName,

        phone: finalPhone,

        flat: finalFlat,

        date,

        startTime,
        endTime,

        purpose: finalPurpose,

        residentId: resident._id,

        isActive: true,

        usedAt: null,

        verifiedBy: null,
        verifiedAt: null,
        deactivatedAt: null,
      });

      return res.status(201).json({
        message:
          "Guest pass created successfully.",

        pass,
      });
    } catch (error) {
      console.error(
        "Create guest pass error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to create guest pass.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 5. ACTIVATE / DEACTIVATE GUEST PASS
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

      const pass =
        await GuestPass.findById(req.params.id);

      if (!pass) {
        return res.status(404).json({
          message: "Guest pass not found.",
        });
      }

      // Resident ownership
      if (req.user.role === "resident") {
        const ownsPass =
          String(pass.residentId || "") ===
            String(req.user.id) ||
          String(pass.flat || "") ===
            String(req.user.flat || "");

        if (!ownsPass) {
          return res.status(403).json({
            message:
              "You cannot modify this guest pass.",
          });
        }
      }

      // Used pass cannot be activated again
      if (pass.usedAt && isActive) {
        return res.status(400).json({
          message:
            "A used guest pass cannot be activated again.",
        });
      }

      pass.isActive = isActive;

      if (!isActive) {
        pass.deactivatedAt = new Date();
      } else {
        pass.deactivatedAt = null;
      }

      await pass.save();

      return res.json({
        message: isActive
          ? "Guest pass activated."
          : "Guest pass deactivated.",

        pass,
      });
    } catch (error) {
      console.error(
        "Guest pass status error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update guest pass status.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 6. MARK GUEST PASS AS USED
// GUARD / ADMIN
// =====================================================

router.put(
  "/:id/use",
  authMiddleware,
  guardOrAdmin,
  async (req, res) => {
    try {
      if (!isDatabaseConnected()) {
        return res.status(503).json({
          message: "Database is not connected.",
        });
      }

      const pass =
        await GuestPass.findById(req.params.id);

      if (!pass) {
        return res.status(404).json({
          message: "Guest pass not found.",
        });
      }

      if (!pass.isActive) {
        return res.status(400).json({
          message:
            "This guest pass has been deactivated.",
        });
      }

      if (pass.usedAt) {
        return res.status(400).json({
          message:
            "This guest pass has already been used.",
        });
      }

      const now = new Date();

      const currentDate =
        `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}-${String(
          now.getDate()
        ).padStart(2, "0")}`;

      // Date must match
      if (String(pass.date) !== currentDate) {
        return res.status(400).json({
          message:
            "Guest pass is not valid for today.",
        });
      }

      const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

      const startMinutes =
        timeToMinutes(pass.startTime);

      const endMinutes =
        timeToMinutes(pass.endTime);

      if (
        currentMinutes < startMinutes ||
        currentMinutes > endMinutes
      ) {
        return res.status(400).json({
          message:
            "Guest pass is outside its allowed time.",
        });
      }

      // -----------------------------------------------
      // Mark used
      // -----------------------------------------------

      pass.usedAt = now;
      pass.verifiedBy = req.user.id;
      pass.verifiedAt = now;

      await pass.save();

      return res.json({
        message:
          "Guest pass verified and marked as used.",

        pass,
      });
    } catch (error) {
      console.error(
        "Use guest pass error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to use guest pass.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 7. DELETE GUEST PASS
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
          message: "Database is not connected.",
        });
      }

      const pass =
        await GuestPass.findById(req.params.id);

      if (!pass) {
        return res.status(404).json({
          message: "Guest pass not found.",
        });
      }

      await GuestPass.findByIdAndDelete(
        req.params.id
      );

      return res.json({
        message:
          "Guest pass deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete guest pass error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to delete guest pass.",
        error: error.message,
      });
    }
  }
);


module.exports = router;