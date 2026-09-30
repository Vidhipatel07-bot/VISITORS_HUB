import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Search,
  Plus,
  Trash2,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Home,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import api from "../utils/api";

const LOCAL_KEY = "adminResidents";

const DEFAULT_RESIDENTS = [
  {
    id: "resident-1",
    name: "Aarav Mehta",
    email: "aarav@example.com",
    phone: "9876543210",
    flat: "A-101",
    role: "resident",
    isActive: true,
  },
  {
    id: "resident-2",
    name: "Priya Shah",
    email: "priya@example.com",
    phone: "9876543211",
    flat: "A-102",
    role: "resident",
    isActive: true,
  },
  {
    id: "resident-3",
    name: "Rohan Patel",
    email: "rohan@example.com",
    phone: "9876543212",
    flat: "A-103",
    role: "resident",
    isActive: true,
  },
  {
    id: "resident-4",
    name: "Neha Desai",
    email: "neha@example.com",
    phone: "9876543213",
    flat: "A-104",
    role: "resident",
    isActive: true,
  },
  {
    id: "resident-5",
    name: "Karan Joshi",
    email: "karan@example.com",
    phone: "9876543214",
    flat: "B-201",
    role: "resident",
    isActive: true,
  },
];

const getLocalResidents = () => {
  try {
    const data = localStorage.getItem(LOCAL_KEY);

    if (!data) {
      localStorage.setItem(
        LOCAL_KEY,
        JSON.stringify(DEFAULT_RESIDENTS)
      );

      return DEFAULT_RESIDENTS;
    }

    const parsed = JSON.parse(data);

    return Array.isArray(parsed)
      ? parsed
      : DEFAULT_RESIDENTS;
  } catch {
    return DEFAULT_RESIDENTS;
  }
};

const saveLocalResidents = (data) => {
  localStorage.setItem(
    LOCAL_KEY,
    JSON.stringify(data)
  );
};

