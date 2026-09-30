import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Users,
  Home,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "visitorHubFlats";

const DEFAULT_FLATS = [
  {
    id: "flat-a101",
    flatNumber: "A-101",
    building: "A",
    floor: "1",
    residentName: "Demo Resident",
    status: "occupied",
    isActive: true,
  },
  {
    id: "flat-a102",
    flatNumber: "A-102",
    building: "A",
    floor: "1",
    residentName: "",
    status: "vacant",
    isActive: true,
  },
  {
    id: "flat-a103",
    flatNumber: "A-103",
    building: "A",
    floor: "1",
    residentName: "",
    status: "vacant",
    isActive: true,
  },
  {
    id: "flat-a104",
    flatNumber: "A-104",
    building: "A",
    floor: "1",
    residentName: "",
    status: "vacant",
    isActive: true,
  },
  {
    id: "flat-b201",
    flatNumber: "B-201",
    building: "B",
    floor: "2",
    residentName: "",
    status: "vacant",
    isActive: true,
  },
  {
    id: "flat-b202",
    flatNumber: "B-202",
    building: "B",
    floor: "2",
    residentName: "",
    status: "vacant",
    isActive: true,
  },
  {
    id: "flat-b203",
    flatNumber: "B-203",
    building: "B",
    floor: "2",
    residentName: "",
    status: "vacant",
    isActive: true,
  },
  {
    id: "flat-b204",
    flatNumber: "B-204",
    building: "B",
    floor: "2",
    residentName: "",
    status: "vacant",
    isActive: true,
  },
];

const getSavedFlats = () => {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "null"
    );

    if (Array.isArray(saved) && saved.length > 0) {
      return saved;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_FLATS)
    );

    return DEFAULT_FLATS;
  } catch {
    return DEFAULT_FLATS;
  }
};

const saveFlats = (flats) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flats));
};

