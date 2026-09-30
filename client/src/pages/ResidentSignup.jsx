import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  UserRound,
  Home,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  UserPlus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const RESIDENT_LIST_API =
  "http://localhost:5000/api/users/resident-list";

const REGISTER_API =
  "http://localhost:5000/api/users/register";

function ResidentSignup() {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [residents, setResidents] = useState([]);

  const [form, setForm] = useState({
    name: "",
    flat: "",
    password: "",
    confirmPassword: "",
  });

  const [loadingResidents, setLoadingResidents] =
    useState(true);

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] =
    useState("");

  // =====================================================
  // LOAD PRE-LISTED RESIDENTS
  // =====================================================

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async () => {
    setLoadingResidents(true);

    try {
      const response = await fetch(
        RESIDENT_LIST_API
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to load resident list."
        );
      }

      const residentList =
        result.residents ||
        result.data ||
        [];

      setResidents(
        Array.isArray(residentList)
          ? residentList
          : []
      );
    } catch (error) {
      console.error(
        "Resident list error:",
        error
      );

      setResidents([]);

      setMessage(
        "Unable to load the resident list. Please make sure the backend is running."
      );

      setMessageType("error");
    } finally {
      setLoadingResidents(false);
    }
  };

  // =====================================================
  // GO TO LOGIN
  // =====================================================

  const goToLogin = () => {
    navigate("/resident", {
      replace: true,
    });
  };

  // =====================================================
  // HANDLE NAME SELECTION
  // =====================================================

  const handleNameChange = (e) => {
    const selectedName = e.target.value;

    const selectedResident =
      residents.find(
        (resident) =>
          resident.name === selectedName
      );

    setForm((previous) => ({
      ...previous,
      name: selectedName,
      flat: selectedResident
        ? selectedResident.flat
        : "",
    }));

    setMessage("");
    setMessageType("");
  };

  // =====================================================
  // HANDLE PASSWORD
  // =====================================================

  const handlePasswordChange = (e) => {
    setForm((previous) => ({
      ...previous,
      password: e.target.value,
    }));

    setMessage("");
    setMessageType("");
  };

  // =====================================================
  // HANDLE CONFIRM PASSWORD
  // =====================================================

  const handleConfirmPasswordChange = (e) => {
    setForm((previous) => ({
      ...previous,
      confirmPassword: e.target.value,
    }));

    setMessage("");
    setMessageType("");
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    if (!form.name) {
      return "Please select your name.";
    }

    if (!form.flat) {
      return "Flat could not be assigned. Please contact the administrator.";
    }

    if (!form.password) {
      return "Please create a password.";
    }

    if (form.password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (!form.confirmPassword) {
      return "Please confirm your password.";
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      return "Passwords do not match.";
    }

    return "";
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      name: "",
      flat: "",
      password: "",
      confirmPassword: "",
    });

    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setMessage("");
    setMessageType("");

    const validationError =
      validateForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        REGISTER_API,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: form.name,
            password: form.password,
            confirmPassword:
              form.confirmPassword,
          }),
        }
      );

      let result = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Registration failed."
        );
      }

      // =================================================
      // SAVE LOGIN SESSION
      // =================================================

      if (result.token) {
        localStorage.setItem(
          "authToken",
          result.token
        );
      }

      if (result.user) {
        localStorage.setItem(
          "currentUser",
          JSON.stringify(result.user)
        );

        localStorage.setItem(
          "loggedInResident",
          JSON.stringify(result.user)
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      setMessage(
        "Account created successfully! Redirecting to login..."
      );

      setMessageType("success");

      resetForm();

      setTimeout(() => {
        navigate("/resident", {
          replace: true,
        });
      }, 1200);
    } catch (error) {
      console.error(
        "Resident registration error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to create account. Please try again."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f5f9ff 0%, #eaf4ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 20px",
        boxSizing: "border-box",
      }}
    >
      {/* BACK TO LOGIN */}

      <button
        type="button"
        onClick={goToLogin}
        style={{
          position: "fixed",
          top: "28px",
          left: "38px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          border: "none",
          background: "#ffffff",
          color: "#173b63",
          padding: "14px 20px",
          borderRadius: "14px",
          fontSize: "15px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow:
            "0 8px 25px rgba(15, 23, 42, 0.08)",
          zIndex: 10,
        }}
      >
        <ArrowLeft size={20} />
        Back to Login
      </button>

      {/* CARD */}

      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "#ffffff",
          borderRadius: "26px",
          padding: "38px",
          boxSizing: "border-box",
          boxShadow:
            "0 25px 70px rgba(15, 23, 42, 0.12)",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "92px",
              height: "92px",
              margin: "0 auto 20px",
              borderRadius: "25px",
              background:
                "linear-gradient(135deg, #2563eb, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow:
                "0 15px 35px rgba(37, 99, 235, 0.25)",
            }}
          >
            <ShieldCheck size={48} />
          </div>

          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "28px",
              fontWeight: 800,
              color: "#0f2f50",
            }}
          >
            Create Resident Account
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            Select your registered name and
            create your password
          </p>
        </div>

        {/* MESSAGE */}

        {message && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "13px 14px",
              borderRadius: "13px",
              marginBottom: "20px",

              background:
                messageType === "success"
                  ? "#ecfdf5"
                  : "#fff1f2",

              border:
                messageType === "success"
                  ? "1px solid #a7f3d0"
                  : "1px solid #fecdd3",

              color:
                messageType === "success"
                  ? "#047857"
                  : "#be123c",

              fontSize: "13px",
              lineHeight: 1.5,
            }}
          >
            {messageType === "success" ? (
              <CheckCircle2
                size={18}
                style={{
                  flexShrink: 0,
                }}
              />
            ) : (
              <AlertCircle
                size={18}
                style={{
                  flexShrink: 0,
                }}
              />
            )}

            <span>{message}</span>
          </div>
        )}

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          {/* PRE-LISTED NAME */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#1e3a5f",
              }}
            >
              Pre-Listed Resident Name
            </label>

            <div
              style={{
                position: "relative",
              }}
            >
              <UserRound
                size={19}
                style={{
                  position: "absolute",
                  left: "15px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  color: "#7c9ab8",
                  pointerEvents: "none",
                }}
              />

              <select
                value={form.name}
                onChange={handleNameChange}
                disabled={loadingResidents}
                style={{
                  width: "100%",
                  height: "54px",
                  padding:
                    "0 45px 0 46px",
                  borderRadius: "14px",
                  border:
                    "1px solid #d8e4f0",
                  background: "#fafdff",
                  color: form.name
                    ? "#173b63"
                    : "#94a3b8",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                  cursor:
                    loadingResidents
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <option value="">
                  {loadingResidents
                    ? "Loading residents..."
                    : residents.length === 0
                    ? "No residents available"
                    : "Select your name"}
                </option>

                {residents.map(
                  (resident, index) => (
                    <option
                      key={
                        resident._id ||
                        resident.id ||
                        `${resident.name}-${index}`
                      }
                      value={resident.name}
                    >
                      {resident.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <p
              style={{
                margin:
                  "7px 0 0 3px",
                fontSize: "12px",
                color: "#7b8fa6",
              }}
            >
              Only residents added by the
              administrator can register.
            </p>
          </div>

          {/* ASSIGNED FLAT */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#1e3a5f",
              }}
            >
              Assigned Flat
            </label>

            <div
              style={{
                position: "relative",
              }}
            >
              <Home
                size={19}
                style={{
                  position: "absolute",
                  left: "15px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  color: "#2563eb",
                }}
              />

              <input
                type="text"
                value={
                  form.flat
                    ? `Flat ${form.flat}`
                    : ""
                }
                readOnly
                placeholder="Flat will be assigned automatically"
                style={{
                  width: "100%",
                  height: "54px",
                  padding:
                    "0 15px 0 46px",
                  borderRadius: "14px",
                  border:
                    "1px solid #d8e4f0",
                  background: "#f1f7ff",
                  color: "#173b63",
                  fontSize: "15px",
                  fontWeight: 700,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <p
              style={{
                margin:
                  "7px 0 0 3px",
                fontSize: "12px",
                color: "#7b8fa6",
              }}
            >
              Flat number is assigned
              automatically and cannot be changed.
            </p>
          </div>

          {/* PASSWORD */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#1e3a5f",
              }}
            >
              Create Password
            </label>

            <div
              style={{
                position: "relative",
              }}
            >
              <Lock
                size={19}
                style={{
                  position: "absolute",
                  left: "15px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  color: "#7c9ab8",
                }}
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={form.password}
                onChange={
                  handlePasswordChange
                }
                placeholder="Minimum 6 characters"
                style={{
                  width: "100%",
                  height: "54px",
                  padding:
                    "0 48px 0 46px",
                  borderRadius: "14px",
                  border:
                    "1px solid #d8e4f0",
                  background: "#fafdff",
                  color: "#173b63",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
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
                  right: "12px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: "6px",
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

          {/* CONFIRM PASSWORD */}

          <div
            style={{
              marginBottom: "25px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#1e3a5f",
              }}
            >
              Confirm Password
            </label>

            <div
              style={{
                position: "relative",
              }}
            >
              <Lock
                size={19}
                style={{
                  position: "absolute",
                  left: "15px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  color: "#7c9ab8",
                }}
              />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={
                  form.confirmPassword
                }
                onChange={
                  handleConfirmPasswordChange
                }
                placeholder="Re-enter your password"
                style={{
                  width: "100%",
                  height: "54px",
                  padding:
                    "0 48px 0 46px",
                  borderRadius: "14px",
                  border:
                    "1px solid #d8e4f0",
                  background: "#fafdff",
                  color: "#173b63",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: "6px",
                }}
              >
                {showConfirmPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          {/* CREATE ACCOUNT BUTTON */}

          <button
            type="submit"
            disabled={
              loading ||
              loadingResidents ||
              residents.length === 0
            }
            style={{
              width: "100%",
              height: "56px",
              border: "none",
              borderRadius: "15px",
              background:
                loading ||
                loadingResidents ||
                residents.length === 0
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #2563eb, #0891b2)",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 800,
              cursor:
                loading ||
                loadingResidents ||
                residents.length === 0
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
              boxShadow:
                "0 12px 28px rgba(37, 99, 235, 0.22)",
            }}
          >
            <UserPlus size={20} />

            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

          {/* LOGIN */}

          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            <span
              style={{
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Already have an account?{" "}
            </span>

            <button
              type="button"
              onClick={goToLogin}
              style={{
                border: "none",
                background: "transparent",
                color: "#2563eb",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
              }}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResidentSignup;