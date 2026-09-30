import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Settings,
  Save,
  RotateCcw,
  Bell,
  ShieldCheck,
  Camera,
  UserCheck,
  UserRound,
  Ticket,
  Clock3,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SETTINGS_KEY = "visitorHubSettings";

const DEFAULT_SETTINGS = {
  societyName: "Visitors Hub Society",
  societyAddress: "Mumbai, Maharashtra",
  contactEmail: "admin@visitorshub.com",
  contactPhone: "9876543210",

  approvalTime: 2,

  visitorNotifications: true,
  deliveryNotifications: true,
  securityNotifications: true,

  photoVerification: true,
  trustedVisitorAccess: true,
  guestPassAccess: true,
};


// =====================================================
// LOAD SETTINGS
// =====================================================

const getSavedSettings = () => {
  try {
    const saved = JSON.parse(
      localStorage.getItem(SETTINGS_KEY) || "null"
    );

    if (saved && typeof saved === "object") {
      return {
        ...DEFAULT_SETTINGS,
        ...saved,
      };
    }

    return {
      ...DEFAULT_SETTINGS,
    };
  } catch (error) {
    console.error("Failed to load settings:", error);

    return {
      ...DEFAULT_SETTINGS,
    };
  }
};


// =====================================================
// ADMIN SETTINGS
// =====================================================