const AdminResidents = () => {
  const [residents, setResidents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] =
    useState(false);
  const [actionLoading, setActionLoading] =
    useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("success");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    flat: "",
    password: "",
  });

  const flats = [
    "A-101",
    "A-102",
    "A-103",
    "A-104",
    "B-201",
    "B-202",
    "B-203",
    "B-204",
  ];

  const showMessage = (
    text,
    type = "success"
  ) => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const normalizeResident = (user) => ({
    ...user,
    id: user.id || user._id,
    name: user.name || "Resident",
    email: user.email || "-",
    phone: user.phone || "-",
    flat: user.flat || "-",
    role: user.role || "resident",
    isActive:
      user.isActive !== undefined
        ? user.isActive
        : true,
  });

  const loadResidents = async () => {
    setLoading(true);

    try {
      const response = await api.get(
        "/users?role=resident"
      );

      const users =
        response.data?.users ||
        response.data?.data ||
        response.data ||
        [];

      if (Array.isArray(users)) {
        const normalized =
          users.map(normalizeResident);

        setResidents(normalized);
        saveLocalResidents(normalized);

        setLoading(false);
        return;
      }
    } catch {
      // Local fallback
    }

    setResidents(
      getLocalResidents().map(
        normalizeResident
      )
    );

    setLoading(false);
  };

  useEffect(() => {
    loadResidents();
  }, []);

  /* =========================
     FORM
  ========================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      flat: "",
      password: "",
    });
  };

  /* =========================
     ADD RESIDENT
  ========================= */

  const addResident = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email
      .trim()
      .toLowerCase();
    const phone = form.phone.trim();
    const flat = form.flat;
    const password = form.password;

    if (
      !name ||
      !email ||
      !phone ||
      !flat ||
      !password
    ) {
      showMessage(
        "Please fill all fields.",
        "error"
      );
      return;
    }

    if (name.length < 2) {
      showMessage(
        "Name must contain at least 2 characters.",
        "error"
      );
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      showMessage(
        "Phone number must contain exactly 10 digits.",
        "error"
      );
      return;
    }

    if (password.length < 6) {
      showMessage(
        "Password must contain at least 6 characters.",
        "error"
      );
      return;
    }

    setActionLoading("add");

    try {
      const response = await api.post(
        "/users/register",
        {
          name,
          email,
          phone,
          flat,
          password,
        }
      );

      const created =
        response.data?.user;

      if (created) {
        const normalized =
          normalizeResident(created);

        setResidents((previous) => [
          normalized,
          ...previous,
        ]);

        const local =
          getLocalResidents();

        saveLocalResidents([
          normalized,
          ...local,
        ]);

        showMessage(
          "Resident added successfully."
        );

        resetForm();
        setShowAddModal(false);
        setActionLoading("");

        return;
      }
    } catch (error) {
      const backendMessage =
        error.response?.data?.message;

      if (backendMessage) {
        /*
          If database is running and backend
          gives a real validation/duplicate
          error, show that error.
        */
        if (
          error.response?.status !== 503
        ) {
          showMessage(
            backendMessage,
            "error"
          );

          setActionLoading("");
          return;
        }
      }
    }

    /*
      Local fallback for demo mode
      when MongoDB is not connected.
    */

    const local =
      getLocalResidents();

    const emailExists = local.some(
      (resident) =>
        resident.email?.toLowerCase() ===
        email
    );

    const phoneExists = local.some(
      (resident) =>
        resident.phone === phone
    );

    const flatExists = local.some(
      (resident) =>
        resident.flat === flat &&
        resident.isActive !== false
    );

    if (emailExists) {
      showMessage(
        "A resident with this email already exists.",
        "error"
      );
      setActionLoading("");
      return;
    }

    if (phoneExists) {
      showMessage(
        "A resident with this phone number already exists.",
        "error"
      );
      setActionLoading("");
      return;
    }

    if (flatExists) {
      showMessage(
        "This flat already has an active resident.",
        "error"
      );
      setActionLoading("");
      return;
    }

    const newResident = {
      id: `resident-${Date.now()}`,
      name,
      email,
      phone,
      flat,
      role: "resident",
      isActive: true,
      isApproved: true,
      createdAt:
        new Date().toISOString(),
    };

    const updated = [
      newResident,
      ...local,
    ];

    saveLocalResidents(updated);
    setResidents(
      updated.map(normalizeResident)
    );

    showMessage(
      "Resident added successfully."
    );

    resetForm();
    setShowAddModal(false);
    setActionLoading("");
  };

  /* =========================
     TOGGLE STATUS
  ========================= */

  const toggleResidentStatus = async (
    resident
  ) => {
    const id =
      resident._id || resident.id;

    const nextStatus =
      resident.isActive === false;

    setActionLoading(
      `status-${id}`
    );

    try {
      await api.put(
        `/users/${id}/status`,
        {
          isActive: nextStatus,
        }
      );
    } catch {
      // Local fallback
    }

    const local =
      getLocalResidents();

    const updated = local.map(
      (item) => {
        const itemId =
          item._id || item.id;

        if (itemId !== id) {
          return item;
        }

        return {
          ...item,
          isActive: nextStatus,
          updatedAt:
            new Date().toISOString(),
        };
      }
    );

    saveLocalResidents(updated);

    setResidents(
      updated.map(normalizeResident)
    );

    showMessage(
      nextStatus
        ? "Resident activated."
        : "Resident deactivated."
    );

    setActionLoading("");
  };

  /* =========================
     DELETE
  ========================= */

  const deleteResident = async (
    resident
  ) => {
    const id =
      resident._id || resident.id;

    const confirmed =
      window.confirm(
        `Delete ${resident.name} from residents?`
      );

    if (!confirmed) return;

    setActionLoading(
      `delete-${id}`
    );

    try {
      await api.delete(
        `/users/${id}`
      );
    } catch (error) {
      /*
        If database is connected and the
        backend returns a real error, do not
        silently delete the local copy.
      */
      if (
        error.response &&
        error.response.status !== 503
      ) {
        showMessage(
          error.response.data?.message ||
            "Unable to delete resident.",
          "error"
        );

        setActionLoading("");
        return;
      }
    }

    const local =
      getLocalResidents();

    const updated = local.filter(
      (item) => {
        const itemId =
          item._id || item.id;

        return itemId !== id;
      }
    );

    saveLocalResidents(updated);

    setResidents(
      updated.map(normalizeResident)
    );

    showMessage(
      "Resident deleted."
    );

    setActionLoading("");
  };

  /* =========================
     SEARCH
  ========================= */

  const filteredResidents =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return residents;
      }

      return residents.filter(
        (resident) =>
          resident.name
            ?.toLowerCase()
            .includes(query) ||
          resident.email
            ?.toLowerCase()
            .includes(query) ||
          resident.phone
            ?.toLowerCase()
            .includes(query) ||
          resident.flat
            ?.toLowerCase()
            .includes(query)
      );
    }, [residents, search]);

  const activeCount =
    residents.filter(
      (resident) =>
        resident.isActive !== false
    ).length;

  const inactiveCount =
    residents.filter(
      (resident) =>
        resident.isActive === false
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
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "25px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
              }}
            >
              <Link
                to="/admin/dashboard"
                style={{
                  color: "#334155",
                  display: "flex",
                }}
              >
                <ArrowLeft
                  size={20}
                />
              </Link>

              <h1
                style={{
                  margin: 0,
                  fontSize: "30px",
                  fontWeight: 800,
                }}
              >
                Residents
              </h1>
            </div>

            <p
              style={{
                margin:
                  "6px 0 0 31px",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Manage society residents and
              their flat assignments.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              onClick={loadResidents}
              style={secondaryButton}
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              onClick={() =>
                setShowAddModal(true)
              }
              style={primaryButton}
            >
              <Plus size={17} />
              Add Resident
            </button>
          </div>
        </div>

        {/* MESSAGE */}

        {message && (
          <div
            style={{
              padding:
                "12px 16px",
              borderRadius: "11px",
              marginBottom: "18px",
              background:
                messageType === "error"
                  ? "#fee2e2"
                  : "#dcfce7",
              color:
                messageType === "error"
                  ? "#991b1b"
                  : "#166534",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {message}
          </div>
        )}

        {/* STATS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <StatCard
            icon={<Users size={22} />}
            value={residents.length}
            label="Total Residents"
          />

          <StatCard
            icon={
              <UserCheck
                size={22}
              />
            }
            value={activeCount}
            label="Active Residents"
          />

          <StatCard
            icon={
              <UserX size={22} />
            }
            value={inactiveCount}
            label="Inactive Residents"
          />
        </div>

        {/* SEARCH */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "15px",
            marginBottom: "20px",
            boxShadow:
              "0 8px 25px rgba(15,23,42,0.06)",
          }}
        >
          <div
            style={{
              position: "relative",
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
              placeholder="Search by name, email, phone or flat..."
              style={{
                ...inputStyle,
                paddingLeft: "38px",
              }}
            />
          </div>
        </div>

        {/* RESIDENT LIST */}

        {loading ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "17px",
              padding: "60px 20px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Loading residents...
          </div>
        ) : filteredResidents.length ===
          0 ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "17px",
              padding: "60px 20px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <Users
              size={42}
              style={{
                marginBottom: "10px",
              }}
            />

            <div
              style={{
                color: "#334155",
                fontWeight: 800,
              }}
            >
              No residents found
            </div>

            <div
              style={{
                fontSize: "13px",
                marginTop: "5px",
              }}
            >
              Try another search or add a
              new resident.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "15px",
            }}
          >
            {filteredResidents.map(
              (resident) => {
                const id =
                  resident._id ||
                  resident.id;

                const active =
                  resident.isActive !==
                  false;

                return (
                  <div
                    key={id}
                    style={{
                      background:
                        "#ffffff",
                      border:
                        "1px solid #e2e8f0",
                      borderRadius:
                        "17px",
                      padding: "18px",
                    }}
                  >
                    {/* CARD HEADER */}

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width:
                              "48px",
                            height:
                              "48px",
                            borderRadius:
                              "14px",
                            background:
                              "#eff6ff",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                          }}
                        >
                          <Users
                            size={22}
                          />
                        </div>

                        <div>
                          <div
                            style={{
                              fontWeight:
                                800,
                              fontSize:
                                "17px",
                            }}
                          >
                            {
                              resident.name
                            }
                          </div>

                          <div
                            style={{
                              marginTop:
                                "4px",
                              fontSize:
                                "11px",
                              color:
                                "#64748b",
                            }}
                          >
                            Resident
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          padding:
                            "5px 9px",
                          borderRadius:
                            "20px",
                          fontSize:
                            "10px",
                          fontWeight:
                            800,
                          background:
                            active
                              ? "#dcfce7"
                              : "#fee2e2",
                          color:
                            active
                              ? "#166534"
                              : "#991b1b",
                        }}
                      >
                        {active
                          ? "ACTIVE"
                          : "INACTIVE"}
                      </span>
                    </div>

                    {/* DETAILS */}

                    <div
                      style={{
                        marginTop:
                          "17px",
                        display:
                          "grid",
                        gap: "11px",
                      }}
                    >
                      <InfoRow
                        icon={
                          <Home
                            size={15}
                          />
                        }
                        label="Flat"
                        value={
                          resident.flat
                        }
                      />

                      <InfoRow
                        icon={
                          <Mail
                            size={15}
                          />
                        }
                        label="Email"
                        value={
                          resident.email
                        }
                      />

                      <InfoRow
                        icon={
                          <Phone
                            size={15}
                          />
                        }
                        label="Mobile"
                        value={
                          resident.phone
                        }
                      />
                    </div>

                    {/* ACTIONS */}

                    <div
                      style={{
                        display:
                          "flex",
                        gap: "8px",
                        marginTop:
                          "18px",
                      }}
                    >
                      <button
                        onClick={() =>
                          toggleResidentStatus(
                            resident
                          )
                        }
                        disabled={
                          actionLoading ===
                          `status-${id}`
                        }
                        style={{
                          ...statusButton,
                          flex: 1,
                        }}
                      >
                        {active ? (
                          <>
                            <UserX
                              size={
                                15
                              }
                            />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck
                              size={
                                15
                              }
                            />
                            Activate
                          </>
                        )}
                      </button>

                      <button
                        onClick={() =>
                          deleteResident(
                            resident
                          )
                        }
                        disabled={
                          actionLoading ===
                          `delete-${id}`
                        }
                        style={
                          deleteButton
                        }
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* SECURITY NOTE */}

        <div
          style={{
            marginTop: "24px",
            background: "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "17px 19px",
            display: "flex",
            gap: "11px",
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
              Resident management
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                lineHeight: 1.6,
              }}
            >
              Only administrators should add,
              deactivate or remove resident
              accounts. Each active resident is
              associated with a society flat.
            </div>
          </div>
        </div>
      </div>

      {/* ADD RESIDENT MODAL */}

      {showAddModal && (
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
              maxWidth: "500px",
              background: "#ffffff",
              borderRadius: "20px",
              padding: "25px",
              boxShadow:
                "0 25px 70px rgba(15,23,42,0.25)",
            }}
          >
            {/* MODAL HEADER */}

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize:
                      "22px",
                  }}
                >
                  Add Resident
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color:
                      "#64748b",
                    fontSize:
                      "12px",
                  }}
                >
                  Create a new resident
                  account.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowAddModal(
                    false
                  );
                  resetForm();
                }}
                style={
                  closeButton
                }
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={
                addResident
              }
            >
              <label
                style={labelStyle}
              >
                Full Name
              </label>

              <input
                name="name"
                value={
                  form.name
                }
                onChange={
                  handleChange
                }
                placeholder="Enter resident name"
                style={
                  inputStyle
                }
              />

              <label
                style={labelStyle}
              >
                Email
              </label>

              <input
                type="email"
                name="email"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
                placeholder="resident@email.com"
                style={
                  inputStyle
                }
              />

              <label
                style={labelStyle}
              >
                Mobile Number
              </label>

              <input
                type="tel"
                name="phone"
                value={
                  form.phone
                }
                onChange={
                  handleChange
                }
                placeholder="10-digit mobile number"
                maxLength={10}
                style={
                  inputStyle
                }
              />

              <label
                style={labelStyle}
              >
                Flat Number
              </label>

              <select
                name="flat"
                value={
                  form.flat
                }
                onChange={
                  handleChange
                }
                style={
                  inputStyle
                }
              >
                <option value="">
                  Select Flat
                </option>

                {flats.map(
                  (flat) => (
                    <option
                      key={flat}
                      value={flat}
                    >
                      {flat}
                    </option>
                  )
                )}
              </select>

              <label
                style={labelStyle}
              >
                Password
              </label>

              <input
                type="password"
                name="password"
                value={
                  form.password
                }
                onChange={
                  handleChange
                }
                placeholder="Minimum 6 characters"
                style={
                  inputStyle
                }
              />

              <button
                type="submit"
                disabled={
                  actionLoading ===
                  "add"
                }
                style={{
                  ...primaryButton,
                  width: "100%",
                  marginTop:
                    "8px",
                  justifyContent:
                    "center",
                }}
              >
                <Plus size={17} />

                {actionLoading ===
                "add"
                  ? "Adding Resident..."
                  : "Add Resident"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================
   COMPONENTS
========================= */

const StatCard = ({
  icon,
  value,
  label,
}) => (
  <div
    style={{
      background: "#ffffff",
      borderRadius: "16px",
      padding: "18px",
      boxShadow:
        "0 8px 25px rgba(15,23,42,0.06)",
      display: "flex",
      alignItems: "center",
      gap: "13px",
    }}
  >
    <div
      style={{
        width: "43px",
        height: "43px",
        borderRadius: "12px",
        background: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </div>

    <div>
      <div
        style={{
          fontSize: "23px",
          fontWeight: 800,
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#64748b",
        }}
      >
        {label}
      </div>
    </div>
  </div>
);

const InfoRow = ({
  icon,
  label,
  value,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "12px",
      color: "#64748b",
      minWidth: 0,
    }}
  >
    {icon}

    <span>{label}:</span>

    <strong
      style={{
        color: "#334155",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </strong>
  </div>
);

/* =========================
   STYLES
========================= */

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border:
    "1px solid #dbe3ee",
  borderRadius: "9px",
  outline: "none",
  fontSize: "13px",
  background: "#ffffff",
  marginBottom: "13px",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 700,
  color: "#334155",
  marginBottom: "6px",
};

const primaryButton = {
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  borderRadius: "10px",
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: "12px",
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
};

const secondaryButton = {
  border:
    "1px solid #dbe3ee",
  background: "#ffffff",
  color: "#334155",
  borderRadius: "10px",
  padding: "10px 13px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "12px",
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
};

const statusButton = {
  border:
    "1px solid #dbe3ee",
  background: "#f8fafc",
  color: "#334155",
  borderRadius: "9px",
  padding: "9px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "11px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
};

const deleteButton = {
  width: "38px",
  border:
    "1px solid #fecaca",
  background: "#fff1f2",
  color: "#b91c1c",
  borderRadius: "9px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const closeButton = {
  width: "35px",
  height: "35px",
  border: "none",
  borderRadius: "9px",
  background: "#f1f5f9",
  color: "#475569",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default AdminResidents;