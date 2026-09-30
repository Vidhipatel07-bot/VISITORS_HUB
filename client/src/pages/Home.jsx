import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Home as HomeIcon,
  UserRound,
  Settings,
  ArrowRight,
  QrCode,
  LockKeyhole,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Resident",
      description:
        "Manage visitors, deliveries and more",
      icon: <HomeIcon size={28} />,
      path: "/resident",
    },
    {
      title: "Security Guard",
      description:
        "Verify and manage entries",
      icon: <ShieldCheck size={28} />,
      path: "/guard",
    },
    {
      title: "Admin",
      description:
        "Manage society, users and settings",
      icon: <Settings size={28} />,
      path: "/admin",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fbff 0%, #eef6ff 50%, #ffffff 100%)",
        fontFamily:
          "Inter, Arial, Helvetica, sans-serif",
        color: "#0f172a",
        padding: "25px",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1050px",
        }}
      >
        {/* LOGO */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "45px",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              margin: "0 auto 17px",
              borderRadius: "22px",
              background:
                "linear-gradient(135deg, #2563eb, #06b6d4)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 12px 30px rgba(37, 99, 235, 0.22)",
            }}
          >
            <ShieldCheck size={38} />
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "42px",
              fontWeight: "900",
              letterSpacing: "-1.5px",
            }}
          >
            Visitors Hub
          </h1>

          <p
            style={{
              margin:
                "9px auto 0",
              color: "#64748b",
              fontSize: "15px",
              maxWidth: "500px",
              lineHeight: 1.6,
            }}
          >
            Smart Visitor & Delivery Management
          </p>

          <div
            style={{
              marginTop: "10px",
              color: "#2563eb",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "1px",
            }}
          >
            SAFE COMMUNITIES • STRONGER CONNECTIONS
          </div>
        </div>


        {/* ROLE CARDS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "20px",
          }}
          className="home-role-grid"
        >
          {roles.map((role) => (
            <button
              key={role.title}
              onClick={() =>
                navigate(role.path)
              }
              style={{
                border: "1px solid #dbeafe",
                background: "#ffffff",
                borderRadius: "22px",
                padding: "28px 22px",
                cursor: "pointer",
                textAlign: "left",
                boxShadow:
                  "0 10px 30px rgba(15,23,42,0.06)",
                transition:
                  "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 16px 35px rgba(37,99,235,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 10px 30px rgba(15,23,42,0.06)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "25px",
                }}
              >
                <div
                  style={{
                    width: "55px",
                    height: "55px",
                    borderRadius: "15px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {role.icon}
                </div>

                <ArrowRight
                  size={20}
                  color="#94a3b8"
                />
              </div>

              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "19px",
                  fontWeight: "850",
                }}
              >
                {role.title}
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                {role.description}
              </p>
            </button>
          ))}
        </div>


        {/* VISITOR QR SECTION */}

        <div
          style={{
            marginTop: "22px",
            background:
              "linear-gradient(135deg, #0f172a, #164e63)",
            borderRadius: "22px",
            padding: "22px 25px",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
            boxShadow:
              "0 14px 35px rgba(15,23,42,0.12)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background:
                  "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QrCode size={25} />
            </div>

            <div>
              <strong
                style={{
                  display: "block",
                  fontSize: "15px",
                }}
              >
                Are you a visitor?
              </strong>

              <span
                style={{
                  color: "#cbd5e1",
                  fontSize: "12px",
                }}
              >
                Scan the Gate QR code to register.
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              navigate("/visitor")
            }
            style={{
              border: "none",
              background: "#ffffff",
              color: "#0f172a",
              borderRadius: "10px",
              padding: "11px 16px",
              fontWeight: "800",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            Visitor Registration
            <ArrowRight size={16} />
          </button>
        </div>


        {/* SECURITY BADGE */}

        <div
          style={{
            marginTop: "25px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "7px",
            color: "#64748b",
            fontSize: "11px",
          }}
        >
          <LockKeyhole size={14} />
          Secure digital visitor management
        </div>


        {/* FOOTER */}

        <p
          style={{
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "11px",
            marginTop: "9px",
          }}
        >
          A safer tomorrow, together.
        </p>
      </div>


      {/* RESPONSIVE */}

      <style>
        {`
          @media (max-width: 800px) {
            .home-role-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 500px) {
            body {
              overflow-x: hidden;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Home;