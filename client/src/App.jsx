import React from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { getCurrentUser } from "./utils/auth";


// =====================================================
// PUBLIC PAGES
// =====================================================

import Home from "./pages/Home";
import VisitorRegistration from "./pages/VisitorRegistration";

import ResidentLogin from "./pages/ResidentLogin";
import ResidentSignup from "./pages/ResidentSignup";

import GuardLogin from "./pages/GuardLogin";

import AdminLogin from "./pages/AdminLogin";


// =====================================================
// RESIDENT PAGES
// =====================================================

import ResidentDashboard from "./pages/ResidentDashboard";
import VisitorRequests from "./pages/VisitorRequests";
import CurrentVisitors from "./pages/CurrentVisitors";
import Deliveries from "./pages/Deliveries";
import VisitorHistory from "./pages/VisitorHistory";
import TrustedVisitors from "./pages/TrustedVisitors";
import GuestPass from "./pages/GuestPass";


// =====================================================
// GUARD PAGES
// =====================================================

import GuardDashboard from "./pages/GuardDashboard";
import GuardVisitors from "./pages/GuardVisitors";
import GuardDeliveries from "./pages/GuardDeliveries";
import GuardVisitorHistory from "./pages/GuardVisitorHistory";
import GuardQRScanner from "./pages/GuardQRScanner";


// =====================================================
// ADMIN PAGES
// =====================================================

import AdminDashboard from "./pages/AdminDashboard";
import AdminResidents from "./pages/AdminResidents";
import AdminGuards from "./pages/AdminGuards";
import AdminFlats from "./pages/AdminFlats";
import AdminVisitorLogs from "./pages/AdminVisitorLogs";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminGateQR from "./pages/AdminGateQR";
import AdminSettings from "./pages/AdminSettings";


// =====================================================
// PROTECTED ROUTE
// =====================================================

const ProtectedRoute = ({
  children,
  allowedRoles,
}) => {
  const location = useLocation();

  const user = getCurrentUser();

  // -----------------------------------------------
  // NOT LOGGED IN
  // -----------------------------------------------

  if (!user) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // -----------------------------------------------
  // WRONG ROLE
  // -----------------------------------------------

  if (
    Array.isArray(allowedRoles) &&
    !allowedRoles.includes(user.role)
  ) {
    if (user.role === "resident") {
      return (
        <Navigate
          to="/resident/dashboard"
          replace
        />
      );
    }

    if (user.role === "guard") {
      return (
        <Navigate
          to="/guard/dashboard"
          replace
        />
      );
    }

    if (user.role === "admin") {
      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
};


// =====================================================
// APP
// =====================================================

const App = () => {
  return (
    <Routes>

      {/* =================================================
          PUBLIC ROUTES
      ================================================= */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/visitor"
        element={<VisitorRegistration />}
      />

      <Route
        path="/resident"
        element={<ResidentLogin />}
      />

      <Route
        path="/resident/signup"
        element={<ResidentSignup />}
      />

      <Route
        path="/guard"
        element={<GuardLogin />}
      />

      <Route
        path="/admin"
        element={<AdminLogin />}
      />


      {/* =================================================
          RESIDENT ROUTES
      ================================================= */}

      <Route
        path="/resident/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["resident"]}
          >
            <ResidentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resident/visitors"
        element={
          <ProtectedRoute
            allowedRoles={["resident"]}
          >
            <VisitorRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resident/current-visitors"
        element={
          <ProtectedRoute
            allowedRoles={["resident"]}
          >
            <CurrentVisitors />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resident/deliveries"
        element={
          <ProtectedRoute
            allowedRoles={["resident"]}
          >
            <Deliveries />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resident/history"
        element={
          <ProtectedRoute
            allowedRoles={["resident"]}
          >
            <VisitorHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resident/trusted-visitors"
        element={
          <ProtectedRoute
            allowedRoles={["resident"]}
          >
            <TrustedVisitors />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resident/guest-pass"
        element={
          <ProtectedRoute
            allowedRoles={["resident"]}
          >
            <GuestPass />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          GUARD ROUTES
      ================================================= */}

      <Route
        path="/guard/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["guard"]}
          >
            <GuardDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/guard/visitors"
        element={
          <ProtectedRoute
            allowedRoles={["guard"]}
          >
            <GuardVisitors />
          </ProtectedRoute>
        }
      />

      <Route
        path="/guard/deliveries"
        element={
          <ProtectedRoute
            allowedRoles={["guard"]}
          >
            <GuardDeliveries />
          </ProtectedRoute>
        }
      />

      <Route
        path="/guard/history"
        element={
          <ProtectedRoute
            allowedRoles={["guard"]}
          >
            <GuardVisitorHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/guard/qr-scanner"
        element={
          <ProtectedRoute
            allowedRoles={["guard"]}
          >
            <GuardQRScanner />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          ADMIN ROUTES
      ================================================= */}

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["admin"]}
          >
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/residents"
        element={
          <ProtectedRoute
            allowedRoles={["admin"]}
          >
            <AdminResidents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/guards"
        element={
          <ProtectedRoute
            allowedRoles={["admin"]}
          >
            <AdminGuards />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/flats"
        element={
          <ProtectedRoute
            allowedRoles={["admin"]}
          >
            <AdminFlats />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/logs"
        element={
          <ProtectedRoute
            allowedRoles={["admin"]}
          >
            <AdminVisitorLogs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute
            allowedRoles={["admin"]}
          >
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/gate-qr"
        element={
          <ProtectedRoute
            allowedRoles={["admin"]}
          >
            <AdminGateQR />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute
            allowedRoles={["admin"]}
          >
            <AdminSettings />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          FALLBACK
      ================================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
};


export default App;