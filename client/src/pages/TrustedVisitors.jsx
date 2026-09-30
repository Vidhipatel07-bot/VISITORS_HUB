import React, { useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  Search,
  Trash2,
  Clock,
  CalendarDays,
  ShieldCheck,
  Phone,
  Users,
  Power,
  PowerOff,
} from "lucide-react";
import api from "../utils/api";

const LOCAL_KEY = "trustedVisitors";

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

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const emptyForm = {
  name: "",
  phone: "",
  relation: "",
  flat: "A-101",
  allowedDays: [],
  startTime: "09:00",
  endTime: "21:00",
};

const getStoredResident = () => {
  try {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const getLocalVisitors = () => {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocalVisitors = (data) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
};

const formatDays = (days = []) => {
  if (!days.length) return "No days selected";

  if (days.length === 7) {
    return "Every day";
  }

  return days
    .map((day) => day.substring(0, 3))
    .join(", ");
};

const TrustedVisitors = () => {
  const [form, setForm] = useState(emptyForm);
  const [visitors, setVisitors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const resident = getStoredResident();

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const loadVisitors = async () => {
    setLoading(true);

    try {
      const response = await api.get("/trusted-visitors");

      const backendVisitors =
        response.data?.trustedVisitors ||
        response.data?.visitors ||
        response.data ||
        [];

      if (Array.isArray(backendVisitors)) {
        setVisitors(backendVisitors);
        saveLocalVisitors(backendVisitors);
      }
    } catch (error) {
      const localVisitors = getLocalVisitors();

      const residentFlat = resident?.flat;

      const filtered = residentFlat
        ? localVisitors.filter(
            (visitor) =>
              visitor.flat === residentFlat ||
              visitor.flat === "A-101"
          )
        : localVisitors;

      setVisitors(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitors();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggleDay = (day) => {
    setForm((previous) => {
      const exists = previous.allowedDays.includes(day);

      return {
        ...previous,
        allowedDays: exists
          ? previous.allowedDays.filter((item) => item !== day)
          : [...previous.allowedDays, day],
      };
    });
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      showMessage("Please enter visitor name.", "error");
      return false;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      showMessage(
        "Phone number must contain exactly 10 digits.",
        "error"
      );
      return false;
    }

    if (!form.relation.trim()) {
      showMessage("Please enter relation.", "error");
      return false;
    }

    if (!form.flat) {
      showMessage("Please select a flat.", "error");
      return false;
    }

    if (!form.allowedDays.length) {
      showMessage(
        "Select at least one allowed day.",
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

  const handleAddVisitor = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    const newVisitor = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      relation: form.relation.trim(),
      flat: form.flat,
      allowedDays: form.allowedDays,
      startTime: form.startTime,
      endTime: form.endTime,
      isActive: true,
    };

    try {
      const response = await api.post(
        "/trusted-visitors",
        newVisitor
      );

      const createdVisitor =
        response.data?.trustedVisitor ||
        response.data?.visitor ||
        response.data;

      if (createdVisitor) {
        const updated = [
          createdVisitor,
          ...visitors,
        ];

        setVisitors(updated);
        saveLocalVisitors(updated);
      }

      setForm({
        ...emptyForm,
        flat: resident?.flat || "A-101",
      });

      showMessage(
        "Trusted visitor added successfully."
      );
    } catch (error) {
      const existingVisitors = getLocalVisitors();

      const duplicate = existingVisitors.some(
        (visitor) =>
          visitor.phone === newVisitor.phone &&
          visitor.flat === newVisitor.flat
      );

      if (duplicate) {
        showMessage(
          "This trusted visitor already exists.",
          "error"
        );
        setSaving(false);
        return;
      }

      const localVisitor = {
        ...newVisitor,
        id: `trusted-${Date.now()}`,
        _id: `trusted-${Date.now()}`,
        residentId:
          resident?.id ||
          resident?._id ||
          "demo-resident-001",
        createdAt: new Date().toISOString(),
      };

      const updated = [
        localVisitor,
        ...existingVisitors,
      ];

      saveLocalVisitors(updated);

      setVisitors(
        resident?.flat
          ? updated.filter(
              (visitor) =>
                visitor.flat === resident.flat
            )
          : updated
      );

      setForm({
        ...emptyForm,
        flat: resident?.flat || "A-101",
      });

      showMessage(
        "Trusted visitor added successfully."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleVisitor = async (visitor) => {
    const visitorId = visitor._id || visitor.id;
    const newStatus = visitor.isActive === false;

    try {
      await api.put(
        `/trusted-visitors/${visitorId}/status`,
        {
          isActive: newStatus,
        }
      );

      const updated = visitors.map((item) =>
        (item._id || item.id) === visitorId
          ? {
              ...item,
              isActive: newStatus,
            }
          : item
      );

      setVisitors(updated);
      saveLocalVisitors(updated);

      showMessage(
        newStatus
          ? "Trusted visitor activated."
          : "Trusted visitor deactivated."
      );
    } catch (error) {
      const updated = visitors.map((item) =>
        (item._id || item.id) === visitorId
          ? {
              ...item,
              isActive: newStatus,
            }
          : item
      );

      setVisitors(updated);
      saveLocalVisitors(updated);

      showMessage(
        newStatus
          ? "Trusted visitor activated."
          : "Trusted visitor deactivated."
      );
    }
  };

  const deleteVisitor = async (visitor) => {
    const visitorId = visitor._id || visitor.id;

    const confirmed = window.confirm(
      `Remove ${visitor.name} from trusted visitors?`
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/trusted-visitors/${visitorId}`
      );

      const updated = visitors.filter(
        (item) =>
          (item._id || item.id) !== visitorId
      );

      setVisitors(updated);
      saveLocalVisitors(updated);

      showMessage("Trusted visitor removed.");
    } catch (error) {
      const updated = visitors.filter(
        (item) =>
          (item._id || item.id) !== visitorId
      );

      setVisitors(updated);
      saveLocalVisitors(updated);

      showMessage("Trusted visitor removed.");
    }
  };

  const filteredVisitors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return visitors;

    return visitors.filter((visitor) => {
      return (
        visitor.name?.toLowerCase().includes(query) ||
        visitor.phone?.includes(query) ||
        visitor.relation?.toLowerCase().includes(query) ||
        visitor.flat?.toLowerCase().includes(query)
      );
    });
  }, [visitors, search]);

  const activeCount = visitors.filter(
    (visitor) => visitor.isActive !== false
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
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "7px",
              }}
            >
              <ShieldCheck
                size={30}
                strokeWidth={2.2}
              />

              <h1
                style={{
                  margin: 0,
                  fontSize: "30px",
                  fontWeight: 800,
                }}
              >
                Trusted Visitors
              </h1>
            </div>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "15px",
              }}
            >
              Allow selected visitors to enter
              automatically during approved times.
            </p>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "14px 18px",
              boxShadow:
                "0 8px 25px rgba(15, 23, 42, 0.07)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Users size={22} />

            <div>
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
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >
                Active Visitors
              </div>
            </div>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              marginBottom: "20px",
              background:
                messageType === "error"
                  ? "#fee2e2"
                  : "#dcfce7",
              color:
                messageType === "error"
                  ? "#991b1b"
                  : "#166534",
              fontWeight: 600,
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(320px, 380px) 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* ADD FORM */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "24px",
              boxShadow:
                "0 10px 30px rgba(15, 23, 42, 0.07)",
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
              <UserPlus size={22} />

              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                }}
              >
                Add Trusted Visitor
              </h2>
            </div>

            <form onSubmit={handleAddVisitor}>
              <label style={labelStyle}>
                Visitor Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
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
                Relation
              </label>

              <input
                name="relation"
                value={form.relation}
                onChange={handleChange}
                placeholder="e.g. Family, Friend, Driver"
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
                  <option key={flat} value={flat}>
                    {flat}
                  </option>
                ))}
              </select>

              <label style={labelStyle}>
                Allowed Days
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, 1fr)",
                  gap: "8px",
                  marginBottom: "18px",
                }}
              >
                {DAYS.map((day) => {
                  const selected =
                    form.allowedDays.includes(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      style={{
                        padding: "9px 8px",
                        borderRadius: "9px",
                        border: selected
                          ? "1px solid #2563eb"
                          : "1px solid #dbe3ee",
                        background: selected
                          ? "#eff6ff"
                          : "#ffffff",
                        cursor: "pointer",
                        fontWeight: selected
                          ? 700
                          : 500,
                        fontSize: "12px",
                      }}
                    >
                      {day.substring(0, 3)}
                    </button>
                  );
                })}
              </div>

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
                disabled={saving}
                style={{
                  width: "100%",
                  marginTop: "20px",
                  padding: "13px",
                  border: "none",
                  borderRadius: "11px",
                  background:
                    saving
                      ? "#94a3b8"
                      : "#2563eb",
                  color: "#ffffff",
                  fontWeight: 700,
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <UserPlus size={18} />

                {saving
                  ? "Adding..."
                  : "Add Trusted Visitor"}
              </button>
            </form>
          </div>

          {/* LIST */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "24px",
              boxShadow:
                "0 10px 30px rgba(15, 23, 42, 0.07)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                  }}
                >
                  Your Trusted Visitors
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Only selected people can be
                  auto-approved.
                </p>
              </div>

              <div
                style={{
                  position: "relative",
                  minWidth: "220px",
                }}
              >
                <Search
                  size={17}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    color: "#64748b",
                  }}
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search visitor..."
                  style={{
                    ...inputStyle,
                    marginBottom: 0,
                    paddingLeft: "38px",
                  }}
                />
              </div>
            </div>

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px 20px",
                  color: "#64748b",
                }}
              >
                Loading trusted visitors...
              </div>
            ) : filteredVisitors.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "55px 20px",
                  border:
                    "1px dashed #cbd5e1",
                  borderRadius: "15px",
                  color: "#64748b",
                }}
              >
                <Users
                  size={38}
                  style={{
                    marginBottom: "10px",
                  }}
                />

                <div
                  style={{
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: "5px",
                  }}
                >
                  No trusted visitors found
                </div>

                <div
                  style={{
                    fontSize: "13px",
                  }}
                >
                  Add a trusted visitor using
                  the form.
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                {filteredVisitors.map(
                  (visitor) => {
                    const active =
                      visitor.isActive !== false;

                    return (
                      <div
                        key={
                          visitor._id ||
                          visitor.id
                        }
                        style={{
                          border:
                            "1px solid #e2e8f0",
                          borderRadius: "15px",
                          padding: "18px",
                          background:
                            active
                              ? "#ffffff"
                              : "#f8fafc",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: "15px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "13px",
                            }}
                          >
                            <div
                              style={{
                                width: "46px",
                                height: "46px",
                                borderRadius:
                                  "50%",
                                background:
                                  "#eff6ff",
                                display: "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                              }}
                            >
                              <Users
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
                                {
                                  visitor.name
                                }
                              </div>

                              <div
                                style={{
                                  color:
                                    "#64748b",
                                  fontSize:
                                    "13px",
                                  marginTop:
                                    "3px",
                                }}
                              >
                                {
                                  visitor.relation
                                }{" "}
                                •{" "}
                                {
                                  visitor.flat
                                }
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
                                  : "#f1f5f9",
                              color:
                                active
                                  ? "#166534"
                                  : "#64748b",
                              fontSize:
                                "11px",
                              fontWeight: 800,
                              height:
                                "fit-content",
                            }}
                          >
                            {active
                              ? "ACTIVE"
                              : "INACTIVE"}
                          </span>
                        </div>

                        <div
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "repeat(2, minmax(0, 1fr))",
                            gap: "10px",
                            marginTop:
                              "16px",
                          }}
                        >
                          <InfoItem
                            icon={<Phone size={15} />}
                            text={
                              visitor.phone
                            }
                          />

                          <InfoItem
                            icon={
                              <CalendarDays
                                size={15}
                              />
                            }
                            text={formatDays(
                              visitor.allowedDays
                            )}
                          />

                          <InfoItem
                            icon={
                              <Clock
                                size={15}
                              />
                            }
                            text={`${visitor.startTime} - ${visitor.endTime}`}
                          />

                          <InfoItem
                            icon={
                              <ShieldCheck
                                size={15}
                              />
                            }
                            text={
                              active
                                ? "Auto approval enabled"
                                : "Auto approval disabled"
                            }
                          />
                        </div>

                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "flex-end",
                            gap: "8px",
                            marginTop:
                              "16px",
                          }}
                        >
                          <button
                            onClick={() =>
                              toggleVisitor(
                                visitor
                              )
                            }
                            style={{
                              border:
                                "1px solid #dbe3ee",
                              background:
                                "#ffffff",
                              borderRadius:
                                "9px",
                              padding:
                                "8px 11px",
                              cursor:
                                "pointer",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "6px",
                              fontWeight: 600,
                              fontSize:
                                "12px",
                            }}
                          >
                            {active ? (
                              <PowerOff
                                size={15}
                              />
                            ) : (
                              <Power
                                size={15}
                              />
                            )}

                            {active
                              ? "Disable"
                              : "Enable"}
                          </button>

                          <button
                            onClick={() =>
                              deleteVisitor(
                                visitor
                              )
                            }
                            style={{
                              border:
                                "1px solid #fecaca",
                              background:
                                "#fff1f2",
                              color:
                                "#b91c1c",
                              borderRadius:
                                "9px",
                              padding:
                                "8px 11px",
                              cursor:
                                "pointer",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "6px",
                              fontWeight: 600,
                              fontSize:
                                "12px",
                            }}
                          >
                            <Trash2
                              size={15}
                            />
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>

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
            style={{ flexShrink: 0 }}
          />

          <div>
            <div
              style={{
                fontWeight: 800,
                marginBottom: "4px",
              }}
            >
              Security rule
            </div>

            <div
              style={{
                color: "#475569",
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              Trusted access is limited to the
              selected person, approved days and
              approved time window. Outside the
              allowed schedule, resident approval
              is required.
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

const InfoItem = ({ icon, text }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "7px",
      color: "#64748b",
      fontSize: "12px",
    }}
  >
    {icon}
    <span>{text}</span>
  </div>
);

export default TrustedVisitors;