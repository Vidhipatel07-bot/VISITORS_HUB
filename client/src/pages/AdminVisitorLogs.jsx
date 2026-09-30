import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  FileText,
  RefreshCw,
  UserRound,
  Phone,
  Home,
  CalendarDays,
  Clock3,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Timer,
  LogIn,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const LOCAL_KEY = "visitorRequests";

const getLocalVisitors = () => {
  try {
    const data = JSON.parse(
      localStorage.getItem(LOCAL_KEY) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
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

const duration = (entry, exit) => {
  if (!entry || !exit) return "-";

  const start = new Date(entry).getTime();
  const end = new Date(exit).getTime();

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    end < start
  ) {
    return "-";
  }

  const minutes = Math.floor(
    (end - start) / 60000
  );

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }

  return `${remainingMinutes}m`;
};

const getStatusStyle = (status) => {
  switch (status) {
    case "approved":
    case "trusted-approved":
      return {
        background: "#dcfce7",
        color: "#166534",
      };

    case "inside":
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };

    case "exited":
      return {
        background: "#e0f2fe",
        color: "#0369a1",
      };

    case "pending":
      return {
        background: "#fef3c7",
        color: "#92400e",
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

const getStatusLabel = (status) => {
  const labels = {
    approved: "Approved",
    "trusted-approved": "Trusted Approved",
    inside: "Inside",
    exited: "Exited",
    pending: "Pending",
    rejected: "Rejected",
    expired: "Expired",
  };

  return labels[status] || status || "Unknown";
};

const normalizeVisitor = (visitor) => ({
  ...visitor,
  name:
    visitor.name ||
    visitor.visitorName ||
    "Unknown Visitor",

  mobile:
    visitor.mobile ||
    visitor.phone ||
    "",

  flat: visitor.flat || "",

  purpose:
    visitor.purpose ||
    "Other",

  status:
    visitor.status ||
    "pending",

  photo:
    visitor.photo ||
    "",

  entryTime:
    visitor.entryTime ||
    null,

  exitTime:
    visitor.exitTime ||
    null,

  registeredAt:
    visitor.createdAt ||
    visitor.registeredAt ||
    visitor.date ||
    null,

  guardVerified:
    visitor.guardVerified === true ||
    visitor.verifiedByGuard === true,
});

const AdminVisitorLogs = () => {
  const navigate = useNavigate();

  const [visitors, setVisitors] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [dateFilter, setDateFilter] =
    useState("all");
  const [purposeFilter, setPurposeFilter] =
    useState("all");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadVisitors = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/visitors");

      const backendVisitors = Array.isArray(
        response.data
      )
        ? response.data
        : Array.isArray(response.data?.visitors)
        ? response.data.visitors
        : [];

      if (backendVisitors.length > 0) {
        setVisitors(
          backendVisitors.map(normalizeVisitor)
        );
      } else {
        setVisitors(
          getLocalVisitors().map(normalizeVisitor)
        );
      }
    } catch (error) {
      setVisitors(
        getLocalVisitors().map(normalizeVisitor)
      );

      if (error.response?.status !== 401) {
        setMessage(
          "Showing locally saved visitor logs."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitors();
  }, []);

  const purposes = useMemo(() => {
    const values = visitors
      .map((visitor) => visitor.purpose)
      .filter(Boolean);

    return [...new Set(values)];
  }, [visitors]);

  const filteredVisitors = useMemo(() => {
    return [...visitors]
      .filter((visitor) => {
        if (statusFilter === "all") {
          return true;
        }

        return visitor.status === statusFilter;
      })
      .filter((visitor) => {
        if (purposeFilter === "all") {
          return true;
        }

        return visitor.purpose === purposeFilter;
      })
      .filter((visitor) => {
        if (dateFilter === "all") {
          return true;
        }

        const value =
          visitor.entryTime ||
          visitor.registeredAt ||
          visitor.createdAt;

        if (!value) return false;

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
          return false;
        }

        const today = new Date();

        if (dateFilter === "today") {
          return (
            date.toDateString() ===
            today.toDateString()
          );
        }

        const difference =
          (today.getTime() -
            date.getTime()) /
          (1000 * 60 * 60 * 24);

        if (dateFilter === "7days") {
          return difference <= 7;
        }

        if (dateFilter === "30days") {
          return difference <= 30;
        }

        return true;
      })
      .filter((visitor) => {
        const query =
          search.toLowerCase().trim();

        if (!query) return true;

        return (
          visitor.name
            .toLowerCase()
            .includes(query) ||
          visitor.mobile
            .toLowerCase()
            .includes(query) ||
          visitor.flat
            .toLowerCase()
            .includes(query) ||
          visitor.purpose
            .toLowerCase()
            .includes(query)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.entryTime ||
            a.registeredAt ||
            0
        ).getTime();

        const dateB = new Date(
          b.entryTime ||
            b.registeredAt ||
            0
        ).getTime();

        return dateB - dateA;
      });
  }, [
    visitors,
    search,
    statusFilter,
    dateFilter,
    purposeFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: visitors.length,

      pending: visitors.filter(
        (visitor) =>
          visitor.status === "pending"
      ).length,

      inside: visitors.filter(
        (visitor) =>
          visitor.status === "inside"
      ).length,

      exited: visitors.filter(
        (visitor) =>
          visitor.status === "exited"
      ).length,

      rejected: visitors.filter(
        (visitor) =>
          visitor.status === "rejected"
      ).length,

      verified: visitors.filter(
        (visitor) =>
          visitor.guardVerified
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
      <div
        style={{
          maxWidth: "1350px",
          margin: "0 auto",
        }}
      >
        {/* BACK */}
        <button
          onClick={() =>
            navigate("/admin/dashboard")
          }
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

        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "20px",
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
              <FileText size={25} />
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
                Visitor Logs
              </h1>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Complete visitor registration,
                entry and exit records.
              </p>
            </div>
          </div>

          <button
            onClick={loadVisitors}
            disabled={loading}
            style={{
              border:
                "1px solid #dbeafe",
              background: "white",
              color: "#2563eb",
              borderRadius: "11px",
              padding: "11px 15px",
              display: "flex",
              alignItems: "center",
              gap: "7px",
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

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          <StatCard
            title="Total Logs"
            value={stats.total}
            icon={<FileText size={20} />}
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            icon={<Timer size={20} />}
          />

          <StatCard
            title="Inside"
            value={stats.inside}
            icon={<LogIn size={20} />}
          />

          <StatCard
            title="Exited"
            value={stats.exited}
            icon={<LogOut size={20} />}
          />

          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={<XCircle size={20} />}
          />

          <StatCard
            title="Guard Verified"
            value={stats.verified}
            icon={<ShieldCheck size={20} />}
          />
        </div>

        {/* FILTERS */}
        <div
          style={{
            background: "white",
            border:
              "1px solid #e2e8f0",
            borderRadius: "17px",
            padding: "17px",
            marginBottom: "20px",
            boxShadow:
              "0 8px 25px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(250px, 1fr) 170px 170px 190px",
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
                  position:
                    "absolute",
                  left: "13px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search name, mobile, flat..."
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  padding:
                    "12px 12px 12px 40px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "10px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* STATUS */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              style={{
                padding: "12px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "10px",
                background: "white",
                outline: "none",
                fontSize: "13px",
              }}
            >
              <option value="all">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="trusted-approved">
                Trusted Approved
              </option>

              <option value="inside">
                Inside
              </option>

              <option value="exited">
                Exited
              </option>

              <option value="rejected">
                Rejected
              </option>

              <option value="expired">
                Expired
              </option>
            </select>

            {/* DATE */}
            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(
                  e.target.value
                )
              }
              style={{
                padding: "12px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "10px",
                background: "white",
                outline: "none",
                fontSize: "13px",
              }}
            >
              <option value="all">
                All Dates
              </option>

              <option value="today">
                Today
              </option>

              <option value="7days">
                Last 7 Days
              </option>

              <option value="30days">
                Last 30 Days
              </option>
            </select>

            {/* PURPOSE */}
            <select
              value={purposeFilter}
              onChange={(e) =>
                setPurposeFilter(
                  e.target.value
                )
              }
              style={{
                padding: "12px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "10px",
                background: "white",
                outline: "none",
                fontSize: "13px",
              }}
            >
              <option value="all">
                All Purposes
              </option>

              {purposes.map(
                (purpose) => (
                  <option
                    key={purpose}
                    value={purpose}
                  >
                    {purpose}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {message && (
          <div
            style={{
              background: "#eff6ff",
              border:
                "1px solid #bfdbfe",
              color: "#1d4ed8",
              padding: "12px 15px",
              borderRadius: "12px",
              marginBottom: "18px",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            {message}
          </div>
        )}

        {/* TABLE */}
        <div
          style={{
            background: "white",
            border:
              "1px solid #e2e8f0",
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow:
              "0 8px 25px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div
            style={{
              padding: "19px 20px",
              borderBottom:
                "1px solid #e2e8f0",
              display: "flex",
              justifyContent:
                "space-between",
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
                  color: "#0f172a",
                }}
              >
                Visitor Records
              </h2>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >
                {filteredVisitors.length}{" "}
                record
                {filteredVisitors.length !==
                1
                  ? "s"
                  : ""}{" "}
                displayed
              </p>
            </div>
          </div>

          {filteredVisitors.length ===
          0 ? (
            <div
              style={{
                padding:
                  "60px 20px",
                textAlign:
                  "center",
              }}
            >
              <FileText
                size={44}
                color="#94a3b8"
                style={{
                  marginBottom:
                    "10px",
                }}
              />

              <h3
                style={{
                  margin:
                    "0 0 6px",
                  color: "#334155",
                }}
              >
                No visitor logs found
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Try changing the
                filters or search.
              </p>
            </div>
          ) : (
            <div
              style={{
                overflowX:
                  "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  minWidth:
                    "1250px",
                  borderCollapse:
                    "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        "#f8fafc",
                    }}
                  >
                    {[
                      "Visitor",
                      "Flat",
                      "Purpose",
                      "Registered",
                      "Entry",
                      "Exit",
                      "Duration",
                      "Guard Verification",
                      "Status",
                    ].map(
                      (heading) => (
                        <th
                          key={
                            heading
                          }
                          style={{
                            textAlign:
                              "left",
                            padding:
                              "14px 15px",
                            fontSize:
                              "11px",
                            color:
                              "#64748b",
                            textTransform:
                              "uppercase",
                            letterSpacing:
                              "0.04em",
                            whiteSpace:
                              "nowrap",
                            borderBottom:
                              "1px solid #e2e8f0",
                          }}
                        >
                          {
                            heading
                          }
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredVisitors.map(
                    (
                      visitor,
                      index
                    ) => {
                      const style =
                        getStatusStyle(
                          visitor.status
                        );

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
                              padding:
                                "15px",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "11px",
                              }}
                            >
                              {visitor.photo ? (
                                <img
                                  src={
                                    visitor.photo
                                  }
                                  alt={
                                    visitor.name
                                  }
                                  style={{
                                    width:
                                      "44px",
                                    height:
                                      "44px",
                                    objectFit:
                                      "cover",
                                    borderRadius:
                                      "11px",
                                    border:
                                      "1px solid #e2e8f0",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width:
                                      "44px",
                                    height:
                                      "44px",
                                    borderRadius:
                                      "11px",
                                    background:
                                      "#eff6ff",
                                    color:
                                      "#2563eb",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                  }}
                                >
                                  <UserRound
                                    size={
                                      20
                                    }
                                  />
                                </div>
                              )}

                              <div>
                                <div
                                  style={{
                                    fontWeight:
                                      "800",
                                    color:
                                      "#0f172a",
                                    fontSize:
                                      "13px",
                                    marginBottom:
                                      "4px",
                                  }}
                                >
                                  {
                                    visitor.name
                                  }
                                </div>

                                <div
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap: "5px",
                                    color:
                                      "#64748b",
                                    fontSize:
                                      "11px",
                                  }}
                                >
                                  <Phone
                                    size={
                                      11
                                    }
                                  />
                                  {visitor.mobile ||
                                    "-"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* FLAT */}
                          <td
                            style={{
                              padding:
                                "15px",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "5px",
                                fontWeight:
                                  "700",
                                fontSize:
                                  "13px",
                              }}
                            >
                              <Home
                                size={
                                  14
                                }
                                color="#2563eb"
                              />
                              {
                                visitor.flat
                              }
                            </div>
                          </td>

                          {/* PURPOSE */}
                          <td
                            style={{
                              padding:
                                "15px",
                            }}
                          >
                            <span
                              style={{
                                display:
                                  "inline-block",
                                background:
                                  "#f1f5f9",
                                color:
                                  "#334155",
                                padding:
                                  "6px 9px",
                                borderRadius:
                                  "7px",
                                fontSize:
                                  "11px",
                                fontWeight:
                                  "700",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {
                                visitor.purpose
                              }
                            </span>
                          </td>

                          {/* REGISTERED */}
                          <td
                            style={{
                              padding:
                                "15px",
                            }}
                          >
                            <div
                              style={{
                                fontSize:
                                  "11px",
                                color:
                                  "#475569",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              <CalendarDays
                                size={
                                  12
                                }
                                style={{
                                  verticalAlign:
                                    "middle",
                                  marginRight:
                                    "4px",
                                }}
                              />
                              {formatDateTime(
                                visitor.registeredAt
                              )}
                            </div>
                          </td>

                          {/* ENTRY */}
                          <td
                            style={{
                              padding:
                                "15px",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                flexDirection:
                                  "column",
                                gap: "3px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    "700",
                                }}
                              >
                                {
                                  formatDate(
                                    visitor.entryTime
                                  )
                                }
                              </span>

                              <span
                                style={{
                                  color:
                                    "#64748b",
                                  fontSize:
                                    "11px",
                                }}
                              >
                                <Clock3
                                  size={
                                    11
                                  }
                                  style={{
                                    verticalAlign:
                                      "middle",
                                    marginRight:
                                      "3px",
                                  }}
                                />
                                {
                                  formatTime(
                                    visitor.entryTime
                                  )
                                }
                              </span>
                            </div>
                          </td>

                          {/* EXIT */}
                          <td
                            style={{
                              padding:
                                "15px",
                            }}
                          >
                            {visitor.exitTime ? (
                              <div
                                style={{
                                  display:
                                    "flex",
                                  flexDirection:
                                    "column",
                                  gap: "3px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize:
                                      "12px",
                                    fontWeight:
                                      "700",
                                  }}
                                >
                                  {formatDate(
                                    visitor.exitTime
                                  )}
                                </span>

                                <span
                                  style={{
                                    color:
                                      "#64748b",
                                    fontSize:
                                      "11px",
                                  }}
                                >
                                  <Clock3
                                    size={
                                      11
                                    }
                                    style={{
                                      verticalAlign:
                                        "middle",
                                      marginRight:
                                        "3px",
                                    }}
                                  />
                                  {formatTime(
                                    visitor.exitTime
                                  )}
                                </span>
                              </div>
                            ) : (
                              <span
                                style={{
                                  color:
                                    "#94a3b8",
                                  fontSize:
                                    "13px",
                                }}
                              >
                                —
                              </span>
                            )}
                          </td>

                          {/* DURATION */}
                          <td
                            style={{
                              padding:
                                "15px",
                              fontWeight:
                                "700",
                              fontSize:
                                "12px",
                              color:
                                "#334155",
                            }}
                          >
                            {
                              duration(
                                visitor.entryTime,
                                visitor.exitTime
                              )
                            }
                          </td>

                          {/* GUARD */}
                          <td
                            style={{
                              padding:
                                "15px",
                            }}
                          >
                            {visitor.guardVerified ? (
                              <span
                                style={{
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  gap: "5px",
                                  background:
                                    "#dcfce7",
                                  color:
                                    "#166534",
                                  padding:
                                    "6px 9px",
                                  borderRadius:
                                    "7px",
                                  fontSize:
                                    "10px",
                                  fontWeight:
                                    "800",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                <ShieldCheck
                                  size={
                                    13
                                  }
                                />
                                Verified
                              </span>
                            ) : (
                              <span
                                style={{
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  gap: "5px",
                                  background:
                                    "#f1f5f9",
                                  color:
                                    "#64748b",
                                  padding:
                                    "6px 9px",
                                  borderRadius:
                                    "7px",
                                  fontSize:
                                    "10px",
                                  fontWeight:
                                    "700",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                Not Verified
                              </span>
                            )}
                          </td>

                          {/* STATUS */}
                          <td
                            style={{
                              padding:
                                "15px",
                            }}
                          >
                            <span
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                gap: "5px",
                                background:
                                  style.background,
                                color:
                                  style.color,
                                padding:
                                  "6px 9px",
                                borderRadius:
                                  "7px",
                                fontSize:
                                  "10px",
                                fontWeight:
                                  "800",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {visitor.status ===
                              "exited" ? (
                                <CheckCircle2
                                  size={
                                    13
                                  }
                                />
                              ) : visitor.status ===
                                "rejected" ? (
                                <XCircle
                                  size={
                                    13
                                  }
                                />
                              ) : (
                                <ShieldCheck
                                  size={
                                    13
                                  }
                                />
                              )}

                              {
                                getStatusLabel(
                                  visitor.status
                                )
                              }
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECURITY NOTE */}
        <div
          style={{
            marginTop: "20px",
            background: "#eff6ff",
            border:
              "1px solid #bfdbfe",
            borderRadius: "14px",
            padding: "16px 18px",
            display: "flex",
            alignItems:
              "flex-start",
            gap: "11px",
          }}
        >
          <ShieldCheck
            size={21}
            color="#2563eb"
          />

          <div>
            <strong
              style={{
                display:
                  "block",
                color:
                  "#1e40af",
                fontSize:
                  "13px",
                marginBottom:
                  "4px",
              }}
            >
              Security & Audit Record
            </strong>

            <span
              style={{
                color:
                  "#475569",
                fontSize:
                  "12px",
                lineHeight:
                  1.6,
              }}
            >
              These logs provide the
              admin with a digital
              record of visitor
              registration, resident
              approval, guard
              verification, entry and
              exit activity.
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

          @media (max-width: 1000px) {
            .visitor-log-filters {
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
        border:
          "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "17px",
        display: "flex",
        alignItems:
          "center",
        gap: "12px",
        boxShadow:
          "0 7px 22px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "11px",
          background: "#eff6ff",
          color: "#2563eb",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            color:
              "#64748b",
            fontSize:
              "11px",
            fontWeight:
              "700",
          }}
        >
          {title}
        </div>

        <div
          style={{
            color:
              "#0f172a",
            fontSize:
              "23px",
            fontWeight:
              "800",
            marginTop:
              "2px",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
};

export default AdminVisitorLogs;