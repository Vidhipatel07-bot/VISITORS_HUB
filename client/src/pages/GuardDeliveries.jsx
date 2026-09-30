import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../utils/api";

const DELIVERY_WAIT_TIME = 120;

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f5f9ff 0%, #eef6ff 50%, #f9fcff 100%)",
    color: "#10233f",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    background: "#fff",
    borderBottom: "1px solid #e4edf7",
    padding: "18px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    position: "sticky",
    top: 0,
    zIndex: 20,
    boxShadow: "0 4px 18px rgba(25, 65, 110, 0.06)",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  backButton: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    border: "1px solid #dce7f2",
    background: "#fff",
    color: "#52657d",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background: "linear-gradient(135deg, #0d47a1, #1687d9)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 800,
  },

  subtitle: {
    margin: "3px 0 0",
    color: "#7a8ba0",
    fontSize: "11px",
  },

  refreshButton: {
    border: "1px solid #dce7f2",
    background: "#fff",
    color: "#52657d",
    borderRadius: "10px",
    padding: "9px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontWeight: 700,
    fontSize: "12px",
  },

  container: {
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "28px 24px 50px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "22px",
  },

  statCard: {
    background: "#fff",
    border: "1px solid #e3ecf7",
    borderRadius: "17px",
    padding: "18px",
    boxShadow: "0 7px 22px rgba(31, 76, 120, 0.05)",
  },

  statIcon: {
    width: "39px",
    height: "39px",
    borderRadius: "11px",
    background: "#eef7ff",
    color: "#1687d9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  statNumber: {
    fontSize: "25px",
    fontWeight: 800,
    margin: "12px 0 3px",
  },

  statLabel: {
    margin: 0,
    color: "#718399",
    fontSize: "12px",
  },

  toolbar: {
    background: "#fff",
    border: "1px solid #e3ecf7",
    borderRadius: "16px",
    padding: "14px",
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    boxShadow: "0 7px 22px rgba(31, 76, 120, 0.05)",
  },

  searchBox: {
    flex: 1,
    position: "relative",
  },

  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#8b9aab",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px 11px 38px",
    border: "1px solid #dce7f2",
    borderRadius: "10px",
    outline: "none",
    fontSize: "13px",
    background: "#fbfdff",
  },

  select: {
    minWidth: "170px",
    border: "1px solid #dce7f2",
    borderRadius: "10px",
    padding: "10px 12px",
    background: "#fbfdff",
    color: "#52657d",
    outline: "none",
    fontSize: "12px",
  },

  section: {
    background: "#fff",
    border: "1px solid #e3ecf7",
    borderRadius: "19px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 7px 22px rgba(31, 76, 120, 0.05)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "17px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 800,
  },

  sectionSub: {
    margin: "4px 0 0",
    color: "#7a8ca0",
    fontSize: "11px",
  },

  deliveryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "14px",
  },

  deliveryCard: {
    border: "1px solid #e2ebf5",
    borderRadius: "15px",
    padding: "16px",
    background: "#fcfeff",
  },

  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "10px",
  },

  personRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  personIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#edf6ff",
    color: "#1479c1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  personName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 800,
  },

  typeText: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#7c8ca0",
  },

  badge: {
    borderRadius: "20px",
    padding: "5px 9px",
    fontSize: "10px",
    fontWeight: 800,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "9px",
    marginTop: "15px",
  },

  infoBox: {
    background: "#f5f9fd",
    borderRadius: "9px",
    padding: "9px",
  },

  infoLabel: {
    margin: 0,
    fontSize: "9px",
    color: "#8797a9",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  infoValue: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#344b65",
    fontWeight: 700,
  },

  timer: {
    marginTop: "12px",
    borderRadius: "10px",
    padding: "10px 12px",
    background: "#eef7ff",
    color: "#1477bd",
    fontSize: "11px",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  holdNotice: {
    marginTop: "12px",
    borderRadius: "10px",
    padding: "10px 12px",
    background: "#fff7e8",
    color: "#a96f0c",
    fontSize: "11px",
    fontWeight: 700,
    display: "flex",
    alignItems: "flex-start",
    gap: "7px",
    lineHeight: 1.4,
  },

  description: {
    margin: "12px 0 0",
    fontSize: "11px",
    color: "#718399",
    lineHeight: 1.5,
  },

  actions: {
    display: "flex",
    gap: "8px",
    marginTop: "14px",
  },

  actionButton: {
    flex: 1,
    border: "none",
    borderRadius: "9px",
    padding: "9px 10px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },

  approveButton: {
    background: "#eafaf1",
    color: "#208452",
  },

  rejectButton: {
    background: "#fff0f0",
    color: "#c33f3f",
  },

  completeButton: {
    background: "#edf5ff",
    color: "#236aa7",
  },

  holdButton: {
    background: "#fff7e8",
    color: "#a96f0c",
  },

  empty: {
    textAlign: "center",
    padding: "40px 15px",
    color: "#7d8da0",
    fontSize: "13px",
  },

  loading: {
    textAlign: "center",
    padding: "45px",
    color: "#718399",
    fontSize: "13px",
  },

  error: {
    background: "#fff1f1",
    border: "1px solid #ffd6d6",
    color: "#c33d3d",
    padding: "11px 13px",
    borderRadius: "10px",
    marginBottom: "15px",
    fontSize: "12px",
  },

  success: {
    background: "#effcf5",
    border: "1px solid #cdeedc",
    color: "#208452",
    padding: "11px 13px",
    borderRadius: "10px",
    marginBottom: "15px",
    fontSize: "12px",
  },

  notice: {
    background: "#f3f8ff",
    border: "1px solid #dcecff",
    borderRadius: "13px",
    padding: "14px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    color: "#63778e",
    fontSize: "11px",
    lineHeight: 1.5,
  },
};

function getLocalDeliveries() {
  try {
    const saved = localStorage.getItem("deliveryRequests");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalDeliveries(data) {
  localStorage.setItem(
    "deliveryRequests",
    JSON.stringify(data)
  );
}

function normalizeDelivery(item) {
  return {
    ...item,
    id:
      item._id ||
      item.id ||
      `delivery-${Date.now()}-${Math.random()}`,

    personName:
      item.personName ||
      item.deliveryPerson ||
      "Delivery Person",

    deliveryPerson:
      item.deliveryPerson ||
      item.personName ||
      "Delivery Person",

    deliveryType:
      item.deliveryType ||
      item.type ||
      "Other",

    type:
      item.type ||
      item.deliveryType ||
      "Other",

    flat: item.flat || "",
    phone: item.phone || "",
    status: item.status || "pending",

    createdAt:
      item.createdAt ||
      item.registeredAt ||
      new Date().toISOString(),
  };
}

function getStatusStyle(status) {
  switch (status) {
    case "approved":
      return {
        background: "#eafaf1",
        color: "#218554",
      };

    case "rejected":
      return {
        background: "#fff0f0",
        color: "#c33f3f",
      };

    case "held":
      return {
        background: "#fff7e8",
        color: "#a96f0c",
      };

    case "completed":
      return {
        background: "#edf5ff",
        color: "#236aa7",
      };

    default:
      return {
        background: "#eef7ff",
        color: "#1477bd",
      };
  }
}

function formatDate(date) {
  if (!date) return "--";

  try {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return "--";
  }
}

function formatTime(date) {
  if (!date) return "--";

  try {
    return new Date(date).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return "--";
  }
}

function remainingSeconds(createdAt) {
  const created = new Date(createdAt).getTime();

  if (Number.isNaN(created)) {
    return DELIVERY_WAIT_TIME;
  }

  const elapsed = Math.floor(
    (Date.now() - created) / 1000
  );

  return Math.max(
    0,
    DELIVERY_WAIT_TIME - elapsed
  );
}

function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
}

function GuardDeliveries() {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [tick, setTick] = useState(Date.now());

  /*
  |--------------------------------------------------------------------------
  | LOAD
  |--------------------------------------------------------------------------
  */

  const loadDeliveries = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/deliveries");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.deliveries || [];

      setDeliveries(
        data.map(normalizeDelivery)
      );
    } catch (backendError) {
      console.log(
        "Backend unavailable. Loading local delivery data."
      );

      const local = getLocalDeliveries().map(
        normalizeDelivery
      );

      setDeliveries(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | TIMER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | AUTOMATIC HOLD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!deliveries.length) return;

    const processExpired = async () => {
      let hasChanges = false;

      const updated = await Promise.all(
        deliveries.map(async (delivery) => {
          if (
            delivery.status !== "pending" ||
            remainingSeconds(
              delivery.createdAt
            ) > 0
          ) {
            return delivery;
          }

          hasChanges = true;

          try {
            const response = await api.put(
              `/deliveries/${delivery.id}/hold`,
              {
                reason:
                  "Resident did not respond within 2 minutes.",
              }
            );

            return normalizeDelivery(
              response.data?.delivery ||
                response.data
            );
          } catch {
            return {
              ...delivery,
              status: "held",
              heldAt:
                new Date().toISOString(),
              holdReason:
                "Resident did not respond within 2 minutes.",
            };
          }
        })
      );

      if (hasChanges) {
        setDeliveries(updated);
        saveLocalDeliveries(updated);
      }
    };

    processExpired();
  }, [tick]);

  /*
  |--------------------------------------------------------------------------
  | STATUS UPDATE
  |--------------------------------------------------------------------------
  */

  const updateStatus = async (
    delivery,
    newStatus
  ) => {
    setError("");
    setSuccess("");

    try {
      const response = await api.put(
        `/deliveries/${delivery.id}/status`,
        {
          status: newStatus,
        }
      );

      const updatedDelivery =
        normalizeDelivery(
          response.data?.delivery ||
            response.data
        );

      setDeliveries((prev) =>
        prev.map((item) =>
          item.id === delivery.id
            ? updatedDelivery
            : item
        )
      );

      const local = getLocalDeliveries();

      saveLocalDeliveries(
        local.map((item) =>
          (item._id || item.id) === delivery.id
            ? updatedDelivery
            : item
        )
      );

      setSuccess(
        `Delivery ${newStatus} successfully.`
      );
    } catch (backendError) {
      /*
      |--------------------------------------------------------------------------
      | LOCAL FALLBACK
      |--------------------------------------------------------------------------
      */

      const updated = deliveries.map(
        (item) =>
          item.id === delivery.id
            ? {
                ...item,
                status: newStatus,
                decisionAt:
                  new Date().toISOString(),
                ...(newStatus === "held"
                  ? {
                      heldAt:
                        new Date().toISOString(),
                      holdReason:
                        "Resident did not respond within 2 minutes.",
                    }
                  : {}),
                ...(newStatus === "completed"
                  ? {
                      completedAt:
                        new Date().toISOString(),
                    }
                  : {}),
              }
            : item
      );

      setDeliveries(updated);
      saveLocalDeliveries(updated);

      setSuccess(
        `Delivery ${newStatus} successfully.`
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const filteredDeliveries = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return deliveries
      .filter((delivery) => {
        if (
          statusFilter !== "all" &&
          delivery.status !== statusFilter
        ) {
          return false;
        }

        if (!keyword) return true;

        return [
          delivery.personName,
          delivery.phone,
          delivery.flat,
          delivery.deliveryType,
          delivery.company,
          delivery.trackingNumber,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(keyword)
          );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [deliveries, search, statusFilter]);

  /*
  |--------------------------------------------------------------------------
  | STATS
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(
    () => ({
      pending: deliveries.filter(
        (item) =>
          item.status === "pending"
      ).length,

      approved: deliveries.filter(
        (item) =>
          item.status === "approved"
      ).length,

      held: deliveries.filter(
        (item) => item.status === "held"
      ).length,

      completed: deliveries.filter(
        (item) =>
          item.status === "completed"
      ).length,
    }),
    [deliveries]
  );

  /*
  |--------------------------------------------------------------------------
  | CARD GROUP
  |--------------------------------------------------------------------------
  */

  const renderCard = (delivery) => {
    const remaining =
      remainingSeconds(
        delivery.createdAt
      );

    return (
      <div
        key={delivery.id}
        style={styles.deliveryCard}
      >
        <div style={styles.cardTop}>
          <div style={styles.personRow}>
            <div style={styles.personIcon}>
              <Truck size={20} />
            </div>

            <div>
              <p style={styles.personName}>
                {delivery.personName}
              </p>

              <p style={styles.typeText}>
                {delivery.deliveryType}
                {delivery.company
                  ? ` • ${delivery.company}`
                  : ""}
              </p>
            </div>
          </div>

          <span
            style={{
              ...styles.badge,
              ...getStatusStyle(
                delivery.status
              ),
            }}
          >
            {delivery.status}
          </span>
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.infoBox}>
            <p style={styles.infoLabel}>
              Flat
            </p>

            <p style={styles.infoValue}>
              {delivery.flat || "--"}
            </p>
          </div>

          <div style={styles.infoBox}>
            <p style={styles.infoLabel}>
              Mobile
            </p>

            <p style={styles.infoValue}>
              {delivery.phone || "--"}
            </p>
          </div>

          <div style={styles.infoBox}>
            <p style={styles.infoLabel}>
              Date
            </p>

            <p style={styles.infoValue}>
              {formatDate(
                delivery.createdAt
              )}
            </p>
          </div>

          <div style={styles.infoBox}>
            <p style={styles.infoLabel}>
              Registered
            </p>

            <p style={styles.infoValue}>
              {formatTime(
                delivery.createdAt
              )}
            </p>
          </div>
        </div>

        {delivery.trackingNumber && (
          <p
            style={{
              ...styles.description,
              fontWeight: 700,
            }}
          >
            Tracking:{" "}
            {delivery.trackingNumber}
          </p>
        )}

        {delivery.description && (
          <p style={styles.description}>
            {delivery.description}
          </p>
        )}

        {delivery.status ===
          "pending" &&
          remaining > 0 && (
            <div style={styles.timer}>
              <Clock3 size={15} />

              Resident response time:
              <strong>
                {formatCountdown(
                  remaining
                )}
              </strong>
            </div>
          )}

        {delivery.status === "pending" &&
          remaining === 0 && (
            <div
              style={{
                ...styles.timer,
                background: "#fff7e8",
                color: "#a96f0c",
              }}
            >
              <AlertCircle size={15} />
              Approval time expired.
              Delivery will be held at
              security.
            </div>
          )}

        {delivery.status === "held" && (
          <div style={styles.holdNotice}>
            <AlertCircle size={16} />

            <div>
              <strong>
                Held at Security Desk
              </strong>

              <div>
                {delivery.holdReason ||
                  "Resident did not respond within 2 minutes."}
              </div>
            </div>
          </div>
        )}

        {delivery.status ===
          "pending" && (
          <div style={styles.actions}>
            <button
              type="button"
              style={{
                ...styles.actionButton,
                ...styles.approveButton,
              }}
              onClick={() =>
                updateStatus(
                  delivery,
                  "approved"
                )
              }
            >
              <CheckCircle2 size={14} />
              Approve
            </button>

            <button
              type="button"
              style={{
                ...styles.actionButton,
                ...styles.rejectButton,
              }}
              onClick={() =>
                updateStatus(
                  delivery,
                  "rejected"
                )
              }
            >
              <XCircle size={14} />
              Reject
            </button>

            <button
              type="button"
              style={{
                ...styles.actionButton,
                ...styles.holdButton,
              }}
              onClick={() =>
                updateStatus(
                  delivery,
                  "held"
                )
              }
            >
              <AlertCircle size={14} />
              Hold
            </button>
          </div>
        )}

        {(delivery.status ===
          "approved" ||
          delivery.status ===
            "held") && (
          <div style={styles.actions}>
            <button
              type="button"
              style={{
                ...styles.actionButton,
                ...styles.completeButton,
              }}
              onClick={() =>
                updateStatus(
                  delivery,
                  "completed"
                )
              }
            >
              <CheckCircle2 size={14} />
              Mark Completed
            </button>
          </div>
        )}
      </div>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | LOGIC FOR SECTIONS
  |--------------------------------------------------------------------------
  */

  const pending = filteredDeliveries.filter(
    (item) =>
      item.status === "pending"
  );

  const active = filteredDeliveries.filter(
    (item) =>
      item.status === "approved" ||
      item.status === "held"
  );

  const completed = filteredDeliveries.filter(
    (item) =>
      item.status === "completed" ||
      item.status === "rejected"
  );

  return (
    <div style={styles.page}>
      {/* HEADER */}

      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            type="button"
            style={styles.backButton}
            onClick={() =>
              navigate("/guard/dashboard")
            }
          >
            <ArrowLeft size={18} />
          </button>

          <div style={styles.logo}>
            <ShieldCheck size={21} />
          </div>

          <div>
            <h1 style={styles.title}>
              Delivery Management
            </h1>

            <p style={styles.subtitle}>
              Security Guard Panel
            </p>
          </div>
        </div>

        <button
          type="button"
          style={styles.refreshButton}
          onClick={loadDeliveries}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </header>

      <main style={styles.container}>
        {/* STATS */}

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <Clock3 size={19} />
            </div>

            <div style={styles.statNumber}>
              {stats.pending}
            </div>

            <p style={styles.statLabel}>
              Pending Approval
            </p>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <CheckCircle2 size={19} />
            </div>

            <div style={styles.statNumber}>
              {stats.approved}
            </div>

            <p style={styles.statLabel}>
              Approved
            </p>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <AlertCircle size={19} />
            </div>

            <div style={styles.statNumber}>
              {stats.held}
            </div>

            <p style={styles.statLabel}>
              Held at Security
            </p>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <Package size={19} />
            </div>

            <div style={styles.statNumber}>
              {stats.completed}
            </div>

            <p style={styles.statLabel}>
              Completed
            </p>
          </div>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.success}>
            {success}
          </div>
        )}

        {/* TOOLBAR */}

        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <Search
              size={16}
              style={styles.searchIcon}
            />

            <input
              style={styles.searchInput}
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search by person, flat, phone, company..."
            />
          </div>

          <select
            style={styles.select}
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >
            <option value="all">
              All Deliveries
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="held">
              Held
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="rejected">
              Rejected
            </option>
          </select>
        </div>

        {loading ? (
          <div style={styles.loading}>
            Loading deliveries...
          </div>
        ) : (
          <>
            {/* PENDING */}

            {pending.length > 0 && (
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2
                      style={styles.sectionTitle}
                    >
                      Pending Deliveries
                    </h2>

                    <p
                      style={styles.sectionSub}
                    >
                      Resident approval is
                      required
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.badge,
                      ...getStatusStyle(
                        "pending"
                      ),
                    }}
                  >
                    {pending.length} pending
                  </span>
                </div>

                <div style={styles.deliveryGrid}>
                  {pending.map(renderCard)}
                </div>
              </section>
            )}

            {/* APPROVED / HELD */}

            {active.length > 0 && (
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2
                      style={styles.sectionTitle}
                    >
                      Active Deliveries
                    </h2>

                    <p
                      style={styles.sectionSub}
                    >
                      Approved or held at
                      security desk
                    </p>
                  </div>
                </div>

                <div style={styles.deliveryGrid}>
                  {active.map(renderCard)}
                </div>
              </section>
            )}

            {/* COMPLETED / REJECTED */}

            {completed.length > 0 && (
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div>
                    <h2
                      style={styles.sectionTitle}
                    >
                      Recent Completed / Rejected
                    </h2>

                    <p
                      style={styles.sectionSub}
                    >
                      Previous delivery activity
                    </p>
                  </div>
                </div>

                <div style={styles.deliveryGrid}>
                  {completed.map(renderCard)}
                </div>
              </section>
            )}

            {filteredDeliveries.length ===
              0 && (
              <div
                style={{
                  ...styles.section,
                  ...styles.empty,
                }}
              >
                <Package
                  size={35}
                  style={{
                    marginBottom: "10px",
                    opacity: 0.6,
                  }}
                />

                <div>
                  No deliveries found.
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    fontSize: "11px",
                  }}
                >
                  Try changing the search or
                  status filter.
                </div>
              </div>
            )}
          </>
        )}

        {/* SECURITY NOTICE */}

        <div style={styles.notice}>
          <ShieldCheck size={18} />

          <div>
            <strong>
              Delivery Security Policy
            </strong>

            <div>
              A delivery person should not be
              sent to a resident's flat without
              proper approval. If the resident
              does not respond within 2 minutes,
              keep the parcel at the security
              desk and mark it as held.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GuardDeliveries;