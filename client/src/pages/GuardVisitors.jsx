import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../utils/api";

const APPROVAL_TIME_MS = 2 * 60 * 1000;

const getLocalVisitors = () => {
  try {
    const data = localStorage.getItem("visitorRequests");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocalVisitors = (visitors) => {
  localStorage.setItem(
    "visitorRequests",
    JSON.stringify(visitors)
  );
};

const getVisitorId = (visitor) =>
  visitor?._id || visitor?.id;

const getVisitorStatus = (visitor) =>
  String(visitor?.status || "pending").toLowerCase();

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusLabel = (status) => {
  const labels = {
    pending: "Pending",
    approved: "Approved",
    "trusted-approved": "Trusted Approved",
    inside: "Inside",
    exited: "Exited",
    rejected: "Rejected",
    expired: "Expired",
  };

  return (
    labels[status] ||
    status.charAt(0).toUpperCase() + status.slice(1)
  );
};

const getStatusStyle = (status) => {
  switch (status) {
    case "pending":
      return {
        background: "#fef3c7",
        color: "#92400e",
      };

    case "approved":
    case "trusted-approved":
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };

    case "inside":
      return {
        background: "#dcfce7",
        color: "#166534",
      };

    case "exited":
      return {
        background: "#e2e8f0",
        color: "#475569",
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
        background: "#f1f5f9",
        color: "#475569",
      };
  }
};

const isPendingExpired = (visitor) => {
  if (getVisitorStatus(visitor) !== "pending") {
    return false;
  }

  const createdAt = visitor?.createdAt;

  if (!createdAt) return false;

  const createdTime = new Date(createdAt).getTime();

  if (Number.isNaN(createdTime)) return false;

  return Date.now() - createdTime >= APPROVAL_TIME_MS;
};

const GuardVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadVisitors = async () => {
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
      setLastUpdated(new Date());
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitors();
  }, []);

  /*
   * Keep the guard dashboard fresh so pending visitor
   * requests can be processed quickly.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      loadVisitors();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  /*
   * Automatically expire pending requests after 2 minutes
   * on the local demo side.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const currentVisitors = getLocalVisitors();

      let changed = false;

      const updatedVisitors = currentVisitors.map((visitor) => {
        if (isPendingExpired(visitor)) {
          changed = true;

          return {
            ...visitor,
            status: "expired",
            expiredAt:
              visitor.expiredAt ||
              new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        return visitor;
      });

      if (changed) {
        saveLocalVisitors(updatedVisitors);
        setVisitors(updatedVisitors);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateVisitorStatus = async (
    visitor,
    newStatus
  ) => {
    const visitorId = getVisitorId(visitor);

    if (!visitorId) return;

    setActionLoading(visitorId);

    try {
      await api.put(
        `/visitors/${visitorId}/status`,
        {
          status: newStatus,
        }
      );
    } catch {
      /*
       * Backend may not be available during the college demo.
       * LocalStorage is updated below as fallback.
       */
    }

    const currentVisitors = getLocalVisitors();

    const updatedVisitors = currentVisitors.map((item) => {
      const itemId = getVisitorId(item);

      if (itemId !== visitorId) {
        return item;
      }

      const now = new Date().toISOString();

      return {
        ...item,
        status: newStatus,
        updatedAt: now,
        ...(newStatus === "approved" ||
        newStatus === "trusted-approved"
          ? {
              approvedAt:
                item.approvedAt || now,
            }
          : {}),
        ...(newStatus === "rejected"
          ? {
              rejectedAt: now,
            }
          : {}),
        ...(newStatus === "expired"
          ? {
              expiredAt: now,
            }
          : {}),
      };
    });

    saveLocalVisitors(updatedVisitors);

    setVisitors((previous) =>
      previous.map((item) => {
        const itemId = getVisitorId(item);

        if (itemId !== visitorId) {
          return item;
        }

        return {
          ...item,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    setActionLoading(null);
  };

  const approveVisitor = async (visitor) => {
    await allowEntry(visitor);
  };

  const allowEntry = async (visitor) => {
    const status = getVisitorStatus(visitor);

    if (
      status !== "pending" &&
      status !== "approved" &&
      status !== "trusted-approved"
    ) {
      return;
    }

    const visitorId = getVisitorId(visitor);

    if (!visitorId) return;

    setActionLoading(visitorId);

    let backendSuccess = false;

    /*
     * If pending, approve first.
     */
    if (status === "pending") {
      try {
        await api.put(
          `/visitors/${visitorId}/status`,
          {
            status:
              visitor.status === "trusted-approved"
                ? "trusted-approved"
                : "approved",
          }
        );

        backendSuccess = true;
      } catch {
        backendSuccess = false;
      }
    }

    /*
     * Record physical entry and guard verification.
     */
    try {
      await api.put(
        `/visitors/${visitorId}/entry`
      );

      backendSuccess = true;
    } catch {
      backendSuccess = false;
    }

    const now = new Date().toISOString();

    const currentVisitors = getLocalVisitors();

    const updatedVisitors = currentVisitors.map((item) => {
      const itemId = getVisitorId(item);

      if (itemId !== visitorId) {
        return item;
      }

      return {
        ...item,
        status: "inside",
        approvedAt:
          item.approvedAt || now,
        entryTime: item.entryTime || now,
        entryDate: item.entryDate || now,
        guardVerified: true,
        verifiedByGuard: true,
        guardVerifiedAt: now,
        verifiedBy: "Security Guard",
        backendSuccess,
        updatedAt: now,
      };
    });

    /*
     * If the visitor came directly from backend and is not
     * present locally, keep a local copy as well.
     */
    const existsLocally = currentVisitors.some(
      (item) =>
        getVisitorId(item) === visitorId
    );

    if (!existsLocally) {
      updatedVisitors.unshift({
        ...visitor,
        status: "inside",
        approvedAt:
          visitor.approvedAt || now,
        entryTime:
          visitor.entryTime || now,
        entryDate:
          visitor.entryDate || now,
        guardVerified: true,
        verifiedByGuard: true,
        guardVerifiedAt: now,
        verifiedBy: "Security Guard",
        backendSuccess,
        updatedAt: now,
      });
    }

    saveLocalVisitors(updatedVisitors);

    setVisitors((previous) =>
      previous.map((item) => {
        if (getVisitorId(item) !== visitorId) {
          return item;
        }

        return {
          ...item,
          status: "inside",
          approvedAt:
            item.approvedAt || now,
          entryTime:
            item.entryTime || now,
          entryDate:
            item.entryDate || now,
          guardVerified: true,
          verifiedByGuard: true,
          guardVerifiedAt: now,
          verifiedBy: "Security Guard",
          updatedAt: now,
        };
      })
    );

    setActionLoading(null);
  };

  const rejectVisitor = async (visitor) => {
    await updateVisitorStatus(
      visitor,
      "rejected"
    );
  };

  const markExit = async (visitor) => {
    const visitorId = getVisitorId(visitor);

    if (!visitorId) return;

    setActionLoading(visitorId);

    try {
      await api.put(
        `/visitors/${visitorId}/exit`
      );
    } catch {
      // Local fallback below.
    }

    const now = new Date().toISOString();

    const currentVisitors = getLocalVisitors();

    const updatedVisitors = currentVisitors.map((item) => {
      if (getVisitorId(item) !== visitorId) {
        return item;
      }

      return {
        ...item,
        status: "exited",
        exitTime: now,
        exitDate: now,
        updatedAt: now,
      };
    });

    saveLocalVisitors(updatedVisitors);

    setVisitors((previous) =>
      previous.map((item) => {
        if (getVisitorId(item) !== visitorId) {
          return item;
        }

        return {
          ...item,
          status: "exited",
          exitTime: now,
          exitDate: now,
          updatedAt: now,
        };
      })
    );

    setActionLoading(null);
  };

  const filteredVisitors = useMemo(() => {
    return visitors
      .filter((visitor) => {
        if (statusFilter === "all") {
          return true;
        }

        return (
          getVisitorStatus(visitor) ===
          statusFilter
        );
      })
      .filter((visitor) => {
        if (!searchTerm.trim()) {
          return true;
        }

        const search = searchTerm
          .toLowerCase()
          .trim();

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
            String(value)
              .toLowerCase()
              .includes(search)
          );
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.createdAt ||
            a.entryTime ||
            a.updatedAt ||
            0
        ).getTime();

        const dateB = new Date(
          b.createdAt ||
            b.entryTime ||
            b.updatedAt ||
            0
        ).getTime();

        return dateB - dateA;
      });
  }, [
    visitors,
    searchTerm,
    statusFilter,
  ]);

  const pendingVisitors = filteredVisitors.filter(
    (visitor) =>
      getVisitorStatus(visitor) ===
      "pending"
  );

  const approvedVisitors = filteredVisitors.filter(
    (visitor) =>
      ["approved", "trusted-approved"].includes(
        getVisitorStatus(visitor)
      )
  );

  const insideVisitors = filteredVisitors.filter(
    (visitor) =>
      getVisitorStatus(visitor) === "inside"
  );

  const recentVisitors = filteredVisitors.filter(
    (visitor) =>
      ["exited", "rejected", "expired"].includes(
        getVisitorStatus(visitor)
      )
  );

  const totalPending = visitors.filter(
    (visitor) =>
      getVisitorStatus(visitor) === "pending"
  ).length;

  const totalInside = visitors.filter(
    (visitor) =>
      getVisitorStatus(visitor) === "inside"
  ).length;

  const totalApproved = visitors.filter(
    (visitor) =>
      ["approved", "trusted-approved"].includes(
        getVisitorStatus(visitor)
      )
  ).length;

  const totalRejected = visitors.filter(
    (visitor) =>
      getVisitorStatus(visitor) === "rejected"
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
            flexWrap: "wrap",
            marginBottom: "24px",
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
              to="/guard/dashboard"
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
                  gap: "8px",
                  color: "#2563eb",
                  fontWeight: 800,
                  fontSize: "14px",
                  marginBottom: "4px",
                }}
              >
                <ShieldCheck size={18} />
                Visitors Hub
              </div>

              <h1
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: "27px",
                }}
              >
                Visitor Management
              </h1>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Verify, approve and manage visitors at the gate.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <span
              style={{
                padding: "8px 12px",
                borderRadius: "20px",
                background: "#dcfce7",
                color: "#166534",
                fontSize: "11px",
                fontWeight: 800,
              }}
            >
              LIVE
            </span>

            <span
              style={{
                color: "#64748b",
                fontSize: "11px",
              }}
            >
              Updated {formatTime(lastUpdated)}
            </span>

            <button
              onClick={loadVisitors}
              style={{
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#334155",
                padding: "10px 14px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          <StatCard
            icon={<Clock3 size={21} />}
            label="Pending"
            value={totalPending}
            description="Waiting for action"
          />

          <StatCard
            icon={<CheckCircle2 size={21} />}
            label="Approved"
            value={totalApproved}
            description="Approved for entry"
          />

          <StatCard
            icon={<UserRound size={21} />}
            label="Inside"
            value={totalInside}
            description="Currently inside"
          />

          <StatCard
            icon={<XCircle size={21} />}
            label="Rejected"
            value={totalRejected}
            description="Access denied"
          />
        </div>

        {/* FILTERS */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "17px",
            boxShadow:
              "0 8px 28px rgba(15, 23, 42, 0.07)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(250px, 1fr) 190px",
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
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search visitor, flat, phone or purpose..."
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
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 13px",
                borderRadius: "11px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#334155",
                fontSize: "13px",
              }}
            >
              <option value="all">
                All Visitors
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
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "70px 20px",
              textAlign: "center",
              color: "#64748b",
              boxShadow:
                "0 8px 28px rgba(15, 23, 42, 0.07)",
            }}
          >
            Loading visitor requests...
          </div>
        ) : (
          <>
            {/* PENDING */}
            {pendingVisitors.length > 0 && (
              <VisitorSection
                title="Pending Visitor Requests"
                subtitle="Requests waiting for security action."
                icon={<Clock3 size={20} />}
                visitors={pendingVisitors}
                actionLoading={actionLoading}
                onApprove={approveVisitor}
                onReject={rejectVisitor}
                showActions
              />
            )}

            {/* APPROVED */}
            {approvedVisitors.length > 0 && (
              <VisitorSection
                title="Approved / Trusted Visitors"
                subtitle="Visitors approved and ready for security verification."
                icon={<CheckCircle2 size={20} />}
                visitors={approvedVisitors}
                actionLoading={actionLoading}
                onApprove={allowEntry}
                showEntryAction
              />
            )}

            {/* INSIDE */}
            {insideVisitors.length > 0 && (
              <VisitorSection
                title="Visitors Currently Inside"
                subtitle="Visitors who have entered the society and have not yet exited."
                icon={<UserRound size={20} />}
                visitors={insideVisitors}
                actionLoading={actionLoading}
                onExit={markExit}
                showExitAction
              />
            )}

            {/* RECENT */}
            {recentVisitors.length > 0 && (
              <VisitorSection
                title="Recent Visitor Records"
                subtitle="Completed, rejected and expired visitor requests."
                icon={<CalendarDays size={20} />}
                visitors={recentVisitors}
                actionLoading={actionLoading}
              />
            )}

            {filteredVisitors.length === 0 && (
              <EmptyState
                searchActive={
                  Boolean(searchTerm) ||
                  statusFilter !== "all"
                }
              />
            )}
          </>
        )}

        {/* SECURITY NOTE */}
        <div
          style={{
            marginTop: "20px",
            padding: "17px 18px",
            borderRadius: "16px",
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
            <strong>Security Policy:</strong> Visitor registration
            does not automatically grant entry. Security should
            verify the visitor and record entry before allowing
            access. Pending requests expire after the configured
            approval period in the demo.
          </div>
        </div>
      </div>
    </div>
  );
};

