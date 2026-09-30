import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  UserRound,
  Mail,
  Phone,
  Home,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/users/register";

const FLATS = [
  "A-101",
  "A-102",
  "A-103",
  "A-104",
  "B-201",
  "B-202",
  "B-203",
  "B-204",
];

function ResidentSignup() {
  const navigate = useNavigate();

  // ==========================================
  // FORM STATE
  // ==========================================

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    flat: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // ==========================================
  // VALIDATION
  // ==========================================

  const validateForm = () => {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();
    const flat = form.flat.trim();
    const password = form.password;
    const confirmPassword = form.confirmPassword;

    if (!name) {
      return "Please enter your full name.";
    }

    if (name.length < 2) {
      return "Name must contain at least 2 characters.";
    }

    if (!email) {
      return "Please enter your email address.";
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return "Please enter a valid email address.";
    }

    if (!phone) {
      return "Please enter your mobile number.";
    }

    if (!/^\d{10}$/.test(phone)) {
      return "Mobile number must contain exactly 10 digits.";
    }

    if (!flat) {
      return "Please select your flat number.";
    }

    if (!FLATS.includes(flat)) {
      return "Please select a valid flat number.";
    }

    if (!password) {
      return "Please create a password.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      return "Please confirm your password.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  // ==========================================
  // SAVE LOCAL DEMO RESIDENT
  // ==========================================

  const saveLocalResident = () => {
    const existingResidents =
      JSON.parse(
        localStorage.getItem("registeredResidents") || "[]"
      );

    const normalizedEmail =
      form.email.trim().toLowerCase();

    const normalizedPhone =
      form.phone.trim();

    const emailExists = existingResidents.some(
      (resident) =>
        resident.email?.toLowerCase() === normalizedEmail
    );

    const phoneExists = existingResidents.some(
      (resident) =>
        resident.phone === normalizedPhone
    );

    const flatExists = existingResidents.some(
      (resident) =>
        resident.flat === form.flat &&
        resident.role === "resident" &&
        resident.isActive !== false
    );

    if (emailExists) {
      throw new Error(
        "An account with this email already exists."
      );
    }

    if (phoneExists) {
      throw new Error(
        "An account with this mobile number already exists."
      );
    }

    if (flatExists) {
      throw new Error(
        "This flat already has a registered resident account."
      );
    }

    const newResident = {
      _id: `local-resident-${Date.now()}`,
      id: `local-resident-${Date.now()}`,
      name: form.name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      flat: form.flat,
      role: "resident",
      isActive: true,
      isApproved: true,
      createdAt: new Date().toISOString(),
    };

    existingResidents.push(newResident);

    localStorage.setItem(
      "registeredResidents",
      JSON.stringify(existingResidents)
    );

    return newResident;
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      flat: form.flat,
      password: form.password,
      role: "resident",
    };

    try {
      // ========================================
      // BACKEND REGISTRATION
      // ========================================

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to create your account."
        );
      }

      // ========================================
      // SUCCESS
      // ========================================

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        flat: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/resident");
      }, 1200);
    } catch (err) {
      // ========================================
      // LOCAL FALLBACK
      // ========================================

      try {
        const localResident = saveLocalResident();

        if (localResident) {
          setSuccess(
            "Account created successfully! Redirecting to login..."
          );

          setForm({
            name: "",
            email: "",
            phone: "",
            flat: "",
            password: "",
            confirmPassword: "",
          });

          setTimeout(() => {
            navigate("/resident");
          }, 1200);

          return;
        }
      } catch (localError) {
        setError(
          localError.message ||
            err.message ||
            "Unable to create account."
        );

        return;
      }

      setError(
        err.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div style={styles.page}>

      {/* ========================================
          BACK BUTTON
      ======================================== */}

      <button
        type="button"
        onClick={() => navigate("/resident")}
        style={styles.backButton}
      >
        <ArrowLeft size={18} />
        Back to Login
      </button>

      {/* ========================================
          SIGNUP CARD
      ======================================== */}

      <div style={styles.card}>

        {/* LOGO */}
        <div style={styles.logoWrapper}>
          <ShieldCheck
            size={38}
            strokeWidth={1.8}
          />
        </div>

        <h1 style={styles.title}>
          Create Resident Account
        </h1>

        <p style={styles.subtitle}>
          Register your flat to manage visitors and deliveries
        </p>

        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={18} />

            <span>
              {error}
            </span>
          </div>
        )}

        {/* ======================================
            SUCCESS
        ====================================== */}

        {success && (
          <div style={styles.successBox}>
            <CheckCircle2 size={18} />

            <span>
              {success}
            </span>
          </div>
        )}

        {/* ======================================
            FORM
        ====================================== */}

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >

          {/* FULL NAME */}
          <div style={styles.fieldGroup}>

            <label style={styles.label}>
              Full Name
            </label>

            <div style={styles.inputWrapper}>

              <UserRound
                size={18}
                style={styles.inputIcon}
              />

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                style={styles.input}
                disabled={loading}
              />

            </div>
          </div>

          {/* EMAIL */}
          <div style={styles.fieldGroup}>

            <label style={styles.label}>
              Email Address
            </label>

            <div style={styles.inputWrapper}>

              <Mail
                size={18}
                style={styles.inputIcon}
              />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                style={styles.input}
                disabled={loading}
              />

            </div>
          </div>

          {/* MOBILE */}
          <div style={styles.fieldGroup}>

            <label style={styles.label}>
              Mobile Number
            </label>

            <div style={styles.inputWrapper}>

              <Phone
                size={18}
                style={styles.inputIcon}
              />

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={(e) => {
                  const value =
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                  setForm((prev) => ({
                    ...prev,
                    phone: value,
                  }));

                  setError("");
                }}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                autoComplete="tel"
                style={styles.input}
                disabled={loading}
              />

            </div>
          </div>

          {/* FLAT */}
          <div style={styles.fieldGroup}>

            <label style={styles.label}>
              Flat Number
            </label>

            <div style={styles.inputWrapper}>

              <Home
                size={18}
                style={styles.inputIcon}
              />

              <select
                name="flat"
                value={form.flat}
                onChange={handleChange}
                style={styles.select}
                disabled={loading}
              >
                <option value="">
                  Select your flat
                </option>

                {FLATS.map((flat) => (
                  <option
                    key={flat}
                    value={flat}
                  >
                    {flat}
                  </option>
                ))}
              </select>

            </div>
          </div>

          {/* PASSWORD */}
          <div style={styles.fieldGroup}>

            <label style={styles.label}>
              Password
            </label>

            <div style={styles.inputWrapper}>

              <Lock
                size={18}
                style={styles.inputIcon}
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
                placeholder="Create password"
                autoComplete="new-password"
                style={{
                  ...styles.input,
                  paddingRight: "48px",
                }}
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                style={styles.eyeButton}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

            <span style={styles.helperText}>
              Minimum 6 characters
            </span>
          </div>

          {/* CONFIRM PASSWORD */}
          <div style={styles.fieldGroup}>

            <label style={styles.label}>
              Confirm Password
            </label>

            <div style={styles.inputWrapper}>

              <Lock
                size={18}
                style={styles.inputIcon}
              />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
                style={{
                  ...styles.input,
                  paddingRight: "48px",
                }}
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) => !previous
                  )
                }
                style={styles.eyeButton}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>
          </div>

          {/* CREATE ACCOUNT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.createButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading ? (
              "Creating Account..."
            ) : (
              <>
                Create Account
                <ArrowRight size={19} />
              </>
            )}
          </button>

        </form>

        {/* ======================================
            LOGIN LINK
        ====================================== */}

        <div style={styles.loginSection}>

          <span style={styles.loginText}>
            Already have an account?
          </span>

          <Link
            to="/resident"
            style={styles.loginLink}
          >
            Sign In
            <ArrowRight size={16} />
          </Link>

        </div>

        {/* ======================================
            NO OTP NOTE
        ====================================== */}

        <div style={styles.infoBox}>
          <ShieldCheck size={17} />

          <span>
            No OTP required. Your account is created
            using your registered details.
          </span>
        </div>

      </div>
    </div>
  );
}

