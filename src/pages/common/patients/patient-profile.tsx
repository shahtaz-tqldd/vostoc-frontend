import { Button } from "@/components/ui/button";
import { useState } from "react";

// ── Types ──────────────────────────────────────────────────
type Tab = "overview" | "appointments" | "prescriptions" | "vitals";

// ── Data ──────────────────────────────────────────────────
const PATIENT = {
  name: "Farida Sultana",
  id: "PT-2024-00847",
  dob: "14 Mar 1982",
  age: 42,
  sex: "Female",
  blood: "B+",
  phone: "+880 1711 234567",
  email: "farida.sultana@email.com",
  address: "Gulshan-2, Dhaka 1212",
  weight: "63 kg",
  height: "162 cm",
  bmi: "24.0",
  allergies: ["Penicillin", "Sulfonamides"],
  conditions: ["Type 2 Diabetes", "Hypertension", "Mild Hypothyroidism"],
  insurance: "Delta Life · #INS-998832",
};

const DOCTORS = [
  {
    name: "Dr. Arif Kamal",
    specialty: "Endocrinologist",
    avatar: "AK",
    color: "#0ea5e9",
    primary: true,
  },
  {
    name: "Dr. Nusrat Jahan",
    specialty: "Cardiologist",
    avatar: "NJ",
    color: "#f59e0b",
    primary: false,
  },
  {
    name: "Dr. Sohel Rana",
    specialty: "General Physician",
    avatar: "SR",
    color: "#10b981",
    primary: false,
  },
];

const APPOINTMENTS = [
  {
    id: 1,
    date: "12 Apr 2025",
    time: "10:00 AM",
    doctor: "Dr. Arif Kamal",
    specialty: "Endocrinology",
    type: "Follow-up",
    status: "upcoming",
    notes: "HbA1c review, medication adjustment",
  },
  {
    id: 2,
    date: "28 Mar 2025",
    time: "11:30 AM",
    doctor: "Dr. Nusrat Jahan",
    specialty: "Cardiology",
    type: "Routine",
    status: "completed",
    notes: "ECG normal. BP slightly elevated, adjusted lisinopril.",
  },
  {
    id: 3,
    date: "05 Mar 2025",
    time: "09:00 AM",
    doctor: "Dr. Sohel Rana",
    specialty: "General",
    type: "Acute",
    status: "completed",
    notes: "Upper respiratory infection. Prescribed azithromycin.",
  },
  {
    id: 4,
    date: "10 Feb 2025",
    time: "03:00 PM",
    doctor: "Dr. Arif Kamal",
    specialty: "Endocrinology",
    type: "Follow-up",
    status: "completed",
    notes: "FBS 7.2 mmol/L. Metformin dose increased to 1000mg BD.",
  },
  {
    id: 5,
    date: "15 Jan 2025",
    time: "10:30 AM",
    doctor: "Dr. Nusrat Jahan",
    specialty: "Cardiology",
    type: "Consultation",
    status: "completed",
    notes: "Echocardiogram within normal limits. Continue current regimen.",
  },
  {
    id: 6,
    date: "22 Apr 2025",
    time: "04:00 PM",
    doctor: "Dr. Sohel Rana",
    specialty: "General",
    type: "Follow-up",
    status: "upcoming",
    notes: "Thyroid function test results review",
  },
];

const PRESCRIPTIONS = [
  {
    drug: "Metformin HCl",
    dose: "1000 mg",
    freq: "Twice daily",
    route: "Oral",
    since: "Feb 2024",
    prescriber: "Dr. Arif Kamal",
    status: "active",
    indication: "Type 2 Diabetes",
  },
  {
    drug: "Lisinopril",
    dose: "10 mg",
    freq: "Once daily",
    route: "Oral",
    since: "Jun 2023",
    prescriber: "Dr. Nusrat Jahan",
    status: "active",
    indication: "Hypertension",
  },
  {
    drug: "Levothyroxine",
    dose: "50 mcg",
    freq: "Once daily (morning)",
    route: "Oral",
    since: "Nov 2023",
    prescriber: "Dr. Arif Kamal",
    status: "active",
    indication: "Hypothyroidism",
  },
  {
    drug: "Aspirin",
    dose: "75 mg",
    freq: "Once daily",
    route: "Oral",
    since: "Jun 2023",
    prescriber: "Dr. Nusrat Jahan",
    status: "active",
    indication: "Cardioprotection",
  },
  {
    drug: "Azithromycin",
    dose: "500 mg",
    freq: "Once daily × 3 days",
    route: "Oral",
    since: "Mar 2025",
    prescriber: "Dr. Sohel Rana",
    status: "completed",
    indication: "URTI",
  },
];

