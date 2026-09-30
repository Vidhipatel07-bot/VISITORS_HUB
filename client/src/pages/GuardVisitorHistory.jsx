import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  History,
  UserRound,
  Phone,
  Home,
  CalendarDays,
  Clock3,
  ShieldCheck,
  LogIn,
  LogOut,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Timer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const LOCAL_KEY = "visitorRequests";

const getLocalVisitors = () => {
  try {
    const data = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const saveLocalVisitors = (data) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
};

const getStatusLabel = (status) => {
  const labels = {
    exited: "Exited",
    rejected: "Rejected",
    expired: "Expired",
    inside: "Inside",
    approved: "Approved",
    "trusted-approved": "Trusted Approved",
    pending: "Pending",
  };

  return labels[status] || status || "Unknown";
};

const getStatusIcon = (status) => {
  if (status === "exited") return <CheckCircle2 size={16} />;
  if (status === "rejected") return <XCircle size={16} />;
  if (status === "expired") return <Timer size={16} />;
  return <ShieldCheck size={16} />;
};

const getStatusStyle = (status) => {
  if (status === "exited") {
    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (status === "rejected") {
    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  if (status === "expired") {
    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  }

  if (status === "inside") {
    return {
      background: "#dbeafe",
      color: "#1d4ed8",
    };
  }

  return {
    background: "#e0f2fe",
    color: "#0369a1",
  };
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calculateDuration = (entryTime, exitTime) => {
  if (!entryTime || !exitTime) return "-";

  const start = new Date(entryTime).getTime();
  const end = new Date(exitTime).getTime();

  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return "-";
  }

  const totalMinutes = Math.floor((end - start) / 60000);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

const normalizeVisitor = (visitor) => {
  return {
    ...visitor,
    name: visitor.name || visitor.visitorName || "Unknown Visitor",
    mobile: visitor.mobile || visitor.phone || "",
    flat: visitor.flat || "",
    purpose: visitor.purpose || "Other",
    status: visitor.status || "pending",
    photo: visitor.photo || "",
    entryTime: visitor.entryTime || null,
    exitTime: visitor.exitTime || null,
    registeredAt:
      visitor.createdAt ||
      visitor.registeredAt ||
      visitor.date ||
      null,
    guardVerified:
      visitor.guardVerified === true ||
      visitor.verifiedByGuard === true,
  };
};

const GuardVisitorHistory = () => {
  const navigate = useNavigate();

  const [visitors, setVisitors] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadVisitors = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/visitors");

      const backendVisitors = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.visitors)
        ? response.data.visitors
        : [];

      if (backendVisitors.length > 0) {
        setVisitors(backendVisitors.map(normalizeVisitor));
      } else {
        setVisitors(getLocalVisitors().map(normalizeVisitor));
      }
    } catch (error) {
      setVisitors(getLocalVisitors().map(normalizeVisitor));

      if (error.response?.status !== 401) {
        setMessage("Showing locally saved visitor history.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitors();
  }, []);

  const historyVisitors = useMemo(() => {
    let result = visitors.filter((visitor) =>
      ["exited", "rejected", "expired"].includes(visitor.status)
    );

    if (statusFilter !== "all") {
      result = result.filter(
        (visitor) => visitor.status === statusFilter
      );
    }

    if (dateFilter !== "all") {
      const now = new Date();

      result = result.filter((visitor) => {
        const dateValue =
          visitor.exitTime ||
          visitor.entryTime ||
          visitor.registeredAt;

        if (!dateValue) return false;

        const visitorDate = new Date(dateValue);

        if (Number.isNaN(visitorDate.getTime())) return false;

        const difference =
          (now.getTime() - visitorDate.getTime()) /
          (1000 * 60 * 60 * 24);

        if (dateFilter === "today") {
          return visitorDate.toDateString() === now.toDateString();
        }

        if (dateFilter === "7days") {
          return difference <= 7;
        }

        if (dateFilter === "30days") {
          return difference <= 30;
        }

        return true;
      });
    }

    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((visitor) => {
        return (
          visitor.name.toLowerCase().includes(query) ||
          visitor.mobile.includes(query) ||
          visitor.flat.toLowerCase().includes(query) ||
          visitor.purpose.toLowerCase().includes(query)
        );
      });
    }

    return [...result].sort((a, b) => {
      const dateA = new Date(
        a.exitTime ||
          a.entryTime ||
          a.registeredAt ||
          0
      ).getTime();

      const dateB = new Date(
        b.exitTime ||
          b.entryTime ||
          b.registeredAt ||
          0
      ).getTime();

      return dateB - dateA;
    });
  }, [visitors, search, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    return {
      total: visitors.filter((visitor) =>
        ["exited", "rejected", "expired"].includes(visitor.status)
      ).length,

      exited: visitors.filter(
        (visitor) => visitor.status === "exited"
      ).length,

      rejected: visitors.filter(
        (visitor) => visitor.status === "rejected"
      ).length,

      expired: visitors.filter(
        (visitor) => visitor.status === "expired"
      ).length,
    };
  }, [visitors]);

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
      {/* HEADER */}
      <div
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
        }}
      >
        <button
          onClick={() => navigate("/guard/dashboard")}
          style={{
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#2563eb",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "18px",
            padding: 0,
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
                  width: "46px",
                  height: "46px",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg, #2563eb, #06b6d4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <History size={25} />
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "30px",
                  fontWeight: "800",
                }}
              >
                Visitor History
              </h1>
            </div>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "15px",
              }}
            >
              View previous visitor entries and security records.
            </p>
          </div>

          <button
            onClick={loadVisitors}
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

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          <StatCard
            title="Total History"
            value={stats.total}
            icon={<History size={21} />}
          />

          <StatCard
            title="Exited"
            value={stats.exited}
            icon={<LogOut size={21} />}
          />

          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={<XCircle size={21} />}
          />

          <StatCard
            title="Expired"
            value={stats.expired}
            icon={<Timer size={21} />}
          />
        </div>

        {/* FILTER BAR */}
        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            padding: "18px",
            marginBottom: "20px",
            boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(240px, 1fr) 180px 180px",
              gap: "12px",
            }}
          >
            {/* SEARCH */}
            <div
              style={{
                position: "relative",
              }}
            >
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />

              <input
                type="text"
                placeholder="Search name, mobile, flat or purpose..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px 12px 42px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "11px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* STATUS */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              style={{
                padding: "12px",
                border: "1px solid #cbd5e1",
                borderRadius: "11px",
                background: "white",
                outline: "none",
                fontSize: "14px",
              }}
            >
              <option value="all">All Status</option>
              <option value="exited">Exited</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>

            {/* DATE */}
            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value)
              }
              style={{
                padding: "12px",
                border: "1px solid #cbd5e1",
                borderRadius: "11px",
                background: "white",
                outline: "none",
                fontSize: "14px",
              }}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>

        {message && (
          <div
            style={{
              background: "#eff6ff",
              color: "#1d4ed8",
              border: "1px solid #bfdbfe",
              padding: "12px 15px",
              borderRadius: "12px",
              marginBottom: "18px",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {message}
          </div>
        )}

        {/* HISTORY TABLE */}
        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
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
                Visitor Records
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                {historyVisitors.length} record
                {historyVisitors.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>
          </div>

          {historyVisitors.length === 0 ? (
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <History
                size={45}
                style={{
                  marginBottom: "12px",
                  color: "#94a3b8",
                }}
              />

              <h3
                style={{
                  margin: "0 0 6px",
                  color: "#334155",
                }}
              >
                No visitor history found
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                }}
              >
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "1050px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                    }}
                  >
                    {[
                      "Visitor",
                      "Flat",
                      "Purpose",
                      "Entry",
                      "Exit",
                      "Duration",
                      "Guard Verification",
                      "Status",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          textAlign: "left",
                          padding: "15px",
                          fontSize: "12px",
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          borderBottom:
                            "1px solid #e2e8f0",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {historyVisitors.map((visitor, index) => {
                    const statusStyle =
                      getStatusStyle(visitor.status);

                    return (
                      <tr
                        key={
                          visitor._id ||
                          visitor.id ||
                          `${visitor.mobile}-${index}`
                        }
                        style={{
                          borderBottom:
                            "1px solid #f1f5f9",
                        }}
                      >
                        {/* VISITOR */}
                        <td
                          style={{
                            padding: "16px 15px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            {visitor.photo ? (
                              <img
                                src={visitor.photo}
                                alt={visitor.name}
                                style={{
                                  width: "44px",
                                  height: "44px",
                                  objectFit: "cover",
                                  borderRadius: "12px",
                                  border:
                                    "1px solid #e2e8f0",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "44px",
                                  height: "44px",
                                  borderRadius: "12px",
                                  background: "#eff6ff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent:
                                    "center",
                                  color: "#2563eb",
                                }}
                              >
                                <UserRound size={21} />
                              </div>
                            )}

                            <div>
                              <div
                                style={{
                                  fontWeight: "800",
                                  color: "#0f172a",
                                  marginBottom: "5px",
                                }}
                              >
                                {visitor.name}
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  color: "#64748b",
                                  fontSize: "12px",
                                }}
                              >
                                <Phone size={12} />
                                {visitor.mobile || "-"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* FLAT */}
                        <td
                          style={{
                            padding: "16px 15px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontWeight: "700",
                            }}
                          >
                            <Home
                              size={15}
                              color="#2563eb"
                            />
                            {visitor.flat || "-"}
                          </div>
                        </td>

                        {/* PURPOSE */}
                        <td
                          style={{
                            padding: "16px 15px",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              background: "#f1f5f9",
                              color: "#334155",
                              padding: "6px 10px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "700",
                            }}
                          >
                            {visitor.purpose}
                          </span>
                        </td>

                        {/* ENTRY */}
                        <td
                          style={{
                            padding: "16px 15px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "13px",
                                fontWeight: "700",
                              }}
                            >
                              <CalendarDays size={13} />
                              {formatDate(
                                visitor.entryTime
                              )}
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                color: "#64748b",
                                fontSize: "12px",
                              }}
                            >
                              <Clock3 size={12} />
                              {formatTime(
                                visitor.entryTime
                              )}
                            </div>
                          </div>
                        </td>

                        {/* EXIT */}
                        <td
                          style={{
                            padding: "16px 15px",
                          }}
                        >
                          {visitor.exitTime ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  fontSize: "13px",
                                  fontWeight: "700",
                                }}
                              >
                                <CalendarDays
                                  size={13}
                                />
                                {formatDate(
                                  visitor.exitTime
                                )}
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  color: "#64748b",
                                  fontSize: "12px",
                                }}
                              >
                                <Clock3 size={12} />
                                {formatTime(
                                  visitor.exitTime
                                )}
                              </div>
                            </div>
                          ) : (
                            <span
                              style={{
                                color: "#94a3b8",
                                fontSize: "13px",
                              }}
                            >
                              —
                            </span>
                          )}
                        </td>

                        {/* DURATION */}
                        <td
                          style={{
                            padding: "16px 15px",
                            fontWeight: "700",
                            color: "#334155",
                          }}
                        >
                          {calculateDuration(
                            visitor.entryTime,
                            visitor.exitTime
                          )}
                        </td>

                        {/* GUARD VERIFICATION */}
                        <td
                          style={{
                            padding: "16px 15px",
                          }}
                        >
                          {visitor.guardVerified ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "#dcfce7",
                                color: "#166534",
                                padding: "7px 10px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: "800",
                              }}
                            >
                              <ShieldCheck
                                size={14}
                              />
                              Verified
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "#f1f5f9",
                                color: "#64748b",
                                padding: "7px 10px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: "700",
                              }}
                            >
                              Not Verified
                            </span>
                          )}
                        </td>

                        {/* STATUS */}
                        <td
                          style={{
                            padding: "16px 15px",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background:
                                statusStyle.background,
                              color: statusStyle.color,
                              padding: "7px 10px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "800",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {getStatusIcon(
                              visitor.status
                            )}

                            {getStatusLabel(
                              visitor.status
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECURITY NOTE */}
        <div
          style={{
            marginTop: "20px",
            padding: "17px 18px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "14px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <ShieldCheck
            size={21}
            color="#2563eb"
            style={{ marginTop: "2px" }}
          />

          <div>
            <strong
              style={{
                color: "#1e40af",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Security Record
            </strong>

            <span
              style={{
                color: "#475569",
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              Visitor history keeps entry, exit, verification
              and approval records for security monitoring.
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

          @media (max-width: 800px) {
            .history-filter-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "17px",
        padding: "18px",
        boxShadow:
          "0 8px 25px rgba(15, 23, 42, 0.05)",
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
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
            fontSize: "12px",
            color: "#64748b",
            marginBottom: "4px",
            fontWeight: "700",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: "25px",
            fontWeight: "800",
            color: "#0f172a",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
};

export default GuardVisitorHistory;