"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const inp: React.CSSProperties = { width: "100%", background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

function SubscribeContent() {
  const params = useSearchParams();
  const defaultPlan = params.get("plan") === "setup" ? "setup" : "subscription";
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [academy, setAcademy] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");

  const checkout = async (plan: "setup" | "subscription") => {
    if (!email || !academy) { setError("Please enter your email and academy name."); return; }
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
      setError("Payment failed to initialize. Please try again.");
      setLoading(null);
    }
  };

  const fi = (k: string) => ({ ...inp, borderColor: focused === k ? "#2563eb" : "#1a1a1a" });

  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      <div style={{ width: "100%", maxWidth: 640 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 40 }}>
          <div style={{ width: 32, height: 32, background: "#2563eb", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 14 }}>A</div>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>AcademyOS</span>
        </Link>

        <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", marginBottom: 8 }}>Get AcademyOS</h1>
        <p style={{ fontSize: 15, color: "#555", marginBottom: 40 }}>Choose your plan and get started today. Secured by Stripe.</p>

        <div style={{ background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 20, padding: 28, marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Your Information</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Academy Name *</label>
              <input value={academy} onChange={e => setAcademy(e.target.value)} placeholder="e.g. Miami Tennis Academy" style={fi("academy")} onFocus={() => setFocused("academy")} onBlur={() => setFocused("")} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="director@academy.com" style={fi("email")} onFocus={() => setFocused("email")} onBlur={() => setFocused("")} />
            </div>
          </div>
        </div>

        {error && <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#f87171", marginBottom: 20 }}>{error}</div>}

        <div style={{ display: "grid", gap: 16 }}>
          {/* Setup */}
          <div style={{ background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 20, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 12, color: "#444", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>One-time</p>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>Custom Setup</h2>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: "#fff" }}>$10,000</span>
                <p style={{ fontSize: 12, color: "#444" }}>one-time payment</p>
              </div>
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {["Full system setup & configuration", "Player database import", "Branding & custom domain", "Full team training", "30-day support"].map(f => (
                <li key={f} style={{ fontSize: 14, color: "#777", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#2563eb", fontSize: 12 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => checkout("setup")} disabled={loading === "setup"} style={{
              width: "100%", border: "1px solid #2a2a2a", background: "#111", color: "#fff", fontWeight: 700,
              fontSize: 14, padding: "13px 20px", borderRadius: 12, cursor: loading === "setup" ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading === "setup" ? .7 : 1, transition: "all .2s",
            }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.borderColor = "#2563eb"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"; }}>
              {loading === "setup" ? "Redirecting to Stripe..." : "Pay $10,000 Setup →"}
            </button>
          </div>

          {/* Subscription */}
          <div style={{ background: "rgba(37,99,235,.03)", border: "1px solid rgba(37,99,235,.25)", borderRadius: 20, padding: 28, boxShadow: "0 0 40px rgba(37,99,235,.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 12, color: "#60a5fa", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Monthly</p>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>Academy License</h2>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: "#fff" }}>$4,000</span>
                <p style={{ fontSize: 12, color: "#444" }}>/month · cancel anytime</p>
              </div>
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {["Unlimited players & coaches", "Automated billing & invoicing", "Parent portal", "Full analytics", "Priority support", "New features included"].map(f => (
                <li key={f} style={{ fontSize: 14, color: "#bbb", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#60a5fa", fontSize: 12 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => checkout("subscription")} disabled={loading === "subscription"} style={{
              width: "100%", background: loading === "subscription" ? "#1d4ed8" : "#2563eb", color: "#fff", fontWeight: 800,
              fontSize: 15, padding: "14px 20px", borderRadius: 12, border: "none",
              cursor: loading === "subscription" ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: loading === "subscription" ? .8 : 1, boxShadow: "0 4px 20px rgba(37,99,235,.3)", transition: "all .2s",
            }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#1d4ed8"; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#2563eb"; }}>
              {loading === "subscription" ? "Redirecting to Stripe..." : "Subscribe $4,000/month →"}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          {[["🔒", "Secured by Stripe"], ["💳", "All major cards"], ["🔄", "Cancel anytime"]].map(([icon, text]) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#333" }}>
              <span>{icon}</span> {text}
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
