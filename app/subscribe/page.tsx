"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useLang } from "@/lib/i18n/context";

function fi(focused: string, k: string): React.CSSProperties {
  return {
    width: "100%",
    background: "#0e1e26",
    border: `1px solid ${focused === k ? "rgba(31,107,69,.45)" : "rgba(255,255,255,.08)"}`,
    borderRadius: 12,
    padding: "13px 16px",
    fontSize: 14,
    color: "#F5F7FA",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color .2s",
  };
}

const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#97A6B2", marginBottom: 7 };

function SubscribeContent() {
  const params = useSearchParams();
  void params.get("plan");
  const { t } = useLang();
  const l = t.subscribe;
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [academy, setAcademy] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");

  const checkout = async (plan: "setup" | "subscription") => {
    if (!email || !academy) { setError(l.errFillFields); return; }
    setError(""); setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, customerEmail: email, academyName: academy }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error);
    } catch {
      setError(l.errPayment);
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#081418", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <style>{`
        @media (max-width: 640px) { .sub-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      <div style={{ width: "100%", maxWidth: 660 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 44 }}>
          <div style={{ width: 36, height: 36, background: "#1F6B45", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#FFD447", fontSize: 16 }}>A</div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#F5F7FA", letterSpacing: "-.3px" }}>AcademyOS</span>
        </Link>

        <h1 style={{ fontSize: 34, fontWeight: 900, color: "#F5F7FA", letterSpacing: "-1.5px", marginBottom: 8 }}>{l.title}</h1>
        <p style={{ fontSize: 15, color: "#97A6B2", marginBottom: 36 }}>{l.subtitle}</p>

        {/* Info form */}
        <div style={{ background: "#0b1a20", border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 26, marginBottom: 22 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#97A6B2", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>{l.yourInfo}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>{l.academyName}</label>
              <input value={academy} onChange={e => setAcademy(e.target.value)} placeholder="Miami Tennis Academy" style={fi(focused, "academy")} onFocus={() => setFocused("academy")} onBlur={() => setFocused("")} />
            </div>
            <div>
              <label style={lbl}>{l.email}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="director@academy.com" style={fi(focused, "email")} onFocus={() => setFocused("email")} onBlur={() => setFocused("")} />
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#f87171", marginBottom: 18 }}>{error}</div>
        )}

        <div className="sub-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          {/* Setup */}
          <div style={{ background: "#0b1a20", border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 26 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#97A6B2", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>{l.oneTimeLabel}</p>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#F5F7FA", marginBottom: 4 }}>{l.setupTitle}</h2>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 34, fontWeight: 900, color: "#F5F7FA", letterSpacing: "-1px" }}>{l.setupPrice}</span>
              <span style={{ fontSize: 13, color: "#97A6B2", marginLeft: 6 }}>{l.setupPeriod}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22 }}>
              {[l.setupF1, l.setupF2, l.setupF3, l.setupF4, l.setupF5].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#97A6B2" }}>
                  <span style={{ color: "#1F6B45", fontWeight: 800, flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}
            </div>
            <button onClick={() => checkout("setup")} disabled={!!loading}
              style={{ width: "100%", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)", color: "#F5F7FA", fontWeight: 700, fontSize: 14, padding: "12px", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer", opacity: loading === "setup" ? .7 : 1, transition: "all .2s" }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.borderColor = "rgba(31,107,69,.4)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.12)"; }}>
              {loading === "setup" ? l.redirecting : l.paySetup}
            </button>
          </div>

          {/* Subscription — featured */}
          <div style={{ background: "#0f2318", border: "1px solid rgba(31,107,69,.3)", borderRadius: 18, padding: 26, position: "relative", boxShadow: "0 0 40px rgba(31,107,69,.08)" }}>
            <div style={{ position: "absolute", top: -12, left: 20, background: "#FFD447", color: "#081418", fontSize: 11, fontWeight: 800, padding: "4px 14px", borderRadius: 100, letterSpacing: ".06em" }}>{l.popularBadge}</div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#18B3A4", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>{l.monthlyLabel}</p>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#F5F7FA", marginBottom: 4 }}>{l.subTitle}</h2>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 34, fontWeight: 900, color: "#F5F7FA", letterSpacing: "-1px" }}>{l.subPrice}</span>
              <span style={{ fontSize: 13, color: "#97A6B2", marginLeft: 6 }}>{l.subPeriod}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22 }}>
              {[l.subF1, l.subF2, l.subF3, l.subF4, l.subF5, l.subF6].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#97A6B2" }}>
                  <span style={{ color: "#4ade80", fontWeight: 800, flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}
            </div>
            <button onClick={() => checkout("subscription")} disabled={!!loading}
              style={{ width: "100%", background: "#FFD447", color: "#081418", fontWeight: 800, fontSize: 15, padding: "13px", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading === "subscription" ? .7 : 1, transition: "all .2s", boxShadow: "0 4px 20px rgba(255,212,71,.2)" }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#f5ca3a"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#FFD447"; }}>
              {loading === "subscription" ? l.redirecting : l.paySub}
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
          {[["🔒", l.trustStripe], ["💳", l.trustCards], ["🔄", l.trustCancel]].map(([icon, text]) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#607080" }}>
              <span>{icon}</span>{text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Subscribe() {
  return <Suspense><SubscribeContent /></Suspense>;
}
