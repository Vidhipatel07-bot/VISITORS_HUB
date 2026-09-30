import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";

const API_URL = "http://localhost:5000/api/users/login";

function GuardLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          role: "guard"
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Invalid email or password."
        );
      }

      // Backend returns user inside result.user
      const user = result.user;

      if (!user) {
        throw new Error(
          "Login successful, but guard information was not returned."
        );
      }

      const guardId = user._id || user.id || "";

      localStorage.setItem(
        "authToken",
        result.token || ""
      );

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: guardId,
          _id: guardId,
          name: user.name || "",
          email: user.email || email,
          phone: user.phone || "",
          role: "guard"
        })
      );

      localStorage.setItem(
        "loggedInGuard",
        JSON.stringify({
          id: guardId,
          _id: guardId,
          name: user.name || "",
          email: user.email || email,
          phone: user.phone || "",
          role: "guard"
        })
      );

      navigate("/guard/dashboard");
    } catch (error) {
      console.log(
        "Backend login unavailable. Checking local guard account."
      );

      /*
        Development fallback while MongoDB
        is not connected.
      */

      try {
        const savedGuards = JSON.parse(
          localStorage.getItem("guards") || "[]"
        );

        const guard = savedGuards.find(
          (user) =>
            user.email?.toLowerCase() === email
        );

        /*
          Demo guard login for development.
          This allows testing the Guard Dashboard
          even when MongoDB is not connected.
        */
        if (
          email === "test@gmail.com" &&
          password === "123456"
        ) {
          const demoGuard = {
            id: "demo-guard-001",
            _id: "demo-guard-001",
            name: "Security Guard",
            email: email,
            phone: "",
            role: "guard"
          };

          localStorage.setItem(
            "authToken",
            "demo-guard-token"
          );

          localStorage.setItem(
            "currentUser",
            JSON.stringify(demoGuard)
          );

          localStorage.setItem(
            "loggedInGuard",
            JSON.stringify(demoGuard)
          );

          navigate("/guard/dashboard");
          return;
        }

        if (!guard) {
          alert(
            error.message ||
              "Guard account not found."
          );
          return;
        }

        if (guard.isActive === false) {
          alert("This guard account is inactive.");
          return;
        }

        const guardId =
          guard.id ||
          guard._id ||
          `guard-${Date.now()}`;

        const localGuard = {
          id: guardId,
          _id: guardId,
          name: guard.name || "Security Guard",
          email: guard.email || email,
          phone: guard.phone || "",
          role: "guard"
        };

        localStorage.setItem(
          "authToken",
          "local-guard-token"
        );

        localStorage.setItem(
          "currentUser",
          JSON.stringify(localGuard)
        );

        localStorage.setItem(
          "loggedInGuard",
          JSON.stringify(localGuard)
        );

        navigate("/guard/dashboard");
      } catch (localError) {
        console.error(
          "Local guard login error:",
          localError
        );

        alert(
          "Unable to login right now."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #eef5ff, #f8fbff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "25px 18px",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "#ffffff",
          borderRadius: "28px",
          padding: "38px 34px",
          boxShadow:
            "0 25px 70px rgba(30, 64, 175, 0.14)",
          border: "1px solid #e3ebf6"
        }}
      >
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "20px",
            background:
              "linear-gradient(135deg, #0f3b82, #1769d1)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow:
              "0 12px 28px rgba(23, 105, 209, 0.2)"
          }}
        >
          <ShieldCheck size={35} />
        </div>

        <h1
          style={{
            textAlign: "center",
            margin: 0,
            fontSize: "30px",
            fontWeight: 850,
            color: "#172033"
          }}
        >
          Security Guard Login
        </h1>

        <p
          style={{
            textAlign: "center",
            margin: "9px 0 30px",
            color: "#64748b",
            fontSize: "14px"
          }}
        >
          Login to manage visitor entry and exit
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "13px",
                fontWeight: 750,
                color: "#334155"
              }}
            >
              Email Address
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                minHeight: "54px",
                padding: "0 15px",
                border: "1px solid #d8e2ef",
                borderRadius: "14px",
                background: "#f8fafc"
              }}
            >
              <Mail
                size={19}
                color="#7890ad"
              />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "14px",
                  color: "#172033"
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "13px",
                fontWeight: 750,
                color: "#334155"
              }}
            >
              Password
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                minHeight: "54px",
                padding: "0 15px",
                border: "1px solid #d8e2ef",
                borderRadius: "14px",
                background: "#f8fafc"
              }}
            >
              <Lock
                size={19}
                color="#7890ad"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "14px",
                  color: "#172033"
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  padding: "4px"
                }}
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "23px",
              gap: "10px"
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#64748b",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              <input type="checkbox" />
              Remember me
            </label>

            <button
              type="button"
              onClick={() =>
                alert(
                  "Please contact the society administrator to reset your password."
                )
              }
              style={{
                border: "none",
                background: "transparent",
                color: "#1769d1",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 650
              }}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              minHeight: "54px",
              border: "none",
              borderRadius: "14px",
              background: loading
                ? "#8ba9e6"
                : "linear-gradient(135deg, #1769d1, #1555b8)",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 800,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              boxShadow:
                "0 10px 25px rgba(23, 105, 209, 0.2)"
            }}
          >
            {loading
              ? "Signing in..."
              : "Login"}
          </button>
        </form>

        <div
          style={{
            marginTop: "24px",
            paddingTop: "18px",
            borderTop: "1px solid #edf1f6",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "7px",
            color: "#8aa0ba",
            fontSize: "12px",
            textAlign: "center"
          }}
        >
          <ShieldCheck size={15} />
          Secure access for Visitors Hub security staff
        </div>
      </div>
    </div>
  );
}

export default GuardLogin;