const AdminFlats = () => {
  const navigate = useNavigate();

  const [flats, setFlats] = useState([]);
  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] =
    useState("all");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingFlat, setEditingFlat] = useState(null);

  const [form, setForm] = useState({
    flatNumber: "",
    building: "A",
    floor: "1",
    residentName: "",
  });

  useEffect(() => {
    setFlats(getSavedFlats());
  }, []);

  const stats = useMemo(() => {
    const total = flats.length;

    const occupied = flats.filter(
      (flat) => flat.status === "occupied"
    ).length;

    const vacant = flats.filter(
      (flat) => flat.status === "vacant"
    ).length;

    const inactive = flats.filter(
      (flat) => !flat.isActive
    ).length;

    return {
      total,
      occupied,
      vacant,
      inactive,
    };
  }, [flats]);

  const filteredFlats = useMemo(() => {
    return flats.filter((flat) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        flat.flatNumber.toLowerCase().includes(query) ||
        (flat.residentName || "")
          .toLowerCase()
          .includes(query);

      const matchesBuilding =
        buildingFilter === "all" ||
        flat.building === buildingFilter;

      const matchesStatus =
        statusFilter === "all" ||
        flat.status === statusFilter;

      return (
        matchesSearch &&
        matchesBuilding &&
        matchesStatus
      );
    });
  }, [
    flats,
    search,
    buildingFilter,
    statusFilter,
  ]);

  const openAddModal = () => {
    setEditingFlat(null);

    setForm({
      flatNumber: "",
      building: "A",
      floor: "1",
      residentName: "",
    });

    setShowModal(true);
  };

  const openEditModal = (flat) => {
    setEditingFlat(flat);

    setForm({
      flatNumber: flat.flatNumber,
      building: flat.building,
      floor: flat.floor,
      residentName: flat.residentName || "",
    });

    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const flatNumber = form.flatNumber
      .trim()
      .toUpperCase();

    if (!/^[AB]-\d{3}$/.test(flatNumber)) {
      alert(
        "Flat number format should be like A-101 or B-201."
      );
      return;
    }

    const duplicate = flats.some(
      (flat) =>
        flat.flatNumber === flatNumber &&
        flat.id !== editingFlat?.id
    );

    if (duplicate) {
      alert("This flat already exists.");
      return;
    }

    if (editingFlat) {
      const updated = flats.map((flat) => {
        if (flat.id !== editingFlat.id) {
          return flat;
        }

        return {
          ...flat,
          flatNumber,
          building: form.building,
          floor: form.floor,
          residentName:
            form.residentName.trim(),
          status: form.residentName.trim()
            ? "occupied"
            : "vacant",
        };
      });

      setFlats(updated);
      saveFlats(updated);
    } else {
      const newFlat = {
        id: `flat-${Date.now()}`,
        flatNumber,
        building: form.building,
        floor: form.floor,
        residentName:
          form.residentName.trim(),
        status: form.residentName.trim()
          ? "occupied"
          : "vacant",
        isActive: true,
      };

      const updated = [...flats, newFlat];

      setFlats(updated);
      saveFlats(updated);
    }

    setShowModal(false);
  };

  const toggleOccupancy = (id) => {
    const updated = flats.map((flat) => {
      if (flat.id !== id) return flat;

      const isOccupied =
        flat.status === "occupied";

      return {
        ...flat,
        status: isOccupied
          ? "vacant"
          : "occupied",
      };
    });

    setFlats(updated);
    saveFlats(updated);
  };

  const toggleActive = (id) => {
    const updated = flats.map((flat) => {
      if (flat.id !== id) return flat;

      return {
        ...flat,
        isActive: !flat.isActive,
      };
    });

    setFlats(updated);
    saveFlats(updated);
  };

  const deleteFlat = (id) => {
    const flat = flats.find(
      (item) => item.id === id
    );

    if (!flat) return;

    const confirmed = window.confirm(
      `Delete ${flat.flatNumber}?`
    );

    if (!confirmed) return;

    const updated = flats.filter(
      (item) => item.id !== id
    );

    setFlats(updated);
    saveFlats(updated);
  };

  const resetFlats = () => {
    const confirmed = window.confirm(
      "Reset flats to the default society flats?"
    );

    if (!confirmed) return;

    setFlats(DEFAULT_FLATS);
    saveFlats(DEFAULT_FLATS);
  };

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
      }}
    >
      <div
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <button
          onClick={() => navigate("/admin/dashboard")}
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
                color: "white",
              }}
            >
              <Building2 size={25} />
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
                Manage Flats
              </h1>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Manage society flats and occupancy status.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              onClick={resetFlats}
              style={{
                border: "1px solid #dbeafe",
                background: "white",
                color: "#2563eb",
                borderRadius: "11px",
                padding: "11px 14px",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              <RefreshCw size={16} />
              Reset
            </button>

            <button
              onClick={openAddModal}
              style={{
                border: "none",
                background:
                  "linear-gradient(135deg, #2563eb, #0891b2)",
                color: "white",
                borderRadius: "11px",
                padding: "11px 16px",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                cursor: "pointer",
                fontWeight: "800",
              }}
            >
              <Plus size={17} />
              Add Flat
            </button>
          </div>
        </div>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <StatCard
            title="Total Flats"
            value={stats.total}
            icon={<Building2 size={21} />}
          />

          <StatCard
            title="Occupied"
            value={stats.occupied}
            icon={<Users size={21} />}
          />

          <StatCard
            title="Vacant"
            value={stats.vacant}
            icon={<Home size={21} />}
          />

          <StatCard
            title="Inactive"
            value={stats.inactive}
            icon={<XCircle size={21} />}
          />
        </div>

        {/* FILTERS */}
        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "17px",
            padding: "17px",
            marginBottom: "20px",
            boxShadow:
              "0 8px 25px rgba(15, 23, 42, 0.05)",
            display: "grid",
            gridTemplateColumns:
              "minmax(240px, 1fr) 180px 180px",
            gap: "12px",
          }}
        >
          <div
            style={{
              position: "relative",
            }}
          >
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "13px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search flat or resident..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 12px 12px 40px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                outline: "none",
                fontSize: "14px",
              }}
            />
          </div>

          <select
            value={buildingFilter}
            onChange={(e) =>
              setBuildingFilter(e.target.value)
            }
            style={{
              padding: "12px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              background: "white",
              fontSize: "14px",
              outline: "none",
            }}
          >
            <option value="all">
              All Buildings
            </option>
            <option value="A">Building A</option>
            <option value="B">Building B</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            style={{
              padding: "12px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              background: "white",
              fontSize: "14px",
              outline: "none",
            }}
          >
            <option value="all">
              All Status
            </option>
            <option value="occupied">
              Occupied
            </option>
            <option value="vacant">
              Vacant
            </option>
          </select>
        </div>

        {/* FLATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "17px",
          }}
        >
          {filteredFlats.map((flat) => {
            const occupied =
              flat.status === "occupied";

            return (
              <div
                key={flat.id}
                style={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "17px",
                  padding: "19px",
                  boxShadow:
                    "0 8px 25px rgba(15, 23, 42, 0.05)",
                  opacity: flat.isActive ? 1 : 0.65,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "10px",
                    marginBottom: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "11px",
                    }}
                  >
                    <div
                      style={{
                        width: "43px",
                        height: "43px",
                        borderRadius: "11px",
                        background: "#eff6ff",
                        color: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Home size={21} />
                    </div>

                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "19px",
                          color: "#0f172a",
                        }}
                      >
                        {flat.flatNumber}
                      </h3>

                      <div
                        style={{
                          color: "#64748b",
                          fontSize: "12px",
                          marginTop: "3px",
                        }}
                      >
                        Building {flat.building} • Floor{" "}
                        {flat.floor}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      background: flat.isActive
                        ? "#dcfce7"
                        : "#fee2e2",
                      color: flat.isActive
                        ? "#166534"
                        : "#991b1b",
                      padding: "5px 8px",
                      borderRadius: "7px",
                      fontSize: "10px",
                      fontWeight: "800",
                    }}
                  >
                    {flat.isActive
                      ? "ACTIVE"
                      : "INACTIVE"}
                  </span>
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "11px",
                    padding: "13px",
                    marginBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: "700",
                      marginBottom: "5px",
                    }}
                  >
                    RESIDENT
                  </div>

                  <div
                    style={{
                      color: "#334155",
                      fontSize: "14px",
                      fontWeight: "700",
                    }}
                  >
                    {flat.residentName ||
                      "No resident assigned"}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: occupied
                        ? "#dcfce7"
                        : "#f1f5f9",
                      color: occupied
                        ? "#166534"
                        : "#475569",
                      padding: "7px 10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: "800",
                    }}
                  >
                    {occupied ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <Home size={14} />
                    )}

                    {occupied
                      ? "Occupied"
                      : "Vacant"}
                  </span>

                  <button
                    onClick={() =>
                      toggleOccupancy(flat.id)
                    }
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#2563eb",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: "800",
                    }}
                  >
                    Change
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr 1fr",
                    gap: "7px",
                  }}
                >
                  <button
                    onClick={() =>
                      openEditModal(flat)
                    }
                    style={{
                      border: "1px solid #dbeafe",
                      background: "#eff6ff",
                      color: "#2563eb",
                      borderRadius: "9px",
                      padding: "9px 5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      toggleActive(flat.id)
                    }
                    style={{
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      color: "#475569",
                      borderRadius: "9px",
                      padding: "9px 5px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    {flat.isActive
                      ? "Disable"
                      : "Enable"}
                  </button>

                  <button
                    onClick={() =>
                      deleteFlat(flat.id)
                    }
                    style={{
                      border: "1px solid #fee2e2",
                      background: "#fef2f2",
                      color: "#dc2626",
                      borderRadius: "9px",
                      padding: "9px 5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredFlats.length === 0 && (
          <div
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "17px",
              padding: "60px 20px",
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            <Building2
              size={42}
              color="#94a3b8"
              style={{ marginBottom: "10px" }}
            />

            <h3
              style={{
                margin: "0 0 5px",
                color: "#334155",
              }}
            >
              No flats found
            </h3>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Try changing your search or filters.
            </p>
          </div>
        )}

        {/* INFO */}
        <div
          style={{
            marginTop: "20px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "14px",
            padding: "15px 17px",
            color: "#475569",
            fontSize: "12px",
            lineHeight: 1.6,
          }}
        >
          <strong
            style={{
              color: "#1e40af",
            }}
          >
            Flat Management:
          </strong>{" "}
          Admin can add, edit, activate/deactivate and manage
          occupancy of society flats.
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
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
              background: "white",
              borderRadius: "20px",
              padding: "24px",
              boxShadow:
                "0 25px 60px rgba(15, 23, 42, 0.2)",
            }}
          >
            <h2
              style={{
                margin: "0 0 5px",
                color: "#0f172a",
              }}
            >
              {editingFlat
                ? "Edit Flat"
                : "Add New Flat"}
            </h2>

            <p
              style={{
                margin: "0 0 20px",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Enter flat details below.
            </p>

            <form onSubmit={handleSubmit}>
              <label style={labelStyle}>
                Flat Number
              </label>

              <input
                value={form.flatNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    flatNumber:
                      e.target.value.toUpperCase(),
                  })
                }
                placeholder="A-101"
                required
                style={inputStyle}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "12px",
                  marginTop: "15px",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Building
                  </label>

                  <select
                    value={form.building}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        building: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="A">
                      Building A
                    </option>
                    <option value="B">
                      Building B
                    </option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    Floor
                  </label>

                  <select
                    value={form.floor}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        floor: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="1">
                      Floor 1
                    </option>
                    <option value="2">
                      Floor 2
                    </option>
                    <option value="3">
                      Floor 3
                    </option>
                    <option value="4">
                      Floor 4
                    </option>
                    <option value="5">
                      Floor 5
                    </option>
                  </select>
                </div>
              </div>

              <label
                style={{
                  ...labelStyle,
                  marginTop: "15px",
                }}
              >
                Resident Name
              </label>

              <input
                value={form.residentName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    residentName: e.target.value,
                  })
                }
                placeholder="Optional"
                style={inputStyle}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "22px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  style={{
                    border: "1px solid #cbd5e1",
                    background: "white",
                    color: "#475569",
                    padding: "11px 16px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    border: "none",
                    background:
                      "linear-gradient(135deg, #2563eb, #0891b2)",
                    color: "white",
                    padding: "11px 18px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "800",
                  }}
                >
                  {editingFlat
                    ? "Save Changes"
                    : "Add Flat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>
        {`
          @media (max-width: 750px) {
            .flat-filter-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
}) => {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "18px",
        display: "flex",
        alignItems: "center",
        gap: "13px",
        boxShadow:
          "0 7px 22px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          width: "43px",
          height: "43px",
          borderRadius: "11px",
          background: "#eff6ff",
          color: "#2563eb",
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
            color: "#64748b",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: "#0f172a",
            fontSize: "24px",
            fontWeight: "800",
            marginTop: "2px",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: "block",
  color: "#334155",
  fontSize: "12px",
  fontWeight: "800",
  marginBottom: "7px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  outline: "none",
  fontSize: "14px",
  background: "white",
};

export default AdminFlats;