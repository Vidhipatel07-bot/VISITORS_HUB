const express = require("express");
const router = express.Router();

const Delivery = require("../models/Delivery");
const User = require("../models/User");

const {
  authMiddleware,
  residentGuardOrAdmin,
  guardOrAdmin,
  adminOnly,
} = require("../middleware/authMiddleware");


// =====================================================
// HELPERS
// =====================================================

const VALID_DELIVERY_TYPES = [
  "Food",
  "Courier",
  "E-commerce",
  "Grocery",
  "Medicine",
  "Other",
];

const VALID_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "held",
  "completed",
];

const isDatabaseConnected = () => {
  return Delivery.db.readyState === 1;
};

const isValidFlat = (flat) => {
  return /^[AB]-\d{3}$/.test(String(flat || ""));
};

const normalizePhone = (phone) => {
  return String(phone || "").replace(/\D/g, "");
};


// =====================================================
// 1. GET ALL DELIVERIES
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

      // Resident → only own flat
      if (req.user.role === "resident") {
        if (req.user.flat) {
          query.flat = req.user.flat;
        } else {
          query.residentId = req.user.id;
        }
      }

      const deliveries = await Delivery.find(query)
        .sort({ createdAt: -1 })
        .limit(500)
        .lean();

      return res.json({
        deliveries,
        count: deliveries.length,
      });
    } catch (error) {
      console.error("Get deliveries error:", error);

      return res.status(500).json({
        message: "Failed to fetch deliveries.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 2. GET SINGLE DELIVERY
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

      const delivery = await Delivery.findById(req.params.id).lean();

      if (!delivery) {
        return res.status(404).json({
          message: "Delivery not found.",
        });
      }

      // Resident ownership check
      if (
        req.user.role === "resident" &&
        delivery.flat !== req.user.flat
      ) {
        return res.status(403).json({
          message:
            "You do not have permission to view this delivery.",
        });
      }

      return res.json({
        delivery,
      });
    } catch (error) {
      console.error("Get delivery error:", error);

      return res.status(500).json({
        message: "Failed to fetch delivery.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 3. REGISTER DELIVERY
// GUARD / ADMIN ONLY
// =====================================================

router.post(
  "/",
  authMiddleware,
  guardOrAdmin,
  async (req, res) => {
    try {
      const {
        personName,
        deliveryPerson,
        phone,
        flat,
        deliveryType,
        type,
        company = "",
        trackingNumber = "",
        description = "",
        source = "security-guard",
        notes = "",
      } = req.body;

      const finalPersonName = String(
        personName || deliveryPerson || ""
      ).trim();

      const finalPhone = normalizePhone(phone);

      const finalDeliveryType =
        deliveryType || type || "Other";

      // -----------------------------------------------
      // Validation
      // -----------------------------------------------

      if (finalPersonName.length < 2) {
        return res.status(400).json({
          message: "Delivery person's name is required.",
        });
      }

      if (!/^\d{10}$/.test(finalPhone)) {
        return res.status(400).json({
          message: "Phone number must contain 10 digits.",
        });
      }

      if (!isValidFlat(flat)) {
        return res.status(400).json({
          message: "Invalid flat number.",
        });
      }

      if (!VALID_DELIVERY_TYPES.includes(finalDeliveryType)) {
        return res.status(400).json({
          message: "Invalid delivery type.",
          allowedTypes: VALID_DELIVERY_TYPES,
        });
      }

      if (!isDatabaseConnected()) {
        return res.status(503).json({
          message:
            "Database is not connected. Delivery registration is temporarily unavailable.",
        });
      }

      // -----------------------------------------------
      // Find resident
      // -----------------------------------------------

      const resident = await User.findOne({
        role: "resident",
        flat: String(flat).trim(),
        isActive: true,
      }).select("_id name email flat");

      if (!resident) {
        return res.status(404).json({
          message:
            "No active resident is registered for this flat.",
        });
      }

      // -----------------------------------------------
      // Create delivery
      // -----------------------------------------------

      const delivery = await Delivery.create({
        personName: finalPersonName,
        deliveryPerson: finalPersonName,

        phone: finalPhone,

        flat: String(flat).trim(),

        residentId: resident._id,

        deliveryType: finalDeliveryType,
        type: finalDeliveryType,

        company: String(company || "").trim(),
        trackingNumber: String(trackingNumber || "").trim(),
        description: String(description || "").trim(),

        status: "pending",

        source,
        createdBy: req.user.id,

        notes: String(notes || "").trim(),
      });

      return res.status(201).json({
        message:
          "Delivery registered successfully. Waiting for resident approval.",

        delivery: {
          _id: delivery._id,
          personName: delivery.personName,
          deliveryPerson: delivery.deliveryPerson,
          phone: delivery.phone,
          flat: delivery.flat,
          residentId: delivery.residentId,
          deliveryType: delivery.deliveryType,
          company: delivery.company,
          trackingNumber: delivery.trackingNumber,
          status: delivery.status,
          createdAt: delivery.createdAt,
        },
      });
    } catch (error) {
      console.error("Register delivery error:", error);

      return res.status(500).json({
        message: "Failed to register delivery.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 4. UPDATE DELIVERY STATUS
// RESIDENT / GUARD / ADMIN
// =====================================================

router.put(
  "/:id/status",
  authMiddleware,
  residentGuardOrAdmin,
  async (req, res) => {
    try {
      const { status, holdReason = "" } = req.body;

      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          message: "Invalid delivery status.",
          allowedStatuses: VALID_STATUSES,
        });
      }

      if (!isDatabaseConnected()) {
        return res.status(503).json({
          message: "Database is not connected.",
        });
      }

      const delivery = await Delivery.findById(req.params.id);

      if (!delivery) {
        return res.status(404).json({
          message: "Delivery not found.",
        });
      }

      // -----------------------------------------------
      // Resident ownership
      // -----------------------------------------------

      if (
        req.user.role === "resident" &&
        delivery.flat !== req.user.flat
      ) {
        return res.status(403).json({
          message:
            "You can only manage deliveries for your own flat.",
        });
      }

      // -----------------------------------------------
      // RESIDENT ACTIONS
      // -----------------------------------------------

      if (req.user.role === "resident") {
        if (!["approved", "rejected"].includes(status)) {
          return res.status(403).json({
            message:
              "Residents can only approve or reject deliveries.",
          });
        }

        if (delivery.status !== "pending") {
          return res.status(400).json({
            message:
              "Only pending deliveries can be approved or rejected.",
          });
        }
      }

      // -----------------------------------------------
      // GUARD ACTIONS
      // -----------------------------------------------

      if (req.user.role === "guard") {
        const validGuardTransitions = {
          pending: ["approved", "rejected", "held"],
          approved: ["completed", "held"],
          held: ["approved", "completed"],
        };

        const allowed =
          validGuardTransitions[delivery.status] || [];

        if (!allowed.includes(status)) {
          return res.status(400).json({
            message:
              `Cannot change delivery from ${delivery.status} to ${status}.`,
          });
        }
      }

      // -----------------------------------------------
      // ADMIN ACTIONS
      // -----------------------------------------------

      if (req.user.role === "admin") {
        const validAdminTransitions = {
          pending: ["approved", "rejected", "held"],
          approved: ["completed", "held"],
          held: ["approved", "completed"],
          rejected: [],
          completed: [],
        };

        const allowed =
          validAdminTransitions[delivery.status] || [];

        if (!allowed.includes(status)) {
          return res.status(400).json({
            message:
              `Cannot change delivery from ${delivery.status} to ${status}.`,
          });
        }
      }

      // -----------------------------------------------
      // UPDATE STATUS
      // -----------------------------------------------

      delivery.status = status;

      delivery.decisionAt = new Date();

      // Approved
      if (status === "approved") {
        delivery.approvedAt = new Date();
        delivery.rejectedAt = null;
        delivery.heldAt = null;
        delivery.holdReason = "";
      }

      // Rejected
      if (status === "rejected") {
        delivery.rejectedAt = new Date();
      }

      // Held
      if (status === "held") {
        delivery.heldAt = new Date();

        delivery.holdReason =
          String(holdReason || "").trim() ||
          "Delivery is being held at the security desk.";
      }

      // Completed
      if (status === "completed") {
        delivery.completedAt = new Date();
        delivery.completedBy = req.user.id;
      }

      delivery.notes = delivery.notes || "";

      await delivery.save();

      return res.json({
        message:
          `Delivery status updated to ${status}.`,

        delivery,
      });
    } catch (error) {
      console.error("Update delivery status error:", error);

      return res.status(500).json({
        message: "Failed to update delivery status.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 5. PUT DELIVERY ON HOLD
// GUARD / ADMIN
// =====================================================

router.put(
  "/:id/hold",
  authMiddleware,
  guardOrAdmin,
  async (req, res) => {
    try {
      const {
        holdReason = "Resident did not respond. Parcel held at security desk.",
      } = req.body;

      if (!isDatabaseConnected()) {
        return res.status(503).json({
          message: "Database is not connected.",
        });
      }

      const delivery = await Delivery.findById(req.params.id);

      if (!delivery) {
        return res.status(404).json({
          message: "Delivery not found.",
        });
      }

      if (delivery.status !== "pending") {
        return res.status(400).json({
          message:
            "Only pending deliveries can be placed on hold.",
        });
      }

      delivery.status = "held";
      delivery.heldAt = new Date();
      delivery.holdReason = String(holdReason).trim();
      delivery.decisionAt = new Date();

      await delivery.save();

      return res.json({
        message:
          "Delivery is now held at the security desk.",
        delivery,
      });
    } catch (error) {
      console.error("Hold delivery error:", error);

      return res.status(500).json({
        message: "Failed to hold delivery.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 6. COMPLETE DELIVERY
// GUARD / ADMIN
// =====================================================

router.put(
  "/:id/complete",
  authMiddleware,
  guardOrAdmin,
  async (req, res) => {
    try {
      if (!isDatabaseConnected()) {
        return res.status(503).json({
          message: "Database is not connected.",
        });
      }

      const delivery = await Delivery.findById(req.params.id);

      if (!delivery) {
        return res.status(404).json({
          message: "Delivery not found.",
        });
      }

      if (!["approved", "held"].includes(delivery.status)) {
        return res.status(400).json({
          message:
            "Only approved or held deliveries can be completed.",
        });
      }

      delivery.status = "completed";
      delivery.completedAt = new Date();
      delivery.completedBy = req.user.id;

      await delivery.save();

      return res.json({
        message: "Delivery completed successfully.",
        delivery,
      });
    } catch (error) {
      console.error("Complete delivery error:", error);

      return res.status(500).json({
        message: "Failed to complete delivery.",
        error: error.message,
      });
    }
  }
);


// =====================================================
// 7. ADMIN DELETE DELIVERY
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

      const delivery = await Delivery.findById(req.params.id);

      if (!delivery) {
        return res.status(404).json({
          message: "Delivery not found.",
        });
      }

      await Delivery.findByIdAndDelete(req.params.id);

      return res.json({
        message: "Delivery record deleted successfully.",
      });
    } catch (error) {
      console.error("Delete delivery error:", error);

      return res.status(500).json({
        message: "Failed to delete delivery.",
        error: error.message,
      });
    }
  }
);


module.exports = router;