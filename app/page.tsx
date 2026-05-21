"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("revealed"); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#122028", border: `1px solid ${open ? "rgba(31,107,69,.3)" : "rgba(255,255,255,.08)"}`, borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "border-color .2s" }} onClick={() => setOpen(!open)}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px" }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#F5F7FA", letterSpacing: "-.2px" }}>{q}</p>
        <span style={{ fontSize: 20, color: "#1F6B45", fontWeight: 400, flexShrink: 0, marginLeft: 16, transform: open ? "rotate(45deg)" : "none", transition: "transform .2s" }}>+</span>
      </div>
      {open && <div style={{ padding: "0 24px 20px", fontSize: 14, color: "#97A6B2", lineHeight: 1.8, borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 16 }}>{a}</div>}
    </div>
  );
}

export default function LandingPage() {
  const revealStats = useReveal();
  const revealProblem = useReveal();
  const revealFeatures = useReveal();
  const revealProcess = useReveal();
  const revealTestimonials = useReveal();
  const revealFaq = useReveal();
  const revealPricing = useReveal();
  const revealCta = useReveal();

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
    <div style={{ background: "#081418", minHeight: "100vh", color: "#F5F7FA", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{`
        @keyframes pulse-slow { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:.3;transform:scale(1.1)} }
        @keyframes fadein { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        * { box-sizing:border-box; margin:0; padding:0 }
        h1 { overflow:visible !important }
        .btn-cta { background:#FFD447; color:#081418; font-weight:800; border:none; cursor:pointer; transition:all .2s; text-decoration:none; display:inline-block; letter-spacing:-.2px }
        .btn-cta:hover { transform:translateY(-1px); box-shadow:0 8px 28px rgba(255,212,71,.3) !important }
        .btn-outline { border:1px solid rgba(255,255,255,.12); color:#97A6B2; background:transparent; font-weight:600; cursor:pointer; transition:all .2s; text-decoration:none; display:inline-block }
        .btn-outline:hover { border-color:rgba(255,255,255,.22); color:#F5F7FA; background:rgba(255,255,255,.04) }
        .card-hover { transition:transform .25s, border-color .25s, box-shadow .25s }
        .card-hover:hover { border-color:rgba(31,107,69,.35) !important; transform:translateY(-2px); box-shadow:0 16px 40px rgba(0,0,0,.4) !important }
        .nav-link { color:#97A6B2; text-decoration:none; font-size:14px; font-weight:500; transition:color .15s }
        .nav-link:hover { color:#F5F7FA }
        @media(max-width:768px){
          .hero-h1{font-size:40px !important;letter-spacing:-1px !important;line-height:1.1 !important;padding:0 !important;word-break:break-word}
          .hero-sub{font-size:16px !important}
          .hero-btns{flex-direction:column !important;align-items:stretch !important}
          .hero-btns a,.hero-btns button{text-align:center !important}
          .dashboard-preview{display:none !important}
          .stats-grid{grid-template-columns:1fr 1fr !important}
          .features-grid{grid-template-columns:1fr !important}
          .feat-big{grid-column:1 !important}
          .steps-grid{grid-template-columns:1fr !important}
          .steps-line{display:none !important}
          .testimonials-grid{grid-template-columns:1fr !important}
          .pricing-grid{grid-template-columns:1fr !important}
          .section-h2{font-size:28px !important;letter-spacing:-.5px !important}
          .nav-signin{display:none !important}
          .section{padding:64px 20px !important}
          .hero-inner{padding:0 20px !important;overflow:visible !important}
          .compare-grid{grid-template-columns:1fr !important}
          .footer-inner{flex-direction:column !important;gap:16px !important;text-align:center !important}
        }
        .reveal-section { opacity:0; transform:translateY(28px); transition:opacity .7s ease,transform .7s ease }
        .reveal-section.revealed { opacity:1; transform:translateY(0) }
      `}</style>

      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(8,20,24,.96)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#1F6B45", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#FFD447", fontSize: 16, flexShrink: 0 }}>A</div>
            <span style={{ fontWeight: 700, color: "#F5F7FA", fontSize: 18, letterSpacing: "-.3px" }}>AcademyOS</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/login" className="nav-link nav-signin" style={{ padding: "8px 16px", borderRadius: 8 }}>Sign in</Link>
            <Link href="/signup" className="btn-cta" style={{ fontSize: 14, padding: "10px 22px", borderRadius: 12 }}>
              Get started →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", paddingTop: 160, paddingBottom: 80, textAlign: "center" }}>
        <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 800, height: 600, background: "radial-gradient(ellipse,rgba(31,107,69,.12) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 220, left: "8%", width: 360, height: 360, background: "radial-gradient(ellipse,rgba(24,179,164,.05) 0%,transparent 70%)", pointerEvents: "none", animation: "float 7s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: 160, right: "6%", width: 280, height: 280, background: "radial-gradient(ellipse,rgba(255,212,71,.04) 0%,transparent 70%)", pointerEvents: "none", animation: "float 9s ease-in-out infinite reverse" }} />

        <div className="hero-inner" style={{ maxWidth: 820, margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 1, animation: "fadein .8s ease both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(31,107,69,.1)", border: "1px solid rgba(31,107,69,.22)", borderRadius: 100, padding: "7px 18px", marginBottom: 40 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "pulse-slow 2.5s ease infinite" }} />
            <span style={{ fontSize: 12, color: "#97A6B2", fontWeight: 600, letterSpacing: ".06em" }}>Built exclusively for tennis academies</span>
          </div>

          <h1 className="hero-h1" style={{ fontSize: 90, fontWeight: 900, lineHeight: 1.04, letterSpacing: "-3px", marginBottom: 28, overflow: "visible" }}>
            <span style={{ color: "#F5F7FA", display: "block", overflow: "visible" }}>Run your academy</span>
            <span style={{ color: "#FFD447", display: "block", overflow: "visible" }}>like a business.</span>
          </h1>

          <p className="hero-sub" style={{ fontSize: 19, color: "#97A6B2", lineHeight: 1.75, maxWidth: 520, margin: "0 auto 48px" }}>
            Players, coaches, schedules, billing, and parent emails — all in one place. Stop wasting hours on admin work.
          </p>

          <div className="hero-btns" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/book-demo" className="btn-cta" style={{ fontSize: 16, padding: "15px 40px", borderRadius: 14 }}>
              Book a Free Demo →
            </Link>
            <Link href="/signup" className="btn-outline" style={{ fontSize: 16, padding: "15px 28px", borderRadius: 14 }}>
              Start free trial
            </Link>
          </div>
          <p style={{ fontSize: 13, color: "#97A6B2", marginTop: 20, opacity: .7 }}>14-day free trial · No credit card · Cancel anytime</p>
        </div>

        {/* Dashboard mockup */}
        <div className="dashboard-preview" style={{ maxWidth: 1020, margin: "72px auto 0", padding: "0 28px", position: "relative", zIndex: 1 }}>
          <div style={{ background: "linear-gradient(160deg,rgba(31,107,69,.35),rgba(24,179,164,.1),rgba(8,20,24,.8))", padding: 1, borderRadius: 20, boxShadow: "0 60px 140px rgba(0,0,0,.9)" }}>
            <div style={{ background: "#0b1a20", borderRadius: 19, overflow: "hidden" }}>
              <div style={{ background: "#081418", borderBottom: "1px solid rgba(255,255,255,.06)", padding: "12px 18px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: .8 }} />)}
                </div>
                <div style={{ flex: 1, maxWidth: 260, margin: "0 auto", background: "rgba(255,255,255,.04)", borderRadius: 6, padding: "4px 12px", fontSize: 11, color: "#97A6B2", textAlign: "center" }}>academy-os.app/app</div>
              </div>
              <div style={{ display: "flex", height: 380 }}>
                <div style={{ width: 185, borderRight: "1px solid rgba(255,255,255,.06)", padding: "20px 12px", background: "#081418", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 18 }}>
                    <div style={{ width: 22, height: 22, background: "#1F6B45", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#FFD447" }}>A</div>
                    <div style={{ width: 65, height: 5, background: "rgba(255,255,255,.07)", borderRadius: 4 }} />
                  </div>
                  {[{l:"Overview",a:true},{l:"Players"},{l:"Billing"},{l:"Schedule"},{l:"Settings"}].map(item => (
                    <div key={item.l} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, marginBottom: 2, background: item.a ? "rgba(31,107,69,.15)" : "transparent", boxShadow: item.a ? "inset 3px 0 0 #1F6B45" : "none" }}>
                      <span style={{ fontSize: 12, color: item.a ? "#4ade80" : "#97A6B2", fontWeight: item.a ? 600 : 400 }}>{item.l}</span>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, padding: "22px 20px", background: "#0d1a20", overflowY: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                      <div style={{ width: 100, height: 7, background: "rgba(255,255,255,.08)", borderRadius: 5, marginBottom: 6 }} />
                      <div style={{ width: 160, height: 4, background: "rgba(255,255,255,.05)", borderRadius: 4 }} />
                    </div>
                    <div style={{ width: 90, height: 28, background: "#FFD447", borderRadius: 10, opacity: .9 }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
                    {[{v:"28",c:"#1F6B45"},{v:"$52k",c:"#10b981"},{v:"$38k",c:"#10b981"},{v:"$14k",c:"#FFD447"}].map((s,i) => (
                      <div key={i} style={{ background: "#122028", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "12px 13px" }}>
                        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,.07)", borderRadius: 3, marginBottom: 8 }} />
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#F5F7FA", letterSpacing: "-.5px", marginBottom: 4 }}>{s.v}</div>
                        <div style={{ width: "60%", height: 2, background: s.c + "50", borderRadius: 2 }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[0,1].map(i => (
                      <div key={i} style={{ background: "#122028", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "13px" }}>
                        <div style={{ width: 80, height: 4, background: "rgba(255,255,255,.07)", borderRadius: 3, marginBottom: 12 }} />
                        {[0,1,2].map(j => (
                          <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: j<2?"1px solid rgba(255,255,255,.05)":"none" }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,.07)", flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ width: "60%", height: 4, background: "rgba(255,255,255,.07)", borderRadius: 3, marginBottom: 3 }} />
                              <div style={{ width: "35%", height: 3, background: "rgba(255,255,255,.04)", borderRadius: 3 }} />
                            </div>
                            <div style={{ width: 36, height: 14, borderRadius: 100, background: ["rgba(31,107,69,.2)","rgba(255,212,71,.15)","rgba(31,107,69,.2)"][j] }} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div ref={revealStats} className="reveal-section" style={{ borderTop: "1px solid rgba(255,255,255,.07)", borderBottom: "1px solid rgba(255,255,255,.07)", background: "#0b1a20" }}>
        <div className="stats-grid" style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          {[
            { v: "$10k", l: "One-time setup" },
            { v: "$4k", l: "Per month" },
            { v: "∞", l: "Players & invoices" },
            { v: "24/7", l: "Support included" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "32px 24px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
              <p style={{ fontSize: 32, fontWeight: 900, color: "#FFD447", letterSpacing: "-1px", marginBottom: 8 }}>{s.v}</p>
              <p style={{ fontSize: 11, color: "#97A6B2", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Problem → Solution */}
      <section ref={revealProblem} className="section reveal-section" style={{ padding: "110px 24px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#18B3A4", textTransform: "uppercase", letterSpacing: ".18em", marginBottom: 14 }}>The problem</p>
            <h2 className="section-h2" style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", marginBottom: 16, color: "#F5F7FA" }}>
              Running an academy is chaos.<br />It doesn't have to be.
            </h2>
          </div>
          <div className="compare-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#122028", border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 36 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 24 }}>Without AcademyOS</p>
              {["3+ hours/month sending invoices manually","Chasing parents on WhatsApp for payments","Excel spreadsheets for player tracking","Missing sessions, losing revenue","No visibility on what's actually happening"].map(item => (
                <div key={item} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                  <span style={{ color: "#ef4444", fontSize: 14, flexShrink: 0, marginTop: 2, fontWeight: 700 }}>✕</span>
                  <p style={{ fontSize: 14, color: "#97A6B2", lineHeight: 1.6 }}>{item}</p>
                </div>
              ))}
            </div>
            <div style={{ background: "#1A2B34", border: "1px solid rgba(31,107,69,.25)", borderRadius: 18, padding: 36 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 24 }}>With AcademyOS</p>
              {["Invoices generated & emailed in one click","Parents pay online via Stripe link","All players, sessions, coaches in one dashboard","Automated reminders for unpaid invoices","Live revenue & attendance at a glance"].map(item => (
                <div key={item} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                  <span style={{ color: "#4ade80", fontSize: 14, flexShrink: 0, marginTop: 2, fontWeight: 700 }}>✓</span>
                  <p style={{ fontSize: 14, color: "#97A6B2", lineHeight: 1.6 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section ref={revealFeatures} className="section reveal-section" style={{ padding: "110px 24px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#18B3A4", textTransform: "uppercase", letterSpacing: ".18em", marginBottom: 14 }}>Features</p>
            <h2 className="section-h2" style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", marginBottom: 16, color: "#F5F7FA" }}>
              Everything your academy needs
            </h2>
            <p style={{ fontSize: 17, color: "#97A6B2", maxWidth: 440, margin: "0 auto" }}>One platform. No spreadsheets. No chaos.</p>
          </div>
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            <div className="card-hover feat-big" style={{ background: "#122028", border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 36, gridColumn: "1 / 3" }}>
              <div style={{ width: 50, height: 50, background: "rgba(31,107,69,.15)", border: "1px solid rgba(31,107,69,.25)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 22 }}>👥</div>
              <h3 style={{ fontSize: 21, fontWeight: 800, color: "#F5F7FA", marginBottom: 12, letterSpacing: "-.4px" }}>Player Management</h3>
              <p style={{ fontSize: 14, color: "#97A6B2", lineHeight: 1.8, maxWidth: 440 }}>Complete profiles — age, level, coach, parent contacts, training history, payment status. Everything about every player, instantly accessible.</p>
            </div>
            {[
              { icon: "💳", title: "Smart Billing", desc: "Generate invoices for all players in one click. Email with a Stripe payment link. Auto-mark paid.", c: "rgba(31,107,69,.15)", cb: "rgba(31,107,69,.25)" },
              { icon: "📧", title: "Parent Emails", desc: "Beautiful invoice and training report emails. Reminders for unpaid invoices automatically.", c: "rgba(255,212,71,.1)", cb: "rgba(255,212,71,.2)" },
              { icon: "📅", title: "Schedule & Sessions", desc: "Log training sessions, track hours, view attendance. Full history per player.", c: "rgba(24,179,164,.1)", cb: "rgba(24,179,164,.2)" },
              { icon: "📊", title: "Revenue Dashboard", desc: "Live MRR, collected vs pending, monthly chart. Know your numbers at a glance.", c: "rgba(31,107,69,.15)", cb: "rgba(31,107,69,.25)" },
              { icon: "🔒", title: "Your Data, Isolated", desc: "Multi-tenant architecture. Your academy data is 100% private and secure.", c: "rgba(255,212,71,.1)", cb: "rgba(255,212,71,.2)" },
            ].map(f => (
              <div key={f.title} className="card-hover" style={{ background: "#122028", border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 28 }}>
                <div style={{ width: 44, height: 44, background: f.c, border: `1px solid ${f.cb}`, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#F5F7FA", marginBottom: 10, letterSpacing: "-.3px" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "#97A6B2", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section ref={revealProcess} className="section reveal-section" style={{ padding: "110px 24px", borderTop: "1px solid rgba(255,255,255,.06)", background: "#0b1a20" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#18B3A4", textTransform: "uppercase", letterSpacing: ".18em", marginBottom: 14 }}>Process</p>
            <h2 className="section-h2" style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", color: "#F5F7FA" }}>Up and running in 3 days</h2>
          </div>
          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, position: "relative" }}>
            <div className="steps-line" style={{ position: "absolute", top: 34, left: "18%", right: "18%", height: 1, background: "linear-gradient(90deg,transparent,rgba(31,107,69,.4),transparent)", pointerEvents: "none" }} />
            {[
              { n: "01", icon: "📋", title: "Send us your data", desc: "Share your player list, billing rates, and coach info. We set up everything in 24 hours." },
              { n: "02", icon: "🎓", title: "Team onboarding", desc: "30-minute call with your staff. Everyone is ready to log sessions and send invoices." },
              { n: "03", icon: "🚀", title: "Go live", desc: "Your academy runs on AcademyOS. Invoices go out, parents pay online, you see everything." },
            ].map(s => (
              <div key={s.n} className="card-hover" style={{ background: "#122028", border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 32, textAlign: "center", position: "relative" }}>
                <div style={{ position: "absolute", top: 16, right: 18, fontSize: 11, fontWeight: 700, color: "#FFD447", letterSpacing: ".08em", opacity: .7 }}>{s.n}</div>
                <div style={{ width: 56, height: 56, background: "rgba(31,107,69,.12)", border: "1px solid rgba(31,107,69,.22)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 20px" }}>{s.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#F5F7FA", marginBottom: 10, letterSpacing: "-.3px" }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "#97A6B2", lineHeight: 1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={revealTestimonials} className="section reveal-section" style={{ padding: "110px 24px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#18B3A4", textTransform: "uppercase", letterSpacing: ".18em", marginBottom: 14 }}>Testimonials</p>
            <h2 className="section-h2" style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", color: "#F5F7FA" }}>Academy directors love it</h2>
          </div>
          <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              { quote: "We used to spend 3 hours every month sending invoices manually. Now it takes one click. Parents actually get real training reports — they love it.", name: "Carlos M.", role: "Director, Elite Tennis Academy" },
              { quote: "Finally a system built for tennis academies, not a generic CRM. The billing dashboard alone saved us from so many missed payments.", name: "Sarah K.", role: "Owner, ProTennis Club" },
              { quote: "Setup took 2 days. The team picked it up immediately. The invoice emails with the Pay Now button are a game-changer.", name: "David R.", role: "Head Coach & Director" },
            ].map(t => (
              <div key={t.name} className="card-hover" style={{ background: "#122028", border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 30 }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 18 }}>
                  {Array(5).fill(0).map((_, i) => <span key={i} style={{ color: "#FFD447", fontSize: 14 }}>★</span>)}
                </div>
                <p style={{ fontSize: 14, color: "#97A6B2", lineHeight: 1.85, marginBottom: 24, fontStyle: "italic" }}>"{t.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, background: "#1F6B45", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#FFD447", flexShrink: 0 }}>{t.name[0]}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#F5F7FA" }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: "#97A6B2" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={revealFaq} className="section reveal-section" style={{ padding: "110px 24px", borderTop: "1px solid rgba(255,255,255,.06)", background: "#0b1a20" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#18B3A4", textTransform: "uppercase", letterSpacing: ".18em", marginBottom: 14 }}>FAQ</p>
            <h2 className="section-h2" style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", color: "#F5F7FA" }}>Common questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
      <section ref={revealPricing} className="section reveal-section" style={{ padding: "110px 24px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#18B3A4", textTransform: "uppercase", letterSpacing: ".18em", marginBottom: 14 }}>Pricing</p>
            <h2 className="section-h2" style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", marginBottom: 16, color: "#F5F7FA" }}>Simple, honest pricing</h2>
            <p style={{ fontSize: 16, color: "#97A6B2" }}>One setup fee. One monthly subscription. No surprises.</p>
          </div>
          <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="card-hover" style={{ background: "#122028", border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 44 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#97A6B2", textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 24 }}>One-Time Setup</p>
              <div style={{ marginBottom: 36 }}>
                <span style={{ fontSize: 54, fontWeight: 900, color: "#F5F7FA", letterSpacing: "-2px" }}>$10k</span>
                <span style={{ fontSize: 15, color: "#97A6B2", marginLeft: 8 }}>once</span>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
                {["Custom installation & config","Data migration from spreadsheets","Staff onboarding call","30-day priority support"].map(i => (
                  <li key={i} style={{ fontSize: 14, color: "#97A6B2", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#1F6B45", fontWeight: 800, fontSize: 15 }}>✓</span>{i}
                  </li>
                ))}
              </ul>
              <Link href="/book-demo" className="btn-outline" style={{ display: "block", width: "100%", textAlign: "center", fontSize: 14, fontWeight: 700, padding: "13px", borderRadius: 13 }}>Book a demo →</Link>
            </div>
            <div className="card-hover" style={{ background: "#1A2B34", border: "1px solid rgba(31,107,69,.3)", borderRadius: 18, padding: 44, position: "relative" }}>
              <div style={{ position: "absolute", top: -13, left: 28, background: "#FFD447", color: "#081418", fontSize: 11, fontWeight: 800, padding: "4px 14px", borderRadius: 100, letterSpacing: ".06em" }}>MONTHLY</div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#18B3A4", textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 24 }}>Subscription</p>
              <div style={{ marginBottom: 36 }}>
                <span style={{ fontSize: 54, fontWeight: 900, color: "#F5F7FA", letterSpacing: "-2px" }}>$4k</span>
                <span style={{ fontSize: 15, color: "#97A6B2", marginLeft: 8 }}>/month</span>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
                {["Unlimited players & coaches","Unlimited invoices & emails","All features included","Monthly updates","24/7 support"].map(i => (
                  <li key={i} style={{ fontSize: 14, color: "#97A6B2", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#FFD447", fontWeight: 800, fontSize: 15 }}>✓</span>{i}
                  </li>
                ))}
              </ul>
              <button onClick={() => setModal(true)} className="btn-cta" style={{ display: "block", width: "100%", textAlign: "center", fontSize: 15, padding: "14px", borderRadius: 13, border: "none" }}>
                Get started →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section ref={revealCta} className="section reveal-section" style={{ padding: "120px 24px", borderTop: "1px solid rgba(255,255,255,.06)", background: "#0b1a20", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: "radial-gradient(ellipse,rgba(31,107,69,.1) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-2.5px", marginBottom: 24, color: "#F5F7FA", lineHeight: 1.1 }}>
            Ready to run a<br /><span style={{ color: "#FFD447" }}>real business?</span>
          </h2>
          <p style={{ fontSize: 17, color: "#97A6B2", lineHeight: 1.8, marginBottom: 48 }}>
            Join directors who stopped drowning in admin and started focusing on what matters — coaching.
          </p>
          <div className="hero-btns" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/signup" className="btn-cta" style={{ fontSize: 17, fontWeight: 800, padding: "16px 52px", borderRadius: 14 }}>
              Start free trial →
            </Link>
            <Link href="/book-demo" className="btn-outline" style={{ fontSize: 15, padding: "16px 32px", borderRadius: 14 }}>
              Book a demo
            </Link>
          </div>
          <p style={{ fontSize: 13, color: "#97A6B2", marginTop: 24, opacity: .6 }}>14 days free · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* Checkout Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,.75)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <div style={{ background: "#122028", border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: "44px 40px", width: "100%", maxWidth: 440, boxShadow: "0 40px 100px rgba(0,0,0,.7)" }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#F5F7FA", letterSpacing: "-.5px", marginBottom: 8 }}>Subscribe to AcademyOS</p>
            <p style={{ fontSize: 14, color: "#97A6B2", marginBottom: 28 }}>$4,000/month — unlimited players, all features</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              {[{label:"Academy Name",val:academy,set:setAcademy,ph:"Miami Tennis Academy",type:"text"},{label:"Email",val:email,set:setEmail,ph:"you@academy.com",type:"email"}].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#97A6B2", textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 8 }}>{f.label}</label>
                  <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                    style={{ width: "100%", background: "#1A2B34", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#F5F7FA", outline: "none" }} />
                </div>
              ))}
            </div>
            {err && <p style={{ fontSize: 13, color: "#f87171", marginBottom: 14 }}>{err}</p>}
            <button onClick={handleCheckout} disabled={loading} className="btn-cta"
              style={{ width: "100%", fontSize: 15, padding: "14px", borderRadius: 13, opacity: loading ? .7 : 1 }}>
              {loading ? "Redirecting..." : "Continue to payment →"}
            </button>
            <p style={{ fontSize: 12, color: "#97A6B2", textAlign: "center", marginTop: 14, opacity: .6 }}>Powered by Stripe · Secure checkout</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,.07)", padding: "36px 28px", background: "#081418" }}>
        <div className="footer-inner" style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, background: "#1F6B45", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#FFD447", fontSize: 11 }}>A</div>
            <span style={{ fontWeight: 600, color: "#97A6B2", fontSize: 14 }}>AcademyOS</span>
          </div>
          <p style={{ fontSize: 13, color: "#97A6B2", opacity: .5 }}>© 2025 AcademyOS. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24 }}>
            <Link href="/login" className="nav-link">Sign in</Link>
            <Link href="/signup" className="nav-link">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
