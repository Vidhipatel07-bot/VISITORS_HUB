import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  Package,
  QrCode,
  History,
  LogOut,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  UserPlus,
  Truck,
  RefreshCw,
} from "lucide-react";

import api from "../utils/api";
import { getCurrentUser, logout } from "../utils/auth";

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

const DELIVERY_TYPES = [
  "Food",
  "E-commerce",
  "Courier",
  "Grocery",
  "Medicine",
  "Other",
];

const DELIVERY_WAIT_TIME = 120;

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f5f9ff 0%, #eef6ff 45%, #f8fbff 100%)",
    color: "#10233f",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    height: "72px",
    background: "#ffffff",
    borderBottom: "1px solid #e5edf7",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    position: "sticky",
    top: 0,
    zIndex: 20,
    boxShadow: "0 4px 18px rgba(25, 65, 110, 0.06)",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logo: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #0d47a1, #1687d9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },

  brandTitle: {
    fontSize: "19px",
    fontWeight: 800,
    margin: 0,
  },

  brandSub: {
    fontSize: "11px",
    color: "#718096",
    marginTop: "2px",
  },

  userArea: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  userInfo: {
    textAlign: "right",
  },

  userName: {
    fontSize: "14px",
    fontWeight: 700,
    margin: 0,
  },

  role: {
    fontSize: "11px",
    color: "#1687d9",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },

  logoutButton: {
    border: "1px solid #dce6f2",
    background: "#fff",
    color: "#52657d",
    borderRadius: "10px",
    padding: "9px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontWeight: 600,
  },

  container: {
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "30px 24px 50px",
  },

  welcome: {
    marginBottom: "25px",
  },

  heading: {
    margin: 0,
    fontSize: "29px",
    fontWeight: 800,
    color: "#10233f",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#687b92",
    fontSize: "14px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "25px",
  },

  statCard: {
    background: "#fff",
    border: "1px solid #e3ecf7",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(31, 76, 120, 0.06)",
  },

  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#edf6ff",
    color: "#1687d9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  statNumber: {
    margin: "15px 0 3px",
    fontSize: "28px",
    fontWeight: 800,
  },

  statLabel: {
    margin: 0,
    color: "#73849a",
    fontSize: "13px",
  },

  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "1.35fr 0.65fr",
    gap: "20px",
    alignItems: "start",
  },

  card: {
    background: "#fff",
    border: "1px solid #e3ecf7",
    borderRadius: "20px",
    boxShadow: "0 8px 25px rgba(31, 76, 120, 0.06)",
    padding: "22px",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: 800,
  },

  cardSubtitle: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#7a8ca2",
  },

  refreshButton: {
    border: "1px solid #dce8f5",
    background: "#f8fbff",
    borderRadius: "9px",
    padding: "8px 10px",
    cursor: "pointer",
    color: "#49627f",
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },

  quickLink: {
    textDecoration: "none",
    color: "#10233f",
    border: "1px solid #e1ebf6",
    borderRadius: "14px",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#fbfdff",
  },

  quickIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background: "#edf6ff",
    color: "#0c75bd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  quickText: {
    flex: 1,
  },

  quickTitle: {
    fontWeight: 700,
    fontSize: "13px",
    margin: 0,
  },

  quickSub: {
    color: "#8090a4",
    fontSize: "11px",
    margin: "3px 0 0",
  },

  activityItem: {
    borderBottom: "1px solid #edf1f6",
    padding: "13px 0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  activityIcon: {
    width: "37px",
    height: "37px",
    borderRadius: "10px",
    background: "#f1f7ff",
    color: "#1687d9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  activityMain: {
    flex: 1,
  },

  activityName: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 700,
  },

  activityMeta: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#7b8ba0",
  },

  badge: {
    padding: "5px 8px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: 700,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(8, 25, 45, 0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 100,
  },

  modal: {
    width: "100%",
    maxWidth: "560px",
    background: "#fff",
    borderRadius: "22px",
    padding: "25px",
    boxShadow: "0 25px 70px rgba(0,0,0,0.2)",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  closeButton: {
    border: "none",
    background: "#f2f6fa",
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "18px",
    color: "#52657d",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  fullField: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#52657d",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dce7f2",
    borderRadius: "10px",
    padding: "11px 12px",
    outline: "none",
    fontSize: "13px",
    background: "#fbfdff",
  },

  select: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dce7f2",
    borderRadius: "10px",
    padding: "11px 12px",
    outline: "none",
    fontSize: "13px",
    background: "#fbfdff",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dce7f2",
    borderRadius: "10px",
    padding: "11px 12px",
    outline: "none",
    fontSize: "13px",
    background: "#fbfdff",
    minHeight: "80px",
    resize: "vertical",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "22px",
  },

  secondaryButton: {
    border: "1px solid #dbe6f2",
    background: "#fff",
    color: "#52657d",
    borderRadius: "10px",
    padding: "11px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },

  primaryButton: {
    border: "none",
    background: "linear-gradient(135deg, #0d47a1, #1687d9)",
    color: "#fff",
    borderRadius: "10px",
    padding: "11px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },

  alert: {
    marginBottom: "15px",
    padding: "11px 13px",
    borderRadius: "10px",
    background: "#fff4f4",
    border: "1px solid #ffd7d7",
    color: "#c43d3d",
    fontSize: "12px",
  },

  success: {
    marginBottom: "15px",
    padding: "11px 13px",
    borderRadius: "10px",
    background: "#effcf5",
    border: "1px solid #ccefdc",
    color: "#208453",
    fontSize: "12px",
  },

  registerButton: {
    border: "none",
    background: "linear-gradient(135deg, #0d47a1, #1687d9)",
    color: "#fff",
    borderRadius: "11px",
    padding: "11px 15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 700,
  },

  notice: {
    marginTop: "20px",
    padding: "14px",
    borderRadius: "13px",
    background: "#f4f9ff",
    border: "1px solid #dcecff",
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    fontSize: "12px",
    color: "#61758d",
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

function saveLocalDeliveries(deliveries) {
  localStorage.setItem(
    "deliveryRequests",
    JSON.stringify(deliveries)
  );
}

function normalizeDelivery(item) {
  return {
    ...item,
    id: item._id || item.id || `delivery-${Date.now()}`,
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
    phone: item.phone || "",
    flat: item.flat || "",
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
        color: "#c83d3d",
      };

    case "held":
      return {
        background: "#fff7e8",
        color: "#b87912",
      };

    case "completed":
      return {
        background: "#edf4ff",
        color: "#2563a8",
      };

    default:
      return {
        background: "#eef7ff",
        color: "#1674b8",
      };
  }
}

function formatTime(date) {
  if (!date) return "--";

  try {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--";
  }
}

function formatDate(date) {
  if (!date) return "--";

  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "--";
  }
}

function getRemainingSeconds(createdAt) {
  const created = new Date(createdAt).getTime();

  if (Number.isNaN(created)) {
    return DELIVERY_WAIT_TIME;
  }

  const elapsed = Math.floor(
    (Date.now() - created) / 1000
  );

  return Math.max(0, DELIVERY_WAIT_TIME - elapsed);
}

function GuardDashboard() {
  const navigate = useNavigate();

  const currentUser = getCurrentUser();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDeliveryModal, setShowDeliveryModal] =
    useState(false);

  const [form, setForm] = useState({
    personName: "",
    phone: "",
    flat: "",
    deliveryType: "Food",
    company: "",
    trackingNumber: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [tick, setTick] = useState(Date.now());

  /*
  |--------------------------------------------------------------------------
  | LOAD DELIVERIES
  |--------------------------------------------------------------------------
  */

  const loadDeliveries = async () => {
    setLoading(true);

    try {
      const response = await api.get("/deliveries");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.deliveries || [];

      const normalized = data.map(normalizeDelivery);

      setDeliveries(normalized);
    } catch (error) {
      console.log(
        "Backend unavailable. Using local delivery data."
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
  | LIVE TIMER
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
  | AUTOMATIC 2-MINUTE HOLD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!deliveries.length) return;

    const processExpiredDeliveries = async () => {
      let changed = false;

      const updated = await Promise.all(
        deliveries.map(async (delivery) => {
          if (
            delivery.status !== "pending" ||
            getRemainingSeconds(delivery.createdAt) > 0
          ) {
            return delivery;
          }

          changed = true;

          try {
            const response = await api.put(
              `/deliveries/${delivery.id}/hold`,
              {
                reason:
                  "Resident did not respond within 2 minutes.",
              }
            );

            return normalizeDelivery(
              response.data?.delivery || response.data
            );
          } catch {
            return {
              ...delivery,
              status: "held",
              heldAt: new Date().toISOString(),
              holdReason:
                "Resident did not respond within 2 minutes.",
            };
          }
        })
      );

      if (changed) {
        setDeliveries(updated);
        saveLocalDeliveries(updated);
      }
    };

    processExpiredDeliveries();
  }, [tick]);

  /*
  |--------------------------------------------------------------------------
  | STATISTICS
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    return {
      pending: deliveries.filter(
        (item) => item.status === "pending"
      ).length,

      approved: deliveries.filter(
        (item) => item.status === "approved"
      ).length,

      held: deliveries.filter(
        (item) => item.status === "held"
      ).length,

      completed: deliveries.filter(
        (item) => item.status === "completed"
      ).length,
    };
  }, [deliveries]);

  const recentDeliveries = useMemo(() => {
    return [...deliveries]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [deliveries]);

  /*
  |--------------------------------------------------------------------------
  | FORM HANDLING
  |--------------------------------------------------------------------------
  */

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      personName: "",
      phone: "",
      flat: "",
      deliveryType: "Food",
      company: "",
      trackingNumber: "",
      description: "",
    });

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | REGISTER DELIVERY
  |--------------------------------------------------------------------------
  */

  const registerDelivery = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = form.personName.trim();
    const phone = form.phone.trim();
    const flat = form.flat.trim().toUpperCase();

    if (!name) {
      setError("Please enter delivery person's name.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!flat) {
      setError("Please select the flat number.");
      return;
    }

    const payload = {
      personName: name,
      deliveryPerson: name,
      phone,
      flat,
      deliveryType: form.deliveryType,
      type: form.deliveryType,
      company: form.company.trim(),
      trackingNumber: form.trackingNumber.trim(),
      description: form.description.trim(),
      source: "security-guard",
      notes: "",
    };

    try {
      /*
      |--------------------------------------------------------------------------
      | BACKEND FIRST
      |--------------------------------------------------------------------------
      */

      const response = await api.post(
        "/deliveries",
        payload
      );

      const created = normalizeDelivery(
        response.data?.delivery || response.data
      );

      setDeliveries((prev) => [created, ...prev]);

      const local = getLocalDeliveries();

      saveLocalDeliveries([
        created,
        ...local.filter(
          (item) =>
            (item._id || item.id) !== created.id
        ),
      ]);

      setSuccess(
        "Delivery registered. Resident approval is now pending."
      );

      resetForm();

      setTimeout(() => {
        setShowDeliveryModal(false);
        setSuccess("");
      }, 1300);
    } catch (backendError) {
      /*
      |--------------------------------------------------------------------------
      | LOCAL FALLBACK
      |--------------------------------------------------------------------------
      */

      const localDelivery = normalizeDelivery({
        ...payload,
        id: `delivery-${Date.now()}`,
        status: "pending",
        residentId: null,
        createdAt: new Date().toISOString(),
      });

      const updated = [
        localDelivery,
        ...getLocalDeliveries(),
      ];

      saveLocalDeliveries(updated);

      setDeliveries(
        updated.map(normalizeDelivery)
      );

      setSuccess(
        "Delivery registered locally. Resident approval is pending."
      );

      resetForm();

      setTimeout(() => {
        setShowDeliveryModal(false);
        setSuccess("");
      }, 1300);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    logout();
    navigate("/guard");
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div style={styles.page}>
      {/* HEADER */}

      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.logo}>
            <ShieldCheck size={23} />
          </div>

          <div>
            <h2 style={styles.brandTitle}>
              Visitors Hub
            </h2>

            <div style={styles.brandSub}>
              Security Management
            </div>
          </div>
        </div>

        <div style={styles.userArea}>
          <div style={styles.userInfo}>
            <p style={styles.userName}>
              {currentUser?.name || "Security Guard"}
            </p>

            <div style={styles.role}>
              Security Guard
            </div>
          </div>

          <button
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}

      <main style={styles.container}>
        <div style={styles.welcome}>
          <h1 style={styles.heading}>
            Security Dashboard
          </h1>

          <p style={styles.subtitle}>
            Manage visitor verification, deliveries and
            security-gate activities from one place.
          </p>
        </div>

        {/* STATS */}

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statTop}>
              <div style={styles.statIcon}>
                <Clock3 size={20} />
              </div>
            </div>

            <div style={styles.statNumber}>
              {stats.pending}
            </div>

            <p style={styles.statLabel}>
              Pending Deliveries
            </p>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statTop}>
              <div style={styles.statIcon}>
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div style={styles.statNumber}>
              {stats.approved}
            </div>

            <p style={styles.statLabel}>
              Approved Deliveries
            </p>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statTop}>
              <div style={styles.statIcon}>
                <AlertCircle size={20} />
              </div>
            </div>

            <div style={styles.statNumber}>
              {stats.held}
            </div>

            <p style={styles.statLabel}>
              Held at Security
            </p>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statTop}>
              <div style={styles.statIcon}>
                <Package size={20} />
              </div>
            </div>

            <div style={styles.statNumber}>
              {stats.completed}
            </div>

            <p style={styles.statLabel}>
              Completed Deliveries
            </p>
          </div>
        </div>

        {/* MAIN CONTENT */}

        <div style={styles.sectionGrid}>
          {/* QUICK ACTIONS */}

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>
                  Quick Actions
                </h2>

                <p style={styles.cardSubtitle}>
                  Common security tasks
                </p>
              </div>
            </div>

            <div style={styles.quickGrid}>
              <Link
                to="/guard/qr-scanner"
                style={styles.quickLink}
              >
                <div style={styles.quickIcon}>
                  <QrCode size={20} />
                </div>

                <div style={styles.quickText}>
                  <p style={styles.quickTitle}>
                    Scan Guest QR
                  </p>

                  <p style={styles.quickSub}>
                    Verify pre-registered guests
                  </p>
                </div>

                <ArrowRight size={16} />
              </Link>

              <Link
                to="/guard/visitors"
                style={styles.quickLink}
              >
                <div style={styles.quickIcon}>
                  <Users size={20} />
                </div>

                <div style={styles.quickText}>
                  <p style={styles.quickTitle}>
                    Visitor Requests
                  </p>

                  <p style={styles.quickSub}>
                    Verify and manage visitors
                  </p>
                </div>

                <ArrowRight size={16} />
              </Link>

              <button
                type="button"
                style={{
                  ...styles.quickLink,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setShowDeliveryModal(true);
                }}
              >
                <div style={styles.quickIcon}>
                  <Truck size={20} />
                </div>

                <div style={styles.quickText}>
                  <p style={styles.quickTitle}>
                    Register Delivery
                  </p>

                  <p style={styles.quickSub}>
                    Create a delivery request
                  </p>
                </div>

                <ArrowRight size={16} />
              </button>

              <Link
                to="/guard/history"
                style={styles.quickLink}
              >
                <div style={styles.quickIcon}>
                  <History size={20} />
                </div>

                <div style={styles.quickText}>
                  <p style={styles.quickTitle}>
                    Visitor History
                  </p>

                  <p style={styles.quickSub}>
                    View previous entries
                  </p>
                </div>

                <ArrowRight size={16} />
              </Link>
            </div>

            <div style={styles.notice}>
              <ShieldCheck size={18} />

              <div>
                <strong>
                  Security reminder
                </strong>

                <div>
                  Always verify the visitor, flat number
                  and purpose before allowing entry. A
                  visitor should not enter only because a
                  request is pending.
                </div>
              </div>
            </div>
          </div>

          {/* RECENT DELIVERIES */}

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>
                  Recent Deliveries
                </h2>

                <p style={styles.cardSubtitle}>
                  Latest delivery activity
                </p>
              </div>

              <button
                type="button"
                style={styles.refreshButton}
                onClick={loadDeliveries}
                title="Refresh"
              >
                <RefreshCw
                  size={15}
                  style={{
                    animation: loading
                      ? "spin 1s linear infinite"
                      : "none",
                  }}
                />
              </button>
            </div>

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px 10px",
                  color: "#718096",
                  fontSize: "13px",
                }}
              >
                Loading deliveries...
              </div>
            ) : recentDeliveries.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px 10px",
                  color: "#718096",
                  fontSize: "13px",
                }}
              >
                No delivery activity yet.
              </div>
            ) : (
              recentDeliveries.map((delivery) => {
                const remaining =
                  getRemainingSeconds(
                    delivery.createdAt
                  );

                return (
                  <div
                    key={delivery.id}
                    style={styles.activityItem}
                  >
                    <div style={styles.activityIcon}>
                      <Package size={18} />
                    </div>

                    <div style={styles.activityMain}>
                      <p style={styles.activityName}>
                        {delivery.personName}
                      </p>

                      <p style={styles.activityMeta}>
                        {delivery.deliveryType} •{" "}
                        {delivery.flat} •{" "}
                        {formatTime(
                          delivery.createdAt
                        )}
                      </p>

                      {delivery.status ===
                        "pending" &&
                        remaining > 0 && (
                          <p
                            style={{
                              margin:
                                "4px 0 0",
                              fontSize: "10px",
                              color: "#1687d9",
                              fontWeight: 700,
                            }}
                          >
                            Resident response:{" "}
                            {Math.floor(
                              remaining / 60
                            )
                              .toString()
                              .padStart(2, "0")}
                            :
                            {(remaining % 60)
                              .toString()
                              .padStart(2, "0")}
                          </p>
                        )}

                      {delivery.status === "held" && (
                        <p
                          style={{
                            margin:
                              "4px 0 0",
                            fontSize: "10px",
                            color: "#b87912",
                            fontWeight: 700,
                          }}
                        >
                          Parcel held at security desk
                        </p>
                      )}
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
                );
              })
            )}

            <Link
              to="/guard/deliveries"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px",
                marginTop: "16px",
                color: "#1477bd",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              View all deliveries
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>

      {/* DELIVERY MODAL */}

      {showDeliveryModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: 800,
                  }}
                >
                  Register Delivery
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    fontSize: "12px",
                    color: "#7b8da2",
                  }}
                >
                  Resident approval will be requested
                  automatically.
                </p>
              </div>

              <button
                type="button"
                style={styles.closeButton}
                onClick={() => {
                  setShowDeliveryModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            {error && (
              <div style={styles.alert}>
                {error}
              </div>
            )}

            {success && (
              <div style={styles.success}>
                {success}
              </div>
            )}

            <form onSubmit={registerDelivery}>
              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>
                    Delivery Person *
                  </label>

                  <input
                    style={styles.input}
                    value={form.personName}
                    onChange={(e) =>
                      updateForm(
                        "personName",
                        e.target.value
                      )
                    }
                    placeholder="Enter name"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Mobile Number *
                  </label>

                  <input
                    style={styles.input}
                    value={form.phone}
                    onChange={(e) =>
                      updateForm(
                        "phone",
                        e.target.value.replace(
                          /\D/g,
                          ""
                        ).slice(0, 10)
                      )
                    }
                    placeholder="10-digit number"
                    inputMode="numeric"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Flat Number *
                  </label>

                  <select
                    style={styles.select}
                    value={form.flat}
                    onChange={(e) =>
                      updateForm(
                        "flat",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select flat
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
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Delivery Type *
                  </label>

                  <select
                    style={styles.select}
                    value={form.deliveryType}
                    onChange={(e) =>
                      updateForm(
                        "deliveryType",
                        e.target.value
                      )
                    }
                  >
                    {DELIVERY_TYPES.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Company
                  </label>

                  <input
                    style={styles.input}
                    value={form.company}
                    onChange={(e) =>
                      updateForm(
                        "company",
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Tracking Number
                  </label>

                  <input
                    style={styles.input}
                    value={form.trackingNumber}
                    onChange={(e) =>
                      updateForm(
                        "trackingNumber",
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                  />
                </div>

                <div style={styles.fullField}>
                  <label style={styles.label}>
                    Description
                  </label>

                  <textarea
                    style={styles.textarea}
                    value={form.description}
                    onChange={(e) =>
                      updateForm(
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Optional delivery details..."
                  />
                </div>
              </div>

              <div style={styles.notice}>
                <Clock3 size={18} />

                <div>
                  <strong>
                    2-minute approval window
                  </strong>

                  <div>
                    The resident will receive the
                    delivery request. If there is no
                    response within 2 minutes, the
                    delivery is marked as{" "}
                    <strong>
                      Held at Security Desk
                    </strong>
                    .
                  </div>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => {
                    setShowDeliveryModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={styles.primaryButton}
                >
                  <UserPlus
                    size={15}
                    style={{
                      verticalAlign: "middle",
                      marginRight: "6px",
                    }}
                  />

                  Register Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GuardDashboard;