import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
  AlertCircle,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../utils/api";

const WAIT_TIME = 120;

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
    position: "sticky",
    top: 0,
    zIndex: 20,
    boxShadow: "0 4px 18px rgba(25,65,110,0.06)",
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
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "28px 24px 50px",
  },

  intro: {
    marginBottom: "20px",
  },

  heading: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 800,
  },

  introText: {
    margin: "6px 0 0",
    color: "#718399",
    fontSize: "13px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0,1fr))",
    gap: "15px",
    marginBottom: "20px",
  },

  statCard: {
    background: "#fff",
    border: "1px solid #e3ecf7",
    borderRadius: "17px",
    padding: "18px",
    boxShadow: "0 7px 22px rgba(31,76,120,0.05)",
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
    margin: "12px 0 3px",
    fontSize: "25px",
    fontWeight: 800,
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
    boxShadow: "0 7px 22px rgba(31,76,120,0.05)",
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
    boxShadow: "0 7px 22px rgba(31,76,120,0.05)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 800,
  },

  sectionSub: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "#7a8ca0",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill,minmax(320px,1fr))",
    gap: "14px",
  },

  card: {
    background: "#fcfeff",
    border: "1px solid #e2ebf5",
    borderRadius: "15px",
    padding: "16px",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
  },

  person: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  personIcon: {
    width: "43px",
    height: "43px",
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

  type: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#7c8ca0",
  },

  badge: {
    padding: "5px 9px",
    borderRadius: "20px",
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

  info: {
    background: "#f5f9fd",
    borderRadius: "9px",
    padding: "9px",
  },

  label: {
    margin: 0,
    fontSize: "9px",
    color: "#8797a9",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  value: {
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

  hold: {
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

  actions: {
    display: "flex",
    gap: "8px",
    marginTop: "14px",
  },

  button: {
    flex: 1,
    border: "none",
    borderRadius: "9px",
    padding: "10px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },

  approve: {
    background: "#eafaf1",
    color: "#208452",
  },

  reject: {
    background: "#fff0f0",
    color: "#c33f3f",
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
    gap: "10px",
    alignItems: "flex-start",
    color: "#63778e",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  empty: {
    textAlign: "center",
    padding: "40px 15px",
    color: "#7d8da0",
    fontSize: "13px",
  },
};

function normalizeDelivery(item) {
  return {
    ...item,
    id: item._id || item.id,
    personName:
      item.personName ||
      item.deliveryPerson ||
      "Delivery Person",
    deliveryType:
      item.deliveryType ||
      item.type ||
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

function getLocalDeliveries() {
  try {
    const saved =
      localStorage.getItem("deliveryRequests");

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

function getRemainingSeconds(createdAt) {
  const created =
    new Date(createdAt).getTime();

  if (Number.isNaN(created)) {
    return WAIT_TIME;
  }

  const elapsed = Math.floor(
    (Date.now() - created) / 1000
  );

  return Math.max(
    0,
    WAIT_TIME - elapsed
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

function formatDate(date) {
  if (!date) return "--";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(date) {
  if (!date) return "--";

  return new Date(date).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function Deliveries() {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [tick, setTick] =
    useState(Date.now());

  /*
  |--------------------------------------------------------------------------
  | LOAD DELIVERIES
  |--------------------------------------------------------------------------
  */

  const loadDeliveries = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await api.get("/deliveries");

      const data = Array.isArray(
        response.data
      )
        ? response.data
        : response.data?.deliveries || [];

      setDeliveries(
        data.map(normalizeDelivery)
      );
    } catch {
      const local =
        getLocalDeliveries().map(
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
  | LOCAL 2-MINUTE EXPIRY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!deliveries.length) return;

    const expirePending = async () => {
      let changed = false;

      const updated =
        await Promise.all(
          deliveries.map(
            async (delivery) => {
              if (
                delivery.status !==
                  "pending" ||
                getRemainingSeconds(
                  delivery.createdAt
                ) > 0
              ) {
                return delivery;
              }

              changed = true;

              try {
                const response =
                  await api.put(
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
            }
          )
        );

      if (changed) {
        setDeliveries(updated);
        saveLocalDeliveries(updated);
      }
    };

    expirePending();
  }, [tick]);

  /*
  |--------------------------------------------------------------------------
  | RESIDENT DECISION
  |--------------------------------------------------------------------------
  */

  const updateStatus = async (
    delivery,
    status
  ) => {
    setError("");
    setSuccess("");

    try {
      const response =
        await api.put(
          `/deliveries/${delivery.id}/status`,
          { status }
        );

      const updated =
        normalizeDelivery(
          response.data?.delivery ||
            response.data
        );

      setDeliveries((prev) =>
        prev.map((item) =>
          item.id === delivery.id
            ? updated
            : item
        )
      );

      const local =
        getLocalDeliveries();

      saveLocalDeliveries(
        local.map((item) =>
          (item._id || item.id) ===
          delivery.id
            ? updated
            : item
        )
      );

      setSuccess(
        status === "approved"
          ? "Delivery approved successfully."
          : "Delivery rejected successfully."
      );
    } catch {
      const updated =
        deliveries.map((item) =>
          item.id === delivery.id
            ? {
                ...item,
                status,
                decisionAt:
                  new Date().toISOString(),
                ...(status === "approved"
                  ? {
                      approvedAt:
                        new Date().toISOString(),
                    }
                  : {}),
                ...(status === "rejected"
                  ? {
                      rejectedAt:
                        new Date().toISOString(),
                    }
                  : {}),
              }
            : item
        );

      setDeliveries(updated);
      saveLocalDeliveries(updated);

      setSuccess(
        status === "approved"
          ? "Delivery approved successfully."
          : "Delivery rejected successfully."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const filtered = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

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
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );
  }, [
    deliveries,
    search,
    statusFilter,
  ]);

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
        (item) =>
          item.status === "held"
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
  | RENDER CARD
  |--------------------------------------------------------------------------
  */

  const renderCard = (delivery) => {
    const remaining =
      getRemainingSeconds(
        delivery.createdAt
      );

    return (
      <div
        key={delivery.id}
        style={styles.card}
      >
        <div style={styles.cardTop}>
          <div style={styles.person}>
            <div style={styles.personIcon}>
              <Truck size={20} />
            </div>

            <div>
              <p style={styles.personName}>
                {delivery.personName}
              </p>

              <p style={styles.type}>
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
          <div style={styles.info}>
            <p style={styles.label}>
              Flat
            </p>

            <p style={styles.value}>
              {delivery.flat || "--"}
            </p>
          </div>

          <div style={styles.info}>
            <p style={styles.label}>
              Mobile
            </p>

            <p style={styles.value}>
              {delivery.phone || "--"}
            </p>
          </div>

          <div style={styles.info}>
            <p style={styles.label}>
              Date
            </p>

            <p style={styles.value}>
              {formatDate(
                delivery.createdAt
              )}
            </p>
          </div>

          <div style={styles.info}>
            <p style={styles.label}>
              Time
            </p>

            <p style={styles.value}>
              {formatTime(
                delivery.createdAt
              )}
            </p>
          </div>
        </div>

        {delivery.trackingNumber && (
          <p
            style={{
              margin:
                "12px 0 0",
              fontSize: "11px",
              color: "#536980",
              fontWeight: 700,
            }}
          >
            Tracking:{" "}
            {delivery.trackingNumber}
          </p>
        )}

        {delivery.description && (
          <p
            style={{
              margin:
                "8px 0 0",
              fontSize: "11px",
              color: "#718399",
            }}
          >
            {delivery.description}
          </p>
        )}

        {/* PENDING TIMER */}

        {delivery.status ===
          "pending" &&
          remaining > 0 && (
            <div style={styles.timer}>
              <Clock3 size={15} />

              <span>
                Please respond within
              </span>

              <strong>
                {formatCountdown(
                  remaining
                )}
              </strong>
            </div>
          )}

        {/* HELD */}

        {delivery.status ===
          "held" && (
            <div style={styles.hold}>
              <AlertCircle size={16} />

              <div>
                <strong>
                  Parcel held at security desk
                </strong>

                <div>
                  The delivery person was not
                  sent to your flat because the
                  approval time expired.
                </div>
              </div>
            </div>
          )}

        {/* COMPLETED */}

        {delivery.status ===
          "completed" && (
            <div
              style={{
                ...styles.timer,
                background: "#edf5ff",
                color: "#236aa7",
              }}
            >
              <CheckCircle2 size={15} />

              Delivery completed.
            </div>
          )}

        {/* ACTIONS */}

        {delivery.status ===
          "pending" &&
          remaining > 0 && (
            <div style={styles.actions}>
              <button
                type="button"
                style={{
                  ...styles.button,
                  ...styles.approve,
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
                  ...styles.button,
                  ...styles.reject,
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
            </div>
          )}
      </div>
    );
  };

  const pending =
    filtered.filter(
      (item) =>
        item.status === "pending"
    );

  const active =
    filtered.filter(
      (item) =>
        item.status === "approved" ||
        item.status === "held"
    );

  const history =
    filtered.filter(
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
              navigate(
                "/resident/dashboard"
              )
            }
          >
            <ArrowLeft size={18} />
          </button>

          <div style={styles.logo}>
            <ShieldCheck size={21} />
          </div>

          <div>
            <h1 style={styles.title}>
              My Deliveries
            </h1>

            <p style={styles.subtitle}>
              Resident Panel
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
        <div style={styles.intro}>
          <h2 style={styles.heading}>
            Delivery Requests
          </h2>

          <p style={styles.introText}>
            Review and manage deliveries
            registered at the security gate.
          </p>
        </div>

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

        {/* SEARCH */}

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
              placeholder="Search delivery..."
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
          <div style={styles.section}>
            <div style={styles.empty}>
              Loading deliveries...
            </div>
          </div>
        ) : (
          <>
            {/* PENDING */}

            {pending.length > 0 && (
              <section style={styles.section}>
                <div
                  style={styles.sectionHeader}
                >
                  <div>
                    <h3
                      style={
                        styles.sectionTitle
                      }
                    >
                      Pending Approval
                    </h3>

                    <p
                      style={
                        styles.sectionSub
                      }
                    >
                      Please review these
                      delivery requests.
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
                    {pending.length}
                  </span>
                </div>

                <div style={styles.grid}>
                  {pending.map(
                    renderCard
                  )}
                </div>
              </section>
            )}

            {/* ACTIVE */}

            {active.length > 0 && (
              <section style={styles.section}>
                <div
                  style={styles.sectionHeader}
                >
                  <div>
                    <h3
                      style={
                        styles.sectionTitle
                      }
                    >
                      Active Deliveries
                    </h3>

                    <p
                      style={
                        styles.sectionSub
                      }
                    >
                      Approved or held at
                      security.
                    </p>
                  </div>
                </div>

                <div style={styles.grid}>
                  {active.map(
                    renderCard
                  )}
                </div>
              </section>
            )}

            {/* HISTORY */}

            {history.length > 0 && (
              <section style={styles.section}>
                <div
                  style={styles.sectionHeader}
                >
                  <div>
                    <h3
                      style={
                        styles.sectionTitle
                      }
                    >
                      Delivery History
                    </h3>

                    <p
                      style={
                        styles.sectionSub
                      }
                    >
                      Completed and rejected
                      delivery requests.
                    </p>
                  </div>
                </div>

                <div style={styles.grid}>
                  {history.map(
                    renderCard
                  )}
                </div>
              </section>
            )}

            {filtered.length === 0 && (
              <section style={styles.section}>
                <div style={styles.empty}>
                  <Package
                    size={38}
                    style={{
                      opacity: 0.55,
                      marginBottom:
                        "10px",
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
                    New delivery requests
                    will appear here.
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* SECURITY POLICY */}

        <div style={styles.notice}>
          <ShieldCheck size={18} />

          <div>
            <strong>
              Delivery Security Policy
            </strong>

            <div>
              Approve a delivery only when you
              expect it. If you do not respond
              within 2 minutes, the parcel remains
              at the security desk and the delivery
              person is not sent to your flat.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Deliveries;