/* VISITOR SECTION */

const VisitorSection = ({
  title,
  subtitle,
  icon,
  visitors,
  actionLoading,
  onApprove,
  onReject,
  onExit,
  showActions = false,
  showEntryAction = false,
  showExitAction = false,
}) => {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "20px",
        marginBottom: "20px",
        boxShadow:
          "0 9px 30px rgba(15, 23, 42, 0.07)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "19px 21px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "39px",
            height: "39px",
            borderRadius: "11px",
            background: "#dbeafe",
            color: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "17px",
            }}
          >
            {title}
          </h2>

          <p
            style={{
              margin: "4px 0 0",
              color: "#64748b",
              fontSize: "11px",
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div
        style={{
          padding: "15px",
          display: "grid",
          gap: "12px",
        }}
      >
        {visitors.map((visitor, index) => (
          <VisitorCard
            key={
              getVisitorId(visitor) ||
              `${visitor.mobile}-${index}`
            }
            visitor={visitor}
            actionLoading={actionLoading}
            onApprove={onApprove}
            onReject={onReject}
            onExit={onExit}
            showActions={showActions}
            showEntryAction={showEntryAction}
            showExitAction={showExitAction}
          />
        ))}
      </div>
    </div>
  );
};

/* VISITOR CARD */

const VisitorCard = ({
  visitor,
  actionLoading,
  onApprove,
  onReject,
  onExit,
  showActions,
  showEntryAction,
  showExitAction,
}) => {
  const status = getVisitorStatus(visitor);
  const statusStyle = getStatusStyle(status);

  const visitorId = getVisitorId(visitor);

  const busy = actionLoading === visitorId;

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "16px",
        display: "grid",
        gridTemplateColumns:
          "auto minmax(220px, 1fr) auto",
        gap: "16px",
        alignItems: "center",
      }}
    >
      {/* PHOTO */}
      <div>
        {visitor.photo ? (
          <img
            src={visitor.photo}
            alt={visitor.name || "Visitor"}
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "16px",
              objectFit: "cover",
              border: "1px solid #e2e8f0",
            }}
          />
        ) : (
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "16px",
              background: "#dbeafe",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserRound size={28} />
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "6px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "15px",
            }}
          >
            {visitor.name || "Unknown Visitor"}
          </h3>

          <span
            style={{
              ...statusStyle,
              padding: "5px 9px",
              borderRadius: "20px",
              fontSize: "10px",
              fontWeight: 800,
            }}
          >
            {getStatusLabel(status)}
          </span>

          {status === "trusted-approved" && (
            <span
              style={{
                padding: "5px 9px",
                borderRadius: "20px",
                background: "#ecfeff",
                color: "#0e7490",
                fontSize: "10px",
                fontWeight: 800,
              }}
            >
              TRUSTED
            </span>
          )}

          {visitor.guestPassId && (
            <span
              style={{
                padding: "5px 9px",
                borderRadius: "20px",
                background: "#f3e8ff",
                color: "#7e22ce",
                fontSize: "10px",
                fontWeight: 800,
              }}
            >
              GUEST PASS
            </span>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(130px, max-content))",
            gap: "6px 18px",
            color: "#64748b",
            fontSize: "11px",
          }}
        >
          <DetailItem
            label="Mobile"
            value={
              visitor.mobile ||
              visitor.phone ||
              "—"
            }
          />

          <DetailItem
            label="Flat"
            value={visitor.flat || "—"}
          />

          <DetailItem
            label="Purpose"
            value={visitor.purpose || "Other"}
          />

          <DetailItem
            label="Registered"
            value={formatTime(
              visitor.createdAt
            )}
          />

          {visitor.entryTime && (
            <DetailItem
              label="Entry"
              value={formatTime(
                visitor.entryTime
              )}
            />
          )}

          {visitor.exitTime && (
            <DetailItem
              label="Exit"
              value={formatTime(
                visitor.exitTime
              )}
            />
          )}
        </div>

        {visitor.vehicleNumber && (
          <div
            style={{
              marginTop: "8px",
              color: "#475569",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            Vehicle: {visitor.vehicleNumber}
            {visitor.vehicleType
              ? ` • ${visitor.vehicleType}`
              : ""}
          </div>
        )}

        {visitor.guardVerified && (
          <div
            style={{
              marginTop: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              color: "#15803d",
              fontSize: "10px",
              fontWeight: 800,
            }}
          >
            <CheckCircle2 size={14} />
            Guard Verified
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "7px",
          minWidth: "125px",
        }}
      >
        {showActions && (
          <>
            <button
              onClick={() => onApprove(visitor)}
              disabled={busy}
              style={{
                border: "none",
                background: busy
                  ? "#94a3b8"
                  : "#16a34a",
                color: "#ffffff",
                borderRadius: "9px",
                padding: "9px 12px",
                cursor: busy
                  ? "not-allowed"
                  : "pointer",
                fontWeight: 800,
                fontSize: "11px",
              }}
            >
              {busy
                ? "Processing..."
                : "Approve & Entry"}
            </button>

            <button
              onClick={() => onReject(visitor)}
              disabled={busy}
              style={{
                border: "1px solid #fecaca",
                background: "#fffafa",
                color: "#b91c1c",
                borderRadius: "9px",
                padding: "9px 12px",
                cursor: busy
                  ? "not-allowed"
                  : "pointer",
                fontWeight: 800,
                fontSize: "11px",
              }}
            >
              Reject
            </button>
          </>
        )}

        {showEntryAction && (
          <button
            onClick={() => onApprove(visitor)}
            disabled={busy}
            style={{
              border: "none",
              background: busy
                ? "#94a3b8"
                : "#2563eb",
              color: "#ffffff",
              borderRadius: "9px",
              padding: "9px 12px",
              cursor: busy
                ? "not-allowed"
                : "pointer",
              fontWeight: 800,
              fontSize: "11px",
            }}
          >
            {busy
              ? "Processing..."
              : "Verify & Allow Entry"}
          </button>
        )}

        {showExitAction && (
          <button
            onClick={() => onExit(visitor)}
            disabled={busy}
            style={{
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              borderRadius: "9px",
              padding: "9px 12px",
              cursor: busy
                ? "not-allowed"
                : "pointer",
              fontWeight: 800,
              fontSize: "11px",
            }}
          >
            {busy
              ? "Processing..."
              : "Mark Exit"}
          </button>
        )}
      </div>
    </div>
  );
};

