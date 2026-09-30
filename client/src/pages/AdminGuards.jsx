import { useEffect, useMemo, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  Search,
  UserPlus,
  Trash2,
  ShieldCheck,
  X,
  CheckCircle2,
  UserCheck,
  UserX,
} from "lucide-react";
import api from "../utils/api";

const API_URL = "/users";

const DEMO_GUARDS = [
  {
    id: "guard-demo-1",
    name: "Rajesh Kumar",
    email: "rajesh.guard@gmail.com",
    phone: "9876543210",
    role: "guard",
    isActive: true,
  },
  {
    id: "guard-demo-2",
    name: "Amit Patil",
    email: "amit.guard@gmail.com",
    phone: "9823456789",
    role: "guard",
    isActive: true,
  },
];

function AdminGuards() {
  const [guards, setGuards] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  /* =====================================================
     LOAD GUARDS
  ===================================================== */

  useEffect(() => {
    loadGuards();
  }, []);

  const loadGuards = async () => {
    setLoading(true);

    try {
      const response = await api.get(
        `${API_URL}?role=guard`
      );

      const data = response.data?.data || [];

      setGuards(data);

      localStorage.setItem(
        "guards",
        JSON.stringify(data)
      );
    } catch (error) {
      console.log(
        "Backend unavailable. Loading guards locally."
      );

      try {
        const saved = JSON.parse(
          localStorage.getItem("guards") || "[]"
        );

        if (Array.isArray(saved) && saved.length > 0) {
          setGuards(saved);
        } else {
          setGuards(DEMO_GUARDS);

          localStorage.setItem(
            "guards",
            JSON.stringify(DEMO_GUARDS)
          );
        }
      } catch {
        setGuards(DEMO_GUARDS);
      }
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "phone"
          ? value.replace(/\D/g, "").slice(0, 10)
          : value,
    }));
  };

  /* =====================================================
     RESET FORM
  ===================================================== */

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
    });

    setShowForm(false);
  };

  /* =====================================================
     ADD GUARD
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim().toLowerCase();

    if (
      !cleanName ||
      !cleanEmail ||
      !form.phone ||
      !form.password
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (form.phone.length !== 10) {
      alert(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (form.password.length < 6) {
      alert(
        "Password must contain at least 6 characters."
      );
      return;
    }

    const duplicate = guards.some(
      (guard) =>
        guard.email?.toLowerCase() === cleanEmail ||
        guard.phone === form.phone
    );

    if (duplicate) {
      alert(
        "A guard with this email or phone number already exists."
      );
      return;
    }

    const guardData = {
      name: cleanName,
      email: cleanEmail,
      phone: form.phone,
      password: form.password,
      role: "guard",
    };

    setSaving(true);

    try {
      /* -----------------------------------------------
         IMPORTANT:
         Admin guard creation uses /admin-create
      ------------------------------------------------ */

      const response = await api.post(
        "/users/admin-create",
        guardData
      );

      const createdGuard =
        response.data?.data;

      if (!createdGuard) {
        throw new Error(
          "Guard was not returned by the server."
        );
      }

      const updatedGuards = [
        createdGuard,
        ...guards,
      ];

      setGuards(updatedGuards);

      localStorage.setItem(
        "guards",
        JSON.stringify(updatedGuards)
      );

      alert(
        "Security guard account created successfully."
      );

      resetForm();
    } catch (error) {
      console.log(
        "Backend guard creation unavailable. Using local storage."
      );

      /* -----------------------------------------------
         LOCAL FALLBACK
      ------------------------------------------------ */

      if (
        error.response?.status === 409
      ) {
        alert(
          error.response?.data?.message ||
            "A user with these details already exists."
        );

        setSaving(false);
        return;
      }

      if (
        error.response?.status === 403
      ) {
        alert(
          "Only an admin account can create a guard."
        );

        setSaving(false);
        return;
      }

      const localGuard = {
        id: `guard-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        phone: form.phone,
        role: "guard",
        isActive: true,
        isApproved: true,
        createdAt: new Date().toISOString(),
      };

      const updatedGuards = [
        localGuard,
        ...guards,
      ];

      setGuards(updatedGuards);

      localStorage.setItem(
        "guards",
        JSON.stringify(updatedGuards)
      );

      alert(
        "Guard added locally. Backend/database is currently unavailable."
      );

      resetForm();
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     TOGGLE GUARD STATUS
  ===================================================== */

  const toggleStatus = async (guard) => {
    const guardId =
      guard._id || guard.id;

    const newStatus =
      guard.isActive === false;

    try {
      if (
        guard._id &&
        !guard._id.toString().startsWith("demo-")
      ) {
        const response = await api.put(
          `/users/${guard._id}/status`,
          {
            isActive: newStatus,
          }
        );

        const updatedGuard =
          response.data?.data;

        if (updatedGuard) {
          const updatedGuards =
            guards.map((item) =>
              (item._id || item.id) === guardId
                ? updatedGuard
                : item
            );

          setGuards(updatedGuards);

          localStorage.setItem(
            "guards",
            JSON.stringify(updatedGuards)
          );

          return;
        }
      }
    } catch (error) {
      console.log(
        "Backend status update unavailable."
      );
    }

    const updatedGuards = guards.map(
      (item) =>
        (item._id || item.id) === guardId
          ? {
              ...item,
              isActive: newStatus,
            }
          : item
    );

    setGuards(updatedGuards);

    localStorage.setItem(
      "guards",
      JSON.stringify(updatedGuards)
    );
  };

  /* =====================================================
     DELETE GUARD
  ===================================================== */

  const deleteGuard = async (guard) => {
    const guardId =
      guard._id || guard.id;

    const confirmDelete = window.confirm(
      `Delete guard "${guard.name}"?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      if (
        guard._id &&
        !guard._id.toString().startsWith("demo-")
      ) {
        await api.delete(
          `/users/${guard._id}`
        );
      }
    } catch (error) {
      console.log(
        "Backend delete unavailable. Removing locally."
      );
    }

    const updatedGuards = guards.filter(
      (item) =>
        (item._id || item.id) !== guardId
    );

    setGuards(updatedGuards);

    localStorage.setItem(
      "guards",
      JSON.stringify(updatedGuards)
    );
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredGuards = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return guards;
    }

    return guards.filter((guard) => {
      return (
        guard.name
          ?.toLowerCase()
          .includes(query) ||
        guard.email
          ?.toLowerCase()
          .includes(query) ||
        guard.phone
          ?.toString()
          .includes(query)
      );
    });
  }, [guards, search]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalGuards = guards.length;

  const activeGuards = guards.filter(
    (guard) =>
      guard.isActive !== false
  ).length;

  const inactiveGuards = guards.filter(
    (guard) =>
      guard.isActive === false
  ).length;

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f5f9ff 0%, #eef8ff 50%, #ffffff 100%)",
        padding: "30px 24px 60px",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#172033",
      }}
    >
      <div
        style={{
          maxWidth: "1150px",
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
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, #0f4c81, #087ea4)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 10px 25px rgba(15,76,129,0.18)",
              }}
            >
              <ShieldCheck size={27} />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "30px",
                  fontWeight: 900,
                }}
              >
                Security Guards
              </h1>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Manage society security guard accounts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowForm(!showForm)
            }
            style={{
              border: "none",
              borderRadius: "13px",
              padding: "13px 18px",
              background:
                "linear-gradient(135deg, #0f4c81, #087ea4)",
              color: "white",
              fontWeight: 850,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow:
                "0 8px 20px rgba(15,76,129,0.18)",
            }}
          >
            {showForm ? (
              <>
                <X size={18} />
                Close
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Add Guard
              </>
            )}
          </button>
        </div>

        {/* STATISTICS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid #e3edf7",
              borderRadius: "18px",
              padding: "20px",
            }}
          >
            <UserRound
              size={21}
              color="#0f4c81"
            />

            <div
              style={{
                fontSize: "28px",
                fontWeight: 900,
                marginTop: "9px",
              }}
            >
              {totalGuards}
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Total Guards
            </div>
          </div>

          <div
            style={{
              background: "white",
              border: "1px solid #e3edf7",
              borderRadius: "18px",
              padding: "20px",
            }}
          >
            <UserCheck
              size={21}
              color="#15803d"
            />

            <div
              style={{
                fontSize: "28px",
                fontWeight: 900,
                marginTop: "9px",
              }}
            >
              {activeGuards}
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Active Guards
            </div>
          </div>

          <div
            style={{
              background: "white",
              border: "1px solid #e3edf7",
              borderRadius: "18px",
              padding: "20px",
            }}
          >
            <UserX
              size={21}
              color="#b45309"
            />

            <div
              style={{
                fontSize: "28px",
                fontWeight: 900,
                marginTop: "9px",
              }}
            >
              {inactiveGuards}
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Inactive Guards
            </div>
          </div>
        </div>

        {/* ADD FORM */}

        {showForm && (
          <div
            style={{
              background: "white",
              border: "1px solid #e3edf7",
              borderRadius: "22px",
              padding: "24px",
              marginBottom: "22px",
              boxShadow:
                "0 12px 32px rgba(15,76,129,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
                marginBottom: "20px",
              }}
            >
              <UserPlus
                size={21}
                color="#0f4c81"
              />

              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "19px",
                    fontWeight: 850,
                  }}
                >
                  Add New Guard
                </h2>

                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#718096",
                    fontSize: "13px",
                  }}
                >
                  Create a security guard login account.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: "16px",
                }}
              >
                {/* NAME */}

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 800,
                      marginBottom: "7px",
                    }}
                  >
                    Full Name
                  </label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      border: "1px solid #d8e5f0",
                      borderRadius: "12px",
                      padding: "11px 13px",
                    }}
                  >
                    <UserRound
                      size={17}
                      color="#718096"
                    />

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      style={{
                        border: "none",
                        outline: "none",
                        width: "100%",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </div>

                {/* EMAIL */}

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 800,
                      marginBottom: "7px",
                    }}
                  >
                    Email Address
                  </label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      border: "1px solid #d8e5f0",
                      borderRadius: "12px",
                      padding: "11px 13px",
                    }}
                  >
                    <Mail
                      size={17}
                      color="#718096"
                    />

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="guard@example.com"
                      style={{
                        border: "none",
                        outline: "none",
                        width: "100%",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </div>

                {/* PHONE */}

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 800,
                      marginBottom: "7px",
                    }}
                  >
                    Mobile Number
                  </label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      border: "1px solid #d8e5f0",
                      borderRadius: "12px",
                      padding: "11px 13px",
                    }}
                  >
                    <Phone
                      size={17}
                      color="#718096"
                    />

                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      style={{
                        border: "none",
                        outline: "none",
                        width: "100%",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 800,
                      marginBottom: "7px",
                    }}
                  >
                    Password
                  </label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      border: "1px solid #d8e5f0",
                      borderRadius: "12px",
                      padding: "11px 13px",
                    }}
                  >
                    <ShieldCheck
                      size={17}
                      color="#718096"
                    />

                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      style={{
                        border: "none",
                        outline: "none",
                        width: "100%",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "20px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 18px",
                    background:
                      "linear-gradient(135deg, #0f4c81, #087ea4)",
                    color: "white",
                    fontWeight: 850,
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                    opacity: saving ? 0.7 : 1,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <UserPlus size={17} />

                  {saving
                    ? "Creating..."
                    : "Create Guard"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    border:
                      "1px solid #d8e5f0",
                    borderRadius: "12px",
                    padding: "12px 18px",
                    background: "white",
                    color: "#475569",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SEARCH */}

        <div
          style={{
            background: "white",
            border: "1px solid #e3edf7",
            borderRadius: "18px",
            padding: "14px 16px",
            marginBottom: "18px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Search
            size={19}
            color="#718096"
          />

          <input
            type="text"
            placeholder="Search guards by name, email or phone..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              fontSize: "14px",
              color: "#172033",
            }}
          />
        </div>

        {/* GUARD LIST */}

        <div
          style={{
            background: "white",
            border: "1px solid #e3edf7",
            borderRadius: "22px",
            padding: "24px",
            boxShadow:
              "0 12px 32px rgba(15,76,129,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "19px",
                  fontWeight: 850,
                }}
              >
                Guard Accounts
              </h2>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "#718096",
                  fontSize: "13px",
                }}
              >
                {filteredGuards.length} guard
                {filteredGuards.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>

            <ShieldCheck
              size={23}
              color="#0f4c81"
            />
          </div>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "45px 20px",
                color: "#64748b",
              }}
            >
              Loading guards...
            </div>
          ) : filteredGuards.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "45px 20px",
                color: "#64748b",
              }}
            >
              <ShieldCheck
                size={45}
                color="#94a3b8"
              />

              <h3
                style={{
                  color: "#334155",
                  margin:
                    "13px 0 5px",
                }}
              >
                No Guards Found
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                }}
              >
                Add a security guard to get started.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {filteredGuards.map((guard) => (
                <div
                  key={
                    guard._id ||
                    guard.id
                  }
                  style={{
                    border:
                      "1px solid #e7eef5",
                    borderRadius: "17px",
                    padding: "17px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "13px",
                    }}
                  >
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "14px",
                        background:
                          "#edf7ff",
                        color: "#0f4c81",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ShieldCheck
                        size={23}
                      />
                    </div>

                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          fontWeight: 850,
                        }}
                      >
                        {guard.name}
                      </h3>

                      <div
                        style={{
                          display: "flex",
                          gap: "14px",
                          flexWrap: "wrap",
                          marginTop: "6px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            color: "#64748b",
                            fontSize: "12px",
                          }}
                        >
                          <Mail size={13} />
                          {guard.email}
                        </span>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            color: "#64748b",
                            fontSize: "12px",
                          }}
                        >
                          <Phone size={13} />
                          {guard.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleStatus(guard)
                      }
                      style={{
                        border: "none",
                        borderRadius: "999px",
                        padding:
                          "7px 11px",
                        background:
                          guard.isActive ===
                          false
                            ? "#fff7ed"
                            : "#ecfdf3",
                        color:
                          guard.isActive ===
                          false
                            ? "#b45309"
                            : "#15803d",
                        fontWeight: 800,
                        fontSize: "11px",
                        cursor: "pointer",
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: "5px",
                      }}
                    >
                      {guard.isActive ===
                      false ? (
                        <>
                          <UserX
                            size={13}
                          />
                          Inactive
                        </>
                      ) : (
                        <>
                          <CheckCircle2
                            size={13}
                          />
                          Active
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteGuard(
                          guard
                        )
                      }
                      title="Delete guard"
                      style={{
                        width: "36px",
                        height: "36px",
                        border:
                          "1px solid #fee2e2",
                        borderRadius:
                          "10px",
                        background:
                          "#fffafa",
                        color: "#dc2626",
                        cursor: "pointer",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                      }}
                    >
                      <Trash2
                        size={17}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECURITY NOTE */}

        <div
          style={{
            marginTop: "20px",
            background: "#f0f9ff",
            border:
              "1px solid #ccecff",
            borderRadius: "17px",
            padding: "16px 18px",
            display: "flex",
            gap: "11px",
            alignItems: "flex-start",
          }}
        >
          <ShieldCheck
            size={19}
            color="#0f4c81"
            style={{
              flexShrink: 0,
              marginTop: "1px",
            }}
          />

          <div>
            <strong
              style={{
                fontSize: "13px",
                color: "#0f4c81",
              }}
            >
              Guard Security
            </strong>

            <p
              style={{
                margin: "4px 0 0",
                color: "#52677d",
                fontSize: "12px",
                lineHeight: 1.6,
              }}
            >
              Guard accounts are separate from resident
              accounts and do not require a flat number.
              Only administrators should create or deactivate
              guard accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminGuards;