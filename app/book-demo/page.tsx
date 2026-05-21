"use client";
import { useState } from "react";
import Link from "next/link";

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

export default function BookDemo() {
  const [form, setForm] = useState({ name: "", email: "", academy: "", phone: "", players: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [focused, setFocused] = useState("");
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/book-demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch { setStatus("error"); }
  };

  if (status === "success") return (
    <div style={{ minHeight: "100vh", background: "#081418", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      <div style={{ maxWidth: 520, width: "100%", background: "#0b1a20", border: "1px solid rgba(31,107,69,.2)", borderRadius: 24, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,.5)" }}>
        <div style={{ height: 4, background: "linear-gradient(90deg,#1F6B45,#18B3A4)" }} />
        <div style={{ padding: 48, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(31,107,69,.12)", border: "2px solid rgba(31,107,69,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28, color: "#4ade80" }}>✓</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#F5F7FA", letterSpacing: "-1px", marginBottom: 12 }}>Demo Booked!</h1>
          <p style={{ fontSize: 15, color: "#97A6B2", lineHeight: 1.7, marginBottom: 32 }}>
            Thanks, <strong style={{ color: "#F5F7FA" }}>{form.name}</strong>. We&apos;ll reach out at{" "}
            <strong style={{ color: "#18B3A4" }}>{form.email}</strong> within 24 hours.
          </p>
          <div style={{ background: "rgba(31,107,69,.08)", border: "1px solid rgba(31,107,69,.2)", borderRadius: 16, padding: 24, marginBottom: 32, textAlign: "left" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#97A6B2", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>What to expect</p>
            {["Live walkthrough of player & schedule management","Billing automation demo with real invoice flow","Parent portal demo — what parents see","Pricing & setup timeline for your academy"].map(item => (
              <div key={item} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <span style={{ color: "#1F6B45", fontWeight: 800, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: "#97A6B2" }}>{item}</span>
              </div>
            ))}
          </div>
          <Link href="/" style={{ fontSize: 14, color: "#97A6B2", textDecoration: "none" }}>← Back to homepage</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#081418" }}>
      <style>{`
        @media (max-width: 768px) {
          .demo-right { display: none !important; }
          .demo-left { flex: 1 1 100% !important; padding: 48px 24px !important; }
          .demo-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* LEFT — form */}
      <div className="demo-left" style={{ flex: "0 0 55%", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 56px", minHeight: "100vh" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 44 }}>
            <div style={{ width: 36, height: 36, background: "#1F6B45", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#FFD447", fontSize: 16 }}>A</div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#F5F7FA", letterSpacing: "-.3px" }}>AcademyOS</span>
          </Link>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(31,107,69,.1)", border: "1px solid rgba(31,107,69,.22)", borderRadius: 100, padding: "6px 16px", marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            <span style={{ fontSize: 12, color: "#97A6B2", fontWeight: 600 }}>Free · No commitment required</span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#F5F7FA", letterSpacing: "-.8px", marginBottom: 8 }}>Book a Free Demo</h1>
          <p style={{ fontSize: 14, color: "#607080", marginBottom: 32, lineHeight: 1.6 }}>
            30-minute personalized walkthrough. We&apos;ll show you exactly how AcademyOS fits your academy.
          </p>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="demo-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Your Name *</label>
                <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="John Smith" style={fi(focused, "name")} onFocus={() => setFocused("name")} onBlur={() => setFocused("")} />
              </div>
              <div>
                <label style={lbl}>Email *</label>
                <input required type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="john@academy.com" style={fi(focused, "email")} onFocus={() => setFocused("email")} onBlur={() => setFocused("")} />
              </div>
            </div>
            <div>
              <label style={lbl}>Academy Name *</label>
              <input required value={form.academy} onChange={e => set("academy", e.target.value)} placeholder="e.g. Miami Tennis Academy" style={fi(focused, "academy")} onFocus={() => setFocused("academy")} onBlur={() => setFocused("")} />
            </div>
            <div className="demo-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Phone</label>
                <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 305 000 0000" style={fi(focused, "phone")} onFocus={() => setFocused("phone")} onBlur={() => setFocused("")} />
              </div>
              <div>
                <label style={lbl}>Number of Players</label>
                <select value={form.players} onChange={e => set("players", e.target.value)} style={fi(focused, "players")} onFocus={() => setFocused("players")} onBlur={() => setFocused("")}>
                  <option value="">Select...</option>
                  <option value="1-20">1–20 players</option>
                  <option value="21-50">21–50 players</option>
                  <option value="51-100">51–100 players</option>
                  <option value="100+">100+ players</option>
                </select>
              </div>
            </div>
            <div>
              <label style={lbl}>Tell us about your academy</label>
              <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={3}
                placeholder="e.g. We have 8 coaches, 60 players, currently use Excel and WhatsApp..."
                style={{ ...fi(focused, "message"), resize: "none" as const }}
                onFocus={() => setFocused("message")} onBlur={() => setFocused("")} />
            </div>

            {status === "error" && (
              <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#f87171" }}>
                Something went wrong. Please try again.
              </div>
            )}

            <button type="submit" disabled={status === "loading"}
              style={{ width: "100%", background: "#FFD447", color: "#081418", fontWeight: 800, fontSize: 15, padding: "14px", borderRadius: 12, border: "none", cursor: status === "loading" ? "not-allowed" : "pointer", opacity: status === "loading" ? .7 : 1, transition: "all .2s", letterSpacing: "-.2px", marginTop: 4 }}
              onMouseEnter={e => { if (status !== "loading") (e.currentTarget as HTMLElement).style.background = "#f5ca3a"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#FFD447"; }}>
              {status === "loading" ? "Submitting…" : "Book Free Demo →"}
            </button>
            <p style={{ fontSize: 12, color: "#607080", textAlign: "center" }}>No commitment · We&apos;ll contact you within 24 hours</p>
          </form>
        </div>
      </div>

      {/* RIGHT — info panel */}
      <div className="demo-right" style={{ flex: "0 0 45%", background: "#0b1a20", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(31,107,69,.1) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 360 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#18B3A4", textTransform: "uppercase", letterSpacing: ".18em", marginBottom: 16 }}>What&apos;s in your demo</p>
          <h2 style={{ fontSize: 30, fontWeight: 900, color: "#F5F7FA", letterSpacing: "-1.2px", lineHeight: 1.2, marginBottom: 36 }}>
            30 minutes.<br /><span style={{ color: "#FFD447" }}>Total clarity.</span>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
            {[
              { icon: "👥", title: "Player management", desc: "Track all players, levels, and fees in one place" },
              { icon: "💳", title: "Billing automation", desc: "Watch invoices get generated and emailed in one click" },
              { icon: "📅", title: "Schedule & courts", desc: "Calendar view, session tracking, court booking" },
              { icon: "📊", title: "Revenue dashboard", desc: "Live MRR, collected vs pending, monthly chart" },
            ].map(f => (
              <div key={f.title} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, padding: "14px 16px" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#F5F7FA", margin: "0 0 3px" }}>{f.title}</p>
                  <p style={{ fontSize: 12, color: "#607080", margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(31,107,69,.08)", border: "1px solid rgba(31,107,69,.18)", borderRadius: 16, padding: "20px 22px" }}>
            <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
              {Array(5).fill(0).map((_, i) => <span key={i} style={{ color: "#FFD447", fontSize: 13 }}>★</span>)}
            </div>
            <p style={{ fontSize: 13, color: "#97A6B2", lineHeight: 1.75, marginBottom: 14, fontStyle: "italic" }}>
              &quot;Setup took 2 days. The invoice emails alone saved us 3 hours a month.&quot;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, background: "#1F6B45", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#FFD447" }}>D</div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#F5F7FA", margin: 0 }}>David R.</p>
                <p style={{ fontSize: 11, color: "#607080", margin: 0 }}>Head Coach & Director</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