/* DETAIL ITEM */

const DetailItem = ({ label, value }) => {
  return (
    <div>
      <span
        style={{
          color: "#94a3b8",
          marginRight: "4px",
        }}
      >
        {label}:
      </span>

      <strong
        style={{
          color: "#475569",
        }}
      >
        {value}
      </strong>
    </div>
  );
};

/* STAT CARD */

const StatCard = ({
  icon,
  label,
  value,
  description,
}) => {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "17px",
        padding: "17px",
        boxShadow:
          "0 8px 25px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        style={{
          width: "39px",
          height: "39px",
          borderRadius: "11px",
          background: "#dbeafe",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "11px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "#64748b",
          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#0f172a",
          fontSize: "24px",
          fontWeight: 900,
          marginTop: "2px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "#94a3b8",
          fontSize: "10px",
          marginTop: "2px",
        }}
      >
        {description}
      </div>
    </div>
  );
};

/* EMPTY STATE */

const EmptyState = ({ searchActive }) => {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "20px",
        padding: "65px 20px",
        textAlign: "center",
        boxShadow:
          "0 8px 28px rgba(15, 23, 42, 0.07)",
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
          margin: "0 auto 14px",
        }}
      >
        <UserRound size={30} />
      </div>

      <h3
        style={{
          margin: "0 0 6px",
          color: "#0f172a",
          fontSize: "17px",
        }}
      >
        {searchActive
          ? "No matching visitors"
          : "No visitor records"}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: "12px",
        }}
      >
        {searchActive
          ? "Try changing your search or status filter."
          : "Visitor requests will appear here when they register."}
      </p>
    </div>
  );
};

export default GuardVisitors;