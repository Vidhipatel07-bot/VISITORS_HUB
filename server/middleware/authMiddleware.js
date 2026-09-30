const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "visitors-hub-secret-key";

// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No Authorization header
    if (!authHeader) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // Expected format:
    // Authorization: Bearer TOKEN

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization format.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication token is missing.",
      });
    }

    // Demo tokens used when MongoDB is not connected
    if (token === "demo-resident-token") {
      req.user = {
        id: "demo-resident-001",
        _id: "demo-resident-001",
        name: "Demo Resident",
        email: "test@gmail.com",
        role: "resident",
        flat: "A-101",
      };

      return next();
    }

    if (token === "demo-guard-token") {
      req.user = {
        id: "demo-guard-001",
        _id: "demo-guard-001",
        name: "Demo Guard",
        email: "test@gmail.com",
        role: "guard",
      };

      return next();
    }

    if (token === "demo-admin-token") {
      req.user = {
        id: "demo-admin-001",
        _id: "demo-admin-001",
        name: "Demo Admin",
        email: "test@gmail.com",
        role: "admin",
      };

      return next();
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    // Make sure decoded user contains required data
    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Your session has expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    return res.status(401).json({
      message: "Authentication failed.",
    });
  }
};

// =====================================================
// ROLE AUTHORIZATION
// =====================================================

const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message:
          "You do not have permission to access this resource.",
      });
    }

    next();
  };
};

// =====================================================
// SPECIFIC ROLE MIDDLEWARES
// =====================================================

const residentOnly = requireRoles("resident");

const guardOnly = requireRoles("guard");

const adminOnly = requireRoles("admin");

const guardOrAdmin = requireRoles(
  "guard",
  "admin"
);

const residentOrAdmin = requireRoles(
  "resident",
  "admin"
);

const residentGuardOrAdmin = requireRoles(
  "resident",
  "guard",
  "admin"
);

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  authMiddleware,
  requireRoles,
  residentOnly,
  guardOnly,
  adminOnly,
  guardOrAdmin,
  residentOrAdmin,
  residentGuardOrAdmin,
};