const AdminSettings = () => {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(
    getSavedSettings()
  );

  const [saved, setSaved] = useState(false);


  // =====================================================
  // LOAD ON PAGE
  // =====================================================

  useEffect(() => {
    setSettings(getSavedSettings());
  }, []);


  // =====================================================
  // UPDATE SETTING
  // =====================================================

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
  };


  // =====================================================
  // SAVE
  // =====================================================

  const handleSave = () => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };


  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset all settings to default values?"
    );

    if (!confirmed) return;

    const defaultValues = {
      ...DEFAULT_SETTINGS,
    };

    setSettings(defaultValues);

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(defaultValues)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fbff 0%, #eef6ff 50%, #ffffff 100%)",
        padding: "28px",
        fontFamily:
          "Inter, Arial, Helvetica, sans-serif",
        color: "#102a43",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >

        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          onClick={() =>
            navigate("/admin/dashboard")
          }
          style={{
            border: "none",
            background: "transparent",
            color: "#2563eb",
            display: "flex",
            alignItems: "center",
            gap: "7px",
            fontWeight: "700",
            cursor: "pointer",
            padding: 0,
            marginBottom: "18px",
          }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>


        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background:
                  "linear-gradient(135deg, #2563eb, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <Settings size={25} />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "29px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                Admin Settings
              </h1>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Configure society information,
                notifications and security options.
              </p>
            </div>
          </div>


          {/* HEADER BUTTONS */}

          <div
            style={{
              display: "flex",
              gap: "9px",
            }}
          >
            <button
              onClick={handleReset}
              style={resetButtonStyle}
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              onClick={handleSave}
              style={saveButtonStyle}
            >
              <Save size={16} />
              Save Settings
            </button>
          </div>
        </div>


        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {saved && (
          <div
            style={{
              background: "#dcfce7",
              border: "1px solid #bbf7d0",
              color: "#166534",
              padding: "12px 15px",
              borderRadius: "12px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              fontWeight: "700",
            }}
          >
            <CheckCircle2 size={17} />
            Settings saved successfully.
          </div>
        )}


        {/* =================================================
            SOCIETY INFORMATION
        ================================================= */}

        <SettingsSection
          icon={<Building2 size={20} />}
          title="Society Information"
          subtitle="Basic information displayed across the application."
        >
          <div className="settings-grid">
            <InputField
              label="Society Name"
              icon={<Building2 size={16} />}
              value={settings.societyName}
              onChange={(value) =>
                updateSetting(
                  "societyName",
                  value
                )
              }
            />

            <InputField
              label="Address"
              icon={<MapPin size={16} />}
              value={settings.societyAddress}
              onChange={(value) =>
                updateSetting(
                  "societyAddress",
                  value
                )
              }
            />

            <InputField
              label="Contact Email"
              icon={<Mail size={16} />}
              type="email"
              value={settings.contactEmail}
              onChange={(value) =>
                updateSetting(
                  "contactEmail",
                  value
                )
              }
            />

            <InputField
              label="Contact Phone"
              icon={<Phone size={16} />}
              value={settings.contactPhone}
              onChange={(value) =>
                updateSetting(
                  "contactPhone",
                  value
                )
              }
            />
          </div>
        </SettingsSection>


        {/* =================================================
            APPROVAL SETTINGS
        ================================================= */}

        <SettingsSection
          icon={<Clock3 size={20} />}
          title="Approval Settings"
          subtitle="Control how long residents have to respond to requests."
        >
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "13px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
                marginBottom: "12px",
              }}
            >
              <div>
                <strong
                  style={{
                    display: "block",
                    color: "#334155",
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
                  Resident Approval Time
                </strong>

                <span
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  Time allowed for visitor or delivery
                  approval.
                </span>
              </div>

              <select
                value={settings.approvalTime}
                onChange={(e) =>
                  updateSetting(
                    "approvalTime",
                    Number(e.target.value)
                  )
                }
                style={{
                  padding: "10px 13px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "9px",
                  background: "#ffffff",
                  fontWeight: "700",
                  outline: "none",
                }}
              >
                <option value={1}>
                  1 Minute
                </option>

                <option value={2}>
                  2 Minutes
                </option>

                <option value={3}>
                  3 Minutes
                </option>

                <option value={4}>
                  4 Minutes
                </option>

                <option value={5}>
                  5 Minutes
                </option>

                <option value={10}>
                  10 Minutes
                </option>
              </select>
            </div>

            <div
              style={{
                height: "7px",
                background: "#e2e8f0",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(
                    settings.approvalTime * 10,
                    100
                  )}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, #2563eb, #06b6d4)",
                  borderRadius: "20px",
                }}
              />
            </div>
          </div>
        </SettingsSection>


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <SettingsSection
          icon={<Bell size={20} />}
          title="Notifications"
          subtitle="Choose which application notifications are enabled."
        >
          <ToggleRow
            icon={<UserRound size={18} />}
            title="Visitor Notifications"
            description="Notify residents when a visitor request is created."
            checked={
              settings.visitorNotifications
            }
            onChange={(value) =>
              updateSetting(
                "visitorNotifications",
                value
              )
            }
          />

          <ToggleRow
            icon={<Bell size={18} />}
            title="Delivery Notifications"
            description="Notify residents about incoming deliveries."
            checked={
              settings.deliveryNotifications
            }
            onChange={(value) =>
              updateSetting(
                "deliveryNotifications",
                value
              )
            }
          />

          <ToggleRow
            icon={<ShieldCheck size={18} />}
            title="Security Notifications"
            description="Enable security-related activity alerts."
            checked={
              settings.securityNotifications
            }
            onChange={(value) =>
              updateSetting(
                "securityNotifications",
                value
              )
            }
            last
          />
        </SettingsSection>


        {/* =================================================
            SECURITY
        ================================================= */}

        <SettingsSection
          icon={<ShieldCheck size={20} />}
          title="Security & Access"
          subtitle="Configure additional visitor security features."
        >
          <ToggleRow
            icon={<Camera size={18} />}
            title="Photo Verification"
            description="Capture visitor photos during registration and verification."
            checked={
              settings.photoVerification
            }
            onChange={(value) =>
              updateSetting(
                "photoVerification",
                value
              )
            }
          />

          <ToggleRow
            icon={<UserCheck size={18} />}
            title="Trusted Visitor Access"
            description="Allow approved trusted visitors according to their schedule."
            checked={
              settings.trustedVisitorAccess
            }
            onChange={(value) =>
              updateSetting(
                "trustedVisitorAccess",
                value
              )
            }
          />

          <ToggleRow
            icon={<Ticket size={18} />}
            title="Guest Pass Access"
            description="Allow residents to create digital guest passes."
            checked={
              settings.guestPassAccess
            }
            onChange={(value) =>
              updateSetting(
                "guestPassAccess",
                value
              )
            }
            last
          />
        </SettingsSection>


        {/* =================================================
            SECURITY NOTE
        ================================================= */}

        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "14px",
            padding: "16px 18px",
            display: "flex",
            alignItems: "flex-start",
            gap: "11px",
            marginBottom: "20px",
          }}
        >
          <ShieldCheck
            size={21}
            color="#2563eb"
          />

          <div>
            <strong
              style={{
                display: "block",
                color: "#1e40af",
                fontSize: "13px",
                marginBottom: "4px",
              }}
            >
              Security Reminder
            </strong>

            <span
              style={{
                color: "#475569",
                fontSize: "12px",
                lineHeight: 1.6,
              }}
            >
              Settings control the behaviour of
              the Visitors Hub application.
              Visitor access should still be
              verified by the security guard
              according to society rules.
            </span>
          </div>
        </div>


        {/* =================================================
            BOTTOM SAVE
        ================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "30px",
          }}
        >
          <button
            onClick={handleSave}
            style={saveButtonStyle}
          >
            <Save size={17} />
            Save Settings
          </button>
        </div>
      </div>


      {/* =================================================
          RESPONSIVE STYLE
      ================================================= */}

      <style>
        {`
          .settings-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          @media (max-width: 700px) {
            .settings-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </div>
  );
};


// =====================================================
// SETTINGS SECTION
// =====================================================

const SettingsSection = ({
  icon,
  title,
  subtitle,
  children,
}) => {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "20px",
        marginBottom: "20px",
        boxShadow:
          "0 7px 22px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "11px",
            background: "#eff6ff",
            color: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              color: "#0f172a",
            }}
          >
            {title}
          </h2>

          <p
            style={{
              margin: "4px 0 0",
              color: "#64748b",
              fontSize: "12px",
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
};


// =====================================================
// INPUT FIELD
// =====================================================

const InputField = ({
  label,
  icon,
  value,
  onChange,
  type = "text",
}) => {
  return (
    <div>
      <label
        style={{
          display: "block",
          color: "#334155",
          fontSize: "12px",
          fontWeight: "800",
          marginBottom: "7px",
        }}
      >
        {label}
      </label>

      <div
        style={{
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform:
              "translateY(-50%)",
            color: "#64748b",
            pointerEvents: "none",
          }}
        >
          {icon}
        </span>

        <input
          type={type}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding:
              "11px 12px 11px 38px",
            border:
              "1px solid #cbd5e1",
            borderRadius: "10px",
            outline: "none",
            fontSize: "13px",
            color: "#334155",
          }}
        />
      </div>
    </div>
  );
};


// =====================================================
// TOGGLE ROW
// =====================================================

const ToggleRow = ({
  icon,
  title,
  description,
  checked,
  onChange,
  last = false,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "13px",
        padding: "15px 0",
        borderBottom: last
          ? "none"
          : "1px solid #f1f5f9",
      }}
    >
      <div
        style={{
          width: "39px",
          height: "39px",
          borderRadius: "10px",
          background: "#f8fafc",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          flex: 1,
        }}
      >
        <div
          style={{
            color: "#334155",
            fontWeight: "800",
            fontSize: "13px",
            marginBottom: "3px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: "#64748b",
            fontSize: "11px",
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(!checked)
        }
        aria-label={`Toggle ${title}`}
        style={{
          width: "48px",
          height: "27px",
          border: "none",
          borderRadius: "20px",
          background: checked
            ? "#2563eb"
            : "#cbd5e1",
          padding: "3px",
          cursor: "pointer",
          transition:
            "background 0.2s ease",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: "block",
            width: "21px",
            height: "21px",
            borderRadius: "50%",
            background: "#ffffff",
            transform: checked
              ? "translateX(21px)"
              : "translateX(0)",
            transition:
              "transform 0.2s ease",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.15)",
          }}
        />
      </button>
    </div>
  );
};


// =====================================================
// BUTTON STYLES
// =====================================================

const resetButtonStyle = {
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#475569",
  borderRadius: "10px",
  padding: "11px 14px",
  display: "flex",
  alignItems: "center",
  gap: "7px",
  cursor: "pointer",
  fontWeight: "700",
};

const saveButtonStyle = {
  border: "none",
  background:
    "linear-gradient(135deg, #2563eb, #0891b2)",
  color: "#ffffff",
  borderRadius: "10px",
  padding: "11px 16px",
  display: "flex",
  alignItems: "center",
  gap: "7px",
  cursor: "pointer",
  fontWeight: "800",
};


export default AdminSettings;