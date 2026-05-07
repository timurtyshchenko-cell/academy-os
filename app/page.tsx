"use client";
import Link from "next/link";
import { useState } from "react";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 14, overflow: "hidden", cursor: "pointer" }} onClick={() => setOpen(!open)}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px" }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", letterSpacing: "-.2px" }}>{q}</p>
        <span style={{ fontSize: 18, color: "#6366f1", fontWeight: 700, flexShrink: 0, marginLeft: 16, transform: open ? "rotate(45deg)" : "none", transition: "transform .2s" }}>+</span>
      </div>
      {open && <div style={{ padding: "0 24px 20px", fontSize: 14, color: "#475569", lineHeight: 1.75, borderTop: "1px solid #0f0f1e", paddingTop: 16 }}>{a}</div>}
    </div>
  );
}

export default function LandingPage() {
  const [modal, setModal] = useState(false);
  const [email, setEmail] = useState("");
  const [academy, setAcademy] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleCheckout() {
    if (!email || !academy) { setErr("Fill in both fields"); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "subscription", customerEmail: email, academyName: academy }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setErr("Something went wrong. Try again.");
    } catch { setErr("Network error. Try again."); }
    setLoading(false);
  }

  return (
    <div style={{ background: "#030305", minHeight: "100vh", color: "#fff", fontFamily: "inherit", overflowX: "hidden" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse-ring { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.15;transform:scale(1.15)} }
        @keyframes fadein { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        .btn-primary { transition:all .2s; background:linear-gradient(135deg,#2563eb,#4f46e5) !important }
        .btn-primary:hover { transform:translateY(-2px) !important; box-shadow:0 12px 40px rgba(79,70,229,.55) !important }
        .btn-ghost:hover { border-color:#333 !important; color:#e2e8f0 !important; background:rgba(255,255,255,.04) !important }
        .btn-ghost { transition:all .2s }
        .feat-card:hover { border-color:rgba(99,102,241,.25) !important; transform:translateY(-2px) }
        .feat-card { transition:all .25s }
        .stat-item:not(:last-child) { border-right:1px solid #111 }
        .nav-a:hover { color:#e2e8f0 !important }
        .nav-a { transition:color .15s }
        .pricing-card-pro:hover { box-shadow:0 0 80px rgba(99,102,241,.12) !important }
        .pricing-card-pro { transition:box-shadow .3s }
      `}</style>

      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(3,3,5,.85)", backdropFilter: "blur(28px)", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#4f46e5,#2563eb)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 15, boxShadow: "0 4px 16px rgba(79,70,229,.5)" }}>A</div>
            <span style={{ fontWeight: 800, color: "#f8fafc", fontSize: 17, letterSpacing: "-.4px" }}>AcademyOS</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Link href="/login" className="nav-a" style={{ fontSize: 14, color: "#555", textDecoration: "none", padding: "8px 18px", fontWeight: 500, borderRadius: 8 }}>Sign in</Link>
            <Link href="/signup" className="btn-primary" style={{ fontSize: 14, fontWeight: 700, color: "#fff", padding: "10px 22px", borderRadius: 10, textDecoration: "none", boxShadow: "0 4px 20px rgba(79,70,229,.4)", letterSpacing: "-.2px" }}>
              Get started →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", paddingTop: 170, paddingBottom: 80, textAlign: "center", overflow: "hidden" }}>
        {/* bg glows */}
        <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 800, height: 600, background: "radial-gradient(ellipse,rgba(79,70,229,.13) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 80, left: "20%", width: 300, height: 300, background: "radial-gradient(ellipse,rgba(37,99,235,.07) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 120, right: "18%", width: 250, height: 250, background: "radial-gradient(ellipse,rgba(124,58,237,.07) 0%,transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1, animation: "fadein .8s ease both" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,.08)", border: "1px solid rgba(99,102,241,.2)", borderRadius: 100, padding: "7px 18px", marginBottom: 40 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#818cf8", display: "inline-block", boxShadow: "0 0 8px #818cf8", animation: "pulse-ring 2s ease infinite" }} />
            <span style={{ fontSize: 12, color: "#a5b4fc", fontWeight: 600, letterSpacing: ".05em" }}>Purpose-built for tennis academies</span>
          </div>

          <h1 style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.02, letterSpacing: "-3px", marginBottom: 28 }}>
            <span style={{ background: "linear-gradient(180deg,#f8fafc 30%,#94a3b8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Manage your academy.</span><br />
            <span style={{ background: "linear-gradient(135deg,#818cf8,#4f46e5,#2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Stop the chaos.</span>
          </h1>
          <p style={{ fontSize: 20, color: "#475569", lineHeight: 1.65, marginBottom: 52, maxWidth: 520, margin: "0 auto 52px" }}>
            Players, coaches, billing, invoices — all in one place. Built for academy directors who are serious about growing.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Link href="/signup" className="btn-primary" style={{ fontSize: 16, fontWeight: 800, color: "#fff", padding: "16px 40px", borderRadius: 13, textDecoration: "none", boxShadow: "0 8px 32px rgba(79,70,229,.5)", letterSpacing: "-.2px" }}>
              Start free trial →
            </Link>
            <Link href="/app" className="btn-ghost" style={{ fontSize: 16, fontWeight: 600, color: "#475569", padding: "16px 28px", borderRadius: 13, textDecoration: "none", border: "1px solid #1a1a2e", background: "transparent" }}>
              View dashboard
            </Link>
          </div>
          <p style={{ fontSize: 13, color: "#1e1e3a", marginTop: 22, letterSpacing: ".02em" }}>14-day free trial · No credit card · Cancel anytime</p>
        </div>

        {/* Dashboard preview */}
        <div style={{ maxWidth: 1000, margin: "72px auto 0", padding: "0 28px", position: "relative", zIndex: 1 }}>
          {/* Gradient border wrapper */}
          <div style={{ background: "linear-gradient(160deg,rgba(99,102,241,.3),rgba(37,99,235,.1),rgba(124,58,237,.15))", padding: 1, borderRadius: 22, boxShadow: "0 50px 140px rgba(0,0,0,.9)" }}>
            <div style={{ background: "#07070f", borderRadius: 21, overflow: "hidden" }}>
              {/* Browser chrome */}
              <div style={{ background: "#0a0a14", borderBottom: "1px solid rgba(255,255,255,.04)", padding: "13px 18px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 7 }}>
                  {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: .7 }} />)}
                </div>
                <div style={{ flex: 1, maxWidth: 280, margin: "0 auto", background: "rgba(255,255,255,.04)", borderRadius: 7, padding: "5px 14px", fontSize: 11, color: "#2a2a4a", textAlign: "center" }}>academyos.com/app</div>
              </div>
              {/* App UI */}
              <div style={{ display: "flex", height: 380 }}>
                {/* Sidebar */}
                <div style={{ width: 190, borderRight: "1px solid rgba(255,255,255,.04)", padding: "22px 14px", background: "#07070f", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 20 }}>
                    <div style={{ width: 24, height: 24, background: "linear-gradient(135deg,#4f46e5,#2563eb)", borderRadius: 7 }} />
                    <div style={{ width: 70, height: 7, background: "#1a1a2e", borderRadius: 4 }} />
                  </div>
                  {[
                    { label: "Overview", emoji: "📊", active: true },
                    { label: "Players", emoji: "👥", active: false },
                    { label: "Billing", emoji: "💳", active: false },
                    { label: "Coaches", emoji: "🎾", active: false },
                    { label: "Settings", emoji: "⚙️", active: false },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 9, marginBottom: 2, background: item.active ? "rgba(99,102,241,.12)" : "transparent", border: item.active ? "1px solid rgba(99,102,241,.18)" : "1px solid transparent" }}>
                      <span style={{ fontSize: 13 }}>{item.emoji}</span>
                      <span style={{ fontSize: 12, color: item.active ? "#a5b4fc" : "#2a2a4a", fontWeight: item.active ? 700 : 400 }}>{item.label}</span>
                    </div>
                  ))}
                </div>
                {/* Main content */}
                <div style={{ flex: 1, padding: "24px 22px", background: "#050510", overflowY: "hidden" }}>
                  <div style={{ width: 110, height: 9, background: "#111128", borderRadius: 5, marginBottom: 7 }} />
                  <div style={{ width: 170, height: 6, background: "#0d0d1e", borderRadius: 4, marginBottom: 24 }} />
                  {/* Stats row */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
                    {[
                      { v: "24", l: "Active Players", c: "#6366f1" },
                      { v: "$48k", l: "MRR", c: "#10b981" },
                      { v: "$32k", l: "Collected", c: "#10b981" },
                      { v: "$16k", l: "Pending", c: "#f59e0b" },
                    ].map(s => (
                      <div key={s.l} style={{ background: "#0a0a1a", border: "1px solid #111128", borderRadius: 11, padding: "13px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <div style={{ width: 46, height: 5, background: "#111128", borderRadius: 3 }} />
                          <div style={{ width: 16, height: 16, borderRadius: 5, background: s.c + "18" }} />
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: "#e2e8f0", letterSpacing: "-.5px", marginBottom: 6 }}>{s.v}</div>
                        <div style={{ width: "55%", height: 3, background: s.c + "40", borderRadius: 2 }} />
                      </div>
                    ))}
                  </div>
                  {/* Bottom row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: "#0a0a1a", border: "1px solid #111128", borderRadius: 11, padding: "14px 14px" }}>
                      <div style={{ width: 90, height: 6, background: "#111128", borderRadius: 3, marginBottom: 14 }} />
                      {[1,2,3].map(i => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #0d0d1e" }}>
                          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#111128", flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ width: "65%", height: 5, background: "#111128", borderRadius: 3, marginBottom: 4 }} />
                            <div style={{ width: "40%", height: 4, background: "#0d0d1e", borderRadius: 3 }} />
                          </div>
                          <div style={{ width: 42, height: 5, background: "#111128", borderRadius: 3 }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#0a0a1a", border: "1px solid #111128", borderRadius: 11, padding: "14px 14px" }}>
                      <div style={{ width: 80, height: 6, background: "#111128", borderRadius: 3, marginBottom: 14 }} />
                      {[
                        { c: "#10b981" }, { c: "#f59e0b" }, { c: "#f59e0b" }, { c: "#10b981" },
                      ].map((row, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #0d0d1e" }}>
                          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#111128", flexShrink: 0 }} />
                          <div style={{ flex: 1, width: "50%", height: 5, background: "#111128", borderRadius: 3 }} />
                          <div style={{ padding: "3px 10px", borderRadius: 100, background: row.c + "18", width: 40, height: 16 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom glow */}
          <div style={{ position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)", width: "50%", height: 50, background: "rgba(79,70,229,.15)", filter: "blur(50px)", borderRadius: "50%", pointerEvents: "none" }} />
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ borderTop: "1px solid #0a0a14", borderBottom: "1px solid #0a0a14", background: "#040408" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          {[
            { v: "$10k", l: "setup investment" },
            { v: "$4k", l: "per month" },
            { v: "∞", l: "players & invoices" },
            { v: "24/7", l: "support" },
          ].map(s => (
            <div key={s.l} className="stat-item" style={{ padding: "28px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 28, fontWeight: 900, color: "#6366f1", letterSpacing: "-1px", marginBottom: 4 }}>{s.v}</p>
              <p style={{ fontSize: 12, color: "#2a2a4a", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features — bento grid */}
      <section style={{ padding: "110px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 70 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: ".16em", marginBottom: 16 }}>Features</p>
            <h2 style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", marginBottom: 18, background: "linear-gradient(180deg,#f8fafc 40%,#475569 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Everything you need.<br />Nothing you don't.
            </h2>
            <p style={{ fontSize: 17, color: "#334155", maxWidth: 440, margin: "0 auto" }}>Stop juggling spreadsheets, WhatsApp groups, and paper invoices.</p>
          </div>

          {/* Bento */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gridTemplateRows: "auto auto", gap: 14 }}>
            {/* Big card */}
            <div className="feat-card" style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 20, padding: 36, gridColumn: "1 / 3" }}>
              <div style={{ width: 48, height: 48, background: "rgba(99,102,241,.12)", border: "1px solid rgba(99,102,241,.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 22 }}>👥</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#e2e8f0", marginBottom: 12, letterSpacing: "-.4px" }}>Player Management</h3>
              <p style={{ fontSize: 15, color: "#334155", lineHeight: 1.7, maxWidth: 420 }}>Complete profiles — age, level, coach assignment, parent contacts, notes, payment status, and full invoice history per player. Everything in one view.</p>
            </div>
            {/* Small card */}
            <div className="feat-card" style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 20, padding: 32 }}>
              <div style={{ width: 44, height: 44, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 18 }}>💳</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#e2e8f0", marginBottom: 10, letterSpacing: "-.3px" }}>Instant Billing</h3>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.65 }}>Generate invoices for every active player in one click.</p>
            </div>
            {/* Small card */}
            <div className="feat-card" style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 20, padding: 32 }}>
              <div style={{ width: 44, height: 44, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 18 }}>📊</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#e2e8f0", marginBottom: 10, letterSpacing: "-.3px" }}>Revenue Dashboard</h3>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.65 }}>Live MRR, collected, and pending — no Excel needed.</p>
            </div>
            <div className="feat-card" style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 20, padding: 32 }}>
              <div style={{ width: 44, height: 44, background: "rgba(139,92,246,.1)", border: "1px solid rgba(139,92,246,.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 18 }}>🎾</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#e2e8f0", marginBottom: 10, letterSpacing: "-.3px" }}>Coach Roster</h3>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.65 }}>Staff profiles with specialties and contacts.</p>
            </div>
            <div className="feat-card" style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 20, padding: 32 }}>
              <div style={{ width: 44, height: 44, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 18 }}>🔒</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#e2e8f0", marginBottom: 10, letterSpacing: "-.3px" }}>Isolated Data</h3>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.65 }}>Multi-tenant. Your data is 100% yours.</p>
            </div>
            <div className="feat-card" style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 20, padding: 32 }}>
              <div style={{ width: 44, height: 44, background: "rgba(6,182,212,.1)", border: "1px solid rgba(6,182,212,.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 18 }}>⚡</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#e2e8f0", marginBottom: 10, letterSpacing: "-.3px" }}>Zero Setup</h3>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.65 }}>No external services. Works immediately.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "100px 24px", borderTop: "1px solid #0a0a14" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 70 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: ".16em", marginBottom: 16 }}>How it works</p>
            <h2 style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", background: "linear-gradient(180deg,#f8fafc 40%,#475569 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Up and running in 3 days</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, position: "relative" }}>
            <div style={{ position: "absolute", top: 32, left: "17%", right: "17%", height: 1, background: "linear-gradient(90deg,transparent,rgba(99,102,241,.3),transparent)", pointerEvents: "none" }} />
            {[
              { n: "01", icon: "📋", title: "We set everything up", desc: "Send us your player list and we configure the entire system — coaches, billing rates, parent contacts." },
              { n: "02", icon: "🎓", title: "Team gets trained", desc: "30-minute onboarding call with your staff. Everyone learns to log sessions, generate invoices, and send reports." },
              { n: "03", icon: "🚀", title: "Go live", desc: "Your academy runs on AcademyOS. Invoices go out automatically, parents get training reports, you track everything." },
            ].map(s => (
              <div key={s.n} style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 20, padding: 36, textAlign: "center", position: "relative" }}>
                <div style={{ width: 56, height: 56, background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 20px" }}>{s.icon}</div>
                <div style={{ position: "absolute", top: 18, right: 20, fontSize: 11, fontWeight: 800, color: "#1e1e3a", letterSpacing: ".06em" }}>{s.n}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#e2e8f0", marginBottom: 12, letterSpacing: "-.3px" }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "100px 24px", borderTop: "1px solid #0a0a14" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: ".16em", marginBottom: 16 }}>What academies say</p>
            <h2 style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", background: "linear-gradient(180deg,#f8fafc 40%,#475569 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Directors love it</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              { quote: "We used to spend 3 hours every month sending invoices manually. Now it takes one click. The parents actually get real training reports too — they love it.", name: "Carlos M.", role: "Director, Elite Tennis Academy", stars: 5 },
              { quote: "Finally a system built for tennis academies, not a generic CRM. The billing dashboard alone saved us from so many missed payments.", name: "Sarah K.", role: "Owner, ProTennis Club", stars: 5 },
              { quote: "Setup took 2 days. The onboarding was smooth and the team picked it up immediately. Worth every penny.", name: "David R.", role: "Head Coach & Director", stars: 5 },
            ].map(t => (
              <div key={t.name} style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 20, padding: 32 }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
                  {Array(t.stars).fill(0).map((_, i) => <span key={i} style={{ color: "#f59e0b", fontSize: 14 }}>★</span>)}
                </div>
                <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.75, marginBottom: 24, fontStyle: "italic" }}>"{t.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#4f46e5,#2563eb)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{t.name[0]}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: "#334155" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "100px 24px", borderTop: "1px solid #0a0a14" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: ".16em", marginBottom: 16 }}>FAQ</p>
            <h2 style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", background: "linear-gradient(180deg,#f8fafc 40%,#475569 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Common questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { q: "How long does setup take?", a: "Typically 2–3 business days. We handle everything — you just send us your player list and billing details." },
              { q: "Can I cancel the subscription?", a: "Yes, cancel anytime. Your data remains accessible for 30 days after cancellation so you can export everything." },
              { q: "How many players and coaches can I add?", a: "Unlimited. No caps on players, coaches, invoices, or training sessions." },
              { q: "Do parents need to create accounts?", a: "No. They receive invoice and training report emails directly — no login required on their end." },
              { q: "Is my data secure?", a: "Yes. Each academy's data is fully isolated. We use encrypted connections and regular backups." },
              { q: "What payment methods does invoicing support?", a: "The billing module tracks who has paid — you collect payments however you prefer (bank transfer, cash, card). We don't process parent payments directly." },
            ].map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "100px 24px", borderTop: "1px solid #0a0a14" }}>
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 70 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: ".16em", marginBottom: 16 }}>Pricing</p>
            <h2 style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", marginBottom: 18, background: "linear-gradient(180deg,#f8fafc 40%,#475569 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Simple, honest pricing</h2>
            <p style={{ fontSize: 17, color: "#334155" }}>One setup. One subscription. No hidden fees.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Setup */}
            <div style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 22, padding: 40 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 22 }}>One-Time Setup</p>
              <div style={{ marginBottom: 32 }}>
                <span style={{ fontSize: 54, fontWeight: 900, color: "#f8fafc", letterSpacing: "-2px" }}>$10k</span>
                <span style={{ fontSize: 15, color: "#334155", marginLeft: 8 }}>once</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {["Custom installation", "Data migration", "Staff onboarding", "Priority support setup"].map(i => (
                  <li key={i} style={{ fontSize: 14, color: "#475569", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#10b981", fontWeight: 800, fontSize: 13 }}>✓</span>{i}
                  </li>
                ))}
              </ul>
            </div>
            {/* Subscription */}
            <div className="pricing-card-pro" style={{ background: "linear-gradient(160deg,#0f0f20,#09091a)", border: "1px solid rgba(99,102,241,.25)", borderRadius: 22, padding: 40, position: "relative", boxShadow: "0 0 60px rgba(99,102,241,.07)" }}>
              <div style={{ position: "absolute", top: -14, left: 32, background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "5px 16px", borderRadius: 100, letterSpacing: ".04em", boxShadow: "0 4px 12px rgba(99,102,241,.4)" }}>MONTHLY PLAN</div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 22 }}>Subscription</p>
              <div style={{ marginBottom: 32 }}>
                <span style={{ fontSize: 54, fontWeight: 900, color: "#f8fafc", letterSpacing: "-2px" }}>$4k</span>
                <span style={{ fontSize: 15, color: "#334155", marginLeft: 8 }}>/month</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
                {["Unlimited players", "Unlimited invoices", "All features included", "Updates & new features", "24/7 support"].map(i => (
                  <li key={i} style={{ fontSize: 14, color: "#475569", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#6366f1", fontWeight: 800, fontSize: 13 }}>✓</span>{i}
                  </li>
                ))}
              </ul>
              <button onClick={() => setModal(true)} className="btn-primary" style={{ display: "block", width: "100%", textAlign: "center", color: "#fff", fontWeight: 800, fontSize: 15, padding: "15px", borderRadius: 13, border: "none", cursor: "pointer", boxShadow: "0 8px 28px rgba(79,70,229,.45)", letterSpacing: "-.2px" }}>
                Get started →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: "100px 24px", borderTop: "1px solid #0a0a14", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: "radial-gradient(ellipse,rgba(99,102,241,.1) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: 50, fontWeight: 900, letterSpacing: "-2px", marginBottom: 22, background: "linear-gradient(180deg,#f8fafc 40%,#475569 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Ready to run a<br />real business?
          </h2>
          <p style={{ fontSize: 18, color: "#334155", lineHeight: 1.7, marginBottom: 44 }}>
            Join academy directors who stopped drowning in admin work and started focusing on what matters — coaching.
          </p>
          <Link href="/signup" className="btn-primary" style={{ display: "inline-block", fontSize: 16, fontWeight: 800, color: "#fff", padding: "17px 48px", borderRadius: 14, textDecoration: "none", boxShadow: "0 10px 40px rgba(79,70,229,.55)", letterSpacing: "-.2px" }}>
            Start free trial →
          </Link>
          <p style={{ fontSize: 13, color: "#1e1e3a", marginTop: 24 }}>14 days free · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* Checkout Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <div style={{ background: "#0c0c18", border: "1px solid rgba(99,102,241,.25)", borderRadius: 22, padding: "44px 40px", width: "100%", maxWidth: 440, boxShadow: "0 40px 120px rgba(0,0,0,.8)" }}>
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc", letterSpacing: "-.5px", marginBottom: 8 }}>Subscribe to AcademyOS</p>
              <p style={{ fontSize: 14, color: "#475569" }}>$4,000/month — unlimited players, all features</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 8 }}>Academy Name</label>
                <input
                  value={academy}
                  onChange={e => setAcademy(e.target.value)}
                  placeholder="Miami Tennis Academy"
                  style={{ width: "100%", background: "#111127", border: "1px solid #1e1e3a", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#f8fafc", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 8 }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@academy.com"
                  style={{ width: "100%", background: "#111127", border: "1px solid #1e1e3a", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#f8fafc", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>
            {err && <p style={{ fontSize: 13, color: "#f87171", marginBottom: 14 }}>{err}</p>}
            <button onClick={handleCheckout} disabled={loading}
              style={{ width: "100%", background: "linear-gradient(135deg,#4f46e5,#2563eb)", color: "#fff", fontWeight: 800, fontSize: 15, padding: "15px", borderRadius: 13, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1, boxShadow: "0 8px 28px rgba(79,70,229,.45)", letterSpacing: "-.2px" }}>
              {loading ? "Redirecting..." : "Continue to payment →"}
            </button>
            <p style={{ fontSize: 12, color: "#1e1e3a", textAlign: "center", marginTop: 14 }}>Powered by Stripe · Secure checkout</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #0a0a14", padding: "36px 28px", background: "#040408" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#4f46e5,#2563eb)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 12 }}>A</div>
            <span style={{ fontWeight: 700, color: "#1e1e3a", fontSize: 14 }}>AcademyOS</span>
          </div>
          <p style={{ fontSize: 13, color: "#1a1a2e" }}>© 2025 AcademyOS. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24 }}>
            <Link href="/login" className="nav-a" style={{ fontSize: 13, color: "#1e1e3a", textDecoration: "none" }}>Sign in</Link>
            <Link href="/signup" className="nav-a" style={{ fontSize: 13, color: "#1e1e3a", textDecoration: "none" }}>Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
