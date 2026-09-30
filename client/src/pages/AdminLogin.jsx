import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Settings,
} from "lucide-react";

import api from "../utils/api";
import { saveAuthSession } from "../utils/auth";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("test@gmail.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/users/login", {
        email: email.trim(),
        password,
        role: "admin",
      });

      const result = response.data;

      if (!result?.token || !result?.user) {
        throw new Error("Invalid login response.");
      }

      saveAuthSession(result.token, result.user);

      localStorage.setItem(
        "loggedInAdmin",
        JSON.stringify(result.user)
      );

      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 700);
    } catch (err) {
      // Demo login fallback
      if (
        email.trim().toLowerCase() === "test@gmail.com" &&
        password === "123456"
      ) {
        const demoUser = {
          _id: "demo-admin-001",
          name: "Visitors Hub Admin",
          email: "test@gmail.com",
          phone: "9999999999",
          role: "admin",
          isActive: true,
          isApproved: true,
        };

        saveAuthSession("demo-admin-token", demoUser);

        localStorage.setItem(
          "loggedInAdmin",
          JSON.stringify(demoUser)
        );

        setSuccess("Demo login successful! Redirecting...");

        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 700);

        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #eef6ff 0%, #f8fbff 45%, #ffffff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "980px",
          minHeight: "620px",
          background: "#ffffff",
          borderRadius: "28px",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "0.9fr 1.1fr",
          boxShadow:
            "0 25px 70px rgba(15, 23, 42, 0.10)",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* LEFT PANEL */}

        <div
          style={{
            background:
              "linear-gradient(145deg, #0f172a, #164e63)",
            padding: "50px 42px",
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "230px",
              height: "230px",
              borderRadius: "50%",
              background:
                "rgba(6, 182, 212, 0.12)",
              top: "-90px",
              right: "-80px",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background:
                "rgba(37, 99, 235, 0.12)",
              bottom: "-70px",
              left: "-70px",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* LOGO */}

            <div
              style={{
                width: "62px",
                height: "62px",
                borderRadius: "18px",
                background:
                  "linear-gradient(135deg, #2563eb, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "28px",
                boxShadow:
                  "0 15px 30px rgba(0,0,0,0.20)",
              }}
            >
              <ShieldCheck size={34} />
            </div>

            <div
              style={{
                fontSize: "12px",
                fontWeight: "800",
                letterSpacing: "2px",
                color: "#67e8f9",
                marginBottom: "12px",
              }}
            >
              VISITORS HUB
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "38px",
                lineHeight: 1.1,
                fontWeight: "900",
                letterSpacing: "-1px",
              }}
            >
              Smart Society
              <br />
              Management
            </h1>

            <p
              style={{
                marginTop: "20px",
                color: "#cbd5e1",
                fontSize: "14px",
                lineHeight: 1.7,
                maxWidth: "330px",
              }}
            >
              Securely manage residents, guards,
              visitors, deliveries and society
              operations from one place.
            </p>
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#cbd5e1",
              fontSize: "12px",
            }}
          >
            <CheckCircle2 size={17} color="#67e8f9" />
            Secure administration portal
          </div>
        </div>

        {/* RIGHT PANEL */}

        <div
          style={{
            padding: "48px 52px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* BACK */}

          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              color: "#64748b",
              fontSize: "13px",
              fontWeight: "700",
              marginBottom: "35px",
              width: "fit-content",
            }}
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>

          {/* HEADING */}

          <div style={{ marginBottom: "30px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "17px",
              }}
            >
              <Settings size={24} />
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "30px",
                fontWeight: "900",
                color: "#0f172a",
                letterSpacing: "-0.7px",
              }}
            >
              Admin Login
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Secure access to Visitors Hub
              administration
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: "13px",
                marginBottom: "18px",
              }}
            >
              <AlertCircle
                size={17}
                style={{ flexShrink: 0 }}
              />

              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#15803d",
                fontSize: "13px",
                marginBottom: "18px",
              }}
            >
              <CheckCircle2 size={17} />
              {success}
            </div>
          )}

          {/* FORM */}

          <form onSubmit={handleLogin}>
            {/* EMAIL */}

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "800",
                  color: "#1e293b",
                  marginBottom: "8px",
                }}
              >
                Email Address
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <Mail
                  size={18}
                  color="#94a3b8"
                  style={{
                    position: "absolute",
                    left: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                  style={{
                    width: "100%",
                    height: "50px",
                    border: "1px solid #dbe3ef",
                    borderRadius: "13px",
                    padding: "0 15px 0 45px",
                    outline: "none",
                    fontSize: "14px",
                    color: "#0f172a",
                    background: "#fbfdff",
                  }}
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "800",
                  color: "#1e293b",
                  marginBottom: "8px",
                }}
              >
                Password
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <LockKeyhole
                  size={18}
                  color="#94a3b8"
                  style={{
                    position: "absolute",
                    left: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    height: "50px",
                    border: "1px solid #dbe3ef",
                    borderRadius: "13px",
                    padding:
                      "0 48px 0 45px",
                    outline: "none",
                    fontSize: "14px",
                    color: "#0f172a",
                    background: "#fbfdff",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "6px",
                    width: "38px",
                    height: "38px",
                    border: "none",
                    background: "transparent",
                    color: "#64748b",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* LOGIN */}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "52px",
                border: "none",
                borderRadius: "13px",
                background:
                  "linear-gradient(135deg, #2563eb, #0891b2)",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "800",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "9px",
                boxShadow:
                  "0 10px 22px rgba(37,99,235,0.20)",
              }}
            >
              <LogIn size={18} />

              {loading
                ? "Signing in..."
                : "Login"}
            </button>
          </form>

          {/* SECURITY NOTE */}

          <div
            style={{
              marginTop: "25px",
              padding: "13px 15px",
              borderRadius: "12px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: "9px",
              color: "#64748b",
              fontSize: "11px",
              lineHeight: 1.5,
            }}
          >
            <ShieldCheck
              size={16}
              color="#2563eb"
              style={{ flexShrink: 0 }}
            />

            Authorized Visitors Hub
            administrators only
          </div>

          {/* DEMO */}

          <div
            style={{
              marginTop: "18px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "11px",
            }}
          >
            Demo: test@gmail.com / 123456
          </div>
        </div>
      </div>

      {/* RESPONSIVE */}

      <style>
        {`
          @media (max-width: 800px) {
            div[style*="grid-template-columns: 0.9fr 1.1fr"] {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 600px) {
            div[style*="grid-template-columns: 0.9fr 1.1fr"] {
              border-radius: 18px !important;
            }

            div[style*="grid-template-columns: 0.9fr 1.1fr"] > div:first-child {
              padding: 32px 25px !important;
            }

            div[style*="grid-template-columns: 0.9fr 1.1fr"] > div:last-child {
              padding: 32px 25px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AdminLogin;