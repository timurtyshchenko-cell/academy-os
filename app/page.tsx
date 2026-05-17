"use client";
import Link from "next/link";
import { useState } from "react";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#07070f", border: `1px solid ${open ? "rgba(99,102,241,.3)" : "#0f0f1e"}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "border-color .2s" }} onClick={() => setOpen(!open)}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px" }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", letterSpacing: "-.2px" }}>{q}</p>
        <span style={{ fontSize: 18, color: "#6366f1", fontWeight: 700, flexShrink: 0, marginLeft: 16, transform: open ? "rotate(45deg)" : "none", transition: "transform .2s" }}>+</span>
      </div>
      {open && <div style={{ padding: "0 24px 20px", fontSize: 14, color: "#64748b", lineHeight: 1.75, borderTop: "1px solid #0f0f1e", paddingTop: 16 }}>{a}</div>}
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
    <div style={{ background: "#030305", minHeight: "100vh", color: "#fff", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", overflowX: "hidden" }}>
      <style>{`
        @keyframes pulse-ring { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.15;transform:scale(1.15)} }
        @keyframes fadein { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes gradient-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        * { box-sizing:border-box; margin:0; padding:0 }
        .btn-main { background:linear-gradient(135deg,#4f46e5,#2563eb); color:#fff; font-weight:800; border:none; cursor:pointer; transition:all .2s; text-decoration:none; display:inline-block }
        .btn-main:hover { transform:translateY(-2px); box-shadow:0 16px 48px rgba(79,70,229,.5) !important }
        .btn-ghost { border:1px solid #1a1a2e; color:#475569; background:transparent; font-weight:600; cursor:pointer; transition:all .2s; text-decoration:none; display:inline-block }
        .btn-ghost:hover { border-color:#333; color:#e2e8f0; background:rgba(255,255,255,.04) }
        .card-hover { transition:all .25s }
        .card-hover:hover { border-color:rgba(99,102,241,.3) !important; transform:translateY(-3px); box-shadow:0 20px 60px rgba(0,0,0,.4) !important }
        .nav-link { color:#475569; text-decoration:none; font-size:14px; font-weight:500; transition:color .15s }
        .nav-link:hover { color:#e2e8f0 }
        @media(max-width:768px){
          .hero-h1{font-size:34px !important;letter-spacing:-0.5px !important;line-height:1.15 !important;padding:0 !important}
          .hero-sub{font-size:16px !important}
          .hero-btns{flex-direction:column !important;align-items:stretch !important}
          .hero-btns a, .hero-btns button{text-align:center !important}
          .dashboard-preview{display:none !important}
          .stats-grid{grid-template-columns:1fr 1fr !important}
          .features-grid{grid-template-columns:1fr !important}
          .feat-big{grid-column:1 !important}
          .steps-grid{grid-template-columns:1fr !important}
          .steps-line{display:none !important}
          .testimonials-grid{grid-template-columns:1fr !important}
          .pricing-grid{grid-template-columns:1fr !important}
          .section-h2{font-size:28px !important;letter-spacing:-1px !important}
          .nav-signin{display:none !important}
          .section{padding:60px 20px !important}
          .hero-inner{padding:0 20px !important}
          .compare-grid{grid-template-columns:1fr !important}
          .footer-inner{flex-direction:column !important;gap:16px !important;text-align:center !important}
        }
      `}</style>

      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(3,3,5,.9)", backdropFilter: "blur(32px)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#4f46e5,#2563eb)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 15, boxShadow: "0 4px 16px rgba(79,70,229,.5)", flexShrink: 0 }}>A</div>
            <span style={{ fontWeight: 800, color: "#f8fafc", fontSize: 17, letterSpacing: "-.4px" }}>AcademyOS</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Link href="/login" className="nav-link nav-signin" style={{ padding: "8px 16px", borderRadius: 8 }}>Sign in</Link>
            <Link href="/signup" className="btn-main" style={{ fontSize: 14, padding: "10px 22px", borderRadius: 10, boxShadow: "0 4px 20px rgba(79,70,229,.35)", letterSpacing: "-.2px" }}>
              Get started →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", paddingTop: 160, paddingBottom: 80, textAlign: "center" }}>
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 900, height: 700, background: "radial-gradient(ellipse,rgba(79,70,229,.15) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 200, left: "10%", width: 400, height: 400, background: "radial-gradient(ellipse,rgba(37,99,235,.06) 0%,transparent 70%)", pointerEvents: "none", animation: "float 6s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: 150, right: "8%", width: 300, height: 300, background: "radial-gradient(ellipse,rgba(124,58,237,.07) 0%,transparent 70%)", pointerEvents: "none", animation: "float 8s ease-in-out infinite reverse" }} />

        <div className="hero-inner" style={{ maxWidth: 800, margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 1, animation: "fadein .9s ease both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,.08)", border: "1px solid rgba(99,102,241,.2)", borderRadius: 100, padding: "7px 18px", marginBottom: 36 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#818cf8", display: "inline-block", boxShadow: "0 0 8px #818cf8", animation: "pulse-ring 2s ease infinite" }} />
            <span style={{ fontSize: 12, color: "#a5b4fc", fontWeight: 600, letterSpacing: ".05em" }}>Built exclusively for tennis academies</span>
          </div>

          <h1 className="hero-h1" style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-3.5px", marginBottom: 28 }}>
            <span style={{ background: "linear-gradient(180deg,#f8fafc 20%,#94a3b8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "block", paddingBottom: 6 }}>Run your academy</span>
            <span style={{ background: "linear-gradient(135deg,#a78bfa,#6366f1,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "block", paddingBottom: 6 }}>like a business.</span>
          </h1>

          <p className="hero-sub" style={{ fontSize: 20, color: "#475569", lineHeight: 1.7, marginBottom: 48, maxWidth: 540, margin: "0 auto 48px" }}>
            Players, coaches, schedules, billing, and parent emails — all in one place. Stop wasting hours on admin work.
          </p>

          <div className="hero-btns" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Link href="/book-demo" className="btn-main" style={{ fontSize: 16, padding: "16px 40px", borderRadius: 13, boxShadow: "0 8px 32px rgba(79,70,229,.5)", letterSpacing: "-.2px" }}>
              Book a Free Demo →
            </Link>
            <Link href="/signup" className="btn-ghost" style={{ fontSize: 16, padding: "16px 28px", borderRadius: 13 }}>
              Start free trial
            </Link>
          </div>
          <p style={{ fontSize: 13, color: "#1e293b", marginTop: 20 }}>14-day free trial · No credit card · Cancel anytime</p>
        </div>

        {/* Dashboard mockup */}
        <div className="dashboard-preview" style={{ maxWidth: 1020, margin: "72px auto 0", padding: "0 28px", position: "relative", zIndex: 1 }}>
          <div style={{ background: "linear-gradient(160deg,rgba(99,102,241,.35),rgba(37,99,235,.12),rgba(124,58,237,.2))", padding: 1, borderRadius: 24, boxShadow: "0 60px 160px rgba(0,0,0,.95)" }}>
            <div style={{ background: "#07070f", borderRadius: 23, overflow: "hidden" }}>
              <div style={{ background: "#0a0a14", borderBottom: "1px solid rgba(255,255,255,.04)", padding: "12px 18px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: .8 }} />)}
                </div>
                <div style={{ flex: 1, maxWidth: 260, margin: "0 auto", background: "rgba(255,255,255,.04)", borderRadius: 6, padding: "4px 12px", fontSize: 11, color: "#1e1e3a", textAlign: "center" }}>academy-os.app/app</div>
              </div>
              <div style={{ display: "flex", height: 380 }}>
                <div style={{ width: 185, borderRight: "1px solid rgba(255,255,255,.04)", padding: "20px 12px", background: "#07070f", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 18 }}>
                    <div style={{ width: 22, height: 22, background: "linear-gradient(135deg,#4f46e5,#2563eb)", borderRadius: 6 }} />
                    <div style={{ width: 65, height: 6, background: "#1a1a2e", borderRadius: 4 }} />
                  </div>
                  {[{l:"Overview",e:"📊",a:true},{l:"Players",e:"👥"},{l:"Billing",e:"💳"},{l:"Schedule",e:"📅"},{l:"Settings",e:"⚙️"}].map(item => (
                    <div key={item.l} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, marginBottom: 2, background: item.a ? "rgba(99,102,241,.12)" : "transparent", border: item.a ? "1px solid rgba(99,102,241,.18)" : "1px solid transparent" }}>
                      <span style={{ fontSize: 12 }}>{item.e}</span>
                      <span style={{ fontSize: 12, color: item.a ? "#a5b4fc" : "#1e1e3a", fontWeight: item.a ? 700 : 400 }}>{item.l}</span>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, padding: "22px 20px", background: "#050510", overflowY: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                      <div style={{ width: 100, height: 8, background: "#111128", borderRadius: 5, marginBottom: 6 }} />
                      <div style={{ width: 160, height: 5, background: "#0d0d1e", borderRadius: 4 }} />
                    </div>
                    <div style={{ width: 90, height: 28, background: "linear-gradient(135deg,#4f46e5,#2563eb)", borderRadius: 8, opacity: .8 }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
                    {[{v:"28",c:"#6366f1"},{v:"$52k",c:"#10b981"},{v:"$38k",c:"#10b981"},{v:"$14k",c:"#f59e0b"}].map((s,i) => (
                      <div key={i} style={{ background: "#0a0a1a", border: "1px solid #111128", borderRadius: 10, padding: "12px 13px" }}>
                        <div style={{ width: 40, height: 4, background: "#111128", borderRadius: 3, marginBottom: 8 }} />
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#e2e8f0", letterSpacing: "-.5px", marginBottom: 4 }}>{s.v}</div>
                        <div style={{ width: "60%", height: 2, background: s.c + "50", borderRadius: 2 }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[0,1].map(i => (
                      <div key={i} style={{ background: "#0a0a1a", border: "1px solid #111128", borderRadius: 10, padding: "13px" }}>
                        <div style={{ width: 80, height: 5, background: "#111128", borderRadius: 3, marginBottom: 12 }} />
                        {[0,1,2].map(j => (
                          <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: j<2?"1px solid #0d0d1e":"none" }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#111128", flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ width: "60%", height: 4, background: "#111128", borderRadius: 3, marginBottom: 3 }} />
                              <div style={{ width: "35%", height: 3, background: "#0d0d1e", borderRadius: 3 }} />
                            </div>
                            <div style={{ width: 36, height: 14, borderRadius: 100, background: ["#10b98118","#f59e0b18","#10b98118"][j] }} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: "60%", height: 60, background: "rgba(79,70,229,.18)", filter: "blur(60px)", borderRadius: "50%", pointerEvents: "none" }} />
        </div>
      </section>

      {/* Stats */}
      <div style={{ borderTop: "1px solid #0a0a14", borderBottom: "1px solid #0a0a14", background: "#040408" }}>
        <div className="stats-grid" style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          {[
            { v: "$10k", l: "One-time setup" },
            { v: "$4k", l: "Per month" },
            { v: "∞", l: "Players & invoices" },
            { v: "24/7", l: "Support included" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "30px 24px", textAlign: "center", borderRight: i < 3 ? "1px solid #0f0f1a" : "none" }}>
              <p style={{ fontSize: 30, fontWeight: 900, color: "#6366f1", letterSpacing: "-1px", marginBottom: 6 }}>{s.v}</p>
              <p style={{ fontSize: 12, color: "#1e293b", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Problem → Solution */}
      <section className="section" style={{ padding: "110px 24px", borderTop: "1px solid #0a0a14" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: ".16em", marginBottom: 14 }}>The problem</p>
            <h2 className="section-h2" style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", marginBottom: 16, background: "linear-gradient(180deg,#f8fafc 40%,#475569 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Running an academy is chaos.<br />It doesn't have to be.
            </h2>
          </div>
          <div className="compare-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#07070f", border: "1px solid #1a0a0a", borderRadius: 20, padding: 36 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 24 }}>❌ Without AcademyOS</p>
              {["3+ hours/month sending invoices manually","Chasing parents on WhatsApp for payments","Excel spreadsheets for player tracking","Missing sessions, losing revenue","No visibility on what's actually happening"].map(item => (
                <div key={item} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                  <span style={{ color: "#ef4444", fontSize: 16, flexShrink: 0, marginTop: 2 }}>✕</span>
                  <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.5 }}>{item}</p>
                </div>
              ))}
            </div>
            <div style={{ background: "linear-gradient(160deg,#0f0f20,#090916)", border: "1px solid rgba(99,102,241,.2)", borderRadius: 20, padding: 36, boxShadow: "0 0 60px rgba(99,102,241,.06)" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 24 }}>✅ With AcademyOS</p>
              {["Invoices generated & emailed in one click","Parents pay online via Stripe link","All players, sessions, coaches in one dashboard","Automated reminders for unpaid invoices","Live revenue & attendance at a glance"].map(item => (
                <div key={item} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                  <span style={{ color: "#10b981", fontSize: 16, flexShrink: 0, marginTop: 2 }}>✓</span>
                  <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.5 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ padding: "110px 24px", borderTop: "1px solid #0a0a14" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: ".16em", marginBottom: 14 }}>Features</p>
            <h2 className="section-h2" style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", marginBottom: 16, background: "linear-gradient(180deg,#f8fafc 40%,#475569 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Everything your academy needs
            </h2>
            <p style={{ fontSize: 17, color: "#334155", maxWidth: 460, margin: "0 auto" }}>One platform. No spreadsheets. No chaos.</p>
          </div>
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            <div className="card-hover feat-big" style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 20, padding: 36, gridColumn: "1 / 3" }}>
              <div style={{ width: 52, height: 52, background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.2)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 24 }}>👥</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0", marginBottom: 12, letterSpacing: "-.4px" }}>Player Management</h3>
              <p style={{ fontSize: 15, color: "#334155", lineHeight: 1.75, maxWidth: 440 }}>Complete profiles — age, level, coach, parent contacts, training history, payment status. Everything about every player, instantly accessible.</p>
            </div>
            <div className="card-hover" style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 20, padding: 32 }}>
              <div style={{ width: 46, height: 46, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.2)", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, marginBottom: 20 }}>💳</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0", marginBottom: 10, letterSpacing: "-.3px" }}>Smart Billing</h3>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.65 }}>Generate invoices for all players in one click. Email them with a Stripe payment link. Auto-mark paid when they pay.</p>
            </div>
            <div className="card-hover" style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 20, padding: 32 }}>
              <div style={{ width: 46, height: 46, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, marginBottom: 20 }}>📧</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0", marginBottom: 10, letterSpacing: "-.3px" }}>Parent Emails</h3>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.65 }}>Beautiful invoice and training report emails sent directly to parents. Reminders for unpaid invoices.</p>
            </div>
            <div className="card-hover" style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 20, padding: 32 }}>
              <div style={{ width: 46, height: 46, background: "rgba(139,92,246,.1)", border: "1px solid rgba(139,92,246,.2)", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, marginBottom: 20 }}>📅</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0", marginBottom: 10, letterSpacing: "-.3px" }}>Schedule & Sessions</h3>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.65 }}>Log training sessions, track hours, view attendance. Full history per player.</p>
            </div>
            <div className="card-hover" style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 20, padding: 32 }}>
              <div style={{ width: 46, height: 46, background: "rgba(6,182,212,.1)", border: "1px solid rgba(6,182,212,.2)", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, marginBottom: 20 }}>📊</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0", marginBottom: 10, letterSpacing: "-.3px" }}>Revenue Dashboard</h3>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.65 }}>Live MRR, collected vs pending, monthly chart. Know your numbers at a glance.</p>
            </div>
            <div className="card-hover" style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 20, padding: 32 }}>
              <div style={{ width: 46, height: 46, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, marginBottom: 20 }}>🔒</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0", marginBottom: 10, letterSpacing: "-.3px" }}>Your Data, Isolated</h3>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.65 }}>Multi-tenant architecture. Your academy data is 100% private and secure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" style={{ padding: "110px 24px", borderTop: "1px solid #0a0a14" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: ".16em", marginBottom: 14 }}>Process</p>
            <h2 className="section-h2" style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", background: "linear-gradient(180deg,#f8fafc 40%,#475569 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Up and running in 3 days</h2>
          </div>
          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, position: "relative" }}>
            <div className="steps-line" style={{ position: "absolute", top: 36, left: "18%", right: "18%", height: 1, background: "linear-gradient(90deg,transparent,rgba(99,102,241,.4),transparent)", pointerEvents: "none" }} />
            {[
              { n: "01", icon: "📋", title: "Send us your data", desc: "Share your player list, billing rates, and coach info. We set up everything in 24 hours." },
              { n: "02", icon: "🎓", title: "Team onboarding", desc: "30-minute call with your staff. Everyone is ready to log sessions and send invoices." },
              { n: "03", icon: "🚀", title: "Go live", desc: "Your academy runs on AcademyOS. Invoices go out, parents pay online, you see everything." },
            ].map(s => (
              <div key={s.n} className="card-hover" style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 20, padding: 36, textAlign: "center", position: "relative" }}>
                <div style={{ position: "absolute", top: 18, right: 20, fontSize: 11, fontWeight: 800, color: "#1e1e3a", letterSpacing: ".06em" }}>{s.n}</div>
                <div style={{ width: 58, height: 58, background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 22px" }}>{s.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0", marginBottom: 12, letterSpacing: "-.3px" }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ padding: "110px 24px", borderTop: "1px solid #0a0a14" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: ".16em", marginBottom: 14 }}>Testimonials</p>
            <h2 className="section-h2" style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", background: "linear-gradient(180deg,#f8fafc 40%,#475569 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Academy directors love it</h2>
          </div>
          <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              { quote: "We used to spend 3 hours every month sending invoices manually. Now it takes one click. Parents actually get real training reports — they love it.", name: "Carlos M.", role: "Director, Elite Tennis Academy", stars: 5 },
              { quote: "Finally a system built for tennis academies, not a generic CRM. The billing dashboard alone saved us from so many missed payments.", name: "Sarah K.", role: "Owner, ProTennis Club", stars: 5 },
              { quote: "Setup took 2 days. The team picked it up immediately. The invoice emails with the Pay Now button are a game-changer.", name: "David R.", role: "Head Coach & Director", stars: 5 },
            ].map(t => (
              <div key={t.name} className="card-hover" style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 20, padding: 32 }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
                  {Array(t.stars).fill(0).map((_, i) => <span key={i} style={{ color: "#f59e0b", fontSize: 15 }}>★</span>)}
                </div>
                <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.8, marginBottom: 28, fontStyle: "italic" }}>"{t.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#4f46e5,#2563eb)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{t.name[0]}</div>
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
      <section className="section" style={{ padding: "110px 24px", borderTop: "1px solid #0a0a14" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: ".16em", marginBottom: 14 }}>FAQ</p>
            <h2 className="section-h2" style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", background: "linear-gradient(180deg,#f8fafc 40%,#475569 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Common questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { q: "How long does setup take?", a: "Typically 2–3 business days. We handle everything — just send us your player list and billing details." },
              { q: "Can I cancel anytime?", a: "Yes. Cancel anytime. Your data stays accessible for 30 days after cancellation so you can export everything." },
              { q: "How many players can I add?", a: "Unlimited. No caps on players, coaches, invoices, or sessions." },
              { q: "Do parents need accounts?", a: "No. They receive invoice and report emails directly — no login required on their end." },
              { q: "Does it work on mobile?", a: "Yes. The dashboard works on all devices. You can also install it as an app on your phone home screen." },
              { q: "Is my data secure?", a: "Yes. Each academy's data is fully isolated. Encrypted connections and regular backups." },
            ].map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section" style={{ padding: "110px 24px", borderTop: "1px solid #0a0a14" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: ".16em", marginBottom: 14 }}>Pricing</p>
            <h2 className="section-h2" style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", marginBottom: 16, background: "linear-gradient(180deg,#f8fafc 40%,#475569 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Simple, honest pricing</h2>
            <p style={{ fontSize: 17, color: "#334155" }}>One setup fee. One monthly subscription. No surprises.</p>
          </div>
          <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card-hover" style={{ background: "#07070f", border: "1px solid #0f0f1e", borderRadius: 22, padding: 44 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 24 }}>One-Time Setup</p>
              <div style={{ marginBottom: 36 }}>
                <span style={{ fontSize: 56, fontWeight: 900, color: "#f8fafc", letterSpacing: "-2px" }}>$10k</span>
                <span style={{ fontSize: 16, color: "#334155", marginLeft: 8 }}>once</span>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
                {["Custom installation & config","Data migration from spreadsheets","Staff onboarding call","30-day priority support"].map(i => (
                  <li key={i} style={{ fontSize: 14, color: "#475569", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#10b981", fontWeight: 800 }}>✓</span>{i}
                  </li>
                ))}
              </ul>
              <Link href="/book-demo" className="btn-ghost" style={{ display: "block", width: "100%", textAlign: "center", fontSize: 15, fontWeight: 700, padding: "14px", borderRadius: 12 }}>Book a demo →</Link>
            </div>
            <div className="card-hover" style={{ background: "linear-gradient(160deg,#0f0f22,#09091c)", border: "1px solid rgba(99,102,241,.3)", borderRadius: 22, padding: 44, position: "relative", boxShadow: "0 0 80px rgba(99,102,241,.08)" }}>
              <div style={{ position: "absolute", top: -14, left: 32, background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "5px 16px", borderRadius: 100, letterSpacing: ".04em", boxShadow: "0 4px 12px rgba(99,102,241,.4)" }}>MONTHLY</div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 24 }}>Subscription</p>
              <div style={{ marginBottom: 36 }}>
                <span style={{ fontSize: 56, fontWeight: 900, color: "#f8fafc", letterSpacing: "-2px" }}>$4k</span>
                <span style={{ fontSize: 16, color: "#334155", marginLeft: 8 }}>/month</span>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
                {["Unlimited players & coaches","Unlimited invoices & emails","All features included","Monthly updates","24/7 support"].map(i => (
                  <li key={i} style={{ fontSize: 14, color: "#94a3b8", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#6366f1", fontWeight: 800 }}>✓</span>{i}
                  </li>
                ))}
              </ul>
              <button onClick={() => setModal(true)} className="btn-main" style={{ display: "block", width: "100%", textAlign: "center", fontSize: 15, fontWeight: 800, padding: "15px", borderRadius: 12, border: "none", boxShadow: "0 8px 32px rgba(79,70,229,.45)", letterSpacing: "-.2px" }}>
                Get started →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section" style={{ padding: "120px 24px", borderTop: "1px solid #0a0a14", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 500, background: "radial-gradient(ellipse,rgba(99,102,241,.12) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-2.5px", marginBottom: 24, background: "linear-gradient(180deg,#f8fafc 30%,#475569 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Ready to run a<br />real business?
          </h2>
          <p style={{ fontSize: 18, color: "#334155", lineHeight: 1.75, marginBottom: 48 }}>
            Join directors who stopped drowning in admin and started focusing on what matters — coaching.
          </p>
          <div className="hero-btns" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Link href="/signup" className="btn-main" style={{ fontSize: 17, fontWeight: 800, padding: "18px 52px", borderRadius: 14, boxShadow: "0 10px 44px rgba(79,70,229,.55)", letterSpacing: "-.2px" }}>
              Start free trial →
            </Link>
            <Link href="/book-demo" className="btn-ghost" style={{ fontSize: 16, padding: "18px 32px", borderRadius: 14 }}>
              Book a demo
            </Link>
          </div>
          <p style={{ fontSize: 13, color: "#1e293b", marginTop: 24 }}>14 days free · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* Checkout Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,.8)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <div style={{ background: "#0c0c18", border: "1px solid rgba(99,102,241,.25)", borderRadius: 24, padding: "44px 40px", width: "100%", maxWidth: 440, boxShadow: "0 40px 120px rgba(0,0,0,.8)" }}>
            <p style={{ fontSize: 22, fontWeight: 900, color: "#f8fafc", letterSpacing: "-.5px", marginBottom: 8 }}>Subscribe to AcademyOS</p>
            <p style={{ fontSize: 14, color: "#475569", marginBottom: 28 }}>$4,000/month — unlimited players, all features</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              {[{label:"Academy Name",val:academy,set:setAcademy,ph:"Miami Tennis Academy",type:"text"},{label:"Email",val:email,set:setEmail,ph:"you@academy.com",type:"email"}].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 8 }}>{f.label}</label>
                  <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                    style={{ width: "100%", background: "#111127", border: "1px solid #1e1e3a", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#f8fafc", outline: "none" }} />
                </div>
              ))}
            </div>
            {err && <p style={{ fontSize: 13, color: "#f87171", marginBottom: 14 }}>{err}</p>}
            <button onClick={handleCheckout} disabled={loading} className="btn-main"
              style={{ width: "100%", fontSize: 15, padding: "15px", borderRadius: 13, boxShadow: "0 8px 28px rgba(79,70,229,.45)", letterSpacing: "-.2px", opacity: loading ? .7 : 1 }}>
              {loading ? "Redirecting..." : "Continue to payment →"}
            </button>
            <p style={{ fontSize: 12, color: "#1e1e3a", textAlign: "center", marginTop: 14 }}>Powered by Stripe · Secure checkout</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #0a0a14", padding: "40px 28px", background: "#040408" }}>
        <div className="footer-inner" style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#4f46e5,#2563eb)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 12 }}>A</div>
            <span style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>AcademyOS</span>
          </div>
          <p style={{ fontSize: 13, color: "#1a1a2e" }}>© 2025 AcademyOS. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24 }}>
            <Link href="/login" className="nav-link" style={{ fontSize: 13, color: "#1e293b" }}>Sign in</Link>
            <Link href="/signup" className="nav-link" style={{ fontSize: 13, color: "#1e293b" }}>Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
