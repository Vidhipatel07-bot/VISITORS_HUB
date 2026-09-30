import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  QrCode,
  Plus,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  UserRound,
  Phone,
  CalendarDays,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import api from "../utils/api";

const LOCAL_KEY = "guestPasses";

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

const emptyForm = {
  guestName: "",
  phone: "",
  flat: "A-101",
  date: "",
  startTime: "09:00",
  endTime: "21:00",
  purpose: "Personal Visit",
};

const getResident = () => {
  try {
    const data = localStorage.getItem("currentUser");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const getLocalPasses = () => {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocalPasses = (passes) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(passes));
};

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const generatePassId = () => {
  return `VH-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isExpired = (pass) => {
  if (!pass?.date || !pass?.endTime) return false;

  const end = new Date(
    `${pass.date}T${pass.endTime}:00`
  );

  return Date.now() > end.getTime();
};

const GuestPass = () => {
  const resident = getResident();

  const [form, setForm] = useState({
    ...emptyForm,
    flat: resident?.flat || "A-101",
    date: getToday(),
  });

  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [selectedPass, setSelectedPass] = useState(null);
  const [copied, setCopied] = useState(false);

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const loadPasses = async () => {
    setLoading(true);

    try {
      const response = await api.get("/guest-passes");

      const backendPasses =
        response.data?.guestPasses ||
        response.data?.passes ||
        response.data ||
        [];

      if (Array.isArray(backendPasses)) {
        setPasses(backendPasses);
        saveLocalPasses(backendPasses);
      }
    } catch (error) {
      const localPasses = getLocalPasses();

      const filtered = resident?.flat
        ? localPasses.filter(
            (pass) => pass.flat === resident.flat
          )
        : localPasses;

      setPasses(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPasses();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.guestName.trim()) {
      showMessage(
        "Please enter guest name.",
        "error"
      );
      return false;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      showMessage(
        "Phone number must contain exactly 10 digits.",
        "error"
      );
      return false;
    }

    if (!form.flat) {
      showMessage(
        "Please select a flat.",
        "error"
      );
      return false;
    }

    if (!form.date) {
      showMessage(
        "Please select a date.",
        "error"
      );
      return false;
    }

    if (form.startTime >= form.endTime) {
      showMessage(
        "End time must be later than start time.",
        "error"
      );
      return false;
    }

    return true;
  };

  const createGuestPass = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setCreating(true);

    const passId = generatePassId();

    const passData = {
      passId,
      guestName: form.guestName.trim(),
      name: form.guestName.trim(),
      phone: form.phone.trim(),
      flat: form.flat,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      purpose: form.purpose,
      isActive: true,
    };

    try {
      const response = await api.post(
        "/guest-passes",
        passData
      );

      const createdPass =
        response.data?.guestPass ||
        response.data?.pass ||
        response.data;

      if (createdPass) {
        const updated = [
          createdPass,
          ...passes,
        ];

        setPasses(updated);
        saveLocalPasses(updated);
        setSelectedPass(createdPass);
      }

      setForm({
        ...emptyForm,
        flat: resident?.flat || "A-101",
        date: getToday(),
      });

      showMessage(
        "Guest pass created successfully."
      );
    } catch (error) {
      const localPass = {
        ...passData,
        id: passId,
        _id: passId,
        residentId:
          resident?.id ||
          resident?._id ||
          "demo-resident-001",
        createdAt: new Date().toISOString(),
      };

      const existing = getLocalPasses();

      const updated = [
        localPass,
        ...existing,
      ];

      saveLocalPasses(updated);

      setPasses(
        resident?.flat
          ? updated.filter(
              (pass) =>
                pass.flat === resident.flat
            )
          : updated
      );

      setSelectedPass(localPass);

      setForm({
        ...emptyForm,
        flat: resident?.flat || "A-101",
        date: getToday(),
      });

      showMessage(
        "Guest pass created successfully."
      );
    } finally {
      setCreating(false);
    }
  };

  const deactivatePass = async (pass) => {
    const passId = pass._id || pass.id || pass.passId;

    if (pass.usedAt) {
      showMessage(
        "A used guest pass cannot be reactivated.",
        "error"
      );
      return;
    }

    try {
      await api.put(
        `/guest-passes/${passId}/status`,
        {
          isActive: false,
        }
      );
    } catch {
      // Local fallback below
    }

    const updated = passes.map((item) =>
      (item._id ||
        item.id ||
        item.passId) === passId
        ? {
            ...item,
            isActive: false,
            deactivatedAt:
              new Date().toISOString(),
          }
        : item
    );

    setPasses(updated);
    saveLocalPasses(updated);

    if (
      selectedPass &&
      (selectedPass._id ||
        selectedPass.id ||
        selectedPass.passId) === passId
    ) {
      setSelectedPass({
        ...selectedPass,
        isActive: false,
        deactivatedAt:
          new Date().toISOString(),
      });
    }

    showMessage("Guest pass deactivated.");
  };

  const deletePass = async (pass) => {
    const passId = pass._id || pass.id || pass.passId;

    if (pass.usedAt) {
      showMessage(
        "Used passes cannot be deleted.",
        "error"
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete guest pass for ${
        pass.guestName || pass.name
      }?`
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/guest-passes/${passId}`
      );
    } catch {
      // Local fallback
    }

    const updated = passes.filter(
      (item) =>
        (item._id ||
          item.id ||
          item.passId) !== passId
    );

    setPasses(updated);
    saveLocalPasses(updated);

    if (
      selectedPass &&
      (selectedPass._id ||
        selectedPass.id ||
        selectedPass.passId) === passId
    ) {
      setSelectedPass(null);
    }

    showMessage("Guest pass deleted.");
  };

  const qrValue = useMemo(() => {
    if (!selectedPass) return "";

    return JSON.stringify({
      type: "VISITORS_HUB_GUEST_PASS",
      passId:
        selectedPass.passId ||
        selectedPass.id ||
        selectedPass._id,
      guestName:
        selectedPass.guestName ||
        selectedPass.name,
      phone: selectedPass.phone,
      flat: selectedPass.flat,
      date: selectedPass.date,
      startTime: selectedPass.startTime,
      endTime: selectedPass.endTime,
      purpose: selectedPass.purpose,
    });
  }, [selectedPass]);

  const copyPassId = async (passId) => {
    try {
      await navigator.clipboard.writeText(
        passId
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      showMessage(
        "Unable to copy pass ID.",
        "error"
      );
    }
  };

  const activeCount = passes.filter(
    (pass) =>
      pass.isActive !== false &&
      !pass.usedAt &&
      !isExpired(pass)
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f7fbff 0%, #eef7ff 100%)",
        padding: "30px",
        fontFamily:
          "Inter, Arial, sans-serif",
        color: "#172033",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/resident/dashboard"
            style={{
              textDecoration: "none",
              color: "#334155",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={18} />
            Dashboard
          </Link>

          <div
            style={{
              width: "1px",
              height: "25px",
              background: "#cbd5e1",
            }}
          />

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "30px",
                fontWeight: 800,
              }}
            >
              Guest Pass
            </h1>

            <p
              style={{
                margin: "5px 0 0",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Create a QR guest pass for
              pre-invited visitors.
            </p>
          </div>

          <div
            style={{
              marginLeft: "auto",
              background: "#ffffff",
              borderRadius: "14px",
              padding: "12px 17px",
              boxShadow:
                "0 7px 22px rgba(15,23,42,0.07)",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              {activeCount}
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
              }}
            >
              Active Passes
            </div>
          </div>
        </div>

        {/* MESSAGE */}

        {message && (
          <div
            style={{
              marginBottom: "20px",
              padding: "13px 17px",
              borderRadius: "11px",
              background:
                messageType === "error"
                  ? "#fee2e2"
                  : "#dcfce7",
              color:
                messageType === "error"
                  ? "#991b1b"
                  : "#166534",
              fontWeight: 700,
              fontSize: "13px",
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(320px, 390px) 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* CREATE FORM */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "24px",
              boxShadow:
                "0 10px 30px rgba(15,23,42,0.07)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <Plus size={22} />

              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                }}
              >
                Create New Pass
              </h2>
            </div>

            <form onSubmit={createGuestPass}>
              <label style={labelStyle}>
                Guest Name
              </label>

              <input
                name="guestName"
                value={form.guestName}
                onChange={handleChange}
                placeholder="Enter guest name"
                style={inputStyle}
              />

              <label style={labelStyle}>
                Mobile Number
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10 digit mobile number"
                inputMode="numeric"
                maxLength={10}
                style={inputStyle}
              />

              <label style={labelStyle}>
                Flat
              </label>

              <select
                name="flat"
                value={form.flat}
                onChange={handleChange}
                style={inputStyle}
              >
                {FLATS.map((flat) => (
                  <option
                    key={flat}
                    value={flat}
                  >
                    {flat}
                  </option>
                ))}
              </select>

              <label style={labelStyle}>
                Purpose
              </label>

              <select
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                style={inputStyle}
              >
                <option>
                  Personal Visit
                </option>
                <option>
                  Family Visit
                </option>
                <option>
                  Friend Visit
                </option>
                <option>
                  Work / Business
                </option>
                <option>
                  Other
                </option>
              </select>

              <label style={labelStyle}>
                Date
              </label>

              <input
                type="date"
                name="date"
                value={form.date}
                min={getToday()}
                onChange={handleChange}
                style={inputStyle}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Start Time
                  </label>

                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    End Time
                  </label>

                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: "11px",
                  padding: "13px",
                  background: creating
                    ? "#94a3b8"
                    : "#2563eb",
                  color: "#ffffff",
                  fontWeight: 800,
                  cursor: creating
                    ? "not-allowed"
                    : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  gap: "8px",
                  marginTop: "4px",
                }}
              >
                <QrCode size={18} />

                {creating
                  ? "Creating..."
                  : "Generate Guest Pass"}
              </button>
            </form>
          </div>

          {/* PASS LIST */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "24px",
              boxShadow:
                "0 10px 30px rgba(15,23,42,0.07)",
            }}
          >
            <h2
              style={{
                margin: "0 0 5px",
                fontSize: "20px",
              }}
            >
              Guest Passes
            </h2>

            <p
              style={{
                margin: "0 0 20px",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Share the QR code with your guest.
            </p>

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px",
                  color: "#64748b",
                }}
              >
                Loading guest passes...
              </div>
            ) : passes.length === 0 ? (
              <div
                style={{
                  padding: "50px 20px",
                  textAlign: "center",
                  border:
                    "1px dashed #cbd5e1",
                  borderRadius: "15px",
                  color: "#64748b",
                }}
              >
                <QrCode
                  size={40}
                  style={{
                    marginBottom: "10px",
                  }}
                />

                <div
                  style={{
                    fontWeight: 800,
                    color: "#334155",
                    marginBottom: "5px",
                  }}
                >
                  No guest passes
                </div>

                <div
                  style={{
                    fontSize: "13px",
                  }}
                >
                  Create your first guest pass
                  using the form.
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                {passes.map((pass) => {
                  const passId =
                    pass.passId ||
                    pass.id ||
                    pass._id;

                  const guestName =
                    pass.guestName ||
                    pass.name ||
                    "Guest";

                  const active =
                    pass.isActive !== false &&
                    !pass.usedAt &&
                    !isExpired(pass);

                  const used =
                    Boolean(pass.usedAt);

                  return (
                    <div
                      key={passId}
                      style={{
                        border:
                          "1px solid #e2e8f0",
                        borderRadius: "15px",
                        padding: "17px",
                        background: active
                          ? "#ffffff"
                          : "#f8fafc",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: "12px",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "45px",
                              height: "45px",
                              borderRadius:
                                "12px",
                              background:
                                "#eff6ff",
                              display: "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                            }}
                          >
                            <QrCode
                              size={21}
                            />
                          </div>

                          <div>
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize:
                                  "16px",
                              }}
                            >
                              {guestName}
                            </div>

                            <div
                              style={{
                                color:
                                  "#64748b",
                                fontSize:
                                  "12px",
                                marginTop:
                                  "3px",
                              }}
                            >
                              {pass.flat} •{" "}
                              {pass.purpose}
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            padding:
                              "6px 10px",
                            borderRadius:
                              "20px",
                            background:
                              active
                                ? "#dcfce7"
                                : used
                                ? "#e0e7ff"
                                : "#f1f5f9",
                            color:
                              active
                                ? "#166534"
                                : used
                                ? "#3730a3"
                                : "#64748b",
                            fontSize:
                              "10px",
                            fontWeight: 800,
                            height:
                              "fit-content",
                          }}
                        >
                          {active
                            ? "ACTIVE"
                            : used
                            ? "USED"
                            : isExpired(
                                pass
                              )
                            ? "EXPIRED"
                            : "INACTIVE"}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(2, minmax(0, 1fr))",
                          gap: "10px",
                          marginTop:
                            "15px",
                        }}
                      >
                        <InfoItem
                          icon={
                            <Phone size={15} />
                          }
                          text={pass.phone}
                        />

                        <InfoItem
                          icon={
                            <CalendarDays
                              size={15}
                            />
                          }
                          text={formatDate(
                            pass.date
                          )}
                        />

                        <InfoItem
                          icon={
                            <Clock
                              size={15}
                            />
                          }
                          text={`${pass.startTime} - ${pass.endTime}`}
                        />

                        <InfoItem
                          icon={
                            <ShieldCheck
                              size={15}
                            />
                          }
                          text={`Pass ID: ${passId}`}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent:
                            "flex-end",
                          flexWrap: "wrap",
                          marginTop:
                            "16px",
                        }}
                      >
                        <button
                          onClick={() => {
                            setSelectedPass(
                              pass
                            );
                            setCopied(false);
                          }}
                          style={
                            primaryButtonStyle
                          }
                        >
                          <QrCode size={15} />
                          View QR
                        </button>

                        <button
                          onClick={() =>
                            copyPassId(
                              passId
                            )
                          }
                          style={
                            secondaryButtonStyle
                          }
                        >
                          {copied ? (
                            <CheckCircle
                              size={15}
                            />
                          ) : (
                            <Copy
                              size={15}
                            />
                          )}

                          {copied
                            ? "Copied"
                            : "Copy ID"}
                        </button>

                        {active && (
                          <button
                            onClick={() =>
                              deactivatePass(
                                pass
                              )
                            }
                            style={{
                              ...secondaryButtonStyle,
                              color:
                                "#b45309",
                              border:
                                "1px solid #fde68a",
                              background:
                                "#fffbeb",
                            }}
                          >
                            <XCircle
                              size={15}
                            />
                            Deactivate
                          </button>
                        )}

                        {!used && (
                          <button
                            onClick={() =>
                              deletePass(
                                pass
                              )
                            }
                            style={{
                              ...secondaryButtonStyle,
                              color:
                                "#b91c1c",
                              border:
                                "1px solid #fecaca",
                              background:
                                "#fff1f2",
                            }}
                          >
                            <Trash2
                              size={15}
                            />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* QR MODAL */}

        {selectedPass && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(15,23,42,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "420px",
                background: "#ffffff",
                borderRadius: "22px",
                padding: "25px",
                textAlign: "center",
                boxShadow:
                  "0 25px 70px rgba(0,0,0,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "21px",
                    }}
                  >
                    Guest QR Pass
                  </h2>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    Show this QR at the gate
                  </div>
                </div>

                <button
                  onClick={() =>
                    setSelectedPass(null)
                  }
                  style={{
                    border: "none",
                    background:
                      "#f1f5f9",
                    width: "34px",
                    height: "34px",
                    borderRadius:
                      "50%",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  padding: "18px",
                  background: "#ffffff",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "18px",
                }}
              >
                <QRCodeCanvas
                  value={qrValue}
                  size={220}
                  level="H"
                />
              </div>

              <div
                style={{
                  marginTop: "18px",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "18px",
                  }}
                >
                  {selectedPass.guestName ||
                    selectedPass.name}
                </div>

                <div
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    marginTop: "5px",
                  }}
                >
                  {selectedPass.flat} •{" "}
                  {formatDate(
                    selectedPass.date
                  )}
                </div>

                <div
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    marginTop: "3px",
                  }}
                >
                  {selectedPass.startTime} -{" "}
                  {selectedPass.endTime}
                </div>
              </div>

              <div
                style={{
                  marginTop: "18px",
                  padding: "12px",
                  borderRadius: "11px",
                  background: "#f8fafc",
                  fontSize: "12px",
                  color: "#475569",
                  wordBreak: "break-all",
                }}
              >
                <strong>Pass ID:</strong>{" "}
                {selectedPass.passId ||
                  selectedPass.id ||
                  selectedPass._id}
              </div>

              <button
                onClick={() =>
                  copyPassId(
                    selectedPass.passId ||
                      selectedPass.id ||
                      selectedPass._id
                  )
                }
                style={{
                  width: "100%",
                  marginTop: "14px",
                  padding: "12px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent:
                    "center",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                {copied ? (
                  <CheckCircle size={17} />
                ) : (
                  <Copy size={17} />
                )}

                {copied
                  ? "Pass ID Copied"
                  : "Copy Pass ID"}
              </button>

              <div
                style={{
                  marginTop: "14px",
                  padding: "12px",
                  background: "#eff6ff",
                  borderRadius: "11px",
                  color: "#475569",
                  fontSize: "12px",
                  lineHeight: 1.5,
                }}
              >
                Security guard will verify the
                QR pass, guest details and validity
                before allowing entry.
              </div>
            </div>
          </div>
        )}

        {/* SECURITY NOTE */}

        <div
          style={{
            marginTop: "24px",
            padding: "18px 20px",
            borderRadius: "16px",
            background: "#eff6ff",
            border: "1px solid #dbeafe",
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
          }}
        >
          <ShieldCheck
            size={22}
            style={{
              flexShrink: 0,
            }}
          />

          <div>
            <div
              style={{
                fontWeight: 800,
                marginBottom: "4px",
              }}
            >
              Guest pass security
            </div>

            <div
              style={{
                color: "#475569",
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              Each guest receives a unique QR
              pass with a specific date and time
              window. The guard verifies the pass
              before entry. Used or deactivated
              passes cannot be reused.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "12px",
  fontWeight: 700,
  color: "#475569",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #dbe3ee",
  borderRadius: "9px",
  outline: "none",
  fontSize: "13px",
  marginBottom: "16px",
  background: "#ffffff",
};

const primaryButtonStyle = {
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  borderRadius: "9px",
  padding: "8px 11px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: 700,
  fontSize: "12px",
};

const secondaryButtonStyle = {
  border: "1px solid #dbe3ee",
  background: "#ffffff",
  color: "#334155",
  borderRadius: "9px",
  padding: "8px 11px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: 700,
  fontSize: "12px",
};

const InfoItem = ({ icon, text }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "7px",
      color: "#64748b",
      fontSize: "12px",
      minWidth: 0,
    }}
  >
    {icon}
    <span
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  </div>
);

export default GuestPass;