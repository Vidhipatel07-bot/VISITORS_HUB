import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Package,
  Clock,
  UserCheck,
  UserPlus,
  QrCode,
  LogOut,
  Check,
  X,
  Phone,
  Home,
  ShieldCheck,
  AlertCircle,
  RefreshCw
} from "lucide-react";

function ResidentDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [deliveries, setDeliveries] = useState([]);

  const loadData = () => {
    try {
      const savedRequests =
        JSON.parse(
          localStorage.getItem("visitorRequests") || "[]"
        );

      const savedDeliveries =
        JSON.parse(
          localStorage.getItem("deliveryRequests") || "[]"
        );

      setRequests(
        Array.isArray(savedRequests)
          ? savedRequests
          : []
      );

      setDeliveries(
        Array.isArray(savedDeliveries)
          ? savedDeliveries
          : []
      );
    } catch (error) {
      console.error(
        "Resident dashboard data error:",
        error
      );

      setRequests([]);
      setDeliveries([]);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      try {
        const savedRequests =
          JSON.parse(
            localStorage.getItem("visitorRequests") || "[]"
          );

        const savedDeliveries =
          JSON.parse(
            localStorage.getItem("deliveryRequests") || "[]"
          );

        const now = Date.now();

        const updatedRequests =
          Array.isArray(savedRequests)
            ? savedRequests.map((request) => {
                if (
                  request.status === "pending" &&
                  request.createdAt
                ) {
                  const createdTime =
                    new Date(
                      request.createdAt
                    ).getTime();

                  const elapsed =
                    Math.floor(
                      (now - createdTime) / 1000
                    );

                  if (elapsed >= 120) {
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

        const updatedDeliveries =
          Array.isArray(savedDeliveries)
            ? savedDeliveries.map((delivery) => {
                if (
                  delivery.status === "pending" &&
                  delivery.createdAt
                ) {
                  const createdTime =
                    new Date(
                      delivery.createdAt
                    ).getTime();

                  const elapsed =
                    Math.floor(
                      (now - createdTime) / 1000
                    );

                  if (elapsed >= 120) {
                    return {
                      ...delivery,
                      status: "held",
                      heldAt:
                        delivery.heldAt ||
                        new Date().toISOString()
                    };
                  }
                }

                return delivery;
              })
            : [];

        if (
          JSON.stringify(updatedRequests) !==
          JSON.stringify(savedRequests)
        ) {
          localStorage.setItem(
            "visitorRequests",
            JSON.stringify(updatedRequests)
          );
        }

        if (
          JSON.stringify(updatedDeliveries) !==
          JSON.stringify(savedDeliveries)
        ) {
          localStorage.setItem(
            "deliveryRequests",
            JSON.stringify(updatedDeliveries)
          );
        }

        setRequests(updatedRequests);
        setDeliveries(updatedDeliveries);
      } catch (error) {
        console.error(
          "Resident live update error:",
          error
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateRequest = (id, status) => {
    const updatedRequests = requests.map(
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

    setRequests(updatedRequests);

    localStorage.setItem(
      "visitorRequests",
      JSON.stringify(updatedRequests)
    );
  };

  const updateDelivery = (id, status) => {
    const updatedDeliveries = deliveries.map(
      (delivery) =>
        delivery.id === id
          ? {
              ...delivery,
              status,
              decisionAt:
                new Date().toISOString()
            }
          : delivery
    );

    setDeliveries(updatedDeliveries);

    localStorage.setItem(
      "deliveryRequests",
      JSON.stringify(updatedDeliveries)
    );
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
        (Date.now() - createdTime) / 1000
      );

    return Math.max(0, 120 - elapsed);
  };

  const formatTime = (seconds) => {
    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      seconds % 60;

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getDeliveryCompany = (delivery) =>
    delivery.company ||
    delivery.deliveryCompany ||
    "Delivery";

  const getDeliveryPerson = (delivery) =>
    delivery.deliveryPerson ||
    delivery.personName ||
    delivery.name ||
    "Delivery Person";

  const getDeliveryType = (delivery) =>
    delivery.deliveryType ||
    delivery.type ||
    delivery.purpose ||
    "Package Delivery";

  const pendingRequests = requests.filter(
    (request) =>
      request.status === "pending"
  );

  const insideVisitors = requests.filter(
    (request) =>
      request.status === "inside"
  );

  const pendingDeliveries = deliveries.filter(
    (delivery) =>
      delivery.status === "pending"
  );

  const heldDeliveries = deliveries.filter(
    (delivery) =>
      delivery.status === "held"
  );

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e4ebf4",
    borderRadius: "20px",
    padding: "22px",
    boxShadow:
      "0 10px 30px rgba(30,64,175,0.07)"
  };

  const actionButtonStyle = {
    border: "none",
    borderRadius: "12px",
    minHeight: "45px",
    padding: "0 17px",
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px"
  };

  const renderTimer = (createdAt) => {
    const remaining =
      getRemainingTime(createdAt);

    return (
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          alignItems: "center",
          gap: "7px",
          color:
            remaining <= 30
              ? "#dc2626"
              : "#1769d1",
          background:
            remaining <= 30
              ? "#fef2f2"
              : "#eff6ff",
          padding: "9px 12px",
          borderRadius: "10px",
          fontSize: "12px",
          fontWeight: 800
        }}
      >
        <Clock size={15} />

        Approval Time:{" "}
        {formatTime(remaining)}
      </div>
    );
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
          padding: "22px 5%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "15px",
          flexWrap: "wrap"
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <ShieldCheck size={28} />

            <h1
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: 850
              }}
            >
              Visitors Hub
            </h1>
          </div>

          <p
            style={{
              margin: "5px 0 0 38px",
              color: "#dbeafe",
              fontSize: "13px"
            }}
          >
            Resident Dashboard
          </p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem(
              "authToken"
            );
            localStorage.removeItem(
              "currentUser"
            );
            localStorage.removeItem(
              "loggedInResident"
            );
            navigate("/resident");
          }}
          style={{
            ...actionButtonStyle,
            background:
              "rgba(255,255,255,0.14)",
            color: "#ffffff",
            border:
              "1px solid rgba(255,255,255,0.25)"
          }}
        >
          <LogOut size={17} />
          Logout
        </button>
      </header>

      <main
        style={{
          width: "90%",
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "35px 0 50px"
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: 850
            }}
          >
            Welcome, Resident 👋
          </h2>

          <p
            style={{
              margin: "7px 0 0",
              color: "#64748b",
              fontSize: "14px"
            }}
          >
            Manage your visitors and deliveries
            easily.
          </p>
        </div>

        {pendingRequests.length > 0 && (
          <section
            style={{
              ...cardStyle,
              marginBottom: "22px",
              border:
                "1px solid #bfdbfe"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "20px"
              }}
            >
              <div>
                <span
                  style={{
                    display: "inline-block",
                    background: "#eff6ff",
                    color: "#1769d1",
                    borderRadius: "20px",
                    padding: "5px 10px",
                    fontSize: "11px",
                    fontWeight: 850
                  }}
                >
                  ● LIVE
                </span>

                <h2
                  style={{
                    margin: "8px 0 3px",
                    fontSize: "21px"
                  }}
                >
                  New Visitor Request
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "13px"
                  }}
                >
                  Someone is waiting at the gate.
                </p>
              </div>

              <Users
                size={27}
                color="#1769d1"
              />
            </div>

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

                  return (
                    <div
                      key={request.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "auto 1fr auto",
                        gap: "18px",
                        alignItems: "center",
                        padding: "17px",
                        background: "#f8fbff",
                        border:
                          "1px solid #e2eaf5",
                        borderRadius: "17px"
                      }}
                    >
                      <div
                        style={{
                          width: "72px",
                          height: "72px",
                          borderRadius: "16px",
                          overflow: "hidden",
                          background: "#eaf2ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#1769d1"
                        }}
                      >
                        {request.photo ? (
                          <img
                            src={request.photo}
                            alt={
                              request.name ||
                              "Visitor"
                            }
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover"
                            }}
                          />
                        ) : (
                          <UserCheck size={32} />
                        )}
                      </div>

                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "17px"
                          }}
                        >
                          {request.name ||
                            "Unknown Visitor"}
                        </h3>

                        <p
                          style={{
                            margin:
                              "4px 0 10px",
                            color: "#64748b",
                            fontSize: "13px"
                          }}
                        >
                          wants to visit your flat
                        </p>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px"
                          }}
                        >
                          <span
                            style={{
                              background: "#ffffff",
                              border:
                                "1px solid #e1e8f1",
                              borderRadius: "9px",
                              padding:
                                "6px 9px",
                              fontSize: "11px",
                              display: "flex",
                              gap: "5px",
                              alignItems:
                                "center"
                            }}
                          >
                            <Home size={13} />
                            {request.flat ||
                              "—"}
                          </span>

                          <span
                            style={{
                              background: "#ffffff",
                              border:
                                "1px solid #e1e8f1",
                              borderRadius: "9px",
                              padding:
                                "6px 9px",
                              fontSize: "11px",
                              display: "flex",
                              gap: "5px",
                              alignItems:
                                "center"
                            }}
                          >
                            <Phone size={13} />
                            {request.phone ||
                              "—"}
                          </span>

                          <span
                            style={{
                              background: "#ffffff",
                              border:
                                "1px solid #e1e8f1",
                              borderRadius: "9px",
                              padding:
                                "6px 9px",
                              fontSize: "11px"
                            }}
                          >
                            {request.purpose ||
                              "Visit"}
                          </span>
                        </div>

                        {renderTimer(
                          request.createdAt
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection:
                            "column",
                          gap: "9px",
                          minWidth: "120px"
                        }}
                      >
                        <button
                          onClick={() =>
                            updateRequest(
                              request.id,
                              "approved"
                            )
                          }
                          disabled={
                            remaining === 0
                          }
                          style={{
                            ...actionButtonStyle,
                            background:
                              remaining === 0
                                ? "#d1d5db"
                                : "#16a34a",
                            color: "#ffffff",
                            cursor:
                              remaining === 0
                                ? "not-allowed"
                                : "pointer"
                          }}
                        >
                          <Check size={17} />
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            updateRequest(
                              request.id,
                              "rejected"
                            )
                          }
                          style={{
                            ...actionButtonStyle,
                            background: "#fee2e2",
                            color: "#dc2626"
                          }}
                        >
                          <X size={17} />
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        )}

        {requests.some(
          (request) =>
            request.status === "expired"
        ) && (
          <div
            style={{
              ...cardStyle,
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
              background: "#fff7ed",
              border:
                "1px solid #fed7aa",
              marginBottom: "22px"
            }}
          >
            <AlertCircle
              size={21}
              color="#ea580c"
            />

            <div>
              <strong
                style={{
                  fontSize: "14px",
                  color: "#9a3412"
                }}
              >
                Some visitor requests have
                expired.
              </strong>

              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "12px",
                  color: "#9a3412"
                }}
              >
                The visitor must submit a new
                request for entry.
              </p>
            </div>
          </div>
        )}

        {pendingDeliveries.length > 0 && (
          <section
            style={{
              ...cardStyle,
              marginBottom: "22px",
              border:
                "1px solid #fed7aa"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "20px"
              }}
            >
              <div>
                <span
                  style={{
                    display: "inline-block",
                    background: "#fff7ed",
                    color: "#c2410c",
                    borderRadius: "20px",
                    padding: "5px 10px",
                    fontSize: "11px",
                    fontWeight: 850
                  }}
                >
                  ● DELIVERY
                </span>

                <h2
                  style={{
                    margin: "8px 0 3px",
                    fontSize: "21px"
                  }}
                >
                  New Delivery Request
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "13px"
                  }}
                >
                  A delivery person is waiting at
                  the gate.
                </p>
              </div>

              <Package
                size={27}
                color="#ea580c"
              />
            </div>

            <div
              style={{
                display: "grid",
                gap: "15px"
              }}
            >
              {pendingDeliveries.map(
                (delivery) => {
                  const remaining =
                    getRemainingTime(
                      delivery.createdAt
                    );

                  return (
                    <div
                      key={delivery.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "auto 1fr auto",
                        gap: "18px",
                        alignItems: "center",
                        padding: "17px",
                        background: "#fffaf5",
                        border:
                          "1px solid #f3e3d0",
                        borderRadius: "17px"
                      }}
                    >
                      <div
                        style={{
                          width: "72px",
                          height: "72px",
                          borderRadius: "16px",
                          background: "#fff1e6",
                          color: "#ea580c",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Package size={32} />
                      </div>

                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "17px"
                          }}
                        >
                          {getDeliveryCompany(
                            delivery
                          )}
                        </h3>

                        <p
                          style={{
                            margin:
                              "4px 0 10px",
                            color: "#64748b",
                            fontSize: "13px"
                          }}
                        >
                          {getDeliveryPerson(
                            delivery
                          )}
                          {" • "}
                          {getDeliveryType(
                            delivery
                          )}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap"
                          }}
                        >
                          <span
                            style={{
                              background: "#ffffff",
                              border:
                                "1px solid #eadfd4",
                              borderRadius: "9px",
                              padding:
                                "6px 9px",
                              fontSize: "11px"
                            }}
                          >
                            Flat{" "}
                            {delivery.flat || "—"}
                          </span>

                          <span
                            style={{
                              background: "#ffffff",
                              border:
                                "1px solid #eadfd4",
                              borderRadius: "9px",
                              padding:
                                "6px 9px",
                              fontSize: "11px"
                            }}
                          >
                            <Phone
                              size={12}
                              style={{
                                verticalAlign:
                                  "middle"
                              }}
                            />{" "}
                            {delivery.phone || "—"}
                          </span>
                        </div>

                        {renderTimer(
                          delivery.createdAt
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection:
                            "column",
                          gap: "9px",
                          minWidth: "120px"
                        }}
                      >
                        <button
                          onClick={() =>
                            updateDelivery(
                              delivery.id,
                              "approved"
                            )
                          }
                          disabled={
                            remaining === 0
                          }
                          style={{
                            ...actionButtonStyle,
                            background:
                              remaining === 0
                                ? "#d1d5db"
                                : "#16a34a",
                            color: "#ffffff"
                          }}
                        >
                          <Check size={17} />
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            updateDelivery(
                              delivery.id,
                              "rejected"
                            )
                          }
                          style={{
                            ...actionButtonStyle,
                            background: "#fee2e2",
                            color: "#dc2626"
                          }}
                        >
                          <X size={17} />
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        )}

        {heldDeliveries.length > 0 && (
          <div
            style={{
              ...cardStyle,
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
              background: "#fff7ed",
              border:
                "1px solid #fed7aa",
              marginBottom: "25px"
            }}
          >
            <AlertCircle
              size={21}
              color="#ea580c"
            />

            <div>
              <strong
                style={{
                  color: "#9a3412",
                  fontSize: "14px"
                }}
              >
                Parcel held at Security Desk
              </strong>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "#9a3412",
                  fontSize: "12px",
                  lineHeight: 1.5
                }}
              >
                No response was received within
                2 minutes. The delivery person was
                not sent to your flat.
              </p>
            </div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "16px"
          }}
        >
          {[
            {
              icon: Users,
              title: "Visitor Requests",
              text: `${pendingRequests.length} Pending Request${
                pendingRequests.length === 1
                  ? ""
                  : "s"
              }`,
              path: "/resident/visitors",
              bg: "#eff6ff",
              color: "#1769d1"
            },
            {
              icon: UserCheck,
              title: "Current Visitors",
              text: `${insideVisitors.length} Currently Inside`,
              path: "/resident/current-visitors",
              bg: "#ecfdf5",
              color: "#16a34a"
            },
            {
              icon: Package,
              title: "Deliveries",
              text:
                pendingDeliveries.length > 0
                  ? `${pendingDeliveries.length} Pending Request${
                      pendingDeliveries.length ===
                      1
                        ? ""
                        : "s"
                    }`
                  : heldDeliveries.length > 0
                  ? `${heldDeliveries.length} Parcel${
                      heldDeliveries.length ===
                      1
                        ? ""
                        : "s"
                    } at Security`
                  : "No pending deliveries",
              path: "/resident/deliveries",
              bg: "#fff7ed",
              color: "#ea580c"
            },
            {
              icon: Clock,
              title: "Visitor History",
              text: "View past visitors",
              path: "/resident/history",
              bg: "#f5f3ff",
              color: "#7c3aed"
            },
            {
              icon: UserPlus,
              title: "Trusted Visitors",
              text: "Manage trusted people",
              path: "/resident/trusted-visitors",
              bg: "#eff6ff",
              color: "#1769d1"
            },
            {
              icon: QrCode,
              title: "Guest Pass",
              text: "Create a QR guest pass",
              path: "/resident/guest-pass",
              bg: "#ecfdf5",
              color: "#16a34a"
            }
          ].map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.title}
                onClick={() =>
                  navigate(card.path)
                }
                style={{
                  ...cardStyle,
                  textAlign: "left",
                  cursor: "pointer",
                  border: "1px solid #e4ebf4",
                  transition: "0.2s",
                  background: "#ffffff"
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: card.bg,
                    color: card.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px"
                  }}
                >
                  <Icon size={24} />
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 800
                  }}
                >
                  {card.title}
                </h3>

                <p
                  style={{
                    margin: "7px 0 0",
                    color: "#64748b",
                    fontSize: "12px"
                  }}
                >
                  {card.text}
                </p>
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: "25px",
            padding: "17px",
            background: "#eff6ff",
            border:
              "1px solid #dbeafe",
            borderRadius: "16px",
            display: "flex",
            alignItems: "flex-start",
            gap: "11px",
            color: "#24528e"
          }}
        >
          <ShieldCheck size={20} />

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
                margin: "4px 0 0",
                fontSize: "12px",
                lineHeight: 1.5
              }}
            >
              Only approve visitors you can
              verify. Security will still check
              approved visitors before entry.
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          style={{
            marginTop: "18px",
            background: "#ffffff",
            border:
              "1px solid #dbe4ef",
            borderRadius: "12px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "7px",
            cursor: "pointer",
            color: "#475569",
            fontWeight: 700,
            fontSize: "12px"
          }}
        >
          <RefreshCw size={15} />
          Refresh Dashboard
        </button>
      </main>
    </div>
  );
}

export default ResidentDashboard;