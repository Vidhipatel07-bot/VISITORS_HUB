import React, { useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  Download,
  ExternalLink,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const GATE_QR_VALUE = "VisitorsHub|GateRegistration|MainGate";

const AdminGateQR = () => {
  const qrRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");

    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "visitors-hub-gate-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    setDownloaded(true);

    setTimeout(() => {
      setDownloaded(false);
    }, 2500);
  };

  const copyQRValue = async () => {
    try {
      await navigator.clipboard.writeText(GATE_QR_VALUE);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = GATE_QR_VALUE;

      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const regeneratePreview = () => {
    /*
     * The gate QR is intentionally permanent.
     * This button only refreshes the displayed QR area.
     */
    window.location.reload();
  };

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
          maxWidth: "1050px",
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
            marginBottom: "25px",
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
              to="/admin/dashboard"
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
                <QrCode size={18} />
                Visitors Hub
              </div>

              <h1
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: "27px",
                }}
              >
                Gate QR Code
              </h1>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Generate and manage the QR code used at the society gate.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "8px 13px",
              borderRadius: "20px",
              background: "#dcfce7",
              color: "#166534",
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            <CheckCircle2 size={15} />
            Gate QR Active
          </div>
        </div>

        {/* MAIN GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(300px, 0.9fr) minmax(350px, 1.1fr)",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          {/* QR CARD */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "22px",
              padding: "28px",
              boxShadow:
                "0 10px 35px rgba(15, 23, 42, 0.08)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#0f172a",
                fontWeight: 800,
                fontSize: "18px",
                marginBottom: "20px",
              }}
            >
              <QrCode size={21} color="#2563eb" />
              Main Gate QR
            </div>

            <div
              ref={qrRef}
              style={{
                background: "#ffffff",
                padding: "18px",
                borderRadius: "18px",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 8px 25px rgba(15, 23, 42, 0.08)",
              }}
            >
              <QRCodeCanvas
                value={GATE_QR_VALUE}
                size={270}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="H"
                includeMargin={true}
              />
            </div>

            <div
              style={{
                marginTop: "18px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "#0f172a",
                  fontWeight: 800,
                  fontSize: "16px",
                }}
              >
                Scan to Register Visitor
              </div>

              <div
                style={{
                  color: "#64748b",
                  fontSize: "12px",
                  marginTop: "5px",
                }}
              >
                Place this QR code at the main society entrance.
              </div>
            </div>

            {/* ACTIONS */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                width: "100%",
                marginTop: "22px",
              }}
            >
              <button
                onClick={downloadQR}
                style={{
                  flex: 1,
                  border: "none",
                  background:
                    "linear-gradient(135deg, #2563eb, #0891b2)",
                  color: "#ffffff",
                  borderRadius: "11px",
                  padding: "12px 15px",
                  cursor: "pointer",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                }}
              >
                <Download size={17} />
                Download
              </button>

              <button
                onClick={copyQRValue}
                style={{
                  flex: 1,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                  borderRadius: "11px",
                  padding: "12px 15px",
                  cursor: "pointer",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                }}
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={17} />
                    Copied
                  </>
                ) : (
                  <>
                    <Clipboard size={17} />
                    Copy
                  </>
                )}
              </button>
            </div>

            {downloaded && (
              <div
                style={{
                  marginTop: "12px",
                  color: "#15803d",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                QR code downloaded successfully.
              </div>
            )}
          </div>

          {/* INFORMATION CARD */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "22px",
              padding: "28px",
              boxShadow:
                "0 10px 35px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "#dbeafe",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck size={22} />
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: "19px",
                  }}
                >
                  Gate QR Information
                </h2>

                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  How the QR registration system works.
                </p>
              </div>
            </div>

            {/* FLOW */}
            <div
              style={{
                marginTop: "24px",
              }}
            >
              <FlowStep
                number="1"
                title="Visitor scans QR"
                description="The visitor scans the QR code displayed at the society gate."
              />

              <FlowStep
                number="2"
                title="Registration opens"
                description="Visitors Hub opens the digital visitor registration page."
              />

              <FlowStep
                number="3"
                title="Visitor submits details"
                description="The visitor enters name, mobile number, flat, purpose and photo."
              />

              <FlowStep
                number="4"
                title="Resident receives request"
                description="The selected resident receives the visitor request for approval."
              />

              <FlowStep
                number="5"
                title="Security verifies entry"
                description="Security checks the visitor and allows entry after the required approval."
                last
              />
            </div>

            {/* QR STATUS */}
            <div
              style={{
                marginTop: "25px",
                padding: "16px",
                borderRadius: "15px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                  }}
                >
                  QR Status
                </span>

                <span
                  style={{
                    padding: "5px 9px",
                    borderRadius: "20px",
                    background: "#dcfce7",
                    color: "#166534",
                    fontSize: "10px",
                    fontWeight: 800,
                  }}
                >
                  ACTIVE
                </span>
              </div>

              <div
                style={{
                  color: "#334155",
                  fontSize: "12px",
                  lineHeight: 1.6,
                }}
              >
                This is the permanent main gate registration QR.
                Keep it printed and visible at the entrance.
              </div>
            </div>

            {/* REFRESH */}
            <button
              onClick={regeneratePreview}
              style={{
                marginTop: "15px",
                width: "100%",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#334155",
                borderRadius: "11px",
                padding: "11px",
                cursor: "pointer",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
              }}
            >
              <RefreshCw size={16} />
              Refresh QR Preview
            </button>
          </div>
        </div>

        {/* IMPORTANT NOTE */}
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
            <strong>Security Note:</strong> The QR code only opens
            the visitor registration flow. Scanning the QR does not
            automatically grant entry. Resident approval and
            security verification are still required.
          </div>
        </div>

        {/* QUICK LINK */}
        <div
          style={{
            marginTop: "16px",
            textAlign: "center",
          }}
        >
          <Link
            to="/visitor"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            Open Visitor Registration
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

/* FLOW STEP */

const FlowStep = ({
  number,
  title,
  description,
  last = false,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "13px",
        position: "relative",
        paddingBottom: last ? "0" : "22px",
      }}
    >
      {!last && (
        <div
          style={{
            position: "absolute",
            left: "15px",
            top: "32px",
            bottom: "0",
            width: "2px",
            background: "#dbeafe",
          }}
        />
      )}

      <div
        style={{
          width: "31px",
          height: "31px",
          borderRadius: "50%",
          background: "#2563eb",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: 900,
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        {number}
      </div>

      <div>
        <div
          style={{
            color: "#0f172a",
            fontSize: "13px",
            fontWeight: 800,
            marginBottom: "3px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: "#64748b",
            fontSize: "11px",
            lineHeight: 1.55,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
};

export default AdminGateQR;