const VITALS_HISTORY = [
  {
    date: "28 Mar",
    bp: "138/88",
    hr: 78,
    spo2: 98,
    temp: 37.0,
    fbs: 7.4,
    weight: 63.0,
  },
  {
    date: "05 Mar",
    bp: "135/86",
    hr: 82,
    spo2: 97,
    temp: 37.8,
    fbs: 7.1,
    weight: 63.4,
  },
  {
    date: "10 Feb",
    bp: "140/90",
    hr: 76,
    spo2: 98,
    temp: 36.8,
    fbs: 7.2,
    weight: 63.8,
  },
  {
    date: "15 Jan",
    bp: "136/84",
    hr: 74,
    spo2: 99,
    temp: 36.9,
    fbs: 6.9,
    weight: 64.2,
  },
  {
    date: "10 Dec",
    bp: "142/92",
    hr: 80,
    spo2: 97,
    temp: 37.1,
    fbs: 7.8,
    weight: 64.5,
  },
];

const LATEST = VITALS_HISTORY[0];

// ── Helpers ──────────────────────────────────────────────
const statusColor = (s: string) => (s === "upcoming" ? "#0ea5e9" : "#10b981");
const statusBg = (s: string) => (s === "upcoming" ? "#0ea5e91a" : "#10b9811a");

// ── Sparkline ────────────────────────────────────────────
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const min = Math.min(...values),
    max = Math.max(...values),
    range = max - min || 1;
  const w = 80,
    h = 28,
    pad = 2;
  const pts = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <circle
        cx={pts.split(" ").at(-1)!.split(",")[0]}
        cy={pts.split(" ").at(-1)!.split(",")[1]}
        r="3"
        fill={color}
      />
    </svg>
  );
}

// ── Mini Bar Chart ────────────────────────────────────────
function MiniBar({
  values,
  labels,
  color,
}: {
  values: number[];
  labels: string[];
  color: string;
}) {
  const max = Math.max(...values);
  return (
    <div
      style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 44 }}
    >
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            flex: 1,
          }}
        >
          <div
            style={{
              width: "100%",
              borderRadius: "3px 3px 0 0",
              height: (v / max) * 36,
              background: i === 0 ? color : `${color}55`,
              transition: "height 0.4s",
            }}
          />
          <span style={{ fontSize: 8, color: "#94a3b8" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function PatientProfile() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div style={{}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; animation: fadeIn 0.3s ease; }
        .tab-btn { transition: all 0.18s; cursor: pointer; border: none; background: transparent; font-family: inherit; }
        .tab-btn:hover { color: #0284c7 !important; }
        .tab-active { background: #0284c7 !important; color: #fff !important; }
        .row-hover { transition: background 0.12s; }
        .row-hover:hover { background: #f8fafc !important; }
        .pill { display: inline-flex; align-items: center; border-radius: 20px; font-size: 12px; font-weight: 500; padding: 3px 10px; }
        .doc-card { transition: transform 0.15s, box-shadow 0.15s; }
        .doc-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px #0ea5e914; }
      `}</style>

      <div>
        <PatientProfileHero />
        {/* ── Tabs ── */}
        <div className="flex bg-white p-2 rounded-full w-fit my-4">
          {(["overview", "appointments", "prescriptions", "vitals"] as Tab[]).map((t) => (
            <Button
              size="sm"
              variant={tab === t ? "primary" : "ghost"}
              onClick={() => setTab(t)}
              className="rounded-full capitalize"
            >
              {t}
            </Button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            {/* Vital Snapshot */}
            <div className="card" style={{ padding: 20, gridColumn: "span 2" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#94a3b8",
                  marginBottom: 14,
                }}
              >
                Latest Vitals · {LATEST.date}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 14,
                }}
              >
                {[
                  {
                    label: "Blood Pressure",
                    value: LATEST.bp,
                    unit: "mmHg",
                    values: VITALS_HISTORY.map((v) => parseInt(v.bp)),
                    color: "#ef4444",
                    warn: parseInt(LATEST.bp) > 130,
                  },
                  {
                    label: "Heart Rate",
                    value: LATEST.hr,
                    unit: "bpm",
                    values: VITALS_HISTORY.map((v) => v.hr),
                    color: "#f97316",
                    warn: LATEST.hr > 100,
                  },
                  {
                    label: "SpO₂",
                    value: LATEST.spo2,
                    unit: "%",
                    values: VITALS_HISTORY.map((v) => v.spo2),
                    color: "#0ea5e9",
                    warn: LATEST.spo2 < 95,
                  },
                  {
                    label: "Temperature",
                    value: LATEST.temp,
                    unit: "°C",
                    values: VITALS_HISTORY.map((v) => v.temp * 10)
                      .map(Math.round)
                      .map((v) => v / 10),
                    color: "#8b5cf6",
                    warn: LATEST.temp > 37.5,
                  },
                  {
                    label: "Fasting Blood Sugar",
                    value: LATEST.fbs,
                    unit: "mmol/L",
                    values: VITALS_HISTORY.map((v) => v.fbs),
                    color: "#10b981",
                    warn: LATEST.fbs > 7.0,
                  },
                  {
                    label: "Weight",
                    value: LATEST.weight,
                    unit: "kg",
                    values: VITALS_HISTORY.map((v) => v.weight),
                    color: "#6366f1",
                    warn: false,
                  },
                ].map(({ label, value, unit, values, color, warn }) => (
                  <div
                    key={label}
                    style={{
                      padding: "12px 14px",
                      background: "#f8fafc",
                      borderRadius: 12,
                      border: `1px solid ${warn ? "#fecaca" : "#e2e8f0"}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                        marginBottom: 4,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color: warn ? "#dc2626" : "#1e293b",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {value}
                      </span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        {unit}
                      </span>
                      {warn && (
                        <span style={{ marginLeft: "auto", fontSize: 14 }}>
                          ⚠️
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <Sparkline values={[...values].reverse()} color={color} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Care Team */}
            <div className="card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#94a3b8",
                  marginBottom: 14,
                }}
              >
                Care Team
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {DOCTORS.map((d) => (
                  <div
                    key={d.name}
                    className="doc-card card"
                    style={{
                      padding: "12px 14px",
                      border: `1px solid ${d.primary ? "#0284c730" : "#e2e8f0"}`,
                      background: d.primary ? "#f0f9ff" : "#fff",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: `${d.color}22`,
                          border: `1.5px solid ${d.color}55`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          color: d.color,
                          fontFamily: "'JetBrains Mono', monospace",
                          flexShrink: 0,
                        }}
                      >
                        {d.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          {d.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          {d.specialty}
                        </div>
                      </div>
                      {d.primary && (
                        <span
                          className="pill"
                          style={{
                            background: "#0284c7",
                            color: "#fff",
                            fontSize: 9,
                          }}
                        >
                          PRIMARY
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Appointments */}
            <div className="card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#94a3b8",
                  marginBottom: 14,
                }}
              >
                Upcoming Appointments
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {APPOINTMENTS.filter((a) => a.status === "upcoming").map(
                  (a) => (
                    <div
                      key={a.id}
                      style={{
                        padding: "12px 14px",
                        background: "#f0f9ff",
                        borderRadius: 12,
                        border: "1px solid #bae6fd",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0284c7",
                          }}
                        >
                          {a.date}
                        </span>
                        <span style={{ fontSize: 11, color: "#64748b" }}>
                          {a.time}
                        </span>
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#1e293b", marginTop: 2 }}
                      >
                        {a.doctor}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}
                      >
                        {a.notes}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Active Medications */}
            <div className="card" style={{ padding: 20, gridColumn: "span 2" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#94a3b8",
                  marginBottom: 14,
                }}
              >
                Active Medications (
                {PRESCRIPTIONS.filter((p) => p.status === "active").length})
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {PRESCRIPTIONS.filter((p) => p.status === "active").map((p) => (
                  <div
                    key={p.drug}
                    style={{
                      padding: "10px 14px",
                      background: "#f8fafc",
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#10b981",
                        marginTop: 5,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {p.drug}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        {p.dose} · {p.freq}
                      </div>
                      <div
                        style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}
                      >
                        {p.indication}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── APPOINTMENTS TAB ── */}
        {tab === "appointments" && (
          <div className="card" style={{ overflow: "hidden" }}>
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  Consultation History
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {APPOINTMENTS.length} total ·{" "}
                  {APPOINTMENTS.filter((a) => a.status === "upcoming").length}{" "}
                  upcoming
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span
                  className="pill"
                  style={{ background: "#0ea5e91a", color: "#0284c7" }}
                >
                  Upcoming:{" "}
                  {APPOINTMENTS.filter((a) => a.status === "upcoming").length}
                </span>
                <span
                  className="pill"
                  style={{ background: "#10b9811a", color: "#059669" }}
                >
                  Completed:{" "}
                  {APPOINTMENTS.filter((a) => a.status === "completed").length}
                </span>
              </div>
            </div>
            <div>
              {APPOINTMENTS.map((a, i) => (
                <div
                  key={a.id}
                  className="row-hover"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr 1fr 1fr auto",
                    gap: 16,
                    alignItems: "center",
                    padding: "16px 24px",
                    borderBottom:
                      i < APPOINTMENTS.length - 1
                        ? "1px solid #f1f5f9"
                        : "none",
                    background: a.status === "upcoming" ? "#f0f9ff" : "#fff",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {a.date}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {a.time}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {a.doctor}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      {a.specialty}
                    </div>
                  </div>
                  <div>
                    <span
                      className="pill"
                      style={{ background: "#f1f5f9", color: "#475569" }}
                    >
                      {a.type}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#475569" }}>
                    {a.notes}
                  </div>
                  <div>
                    <span
                      className="pill"
                      style={{
                        background: statusBg(a.status),
                        color: statusColor(a.status),
                      }}
                    >
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRESCRIPTIONS TAB ── */}
        {tab === "prescriptions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  padding: "18px 24px",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  Prescription Ledger
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {PRESCRIPTIONS.filter((p) => p.status === "active").length}{" "}
                  active ·{" "}
                  {PRESCRIPTIONS.filter((p) => p.status === "completed").length}{" "}
                  completed
                </div>
              </div>

              {/* Active */}
              <div style={{ padding: "14px 24px 6px" }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "#10b981",
                    marginBottom: 10,
                  }}
                >
                  Active Medications
                </div>
              </div>
              {PRESCRIPTIONS.filter((p) => p.status === "active").map(
                (p, i, arr) => (
                  <div
                    key={p.drug}
                    className="row-hover"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 80px 160px 120px 140px",
                      gap: 16,
                      alignItems: "center",
                      padding: "14px 24px",
                      borderBottom:
                        i < arr.length - 1
                          ? "1px solid #f1f5f9"
                          : "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "#10b981",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {p.drug}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          {p.indication}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: "#1e293b",
                      }}
                    >
                      {p.dose}
                    </div>
                    <div style={{ fontSize: 12, color: "#475569" }}>
                      {p.freq}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                      Since {p.since}
                    </div>
                    <div style={{ fontSize: 12, color: "#475569" }}>
                      {p.prescriber}
                    </div>
                  </div>
                ),
              )}

              {/* Completed */}
              <div style={{ padding: "14px 24px 6px" }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "#94a3b8",
                    marginBottom: 10,
                  }}
                >
                  Past Medications
                </div>
              </div>
              {PRESCRIPTIONS.filter((p) => p.status === "completed").map(
                (p) => (
                  <div
                    key={p.drug}
                    className="row-hover"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 80px 160px 120px 140px",
                      gap: 16,
                      alignItems: "center",
                      padding: "14px 24px",
                      opacity: 0.6,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "#94a3b8",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {p.drug}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          {p.indication}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {p.dose}
                    </div>
                    <div style={{ fontSize: 12, color: "#475569" }}>
                      {p.freq}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                      Since {p.since}
                    </div>
                    <div style={{ fontSize: 12, color: "#475569" }}>
                      {p.prescriber}
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* Allergy Alert */}
            <div
              className="card"
              style={{
                padding: "16px 24px",
                background: "#fff5f5",
                border: "1px solid #fecaca",
              }}
            >
              <div
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <span style={{ fontSize: 20 }}>⚠️</span>
                <div>
                  <div
                    style={{ fontSize: 14, fontWeight: 700, color: "#991b1b" }}
                  >
                    Known Drug Allergies
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    {PATIENT.allergies.map((a) => (
                      <span
                        key={a}
                        className="pill"
                        style={{
                          background: "#fee2e2",
                          color: "#991b1b",
                          border: "1px solid #fca5a5",
                          fontSize: 13,
                        }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: "#b91c1c", marginTop: 6 }}>
                    Verify compatibility before prescribing new medications.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── VITALS TAB ── */}
        {tab === "vitals" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            {/* BP Trend */}
            {[
              {
                label: "Blood Pressure (Systolic)",
                key: "bp",
                extract: (v: (typeof VITALS_HISTORY)[0]) => parseInt(v.bp),
                unit: "mmHg",
                color: "#ef4444",
                threshold: "< 130",
              },
              {
                label: "Heart Rate",
                key: "hr",
                extract: (v: (typeof VITALS_HISTORY)[0]) => v.hr,
                unit: "bpm",
                color: "#f97316",
                threshold: "60–100",
              },
              {
                label: "Fasting Blood Sugar",
                key: "fbs",
                extract: (v: (typeof VITALS_HISTORY)[0]) => v.fbs,
                unit: "mmol/L",
                color: "#10b981",
                threshold: "3.9–7.0",
              },
            ].map(({ label, extract, unit, color, threshold }) => {
              const vals = [...VITALS_HISTORY].reverse().map(extract);
              const labels = [...VITALS_HISTORY].reverse().map((v) => v.date);
              const latest = vals[vals.length - 1];
              return (
                <div key={label} className="card" style={{ padding: 20 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      color: "#94a3b8",
                      marginBottom: 4,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 4,
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {latest}
                    </span>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      {unit}
                    </span>
                  </div>
                  <div
                    style={{ fontSize: 10, color: "#94a3b8", marginBottom: 12 }}
                  >
                    Normal: {threshold}
                  </div>
                  <MiniBar values={vals} labels={labels} color={color} />
                  {/* Table */}
                  <div
                    style={{
                      marginTop: 14,
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: 10,
                    }}
                  >
                    {VITALS_HISTORY.map((v, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "4px 0",
                          borderBottom:
                            i < VITALS_HISTORY.length - 1
                              ? "1px solid #f8fafc"
                              : "none",
                        }}
                      >
                        <span style={{ fontSize: 11, color: "#64748b" }}>
                          {v.date}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: i === 0 ? color : "#1e293b",
                          }}
                        >
                          {extract(v)} {unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Weight trend */}
            {(() => {
              const vals = [...VITALS_HISTORY].reverse().map((v) => v.weight);
              const labels = [...VITALS_HISTORY].reverse().map((v) => v.date);
              return (
                <div className="card" style={{ padding: 20 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      color: "#94a3b8",
                      marginBottom: 4,
                    }}
                  >
                    Weight
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 4,
                      marginBottom: 14,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#6366f1",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {LATEST.weight}
                    </span>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>kg</span>
                    <span
                      style={{ fontSize: 11, color: "#10b981", marginLeft: 8 }}
                    >
                      ▼{" "}
                      {(
                        VITALS_HISTORY[VITALS_HISTORY.length - 1].weight -
                        LATEST.weight
                      ).toFixed(1)}{" "}
                      kg
                    </span>
                  </div>
                  <MiniBar values={vals} labels={labels} color="#6366f1" />
                </div>
              );
            })()}

            {/* SpO2 + Temp */}
            <div className="card" style={{ padding: 20, gridColumn: "span 2" }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#94a3b8",
                  marginBottom: 14,
                }}
              >
                SpO₂ & Temperature History
              </div>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        "Date",
                        "Blood Pressure",
                        "Heart Rate",
                        "SpO₂",
                        "Temperature",
                        "FBS",
                        "Weight",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "6px 10px",
                            color: "#94a3b8",
                            fontWeight: 600,
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {VITALS_HISTORY.map((v, i) => (
                      <tr
                        key={i}
                        style={{
                          background:
                            i === 0
                              ? "#f0f9ff"
                              : i % 2 === 0
                                ? "#f8fafc"
                                : "#fff",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px 10px",
                            fontWeight: 600,
                            color: i === 0 ? "#0284c7" : "#1e293b",
                          }}
                        >
                          {v.date}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            fontFamily: "'JetBrains Mono', monospace",
                            color: parseInt(v.bp) > 130 ? "#dc2626" : "#1e293b",
                          }}
                        >
                          {v.bp}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {v.hr}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            fontFamily: "'JetBrains Mono', monospace",
                            color: v.spo2 < 95 ? "#dc2626" : "#059669",
                          }}
                        >
                          {v.spo2}%
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            fontFamily: "'JetBrains Mono', monospace",
                            color: v.temp > 37.5 ? "#dc2626" : "#1e293b",
                          }}
                        >
                          {v.temp}°C
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            fontFamily: "'JetBrains Mono', monospace",
                            color: v.fbs > 7.0 ? "#d97706" : "#1e293b",
                          }}
                        >
                          {v.fbs}
                        </td>
                        <td
                          style={{
                            padding: "8px 10px",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {v.weight} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const icons = {
  age: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  sex: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" d="M12 12v8M9 17h6" />
    </svg>
  ),
  dob: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  blood: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2C12 2 5 10.5 5 15a7 7 0 0014 0c0-4.5-7-13-7-13z"
      />
    </svg>
  ),
  height: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3v18M5 3l3 3M5 3L2 6M5 21l3-3M5 21L2 18M19 12H9"
      />
    </svg>
  ),
  weight: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 6h18l-2 13H5L3 6zM9 6V5a3 3 0 016 0v1"
      />
    </svg>
  ),
  bmi: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  phone: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  ),
  warn: (
    <svg
      className="w-3 h-3 flex-shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

const PatientProfileHero = () => {
  const PATIENT = {
    name: "Farida Sultana",
    id: "PT-2024-00847",
    age: 42,
    sex: "Female",
    blood: "B+",
    phone: "+880 1711 234567",
    weight: "63 kg",
    height: "162 cm",
    bmi: "24.0",
    allergies: ["Penicillin", "Sulfonamides"],
    conditions: ["Type 2 Diabetes", "Hypertension", "Mild Hypothyroidism"],
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="w-full bg-white rounded-2xl p-5 grid grid-cols-2">
      <div className="flex flex-col justify-between gap-6">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold shadow-sm select-none">
              {initials(PATIENT.name)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
          </div>

          {/* Name block */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-extrabold text-slate-800 tracking-tight leading-none">
                {PATIENT.name}
              </h2>
              <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-600 text-[10px] font-semibold border border-sky-100">
                {PATIENT.id}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-semibold border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Active
              </span>
            </div>
            <span className="flex items-center gap-1 text-slate-400 text-[11px]">
              {icons.phone}
              <span className="text-slate-500">{PATIENT.phone}</span>
            </span>
          </div>
        </div>
        {/* Stat chips */}
        <div>
          <h2 className="text-gray-500 text-xs">Overview</h2>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {[
              { icon: icons.age, label: "Age", value: `${PATIENT.age} yrs` },
              { icon: icons.sex, label: "Sex", value: PATIENT.sex },
              {
                icon: icons.blood,
                label: "Blood",
                value: PATIENT.blood,
                red: true,
              },
              { icon: icons.height, label: "Ht", value: PATIENT.height },
              { icon: icons.weight, label: "Wt", value: PATIENT.weight },
              { icon: icons.bmi, label: "BMI", value: PATIENT.bmi },
            ].map(({ icon, label, value, red }) => (
              <div
                key={label}
                title={label}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-semibold ${red ? "bg-red-50 border-red-100 text-red-500" : "bg-slate-50 border-slate-100 text-slate-700"}`}
              >
                <span className={red ? "text-red-400" : "text-slate-400"}>
                  {icon}
                </span>
                {value}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full">
        <div>
          <h2 className="text-gray-500 text-xs">Conditions</h2>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {PATIENT.conditions.map((c) => (
              <span
                key={c}
                className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-semibold"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-gray-500 text-xs">Allergies</h2>

          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {PATIENT.allergies.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[11px] font-semibold"
              >
                {icons.warn}
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
