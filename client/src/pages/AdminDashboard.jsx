import React, { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Users,
  UserRound,
  Building2,
  Activity,
  Truck,
  Clock3,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  QrCode,
  Settings,
  FileText,
  BarChart3,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const VISITOR_KEY = "visitorRequests";
const DELIVERY_KEY = "deliveryRequests";

const getLocalData = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusLabel = (status) => {
  const labels = {
    pending: "Pending",
    approved: "Approved",
    "trusted-approved": "Trusted Approved",
    inside: "Inside",
    exited: "Exited",
    rejected: "Rejected",
    expired: "Expired",
    held: "Held",
    completed: "Completed",
  };

  return labels[status] || status || "Unknown";
};

const statusStyle = (status) => {
  switch (status) {
    case "approved":
    case "trusted-approved":
    case "completed":
      return {
        background: "#dcfce7",
        color: "#166534",
      };

    case "inside":
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };

    case "pending":
      return {
        background: "#fef3c7",
        color: "#92400e",
      };

    case "held":
      return {
        background: "#ffedd5",
        color: "#9a3412",
      };

    case "rejected":
      return {
        background: "#fee2e2",
        color: "#991b1b",
      };

    case "expired":
      return {
        background: "#f1f5f9",
        color: "#475569",
      };

    default:
      return {
        background: "#f1f5f9",
        color: "#475569",
      };
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [visitors, setVisitors] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setMessage("");

    let visitorData = getLocalData(VISITOR_KEY);
    let deliveryData = getLocalData(DELIVERY_KEY);
    let userData = [];

    try {
      const response = await api.get("/visitors");

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.visitors)
        ? response.data.visitors
        : [];

      if (data.length > 0) {
        visitorData = data;
      }
    } catch {
      // Local fallback
    }

    try {
      const response = await api.get("/deliveries");

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.deliveries)
        ? response.data.deliveries
        : [];

      if (data.length > 0) {
        deliveryData = data;
      }
    } catch {
      // Local fallback
    }

    try {
      const response = await api.get("/users");

      userData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.users)
        ? response.data.users
        : [];
    } catch {
      userData = [];
    }

    setVisitors(visitorData);
    setDeliveries(deliveryData);
    setUsers(userData);

    if (
      visitorData.length === 0 &&
      deliveryData.length === 0 &&
      userData.length === 0
    ) {
      setMessage("Dashboard is ready. No records available yet.");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const residentCount = useMemo(() => {
    const backendCount = users.filter(
      (user) => user.role === "resident"
    ).length;

    return backendCount || 5;
  }, [users]);

  const guardCount = useMemo(() => {
    const backendCount = users.filter(
      (user) => user.role === "guard"
    ).length;

    return backendCount || 4;
  }, [users]);

  const flatCount = 8;

  const pendingVisitors = visitors.filter(
    (visitor) => visitor.status === "pending"
  ).length;

  const currentVisitors = visitors.filter(
    (visitor) => visitor.status === "inside"
  ).length;

  const pendingDeliveries = deliveries.filter(
    (delivery) => delivery.status === "pending"
  ).length;

  const heldDeliveries = deliveries.filter(
    (delivery) => delivery.status === "held"
  ).length;

  const approvedVisitors = visitors.filter((visitor) =>
    ["approved", "trusted-approved", "inside", "exited"].includes(
      visitor.status
    )
  ).length;

  const rejectedVisitors = visitors.filter(
    (visitor) => visitor.status === "rejected"
  ).length;

  const completedDeliveries = deliveries.filter(
    (delivery) => delivery.status === "completed"
  ).length;

  const recentActivity = useMemo(() => {
    const visitorActivity = visitors.map((visitor) => ({
      type: "visitor",
      name:
        visitor.name ||
        visitor.visitorName ||
        "Unknown Visitor",
      flat: visitor.flat || "-",
      purpose: visitor.purpose || "Visitor",
      status: visitor.status || "pending",
      time:
        visitor.updatedAt ||
        visitor.createdAt ||
        visitor.registeredAt ||
        null,
    }));

    const deliveryActivity = deliveries.map((delivery) => ({
      type: "delivery",
      name:
        delivery.personName ||
        delivery.deliveryPerson ||
        "Delivery Person",
      flat: delivery.flat || "-",
      purpose:
        delivery.deliveryType ||
        delivery.type ||
        "Delivery",
      status: delivery.status || "pending",
      time:
        delivery.updatedAt ||
        delivery.createdAt ||
        null,
    }));

    return [...visitorActivity, ...deliveryActivity]
      .filter((item) => item.time)
      .sort(
        (a, b) =>
          new Date(b.time).getTime() -
          new Date(a.time).getTime()
      )
      .slice(0, 8);
  }, [visitors, deliveries]);

  const quickActions = [
    {
      title: "Manage Residents",
      description: "Add, search and manage residents",
      icon: <Users size={21} />,
      path: "/admin/residents",
    },
    {
      title: "Manage Guards",
      description: "Manage security guard accounts",
      icon: <ShieldCheck size={21} />,
      path: "/admin/guards",
    },
    {
      title: "Visitor Logs",
      description: "View complete visitor records",
      icon: <FileText size={21} />,
      path: "/admin/logs",
    },
    {
      title: "Analytics",
      description: "View visitor and delivery statistics",
      icon: <BarChart3 size={21} />,
      path: "/admin/analytics",
    },
    {
      title: "Gate QR",
      description: "Manage society registration QR",
      icon: <QrCode size={21} />,
      path: "/admin/gate-qr",
    },
    {
      title: "Settings",
      description: "Manage application settings",
      icon: <Settings size={21} />,
      path: "/admin/settings",
    },
  ];

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
          maxWidth: "1280px",
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
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "7px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg, #1d4ed8, #06b6d4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <ShieldCheck size={26} />
              </div>

              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "30px",
                    fontWeight: "800",
                    color: "#0f172a",
                  }}
                >
                  Admin Dashboard
                </h1>

                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  Manage your society's visitors, residents,
                  guards and security records.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            style={{
              border: "1px solid #dbeafe",
              background: "white",
              color: "#2563eb",
              borderRadius: "12px",
              padding: "11px 16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            <RefreshCw
              size={17}
              style={{
                animation: loading
                  ? "spin 1s linear infinite"
                  : "none",
              }}
            />

            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#1d4ed8",
              padding: "12px 15px",
              borderRadius: "12px",
              marginBottom: "20px",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {message}
          </div>
        )}

        {/* MAIN STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          <StatCard
            title="Residents"
            value={residentCount}
            subtitle="Registered residents"
            icon={<Users size={22} />}
          />

          <StatCard
            title="Security Guards"
            value={guardCount}
            subtitle="Security team"
            icon={<ShieldCheck size={22} />}
          />

          <StatCard
            title="Total Flats"
            value={flatCount}
            subtitle="Society units"
            icon={<Building2 size={22} />}
          />

          <StatCard
            title="Current Visitors"
            value={currentVisitors}
            subtitle="Currently inside"
            icon={<UserRound size={22} />}
          />
        </div>

        {/* SECURITY STATUS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <MiniStat
            title="Pending Visitors"
            value={pendingVisitors}
            icon={<Clock3 size={19} />}
            onClick={() => navigate("/admin/logs")}
          />

          <MiniStat
            title="Approved Visitors"
            value={approvedVisitors}
            icon={<CheckCircle2 size={19} />}
            onClick={() => navigate("/admin/logs")}
          />

          <MiniStat
            title="Rejected Visitors"
            value={rejectedVisitors}
            icon={<XCircle size={19} />}
            onClick={() => navigate("/admin/logs")}
          />

          <MiniStat
            title="Pending Deliveries"
            value={pendingDeliveries}
            icon={<Truck size={19} />}
            onClick={() => navigate("/admin/logs")}
          />

          <MiniStat
            title="Held Deliveries"
            value={heldDeliveries}
            icon={<AlertTriangle size={19} />}
            onClick={() => navigate("/admin/logs")}
          />

          <MiniStat
            title="Completed Deliveries"
            value={completedDeliveries}
            icon={<CheckCircle2 size={19} />}
            onClick={() => navigate("/admin/analytics")}
          />
        </div>

        {/* TWO COLUMN SECTION */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.5fr) minmax(320px, 1fr)",
            gap: "20px",
            marginBottom: "22px",
          }}
        >
          {/* RECENT ACTIVITY */}
          <div
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow:
                "0 8px 25px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "19px",
                    color: "#0f172a",
                  }}
                >
                  Recent Activity
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Latest visitor and delivery activity
                </p>
              </div>

              <Activity
                size={21}
                color="#2563eb"
              />
            </div>

            {recentActivity.length === 0 ? (
              <div
                style={{
                  padding: "50px 20px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                <Activity
                  size={40}
                  style={{
                    marginBottom: "10px",
                    color: "#94a3b8",
                  }}
                />

                <div
                  style={{
                    fontWeight: "700",
                    color: "#475569",
                  }}
                >
                  No activity yet
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    marginTop: "5px",
                  }}
                >
                  Visitor and delivery records will appear
                  here.
                </div>
              </div>
            ) : (
              <div>
                {recentActivity.map((item, index) => {
                  const style = statusStyle(item.status);

                  return (
                    <div
                      key={`${item.type}-${item.time}-${index}`}
                      style={{
                        padding: "15px 20px",
                        borderBottom:
                          index !== recentActivity.length - 1
                            ? "1px solid #f1f5f9"
                            : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "13px",
                      }}
                    >
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "11px",
                          background:
                            item.type === "visitor"
                              ? "#eff6ff"
                              : "#ecfeff",
                          color:
                            item.type === "visitor"
                              ? "#2563eb"
                              : "#0891b2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {item.type === "visitor" ? (
                          <UserRound size={20} />
                        ) : (
                          <Truck size={20} />
                        )}
                      </div>

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "7px",
                            flexWrap: "wrap",
                            marginBottom: "4px",
                          }}
                        >
                          <strong
                            style={{
                              color: "#0f172a",
                              fontSize: "14px",
                            }}
                          >
                            {item.name}
                          </strong>

                          <span
                            style={{
                              ...style,
                              padding: "3px 7px",
                              borderRadius: "6px",
                              fontSize: "10px",
                              fontWeight: "800",
                            }}
                          >
                            {statusLabel(item.status)}
                          </span>
                        </div>

                        <div
                          style={{
                            color: "#64748b",
                            fontSize: "12px",
                          }}
                        >
                          {item.type === "visitor"
                            ? "Visitor"
                            : "Delivery"}{" "}
                          • Flat {item.flat} • {item.purpose}
                        </div>
                      </div>

                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: "11px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDateTime(item.time)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SYSTEM OVERVIEW */}
          <div
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "20px",
              boxShadow:
                "0 8px 25px rgba(15, 23, 42, 0.05)",
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
                }}
              >
                <Activity size={20} />
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "18px",
                  }}
                >
                  System Overview
                </h2>

                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  Current application status
                </p>
              </div>
            </div>

            <OverviewRow
              label="Visitor Management"
              value={
                visitors.length > 0
                  ? "Active"
                  : "Ready"
              }
              active={true}
            />

            <OverviewRow
              label="Delivery Management"
              value={
                deliveries.length > 0
                  ? "Active"
                  : "Ready"
              }
              active={true}
            />

            <OverviewRow
              label="QR Gate Registration"
              value="Enabled"
              active={true}
            />

            <OverviewRow
              label="Resident Approval"
              value="Enabled"
              active={true}
            />

            <OverviewRow
              label="Entry / Exit Tracking"
              value="Enabled"
              active={true}
            />

            <OverviewRow
              label="Photo Verification"
              value="Enabled"
              active={true}
              last
            />
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            padding: "20px",
            boxShadow:
              "0 8px 25px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "15px",
              marginBottom: "18px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "19px",
                }}
              >
                Quick Actions
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Quickly access important admin sections.
              </p>
            </div>

            <UserPlus
              size={21}
              color="#2563eb"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "13px",
            }}
          >
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() =>
                  navigate(action.path)
                }
                style={{
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  borderRadius: "13px",
                  padding: "15px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {action.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "800",
                      color: "#0f172a",
                      fontSize: "13px",
                      marginBottom: "4px",
                    }}
                  >
                    {action.title}
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "11px",
                      lineHeight: 1.4,
                    }}
                  >
                    {action.description}
                  </div>
                </div>

                <ArrowRight
                  size={17}
                  color="#94a3b8"
                />
              </button>
            ))}
          </div>
        </div>

        {/* FOOTER SECURITY NOTE */}
        <div
          style={{
            marginTop: "20px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "14px",
            padding: "16px 18px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <ShieldCheck
            size={21}
            color="#2563eb"
            style={{
              marginTop: "2px",
              flexShrink: 0,
            }}
          />

          <div>
            <strong
              style={{
                display: "block",
                color: "#1e40af",
                marginBottom: "4px",
                fontSize: "13px",
              }}
            >
              Visitors Hub Security
            </strong>

            <span
              style={{
                color: "#475569",
                fontSize: "12px",
                lineHeight: 1.6,
              }}
            >
              Admin can monitor visitor activity, delivery
              status, resident accounts, security guards and
              important society records from one place.
            </span>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 900px) {
            .admin-dashboard-grid {
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
  subtitle,
  icon,
}) => {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "17px",
        padding: "19px",
        boxShadow:
          "0 8px 25px rgba(15, 23, 42, 0.05)",
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <div
        style={{
          width: "46px",
          height: "46px",
          borderRadius: "12px",
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
        <div
          style={{
            color: "#64748b",
            fontSize: "12px",
            fontWeight: "700",
            marginBottom: "3px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: "#0f172a",
            fontSize: "26px",
            fontWeight: "800",
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>

        <div
          style={{
            color: "#94a3b8",
            fontSize: "11px",
            marginTop: "4px",
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({
  title,
  value,
  icon,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1px solid #e2e8f0",
        background: "white",
        borderRadius: "15px",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        textAlign: "left",
        cursor: "pointer",
        boxShadow:
          "0 5px 18px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "11px",
          background: "#f8fafc",
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
            fontSize: "11px",
            color: "#64748b",
            fontWeight: "700",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: "21px",
            fontWeight: "800",
            color: "#0f172a",
            marginTop: "2px",
          }}
        >
          {value}
        </div>
      </div>
    </button>
  );
};

const OverviewRow = ({
  label,
  value,
  active,
  last,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "13px 0",
        borderBottom: last
          ? "none"
          : "1px solid #f1f5f9",
      }}
    >
      <span
        style={{
          fontSize: "12px",
          color: "#475569",
          fontWeight: "600",
        }}
      >
        {label}
      </span>

      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: active ? "#166534" : "#64748b",
          fontSize: "11px",
          fontWeight: "800",
        }}
      >
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: active
              ? "#22c55e"
              : "#94a3b8",
          }}
        />

        {value}
      </span>
    </div>
  );
};

export default AdminDashboard;