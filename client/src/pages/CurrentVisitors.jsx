import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Clock,
  ShieldCheck,
  RefreshCw,
  MapPin,
  LogOut,
  Phone,
  CalendarDays
} from "lucide-react";

function CurrentVisitors() {
  const navigate = useNavigate();

  const [visitors, setVisitors] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadVisitors = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("visitorRequests") || "[]"
      );

      const insideVisitors = Array.isArray(saved)
        ? saved
            .filter((visitor) => visitor.status === "inside")
            .sort((a, b) => {
              const aTime = new Date(
                a.entryTime || a.updatedAt || a.createdAt || 0
              ).getTime();

              const bTime = new Date(
                b.entryTime || b.updatedAt || b.createdAt || 0
              ).getTime();

              return bTime - aTime;
            })
        : [];

      setVisitors(insideVisitors);
    } catch (error) {
      console.error("Unable to load current visitors:", error);
      setVisitors([]);
    }
  };

  useEffect(() => {
    loadVisitors();

    const interval = setInterval(loadVisitors, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadVisitors();

    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const formatTime = (date) => {
    if (!date) return "--";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "--";

    return parsedDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDate = (date) => {
    if (!date) return "--";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "--";

    return parsedDate.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getPurpose = (purpose) => {
    return purpose || "Personal Visit";
  };

  const markExit = (visitorId) => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("visitorRequests") || "[]"
      );

      if (!Array.isArray(saved)) return;

      const updated = saved.map((visitor) => {
        const id = visitor.id || visitor._id;

        if (id !== visitorId) {
          return visitor;
        }

        return {
          ...visitor,
          status: "exited",
          exitTime: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });

      localStorage.setItem(
        "visitorRequests",
        JSON.stringify(updated)
      );

      loadVisitors();
    } catch (error) {
      console.error("Unable to mark visitor exit:", error);
    }
  };

  const getVisitorId = (visitor) => {
    return visitor.id || visitor._id;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f4f8ff 0%, #eef5ff 50%, #f8fbff 100%)",
        padding: "30px 18px",
        color: "#172033"
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto"
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "30px",
            flexWrap: "wrap"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px"
            }}
          >
            <button
              onClick={() => navigate("/resident/dashboard")}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#ffffff",
                border: "1px solid #dce5f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#24324a",
                boxShadow: "0 4px 12px rgba(30, 64, 120, 0.08)"
              }}
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1
                style={{
                  fontSize: "30px",
                  fontWeight: "750",
                  marginBottom: "5px"
                }}
              >
                Current Visitors
              </h1>

              <p
                style={{
                  color: "#667085",
                  fontSize: "15px"
                }}
              >
                Visitors currently inside the society
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            title="Refresh"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#ffffff",
              border: "1px solid #dce5f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#2563eb",
              boxShadow: "0 4px 12px rgba(30, 64, 120, 0.08)"
            }}
          >
            <RefreshCw
              size={19}
              style={{
                transform: refreshing ? "rotate(360deg)" : "none",
                transition: "transform 0.5s"
              }}
            />
          </button>
        </div>

        {/* SUMMARY */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "32px"
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e0e8f5",
              borderRadius: "18px",
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "15px",
              boxShadow: "0 8px 25px rgba(30, 64, 120, 0.06)"
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "#eaf2ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <UserRound size={23} />
            </div>

            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#667085",
                  marginBottom: "4px"
                }}
              >
                Currently Inside
              </span>

              <strong
                style={{
                  fontSize: "25px"
                }}
              >
                {visitors.length}
              </strong>
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e0e8f5",
              borderRadius: "18px",
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "15px",
              boxShadow: "0 8px 25px rgba(30, 64, 120, 0.06)"
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "#eafaf1",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Clock size={23} />
            </div>

            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#667085",
                  marginBottom: "4px"
                }}
              >
                Live Status
              </span>

              <strong
                style={{
                  fontSize: "20px",
                  color: visitors.length > 0 ? "#16a34a" : "#667085"
                }}
              >
                {visitors.length > 0 ? "Active" : "Clear"}
              </strong>
            </div>
          </div>
        </div>

        {/* SECTION HEADER */}
        <div style={{ marginBottom: "18px" }}>
          <h2
            style={{
              fontSize: "22px",
              marginBottom: "5px"
            }}
          >
            Visitors Inside
          </h2>

          <p
            style={{
              color: "#667085",
              fontSize: "14px"
            }}
          >
            Live visitor entry information
          </p>
        </div>

        {/* EMPTY STATE */}
        {visitors.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e0e8f5",
              borderRadius: "20px",
              padding: "55px 25px",
              textAlign: "center",
              boxShadow: "0 8px 25px rgba(30, 64, 120, 0.06)"
            }}
          >
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                background: "#edf4ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}
            >
              <ShieldCheck size={32} />
            </div>

            <h3
              style={{
                fontSize: "20px",
                marginBottom: "8px"
              }}
            >
              No Visitors Inside
            </h3>

            <p
              style={{
                color: "#667085",
                fontSize: "14px",
                maxWidth: "430px",
                margin: "0 auto"
              }}
            >
              There are currently no active visitors inside
              the society.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(310px, 1fr))",
              gap: "18px"
            }}
          >
            {visitors.map((visitor) => {
              const visitorId = getVisitorId(visitor);

              return (
                <div
                  key={visitorId}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #dfe7f3",
                    borderRadius: "20px",
                    padding: "20px",
                    boxShadow:
                      "0 10px 28px rgba(30, 64, 120, 0.07)"
                  }}
                >
                  {/* TOP */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "13px",
                      marginBottom: "18px"
                    }}
                  >
                    <div
                      style={{
                        width: "55px",
                        height: "55px",
                        borderRadius: "16px",
                        overflow: "hidden",
                        background: "#edf4ff",
                        color: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}
                    >
                      {visitor.photo ? (
                        <img
                          src={visitor.photo}
                          alt={visitor.name || "Visitor"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                        />
                      ) : (
                        <UserRound size={27} />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: "18px",
                          marginBottom: "4px"
                        }}
                      >
                        {visitor.name || "Visitor"}
                      </h3>

                      <p
                        style={{
                          color: "#667085",
                          fontSize: "14px"
                        }}
                      >
                        {getPurpose(visitor.purpose)}
                      </p>

                      {visitor.source === "guest-pass" && (
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "8px",
                            padding: "5px 9px",
                            borderRadius: "20px",
                            background: "#f3edff",
                            color: "#7c3aed",
                            fontSize: "11px",
                            fontWeight: "700"
                          }}
                        >
                          Pre-Registered Guest
                        </span>
                      )}
                    </div>

                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: "20px",
                        background: "#eafaf1",
                        color: "#15803d",
                        fontSize: "11px",
                        fontWeight: "700",
                        whiteSpace: "nowrap"
                      }}
                    >
                      ● Inside
                    </span>
                  </div>

                  {/* DETAILS */}
                  <div
                    style={{
                      background: "#f8faff",
                      borderRadius: "14px",
                      padding: "14px",
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(2, 1fr)",
                      gap: "14px",
                      marginBottom: "14px"
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          color: "#8a94a6",
                          marginBottom: "4px"
                        }}
                      >
                        Flat
                      </span>

                      <strong style={{ fontSize: "14px" }}>
                        {visitor.flat || "--"}
                      </strong>
                    </div>

                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          color: "#8a94a6",
                          marginBottom: "4px"
                        }}
                      >
                        Entry Time
                      </span>

                      <strong style={{ fontSize: "14px" }}>
                        {formatTime(
                          visitor.entryTime ||
                            visitor.updatedAt
                        )}
                      </strong>
                    </div>

                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          color: "#8a94a6",
                          marginBottom: "4px"
                        }}
                      >
                        Entry Date
                      </span>

                      <strong style={{ fontSize: "14px" }}>
                        {formatDate(
                          visitor.entryDate ||
                            visitor.entryTime ||
                            visitor.createdAt
                        )}
                      </strong>
                    </div>

                    {visitor.phone && (
                      <div>
                        <span
                          style={{
                            display: "block",
                            fontSize: "11px",
                            color: "#8a94a6",
                            marginBottom: "4px"
                          }}
                        >
                          Mobile
                        </span>

                        <strong
                          style={{
                            fontSize: "14px"
                          }}
                        >
                          {visitor.phone}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* LOCATION */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#52617a",
                      fontSize: "13px",
                      paddingBottom: "12px"
                    }}
                  >
                    <MapPin size={17} />
                    Currently inside society
                  </div>

                  {/* SECURITY */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#15803d",
                      fontSize: "13px",
                      paddingBottom: "15px"
                    }}
                  >
                    <ShieldCheck size={17} />
                    Entry verified by security
                  </div>

                  {/* EXIT */}
                  <button
                    onClick={() => markExit(visitorId)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "12px",
                      border: "1px solid #fecaca",
                      background: "#fff7f7",
                      color: "#dc2626",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    <LogOut size={17} />
                    Mark Exit
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* INFO */}
        <div
          style={{
            marginTop: "28px",
            background: "#eef6ff",
            border: "1px solid #d7e8ff",
            borderRadius: "16px",
            padding: "16px",
            display: "flex",
            gap: "12px",
            alignItems: "flex-start"
          }}
        >
          <ShieldCheck
            size={20}
            style={{
              color: "#2563eb",
              flexShrink: 0,
              marginTop: "2px"
            }}
          />

          <div>
            <strong
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#1e40af"
              }}
            >
              Live Visitor Tracking
            </strong>

            <p
              style={{
                color: "#52617a",
                fontSize: "13px",
                lineHeight: "1.5"
              }}
            >
              This page updates automatically when security
              marks a visitor as entered or exited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrentVisitors;