import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Check,
  X,
  Clock,
  ShieldCheck,
  RefreshCw,
  Phone,
  Home,
  AlertCircle
} from "lucide-react";

function VisitorRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);

  const loadRequests = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(
          "visitorRequests"
        ) || "[]"
      );

      const now = Date.now();

      const updated = Array.isArray(saved)
        ? saved.map((request) => {
            if (
              request.status === "pending" &&
              request.createdAt
            ) {
              const createdTime =
                new Date(
                  request.createdAt
                ).getTime();

              if (
                !Number.isNaN(createdTime) &&
                now - createdTime >= 120000
              ) {
                return {
                  ...request,
                  status: "expired",
                  expiredAt:
                    request.expiredAt ||
                    new Date().toISOString()
                };
              }
            }

            return request;
          })
        : [];

      localStorage.setItem(
        "visitorRequests",
        JSON.stringify(updated)
      );

      setRequests(updated);
    } catch (error) {
      console.error(
        "Visitor request loading error:",
        error
      );

      setRequests([]);
    }
  };

  useEffect(() => {
    loadRequests();

    const interval = setInterval(
      loadRequests,
      1000
    );

    return () =>
      clearInterval(interval);
  }, []);

  const updateStatus = (id, status) => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(
          "visitorRequests"
        ) || "[]"
      );

      const updated = saved.map(
        (request) =>
          request.id === id
            ? {
                ...request,
                status,
                decisionAt:
                  new Date().toISOString()
              }
            : request
      );

      localStorage.setItem(
        "visitorRequests",
        JSON.stringify(updated)
      );

      setRequests(updated);
    } catch (error) {
      console.error(
        "Visitor status update error:",
        error
      );
    }
  };

  const pendingRequests =
    requests.filter(
      (request) =>
        request.status === "pending"
    );

  const recentRequests = requests
    .filter((request) =>
      [
        "approved",
        "trusted-approved",
        "rejected",
        "expired",
        "inside",
        "exited"
      ].includes(request.status)
    )
    .slice()
    .sort((a, b) => {
      const first =
        new Date(
          b.decisionAt ||
            b.entryTime ||
            b.createdAt ||
            0
        ).getTime();

      const second =
        new Date(
          a.decisionAt ||
            a.entryTime ||
            a.createdAt ||
            0
        ).getTime();

      return first - second;
    });

  const getPurposeLabel = (purpose) =>
    purpose || "Personal Visit";

  const getStatusLabel = (status) => {
    switch (status) {
      case "approved":
        return "Approved";

      case "trusted-approved":
        return "Auto-Approved";

      case "rejected":
        return "Rejected";

      case "expired":
        return "Expired";

      case "inside":
        return "Currently Inside";

      case "exited":
        return "Completed";

      default:
        return status || "Pending";
    }
  };

  const getStatusColors = (status) => {
    switch (status) {
      case "approved":
      case "trusted-approved":
      case "inside":
        return {
          background: "#ecfdf5",
          color: "#15803d",
          border: "#bbf7d0"
        };

      case "rejected":
        return {
          background: "#fef2f2",
          color: "#dc2626",
          border: "#fecaca"
        };

      case "expired":
        return {
          background: "#fff7ed",
          color: "#c2410c",
          border: "#fed7aa"
        };

      case "exited":
        return {
          background: "#f1f5f9",
          color: "#475569",
          border: "#e2e8f0"
        };

      default:
        return {
          background: "#eff6ff",
          color: "#1769d1",
          border: "#dbeafe"
        };
    }
  };

  const getRemainingTime = (createdAt) => {
    if (!createdAt) return 0;

    const createdTime =
      new Date(createdAt).getTime();

    if (Number.isNaN(createdTime)) {
      return 0;
    }

    const elapsed =
      Math.floor(
        (Date.now() - createdTime) /
          1000
      );

    return Math.max(0, 120 - elapsed);
  };

  const formatTimer = (seconds) => {
    const minutes =
      Math.floor(seconds / 60);

    const remaining =
      seconds % 60;

    return `${minutes}:${String(
      remaining
    ).padStart(2, "0")}`;
  };

  const formatTime = (date) => {
    if (!date) return "--";

    const parsed =
      new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "--";
    }

    return parsed.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDate = (date) => {
    if (!date) return "--";

    const parsed =
      new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "--";
    }

    return parsed.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const cardStyle = {
    background: "#ffffff",
    border:
      "1px solid #e4ebf4",
    borderRadius: "20px",
    boxShadow:
      "0 10px 30px rgba(30,64,175,0.07)"
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#f4f8ff,#f8fbff)",
        fontFamily:
          'Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
        color: "#172033"
      }}
    >
      <header
        style={{
          background:
            "linear-gradient(135deg,#0f2f68,#1769d1)",
          color: "#ffffff",
          padding: "20px 5%",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "15px"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "13px"
          }}
        >
          <button
            onClick={() =>
              navigate(
                "/resident/dashboard"
              )
            }
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              border:
                "1px solid rgba(255,255,255,0.25)",
              background:
                "rgba(255,255,255,0.12)",
              color: "#ffffff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "23px",
                fontWeight: 850
              }}
            >
              Visitor Requests
            </h1>

            <p
              style={{
                margin: "4px 0 0",
                color: "#dbeafe",
                fontSize: "12px"
              }}
            >
              Review and manage visitor entry
              requests
            </p>
          </div>
        </div>

        <button
          onClick={loadRequests}
          title="Refresh"
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            border:
              "1px solid rgba(255,255,255,0.25)",
            background:
              "rgba(255,255,255,0.12)",
            color: "#ffffff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <RefreshCw size={19} />
        </button>
      </header>

      <main
        style={{
          width: "90%",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "35px 0 50px"
        }}
      >
        <section style={{ marginBottom: "30px" }}>
          <div style={{ marginBottom: "18px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 10px",
                borderRadius: "20px",
                background: "#eff6ff",
                color: "#1769d1",
                fontSize: "11px",
                fontWeight: 850
              }}
            >
              <Clock size={13} />
              {pendingRequests.length} PENDING
            </span>

            <h2
              style={{
                margin: "10px 0 4px",
                fontSize: "22px"
              }}
            >
              Pending Requests
            </h2>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "13px"
              }}
            >
              Review visitors waiting for your
              approval.
            </p>
          </div>

          {pendingRequests.length === 0 ? (
            <div
              style={{
                ...cardStyle,
                padding: "45px 25px",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "20px",
                  background: "#ecfdf5",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 15px"
                }}
              >
                <ShieldCheck size={31} />
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: "18px"
                }}
              >
                No Pending Requests
              </h3>

              <p
                style={{
                  maxWidth: "430px",
                  margin:
                    "8px auto 0",
                  color: "#64748b",
                  fontSize: "13px",
                  lineHeight: 1.5
                }}
              >
                New visitor requests will
                appear here when someone
                registers at the gate.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "15px"
              }}
            >
              {pendingRequests.map(
                (request) => {
                  const remaining =
                    getRemainingTime(
                      request.createdAt
                    );

                  const isUrgent =
                    remaining <= 30;

                  return (
                    <div
                      key={request.id}
                      style={{
                        ...cardStyle,
                        padding: "20px",
                        border:
                          isUrgent
                            ? "1px solid #fecaca"
                            : "1px solid #dbe7f5"
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "auto 1fr auto",
                          gap: "18px",
                          alignItems:
                            "center"
                        }}
                      >
                        <div
                          style={{
                            width: "76px",
                            height: "76px",
                            borderRadius: "18px",
                            overflow: "hidden",
                            background:
                              "#eef5ff",
                            color:
                              "#1769d1",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center"
                          }}
                        >
                          {request.photo ? (
                            <img
                              src={
                                request.photo
                              }
                              alt={
                                request.name ||
                                "Visitor"
                              }
                              style={{
                                width:
                                  "100%",
                                height:
                                  "100%",
                                objectFit:
                                  "cover"
                              }}
                            />
                          ) : (
                            <UserRound
                              size={31}
                            />
                          )}
                        </div>

                        <div>
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "8px",
                              flexWrap:
                                "wrap"
                            }}
                          >
                            <h3
                              style={{
                                margin: 0,
                                fontSize:
                                  "17px"
                              }}
                            >
                              {request.name ||
                                "Unknown Visitor"}
                            </h3>

                            {request.source ===
                              "guest-pass" && (
                              <span
                                style={{
                                  background:
                                    "#f5f3ff",
                                  color:
                                    "#7c3aed",
                                  padding:
                                    "4px 8px",
                                  borderRadius:
                                    "20px",
                                  fontSize:
                                    "10px",
                                  fontWeight:
                                    800
                                }}
                              >
                                PRE-REGISTERED
                              </span>
                            )}

                            {request.isTrustedVisitor && (
                              <span
                                style={{
                                  background:
                                    "#ecfdf5",
                                  color:
                                    "#15803d",
                                  padding:
                                    "4px 8px",
                                  borderRadius:
                                    "20px",
                                  fontSize:
                                    "10px",
                                  fontWeight:
                                    800
                                }}
                              >
                                TRUSTED
                              </span>
                            )}
                          </div>

                          <p
                            style={{
                              margin:
                                "5px 0 10px",
                              color:
                                "#64748b",
                              fontSize:
                                "13px"
                            }}
                          >
                            {getPurposeLabel(
                              request.purpose
                            )}
                          </p>

                          <div
                            style={{
                              display:
                                "flex",
                              gap: "8px",
                              flexWrap:
                                "wrap"
                            }}
                          >
                            <span
                              style={{
                                background:
                                  "#f8fafc",
                                border:
                                  "1px solid #e2e8f0",
                                padding:
                                  "7px 9px",
                                borderRadius:
                                  "9px",
                                fontSize:
                                  "11px",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "5px"
                              }}
                            >
                              <Home size={13} />
                              {request.flat ||
                                "--"}
                            </span>

                            <span
                              style={{
                                background:
                                  "#f8fafc",
                                border:
                                  "1px solid #e2e8f0",
                                padding:
                                  "7px 9px",
                                borderRadius:
                                  "9px",
                                fontSize:
                                  "11px",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "5px"
                              }}
                            >
                              <Phone size={13} />
                              {request.phone ||
                                "--"}
                            </span>

                            <span
                              style={{
                                background:
                                  "#f8fafc",
                                border:
                                  "1px solid #e2e8f0",
                                padding:
                                  "7px 9px",
                                borderRadius:
                                  "9px",
                                fontSize:
                                  "11px"
                              }}
                            >
                              Requested{" "}
                              {formatTime(
                                request.createdAt
                              )}
                            </span>
                          </div>

                          <div
                            style={{
                              marginTop:
                                "11px",
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: "7px",
                              padding:
                                "8px 10px",
                              borderRadius:
                                "10px",
                              background:
                                isUrgent
                                  ? "#fef2f2"
                                  : "#eff6ff",
                              color:
                                isUrgent
                                  ? "#dc2626"
                                  : "#1769d1",
                              fontSize:
                                "12px",
                              fontWeight:
                                800
                            }}
                          >
                            <Clock size={15} />
                            {isUrgent
                              ? "Respond quickly • "
                              : "Approval Time: "}
                            {formatTimer(
                              remaining
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            display:
                              "flex",
                            flexDirection:
                              "column",
                            gap: "9px",
                            minWidth:
                              "120px"
                          }}
                        >
                          <button
                            onClick={() =>
                              updateStatus(
                                request.id,
                                "approved"
                              )
                            }
                            disabled={
                              remaining ===
                              0
                            }
                            style={{
                              border:
                                "none",
                              borderRadius:
                                "12px",
                              minHeight:
                                "45px",
                              background:
                                remaining ===
                                0
                                  ? "#d1d5db"
                                  : "#16a34a",
                              color:
                                "#ffffff",
                              fontWeight:
                                800,
                              cursor:
                                remaining ===
                                0
                                  ? "not-allowed"
                                  : "pointer",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              gap: "6px"
                            }}
                          >
                            <Check size={17} />
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(
                                request.id,
                                "rejected"
                              )
                            }
                            style={{
                              border:
                                "none",
                              borderRadius:
                                "12px",
                              minHeight:
                                "45px",
                              background:
                                "#fee2e2",
                              color:
                                "#dc2626",
                              fontWeight:
                                800,
                              cursor:
                                "pointer",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              gap: "6px"
                            }}
                          >
                            <X size={17} />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        <section>
          <div style={{ marginBottom: "18px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "22px"
              }}
            >
              Recent Visitor Activity
            </h2>

            <p
              style={{
                margin:
                  "5px 0 0",
                color: "#64748b",
                fontSize: "13px"
              }}
            >
              Recently processed visitor
              requests.
            </p>
          </div>

          {recentRequests.length === 0 ? (
            <div
              style={{
                ...cardStyle,
                padding: "40px 25px",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  width: "58px",
                  height: "58px",
                  borderRadius: "18px",
                  background: "#f1f5f9",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 13px"
                }}
              >
                <UserRound size={27} />
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: "17px"
                }}
              >
                No Recent Activity
              </h3>

              <p
                style={{
                  margin:
                    "7px auto 0",
                  maxWidth:
                    "400px",
                  color: "#64748b",
                  fontSize: "12px"
                }}
              >
                Approved and rejected visitor
                requests will appear here.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "10px"
              }}
            >
              {recentRequests.map(
                (request) => {
                  const colors =
                    getStatusColors(
                      request.status
                    );

                  return (
                    <div
                      key={request.id}
                      style={{
                        ...cardStyle,
                        padding:
                          "14px 17px",
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap: "15px"
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "12px"
                        }}
                      >
                        <div
                          style={{
                            width: "47px",
                            height: "47px",
                            borderRadius:
                              "13px",
                            overflow:
                              "hidden",
                            background:
                              "#eef5ff",
                            color:
                              "#1769d1",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            flexShrink:
                              0
                          }}
                        >
                          {request.photo ? (
                            <img
                              src={
                                request.photo
                              }
                              alt={
                                request.name ||
                                "Visitor"
                              }
                              style={{
                                width:
                                  "100%",
                                height:
                                  "100%",
                                objectFit:
                                  "cover"
                              }}
                            />
                          ) : (
                            <UserRound
                              size={21}
                            />
                          )}
                        </div>

                        <div>
                          <h3
                            style={{
                              margin: 0,
                              fontSize:
                                "14px"
                            }}
                          >
                            {request.name ||
                              "Unknown Visitor"}
                          </h3>

                          <p
                            style={{
                              margin:
                                "4px 0 0",
                              color:
                                "#64748b",
                              fontSize:
                                "11px"
                            }}
                          >
                            {request.flat ||
                              "--"}{" "}
                            •{" "}
                            {getPurposeLabel(
                              request.purpose
                            )}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          flexDirection:
                            "column",
                          alignItems:
                            "flex-end",
                          gap: "5px"
                        }}
                      >
                        <span
                          style={{
                            background:
                              colors.background,
                            color:
                              colors.color,
                            border:
                              `1px solid ${colors.border}`,
                            borderRadius:
                              "20px",
                            padding:
                              "5px 9px",
                            fontSize:
                              "10px",
                            fontWeight:
                              800
                          }}
                        >
                          {getStatusLabel(
                            request.status
                          )}
                        </span>

                        <span
                          style={{
                            color:
                              "#94a3b8",
                            fontSize:
                              "10px"
                          }}
                        >
                          {formatDate(
                            request.decisionAt ||
                              request.entryTime ||
                              request.createdAt
                          )}{" "}
                          •{" "}
                          {formatTime(
                            request.decisionAt ||
                              request.entryTime ||
                              request.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        <div
          style={{
            marginTop: "25px",
            padding: "16px",
            borderRadius: "15px",
            background: "#eff6ff",
            border:
              "1px solid #dbeafe",
            display: "flex",
            gap: "10px",
            alignItems: "flex-start",
            color: "#24528e"
          }}
        >
          <ShieldCheck size={19} />

          <div>
            <strong
              style={{
                fontSize: "13px"
              }}
            >
              Security Reminder
            </strong>

            <p
              style={{
                margin:
                  "4px 0 0",
                fontSize: "12px",
                lineHeight: 1.5
              }}
            >
              Only approve visitors you can
              verify. Approved visitors must
              still be checked by security before
              entry.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VisitorRequests; 