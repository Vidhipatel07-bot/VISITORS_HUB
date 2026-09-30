import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const PURPOSES = [
  "Personal Visit",
  "Delivery",
  "Service / Repair",
  "Work / Business",
  "Driver",
  "Household Staff",
  "Other",
];

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

function VisitorRegistration() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    flat: "",
    purpose: "",
    photo: "",
    vehicleNumber: "",
    vehicleType: "",
  });

  const [photoPreview, setPhotoPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [submittedVisitor, setSubmittedVisitor] = useState(null);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  // =====================================================
  // PHOTO
  // =====================================================

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be smaller than 5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const image = reader.result;

      setForm((previous) => ({
        ...previous,
        photo: image,
      }));

      setPhotoPreview(image);
      setError("");
    };

    reader.readAsDataURL(file);
  };

  // =====================================================
  // VALIDATE STEP 1
  // =====================================================

  const validateDetails = () => {
    if (!form.name.trim()) {
      setError("Please enter your name.");
      return false;
    }

    if (form.name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return false;
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return false;
    }

    if (!FLATS.includes(form.flat)) {
      setError("Please select a valid flat number.");
      return false;
    }

    return true;
  };

  // =====================================================
  // NEXT STEP
  // =====================================================

  const goToPurpose = () => {
    if (!validateDetails()) return;

    setError("");
    setStep(2);
  };

  // =====================================================
  // NEXT PHOTO
  // =====================================================

  const goToPhoto = () => {
    if (!form.purpose) {
      setError("Please select your purpose of visit.");
      return;
    }

    setError("");
    setStep(3);
  };

  // =====================================================
  // CHECK TRUSTED VISITOR
  // =====================================================

  const checkTrustedVisitor = () => {
    try {
      const stored =
        localStorage.getItem("trustedVisitors");

      if (!stored) {
        return null;
      }

      const trustedVisitors = JSON.parse(stored);

      if (!Array.isArray(trustedVisitors)) {
        return null;
      }

      const today = new Date();

      const dayName = today.toLocaleDateString(
        "en-US",
        {
          weekday: "long",
        }
      );

      const currentMinutes =
        today.getHours() * 60 +
        today.getMinutes();

      const match = trustedVisitors.find((visitor) => {
        if (!visitor) return false;

        const visitorPhone =
          String(visitor.phone || "").replace(/\D/g, "");

        const allowedDays =
          Array.isArray(visitor.allowedDays)
            ? visitor.allowedDays
            : [];

        if (visitorPhone !== form.mobile) {
          return false;
        }

        if (visitor.flat !== form.flat) {
          return false;
        }

        if (visitor.isActive === false) {
          return false;
        }

        if (!allowedDays.includes(dayName)) {
          return false;
        }

        if (!visitor.startTime || !visitor.endTime) {
          return false;
        }

        const [startHour, startMinute] =
          visitor.startTime.split(":").map(Number);

        const [endHour, endMinute] =
          visitor.endTime.split(":").map(Number);

        const start =
          startHour * 60 + startMinute;

        const end =
          endHour * 60 + endMinute;

        return (
          currentMinutes >= start &&
          currentMinutes <= end
        );
      });

      return match || null;
    } catch {
      return null;
    }
  };

  // =====================================================
  // SUBMIT VISITOR
  // =====================================================

  const submitVisitor = async () => {
    if (!form.photo) {
      setError("Please capture or upload your photo.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const trustedVisitor =
      checkTrustedVisitor();

    const visitorPayload = {
      name: form.name.trim(),

      mobile: form.mobile,

      phone: form.mobile,

      flat: form.flat,

      purpose: form.purpose,

      photo: form.photo,

      vehicleNumber:
        form.vehicleNumber.trim(),

      vehicleType:
        form.vehicleType.trim(),

      source: trustedVisitor
        ? "trusted-visitor"
        : "qr-gate",

      trustedVisitorId:
        trustedVisitor?.id ||
        trustedVisitor?._id ||
        null,

      status: trustedVisitor
        ? "trusted-approved"
        : "pending",

      notes: trustedVisitor
        ? "Trusted visitor within allowed schedule."
        : "",
    };

    try {
      // -------------------------------------------------
      // Backend
      // -------------------------------------------------

      const response = await api.post(
        "/visitors",
        visitorPayload
      );

      const backendVisitor =
        response.data?.visitor;

      const finalVisitor = {
        ...visitorPayload,
        ...(backendVisitor || {}),
        id:
          backendVisitor?._id ||
          `visitor-${Date.now()}`,
        createdAt:
          backendVisitor?.createdAt ||
          new Date().toISOString(),
      };

      saveLocalVisitor(finalVisitor);

      setSubmittedVisitor(finalVisitor);
      setSubmitted(true);
      setMessage(
        trustedVisitor
          ? "Trusted visitor verified successfully."
          : "Visitor request sent to the resident."
      );
    } catch (apiError) {
      // -------------------------------------------------
      // Local fallback
      // -------------------------------------------------

      console.log(
        "Backend unavailable. Using local visitor storage."
      );

      const localVisitor = {
        ...visitorPayload,

        id: `visitor-${Date.now()}`,

        createdAt:
          new Date().toISOString(),

        date:
          new Date().toISOString(),

        entryTime: null,

        exitTime: null,

        guardVerified: false,

        verifiedByGuard: false,

        status: trustedVisitor
          ? "trusted-approved"
          : "pending",

        residentId: null,
      };

      saveLocalVisitor(localVisitor);

      setSubmittedVisitor(localVisitor);
      setSubmitted(true);

      setMessage(
        trustedVisitor
          ? "Trusted visitor verified successfully."
          : "Visitor request sent to the resident."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SAVE LOCAL VISITOR
  // =====================================================

  const saveLocalVisitor = (visitor) => {
    try {
      const existing =
        JSON.parse(
          localStorage.getItem(
            "visitorRequests"
          ) || "[]"
        );

      const updated = [
        visitor,
        ...(Array.isArray(existing)
          ? existing
          : []),
      ];

      localStorage.setItem(
        "visitorRequests",
        JSON.stringify(updated)
      );
    } catch (storageError) {
      console.error(
        "Local storage error:",
        storageError
      );
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const registerAnother = () => {
    setForm({
      name: "",
      mobile: "",
      flat: "",
      purpose: "",
      photo: "",
      vehicleNumber: "",
      vehicleType: "",
    });

    setPhotoPreview("");
    setSubmitted(false);
    setSubmittedVisitor(null);
    setMessage("");
    setError("");
    setStep(1);
  };

  // =====================================================
  // SUCCESS SCREEN
  // =====================================================

  if (submitted) {
    const isTrusted =
      submittedVisitor?.status ===
      "trusted-approved";

    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #f7fbff, #eef7ff)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px",
          fontFamily:
            "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            background: "#ffffff",
            borderRadius: "24px",
            padding: "36px",
            textAlign: "center",
            boxShadow:
              "0 20px 60px rgba(20, 60, 100, 0.12)",
          }}
        >
          <div
            style={{
              width: "78px",
              height: "78px",
              borderRadius: "50%",
              margin: "0 auto 20px",
              background: isTrusted
                ? "#dcfce7"
                : "#e0f2fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "38px",
            }}
          >
            {isTrusted ? "✓" : "⏳"}
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              color: "#102a43",
              fontSize: "28px",
            }}
          >
            {isTrusted
              ? "Visitor Verified"
              : "Request Submitted"}
          </h1>

          <p
            style={{
              color: "#627d98",
              lineHeight: 1.6,
              marginBottom: "26px",
            }}
          >
            {isTrusted
              ? "Your trusted visitor access is currently within the allowed schedule. Please proceed to security verification."
              : "Your visitor request has been sent to the resident. Please wait for approval."}
          </p>

          <div
            style={{
              textAlign: "left",
              background: "#f8fafc",
              borderRadius: "16px",
              padding: "18px",
              marginBottom: "24px",
            }}
          >
            <InfoRow
              label="Name"
              value={
                submittedVisitor?.name
              }
            />

            <InfoRow
              label="Flat"
              value={
                submittedVisitor?.flat
              }
            />

            <InfoRow
              label="Purpose"
              value={
                submittedVisitor?.purpose
              }
            />

            <InfoRow
              label="Status"
              value={
                isTrusted
                  ? "Trusted Approved"
                  : "Pending Resident Approval"
              }
              last
            />
          </div>

          <div
            style={{
              background: "#eff6ff",
              borderRadius: "12px",
              padding: "14px",
              color: "#1e40af",
              fontSize: "14px",
              marginBottom: "20px",
            }}
          >
            Security guard will verify your details
            before entry.
          </div>

          <button
            onClick={registerAnother}
            style={primaryButtonStyle}
          >
            Register Another Visitor
          </button>

          <button
            onClick={() => navigate("/")}
            style={secondaryButtonStyle}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f7fbff, #eef7ff)",
        fontFamily:
          "Inter, Arial, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "26px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "13px",
                background:
                  "linear-gradient(135deg, #2563eb, #06b6d4)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              🛡
            </div>

            <h1
              style={{
                margin: 0,
                color: "#102a43",
                fontSize: "28px",
              }}
            >
              Visitors Hub
            </h1>
          </div>

          <p
            style={{
              margin: 0,
              color: "#627d98",
            }}
          >
            Smart Visitor Registration
          </p>
        </div>

        {/* PROGRESS */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <StepCircle
            number="1"
            label="Details"
            active={step >= 1}
          />

          <StepLine active={step >= 2} />

          <StepCircle
            number="2"
            label="Purpose"
            active={step >= 2}
          />

          <StepLine active={step >= 3} />

          <StepCircle
            number="3"
            label="Photo"
            active={step >= 3}
          />
        </div>

        {/* CARD */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "28px",
            boxShadow:
              "0 20px 60px rgba(20, 60, 100, 0.10)",
          }}
        >
          {/* ERROR */}

          {error && (
            <div
              style={{
                background: "#fef2f2",
                color: "#b91c1c",
                padding: "13px 15px",
                borderRadius: "12px",
                marginBottom: "18px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {/* MESSAGE */}

          {message && (
            <div
              style={{
                background: "#ecfdf5",
                color: "#047857",
                padding: "13px 15px",
                borderRadius: "12px",
                marginBottom: "18px",
                fontSize: "14px",
              }}
            >
              {message}
            </div>
          )}

          {/* ============================================
              STEP 1
          ============================================ */}

          {step === 1 && (
            <>
              <SectionTitle
                title="Your Details"
                subtitle="Enter the basic information required for visitor verification."
              />

              <InputField
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />

              <InputField
                label="Mobile Number"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                inputMode="numeric"
              />

              <label style={labelStyle}>
                Flat Number
              </label>

              <select
                name="flat"
                value={form.flat}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">
                  Select flat number
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

              <button
                onClick={goToPurpose}
                style={primaryButtonStyle}
              >
                Continue →
              </button>
            </>
          )}

          {/* ============================================
              STEP 2
          ============================================ */}

          {step === 2 && (
            <>
              <SectionTitle
                title="Purpose of Visit"
                subtitle="Select the reason for your visit."
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                }}
              >
                {PURPOSES.map((purpose) => {
                  const selected =
                    form.purpose === purpose;

                  return (
                    <button
                      key={purpose}
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          purpose,
                        }))
                      }
                      style={{
                        padding: "17px",
                        borderRadius: "14px",
                        border: selected
                          ? "2px solid #2563eb"
                          : "1px solid #d9e2ec",
                        background: selected
                          ? "#eff6ff"
                          : "#ffffff",
                        color: selected
                          ? "#1d4ed8"
                          : "#243b53",
                        fontWeight: 600,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {selected ? "✓ " : ""}
                      {purpose}
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "20px",
                  borderTop:
                    "1px solid #e5e7eb",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 5px",
                    color: "#243b53",
                    fontSize: "16px",
                  }}
                >
                  Vehicle Details
                  <span
                    style={{
                      color: "#829ab1",
                      fontWeight: 400,
                      fontSize: "13px",
                    }}
                  >
                    {" "}
                    (Optional)
                  </span>
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "12px",
                    marginTop: "12px",
                  }}
                >
                  <input
                    name="vehicleNumber"
                    value={
                      form.vehicleNumber
                    }
                    onChange={handleChange}
                    placeholder="Vehicle number"
                    style={inputStyle}
                  />

                  <input
                    name="vehicleType"
                    value={
                      form.vehicleType
                    }
                    onChange={handleChange}
                    placeholder="Vehicle type"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <button
                  onClick={() => {
                    setError("");
                    setStep(1);
                  }}
                  style={secondaryButtonStyle}
                >
                  ← Back
                </button>

                <button
                  onClick={goToPhoto}
                  style={{
                    ...primaryButtonStyle,
                    marginTop: 0,
                  }}
                >
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* ============================================
              STEP 3
          ============================================ */}

          {step === 3 && (
            <>
              <SectionTitle
                title="Photo Verification"
                subtitle="Capture or upload a clear photo for security verification."
              />

              <div
                style={{
                  border:
                    "2px dashed #bfdbfe",
                  borderRadius: "18px",
                  padding: "25px",
                  textAlign: "center",
                  background: "#f8fbff",
                }}
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Visitor preview"
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "18px",
                      objectFit: "cover",
                      display: "block",
                      margin:
                        "0 auto 18px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: "52px",
                      marginBottom: "12px",
                    }}
                  >
                    📷
                  </div>
                )}

                <label
                  style={{
                    display:
                      "inline-block",
                    background:
                      "#2563eb",
                    color: "#ffffff",
                    padding:
                      "12px 20px",
                    borderRadius:
                      "10px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {photoPreview
                    ? "Change Photo"
                    : "Capture / Upload Photo"}

                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={
                      handlePhoto
                    }
                    style={{
                      display: "none",
                    }}
                  />
                </label>

                <p
                  style={{
                    color: "#829ab1",
                    fontSize: "13px",
                    margin:
                      "12px 0 0",
                  }}
                >
                  Use a clear front-facing
                  photo.
                </p>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  padding: "15px",
                  borderRadius: "12px",
                  marginTop: "18px",
                  color: "#486581",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                🔐 Your photo is used as an
                additional security verification
                layer. The security guard will
                still verify your entry.
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <button
                  onClick={() => {
                    setError("");
                    setStep(2);
                  }}
                  style={secondaryButtonStyle}
                >
                  ← Back
                </button>

                <button
                  onClick={submitVisitor}
                  disabled={loading}
                  style={{
                    ...primaryButtonStyle,
                    marginTop: 0,
                    opacity: loading
                      ? 0.7
                      : 1,
                  }}
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Visitor Request"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}

        <p
          style={{
            textAlign: "center",
            color: "#829ab1",
            fontSize: "12px",
            marginTop: "18px",
          }}
        >
          Visitors Hub • Smart & Secure
          Visitor Management
        </p>
      </div>
    </div>
  );
}


// =====================================================
// SMALL COMPONENTS
// =====================================================

function SectionTitle({
  title,
  subtitle,
}) {
  return (
    <div
      style={{
        marginBottom: "22px",
      }}
    >
      <h2
        style={{
          margin: "0 0 7px",
          color: "#102a43",
          fontSize: "22px",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin: 0,
          color: "#627d98",
          fontSize: "14px",
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}


function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  maxLength,
  inputMode,
}) {
  return (
    <div
      style={{
        marginBottom: "17px",
      }}
    >
      <label style={labelStyle}>
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        style={inputStyle}
      />
    </div>
  );
}


function InfoRow({
  label,
  value,
  last = false,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "15px",
        padding: "10px 0",
        borderBottom: last
          ? "none"
          : "1px solid #e5e7eb",
      }}
    >
      <span
        style={{
          color: "#829ab1",
          fontSize: "13px",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          color: "#243b53",
          fontSize: "13px",
          textAlign: "right",
        }}
      >
        {value || "-"}
      </strong>
    </div>
  );
}


function StepCircle({
  number,
  label,
  active,
}) {
  return (
    <div
      style={{
        textAlign: "center",
        minWidth: "70px",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          margin: "0 auto 5px",
          borderRadius: "50%",
          background: active
            ? "#2563eb"
            : "#e5e7eb",
          color: active
            ? "#ffffff"
            : "#829ab1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: "14px",
        }}
      >
        {number}
      </div>

      <span
        style={{
          fontSize: "11px",
          color: active
            ? "#2563eb"
            : "#829ab1",
          fontWeight: active
            ? 600
            : 400,
        }}
      >
        {label}
      </span>
    </div>
  );
}


function StepLine({ active }) {
  return (
    <div
      style={{
        width: "55px",
        height: "2px",
        background: active
          ? "#2563eb"
          : "#e5e7eb",
        marginBottom: "20px",
      }}
    />
  );
}


// =====================================================
// STYLES
// =====================================================

const labelStyle = {
  display: "block",
  color: "#334e68",
  fontWeight: 600,
  fontSize: "14px",
  marginBottom: "7px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  border: "1px solid #d9e2ec",
  borderRadius: "10px",
  outline: "none",
  background: "#ffffff",
  color: "#243b53",
  fontSize: "14px",
};

const primaryButtonStyle = {
  width: "100%",
  border: "none",
  borderRadius: "11px",
  padding: "14px 18px",
  background:
    "linear-gradient(135deg, #2563eb, #0891b2)",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 700,
  cursor: "pointer",
  marginTop: "24px",
};

const secondaryButtonStyle = {
  flex: 1,
  border: "1px solid #d9e2ec",
  borderRadius: "11px",
  padding: "14px 18px",
  background: "#ffffff",
  color: "#334e68",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};


export default VisitorRegistration;