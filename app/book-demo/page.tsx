"use client";
import { useState } from "react";
import Link from "next/link";

const inp: React.CSSProperties = { width: "100%", background: "#080808", border: "1px solid #1a1a1a", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 };

export default function BookDemo() {
  const [form, setForm] = useState({ name: "", email: "", academy: "", phone: "", players: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [focused, setFocused] = useState("");
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const fi = (k: string) => ({ ...inp, borderColor: focused === k ? "#2563eb" : "#1a1a1a" });

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
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      <div style={{ maxWidth: 520, width: "100%", background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 24, padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 12 }}>Demo Booked!</h1>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, marginBottom: 32 }}>
          Thank you, <strong style={{ color: "#fff" }}>{form.name}</strong>.<br /><br />
          Our team will contact you at <strong style={{ color: "#2563eb" }}>{form.email}</strong> within 24 hours to schedule your personalized demo of AcademyOS.
        </p>
        <div style={{ background: "rgba(37,99,235,.06)", border: "1px solid rgba(37,99,235,.15)", borderRadius: 16, padding: 24, marginBottom: 28 }}>
          <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>What to expect in your demo:</p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {["Live walkthrough of player & schedule management", "Billing automation demo with real invoice flow", "Parent portal demo — what parents see", "Pricing & setup timeline for your academy"].map(item => (
              <li key={item} style={{ fontSize: 13, color: "#777", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#2563eb" }}>✓</span>{item}
              </li>
            ))}
          </ul>
        </div>
        <Link href="/" style={{ fontSize: 14, color: "#444", textDecoration: "none" }}>← Back to homepage</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      <div style={{ maxWidth: 560, width: "100%", background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 24, padding: 40 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, background: "#2563eb", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 14 }}>A</div>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>AcademyOS</span>
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: 8 }}>Book a Demo</h1>
        <p style={{ fontSize: 14, color: "#555", marginBottom: 32, lineHeight: 1.6 }}>30-minute personalized walkthrough. We will show you exactly how AcademyOS works for your academy.</p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={lbl}>Your Name *</label>
              <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="John Smith" style={fi("name")} onFocus={() => setFocused("name")} onBlur={() => setFocused("")} />
            </div>
            <div>
              <label style={lbl}>Email *</label>
              <input required type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="john@academy.com" style={fi("email")} onFocus={() => setFocused("email")} onBlur={() => setFocused("")} />
            </div>
          </div>
          <div>
            <label style={lbl}>Academy Name *</label>
            <input required value={form.academy} onChange={e => set("academy", e.target.value)} placeholder="e.g. Miami Tennis Academy" style={fi("academy")} onFocus={() => setFocused("academy")} onBlur={() => setFocused("")} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={lbl}>Phone</label>
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 305 000 0000" style={fi("phone")} onFocus={() => setFocused("phone")} onBlur={() => setFocused("")} />
            </div>
            <div>
              <label style={lbl}>Number of Players</label>
              <select value={form.players} onChange={e => set("players", e.target.value)} style={fi("players")} onFocus={() => setFocused("players")} onBlur={() => setFocused("")}>
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
            <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={3} placeholder="e.g. We have 8 coaches, 60 players, currently use Excel and WhatsApp..." style={{ ...fi("message"), resize: "none" as const }} onFocus={() => setFocused("message")} onBlur={() => setFocused("")} />
          </div>
          {status === "error" && (
            <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#f87171" }}>
              Something went wrong. Please try again.
            </div>
          )}
          <button type="submit" disabled={status === "loading"} style={{
            width: "100%", background: "#2563eb", color: "#fff", fontWeight: 800, fontSize: 15,
            padding: "15px 24px", borderRadius: 14, border: "none", cursor: status === "loading" ? "not-allowed" : "pointer",
            opacity: status === "loading" ? .7 : 1, transition: "all .2s",
          }}
            onMouseEnter={e => { if (status !== "loading") (e.currentTarget as HTMLElement).style.background = "#1d4ed8"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#2563eb"; }}>
            {status === "loading" ? "Submitting..." : "Book Free Demo →"}
          </button>
          <p style={{ fontSize: 12, color: "#333", textAlign: "center" }}>No commitment. We will contact you within 24 hours.</p>
        </form>
      </div>
    </div>
  );
}
