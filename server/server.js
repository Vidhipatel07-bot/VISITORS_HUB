const dns = require("dns");

// =====================================================
// DNS FIX FOR MONGODB ATLAS
// =====================================================

dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);

// =====================================================
// IMPORTS
// =====================================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

dotenv.config();

// =====================================================
// ROUTES
// =====================================================

const visitorRoutes = require("./routes/visitorRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const trustedVisitorRoutes = require("./routes/trustedVisitorRoutes");
const guestPassRoutes = require("./routes/guestPassRoutes");
const userRoutes = require("./routes/userRoutes");

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// CONFIGURATION
// =====================================================

const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI;

const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:5173";

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: CLIENT_URL,
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// =====================================================
// REQUEST LOGGER
// =====================================================

app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} | ${req.method} ${req.originalUrl}`
  );

  next();
});

// =====================================================
// ROOT ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Visitors Hub API is running 🚀",
    project: "Visitors Hub",
    version: "1.0.0",
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/health", (req, res) => {
  const databaseStatus =
    mongoose.connection.readyState === 1
      ? "connected"
      : "not-connected";

  res.json({
    success: true,
    server: "running",
    database: databaseStatus,
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// API TEST ROUTE
// =====================================================

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Visitors Hub API is working.",
  });
});

// =====================================================
// API ROUTES
// =====================================================

app.use(
  "/api/visitors",
  visitorRoutes
);

app.use(
  "/api/deliveries",
  deliveryRoutes
);

app.use(
  "/api/trusted-visitors",
  trustedVisitorRoutes
);

app.use(
  "/api/guest-passes",
  guestPassRoutes
);

app.use(
  "/api/users",
  userRoutes
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {
  console.error("Server Error:", error);

  // JSON parsing error
  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    error.type === "entity.parse.failed"
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  // Payload too large
  if (error.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message:
        "Request is too large. Please reduce the uploaded photo or data size.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : undefined,
  });
});

// =====================================================
// DATABASE CONNECTION
// =====================================================

let server;

const startServer = async () => {
  try {
    console.log("======================================");
    console.log("      VISITORS HUB SERVER STARTING");
    console.log("======================================");

    // -----------------------------------------------
    // Check MongoDB URI
    // -----------------------------------------------

    if (!MONGO_URI) {
      console.log(
        "MongoDB URI not found."
      );

      console.log(
        "Running server without database."
      );
    } else {
      console.log(
        "Connecting to MongoDB Atlas..."
      );

      // -----------------------------------------------
      // MongoDB connection
      // -----------------------------------------------

      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      });

      console.log(
        "MongoDB connected successfully. ✅"
      );
    }

    // -----------------------------------------------
    // Start Express server
    // -----------------------------------------------

    server = app.listen(
      PORT,
      () => {
        console.log(
          "======================================"
        );

        console.log(
          `Visitors Hub server running on http://localhost:${PORT} 🚀`
        );

        console.log(
          `Database: ${
            mongoose.connection.readyState === 1
              ? "CONNECTED ✅"
              : "NOT CONNECTED ⚠️"
          }`
        );

        console.log(
          "======================================"
        );
      }
    );
  } catch (error) {
    console.error(
      "======================================"
    );

    console.error(
      "SERVER STARTUP ERROR ❌"
    );

    console.error(
      error.message
    );

    console.error(
      "======================================"
    );

    process.exit(1);
  }
};

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

const shutdownServer = async (signal) => {
  console.log(
    `${signal} received. Shutting down server...`
  );

  if (server) {
    server.close(async () => {
      try {
        if (
          mongoose.connection.readyState !== 0
        ) {
          await mongoose.connection.close();

          console.log(
            "MongoDB connection closed."
          );
        }

        console.log(
          "Server shut down successfully."
        );

        process.exit(0);
      } catch (error) {
        console.error(
          "Shutdown error:",
          error.message
        );

        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

// =====================================================
// PROCESS SIGNALS
// =====================================================

process.on(
  "SIGINT",
  () => shutdownServer("SIGINT")
);

process.on(
  "SIGTERM",
  () => shutdownServer("SIGTERM")
);

// =====================================================
// START SERVER
// =====================================================

startServer();