// =====================================================
// INLINE STYLES
// =====================================================

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f5f9ff 0%, #eaf4ff 50%, #f8fbff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "45px 20px",
    position: "relative",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
  },

  backButton: {
    position: "absolute",
    top: "24px",
    left: "24px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "none",
    background: "#ffffff",
    color: "#243b53",
    padding: "10px 16px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow:
      "0 5px 18px rgba(37, 99, 235, 0.08)",
  },

  card: {
    width: "100%",
    maxWidth: "480px",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "38px",
    boxSizing: "border-box",
    boxShadow:
      "0 20px 60px rgba(30, 64, 175, 0.12)",
    border:
      "1px solid rgba(148, 163, 184, 0.18)",
  },

  logoWrapper: {
    width: "68px",
    height: "68px",
    borderRadius: "20px",
    margin: "0 auto 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #2563eb, #06b6d4)",
    color: "#ffffff",
    boxShadow:
      "0 12px 28px rgba(37, 99, 235, 0.25)",
  },

  title: {
    margin: "0",
    textAlign: "center",
    color: "#102a43",
    fontSize: "27px",
    fontWeight: "750",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin:
      "9px 0 26px",
    textAlign: "center",
    color: "#6b7c93",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "12px 14px",
    marginBottom: "20px",
    background: "#fff1f2",
    border:
      "1px solid #fecdd3",
    borderRadius: "12px",
    color: "#be123c",
    fontSize: "13px",
    lineHeight: "1.4",
  },

  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "12px 14px",
    marginBottom: "20px",
    background: "#f0fdf4",
    border:
      "1px solid #bbf7d0",
    borderRadius: "12px",
    color: "#15803d",
    fontSize: "13px",
    lineHeight: "1.4",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "17px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    color: "#243b53",
    fontSize: "13px",
    fontWeight: "650",
  },

  inputWrapper: {
    position: "relative",
    width: "100%",
  },

  inputIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#829ab1",
    pointerEvents: "none",
  },

  input: {
    width: "100%",
    height: "49px",
    boxSizing: "border-box",
    border:
      "1px solid #d9e2ec",
    borderRadius: "13px",
    outline: "none",
    padding:
      "0 15px 0 46px",
    fontSize: "14px",
    color: "#102a43",
    background: "#fbfdff",
  },

  select: {
    width: "100%",
    height: "49px",
    boxSizing: "border-box",
    border:
      "1px solid #d9e2ec",
    borderRadius: "13px",
    outline: "none",
    padding:
      "0 15px 0 46px",
    fontSize: "14px",
    color: "#102a43",
    background: "#fbfdff",
    cursor: "pointer",
  },

  eyeButton: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "36px",
    height: "36px",
    border: "none",
    background: "transparent",
    color: "#829ab1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    borderRadius: "8px",
  },

  helperText: {
    color: "#829ab1",
    fontSize: "11px",
    marginTop: "1px",
  },

  createButton: {
    width: "100%",
    height: "52px",
    marginTop: "5px",
    border: "none",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #2563eb, #0891b2)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    fontSize: "15px",
    fontWeight: "700",
    boxShadow:
      "0 10px 24px rgba(37, 99, 235, 0.22)",
  },

  loginSection: {
    marginTop: "24px",
    paddingTop: "21px",
    borderTop:
      "1px solid #edf2f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    flexWrap: "wrap",
  },

  loginText: {
    color: "#6b7c93",
    fontSize: "13px",
  },

  loginLink: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#2563eb",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "700",
  },

  infoBox: {
    marginTop: "18px",
    padding: "12px 14px",
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    background: "#f0f9ff",
    border:
      "1px solid #bae6fd",
    borderRadius: "12px",
    color: "#075985",
    fontSize: "11px",
    lineHeight: "1.5",
  },
};

export default ResidentSignup;