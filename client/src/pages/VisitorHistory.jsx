import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
  Search,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import api from "../utils/api";

const getLocalVisitors = () => {
  try {
    const data = localStorage.getItem("visitorRequests");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const formatDate = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDuration = (entryTime, exitTime) => {
  if (!entryTime || !exitTime) return "—";

  const entry = new Date(entryTime).getTime();
  const exit = new Date(exitTime).getTime();

  if (Number.isNaN(entry) || Number.isNaN(exit)) return "—";

  const difference = Math.max(0, exit - entry);

  const totalMinutes = Math.floor(difference / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours} hr ${minutes} min`;
};

const getStatus = (visitor) => {
  const status = String(visitor?.status || "").toLowerCase();

  if (status === "exited") return "Exited";
  if (status === "rejected") return "Rejected";
  if (status === "expired") return "Expired";

  return status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Completed";
};

const getStatusStyle = (status) => {
  switch (status.toLowerCase()) {
    case "exited":
      return {
        background: "#dcfce7",
        color: "#166534",
      };

    case "rejected":
      return {
        background: "#fee2e2",
        color: "#b91c1c",
      };

    case "expired":
      return {
        background: "#fef3c7",
        color: "#92400e",
      };

    default:
      return {
        background: "#e2e8f0",
        color: "#475569",
      };
  }
};

const VisitorHistory = () => {
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);

    try {
      const response = await api.get("/visitors");

      const backendVisitors = Array.isArray(response.data)
        ? response.data
        : response.data?.visitors || [];

      if (backendVisitors.length > 0) {
        setVisitors(backendVisitors);
      } else {
        setVisitors(getLocalVisitors());
      }
    } catch {
      setVisitors(getLocalVisitors());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const historyVisitors = useMemo(() => {
    return visitors
      .filter((visitor) => {
        const status = String(visitor?.status || "").toLowerCase();

        return (
          status === "exited" ||
          status === "rejected" ||
          status === "expired"
        );
      })
      .filter((visitor) => {
        if (!searchTerm.trim()) return true;

        const search = searchTerm.toLowerCase();

        return [
          visitor.name,
          visitor.mobile,
          visitor.phone,
          visitor.flat,
          visitor.purpose,
          visitor.vehicleNumber,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(search)
          );
      })
      .filter((visitor) => {
        if (statusFilter === "all") return true;

        return (
          String(visitor?.status || "").toLowerCase() ===
          statusFilter
        );
      })
      .filter((visitor) => {
        if (dateFilter === "all") return true;

        const sourceDate =
          visitor.exitTime ||
          visitor.entryTime ||
          visitor.createdAt;

        if (!sourceDate) return false;

        const visitorDate = new Date(sourceDate);

        if (Number.isNaN(visitorDate.getTime())) return false;

        const today = new Date();

        if (dateFilter === "today") {
          return (
            visitorDate.getDate() === today.getDate() &&
            visitorDate.getMonth() === today.getMonth() &&
            visitorDate.getFullYear() === today.getFullYear()
          );
        }

        if (dateFilter === "7days") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(today.getDate() - 7);

          return visitorDate >= sevenDaysAgo;
        }

        if (dateFilter === "30days") {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(today.getDate() - 30);

          return visitorDate >= thirtyDaysAgo;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.exitTime || a.entryTime || a.createdAt || 0
        ).getTime();

        const dateB = new Date(
          b.exitTime || b.entryTime || b.createdAt || 0
        ).getTime();

        return dateB - dateA;
      });
  }, [visitors, searchTerm, statusFilter, dateFilter]);

  const totalHistory = visitors.filter((visitor) =>
    ["exited", "rejected", "expired"].includes(
      String(visitor?.status || "").toLowerCase()
    )
  ).length;

  const exitedCount = visitors.filter(
    (visitor) =>
      String(visitor?.status || "").toLowerCase() === "exited"
  ).length;

  const rejectedCount = visitors.filter(
    (visitor) =>
      String(visitor?.status || "").toLowerCase() === "rejected"
  ).length;

  const expiredCount = visitors.filter(
    (visitor) =>
      String(visitor?.status || "").toLowerCase() === "expired"
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f1f8ff 0%, #ffffff 50%, #effcff 100%)",
        padding: "24px",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            marginBottom: "25px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <Link
              to="/resident/dashboard"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#334155",
                textDecoration: "none",
                boxShadow:
                  "0 6px 20px rgba(15, 23, 42, 0.08)",
              }}
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  color: "#2563eb",
                  fontWeight: 800,
                  fontSize: "14px",
                  marginBottom: "4px",
                }}
              >
                <History size={18} />
                Visitors Hub
              </div>

              <h1
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: "27px",
                }}
              >
                Visitor History
              </h1>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                View previous visitor activity and security records.
              </p>
            </div>
          </div>

          <button
            onClick={loadHistory}
            style={{
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              padding: "11px 17px",
              borderRadius: "11px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Refresh
          </button>
        </div>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "22px",
          }}
        >
          <StatCard
            icon={<History size={21} />}
            label="Total History"
            value={totalHistory}
            description="Recorded visitor activity"
          />

          <StatCard
            icon={<CheckCircle2 size={21} />}
            label="Completed Visits"
            value={exitedCount}
            description="Visitors who exited"
          />

          <StatCard
            icon={<XCircle size={21} />}
            label="Rejected"
            value={rejectedCount}
            description="Requests rejected"
          />

          <StatCard
            icon={<Clock3 size={21} />}
            label="Expired"
            value={expiredCount}
            description="Requests timed out"
          />
        </div>

        {/* FILTERS */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "18px",
            boxShadow:
              "0 8px 30px rgba(15, 23, 42, 0.07)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(220px, 1fr) 170px 170px",
              gap: "12px",
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "13px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                }}
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search visitor, flat, phone..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 13px 12px 40px",
                  borderRadius: "11px",
                  border: "1px solid #cbd5e1",
                  outline: "none",
                  fontSize: "13px",
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              style={selectStyle}
            >
              <option value="all">All Status</option>
              <option value="exited">Exited</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(event.target.value)
              }
              style={selectStyle}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* CONTENT */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            boxShadow:
              "0 10px 35px rgba(15, 23, 42, 0.07)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 22px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: "18px",
                }}
              >
                Previous Visitors
              </h2>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >
                {historyVisitors.length} record
                {historyVisitors.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              <ShieldCheck size={16} color="#2563eb" />
              Security records
            </div>
          </div>

          {loading ? (
            <div
              style={{
                padding: "70px 20px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Loading visitor history...
            </div>
          ) : historyVisitors.length === 0 ? (
            <EmptyState
              searchActive={
                Boolean(searchTerm) ||
                statusFilter !== "all" ||
                dateFilter !== "all"
              }
            />
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
                    <th style={thStyle}>Visitor</th>
                    <th style={thStyle}>Flat</th>
                    <th style={thStyle}>Purpose</th>
                    <th style={thStyle}>Entry</th>
                    <th style={thStyle}>Exit</th>
                    <th style={thStyle}>Duration</th>
                    <th style={thStyle}>Guard</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {historyVisitors.map((visitor, index) => {
                    const status = getStatus(visitor);
                    const statusStyle = getStatusStyle(status);

                    return (
                      <tr
                        key={
                          visitor._id ||
                          visitor.id ||
                          `${visitor.mobile}-${index}`
                        }
                        style={{
                          borderTop: "1px solid #e2e8f0",
                        }}
                      >
                        {/* VISITOR */}
                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "11px",
                            }}
                          >
                            {visitor.photo ? (
                              <img
                                src={visitor.photo}
                                alt={visitor.name || "Visitor"}
                                style={{
                                  width: "43px",
                                  height: "43px",
                                  borderRadius: "12px",
                                  objectFit: "cover",
                                  border: "1px solid #e2e8f0",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "43px",
                                  height: "43px",
                                  borderRadius: "12px",
                                  background: "#dbeafe",
                                  color: "#2563eb",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <UserRound size={20} />
                              </div>
                            )}

                            <div>
                              <div
                                style={{
                                  fontWeight: 800,
                                  color: "#0f172a",
                                  fontSize: "13px",
                                }}
                              >
                                {visitor.name || "Unknown Visitor"}
                              </div>

                              <div
                                style={{
                                  color: "#64748b",
                                  fontSize: "11px",
                                  marginTop: "3px",
                                }}
                              >
                                {visitor.mobile ||
                                  visitor.phone ||
                                  "No mobile"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* FLAT */}
                        <td style={tdStyle}>
                          <div
                            style={{
                              fontWeight: 800,
                              color: "#334155",
                            }}
                          >
                            {visitor.flat || "—"}
                          </div>
                        </td>

                        {/* PURPOSE */}
                        <td style={tdStyle}>
                          <span
                            style={{
                              padding: "6px 9px",
                              borderRadius: "8px",
                              background: "#f1f5f9",
                              color: "#475569",
                              fontSize: "11px",
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {visitor.purpose || "Other"}
                          </span>
                        </td>

                        {/* ENTRY */}
                        <td style={tdStyle}>
                          <DateTimeCell
                            date={visitor.entryTime}
                          />
                        </td>

                        {/* EXIT */}
                        <td style={tdStyle}>
                          <DateTimeCell
                            date={visitor.exitTime}
                          />
                        </td>

                        {/* DURATION */}
                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              color: "#475569",
                              fontSize: "12px",
                              fontWeight: 700,
                            }}
                          >
                            <Clock3 size={15} />
                            {getDuration(
                              visitor.entryTime,
                              visitor.exitTime
                            )}
                          </div>
                        </td>

                        {/* GUARD */}
                        <td style={tdStyle}>
                          {visitor.guardVerified ||
                          visitor.verifiedByGuard ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                color: "#15803d",
                                fontSize: "11px",
                                fontWeight: 800,
                              }}
                            >
                              <CheckCircle2 size={15} />
                              Verified
                            </div>
                          ) : (
                            <div
                              style={{
                                color: "#94a3b8",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              Not verified
                            </div>
                          )}
                        </td>

                        {/* STATUS */}
                        <td style={tdStyle}>
                          <span
                            style={{
                              ...statusStyle,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "6px 10px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 800,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {status === "Exited" && (
                              <CheckCircle2 size={13} />
                            )}

                            {status === "Rejected" && (
                              <XCircle size={13} />
                            )}

                            {status === "Expired" && (
                              <Clock3 size={13} />
                            )}

                            {status}
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
            marginTop: "18px",
            padding: "15px 17px",
            borderRadius: "15px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            color: "#1e40af",
            fontSize: "12px",
            lineHeight: 1.6,
          }}
        >
          <ShieldCheck
            size={19}
            style={{ flexShrink: 0 }}
          />

          <div>
            <strong>Visitor History:</strong> Entry and exit
            records help residents review previous activity and
            provide a digital security record for the society.
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, description }) => {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "17px",
        padding: "18px",
        boxShadow:
          "0 8px 25px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "#dbeafe",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "#64748b",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#0f172a",
          fontSize: "25px",
          fontWeight: 900,
          marginTop: "3px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "#94a3b8",
          fontSize: "11px",
          marginTop: "3px",
        }}
      >
        {description}
      </div>
    </div>
  );
};

const DateTimeCell = ({ date }) => {
  if (!date) {
    return (
      <span
        style={{
          color: "#94a3b8",
          fontSize: "12px",
        }}
      >
        —
      </span>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          color: "#334155",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        <CalendarDays size={14} />
        {formatDate(date)}
      </div>

      <div
        style={{
          color: "#94a3b8",
          fontSize: "11px",
          marginTop: "3px",
        }}
      >
        {formatTime(date)}
      </div>
    </div>
  );
};

const EmptyState = ({ searchActive }) => {
  return (
    <div
      style={{
        padding: "70px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "65px",
          height: "65px",
          borderRadius: "18px",
          background: "#eff6ff",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 15px",
        }}
      >
        <History size={30} />
      </div>

      <h3
        style={{
          margin: "0 0 7px",
          color: "#0f172a",
          fontSize: "17px",
        }}
      >
        {searchActive
          ? "No matching records"
          : "No visitor history yet"}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        {searchActive
          ? "Try changing your search or filters."
          : "Completed visitor activity will appear here."}
      </p>
    </div>
  );
};

const selectStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 13px",
  borderRadius: "11px",
  border: "1px solid #cbd5e1",
  outline: "none",
  background: "#ffffff",
  color: "#334155",
  fontSize: "13px",
};

const thStyle = {
  padding: "13px 15px",
  textAlign: "left",
  fontSize: "11px",
  color: "#64748b",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "15px",
  color: "#334155",
  fontSize: "12px",
  verticalAlign: "middle",
};

export default VisitorHistory;