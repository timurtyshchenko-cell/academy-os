"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n/context";
import { LOCALE_MAP } from "@/lib/i18n/translations";

interface Player { id: number; name: string; monthly_fee: number; status: string }
interface Invoice { id: number; amount: number; status: string; month: string; created_at: string }
interface Session { id: number; player_name: string; date: string; duration: number; type: string; coach_name: string }

const SESSION_META: Record<string, { icon: string; color: string }> = {
  Training: { icon: "🎯", color: "#1F6B45" },
  Match: { icon: "🎾", color: "#FFD447" },
  Fitness: { icon: "💪", color: "#18B3A4" },
  "Serve Practice": { icon: "🏆", color: "#e07b4f" },
  Doubles: { icon: "👥", color: "#9b59b6" },
  "Video Analysis": { icon: "📹", color: "#607080" },
};

function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return "goodMorning" as const;
  if (h < 17) return "goodAfternoon" as const;
  return "goodEvening" as const;
}

export default function Overview() {
  const { lang, t } = useLang();
  const [players, setPlayers] = useState<Player[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/players"), fetch("/api/invoices"), fetch("/api/sessions")])
      .then(async ([pr, ir, sr]) => {
        const [pd, id, sd] = await Promise.all([pr.json(), ir.json(), sr.json()]);
        setPlayers(pd.players || []);
        setInvoices(id.invoices || []);
        setSessions(sd.sessions || []);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "#1F6B45", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  const activePlayers = players.filter(p => p.status === "active");
  const mrr = activePlayers.reduce((s, p) => s + p.monthly_fee, 0);
  const collected = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0);
  const pendingCount = invoices.filter(i => i.status !== "paid").length;
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const sessionsThisMonth = sessions.filter(s => s.date?.startsWith(thisMonth));
  const sessionsToday = sessions.filter(s => s.date === today);
  const totalHoursThisMonth = (sessionsThisMonth.reduce((s, r) => s + (r.duration || 0), 0) / 60).toFixed(1);

  const monthlyRevenue = (() => {
    const months: { label: string; key: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleString(LOCALE_MAP[lang], { month: "short" }), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` });
    }
    return months.map(m => ({
      label: m.label,
      isCurrent: m.key === thisMonth,
      collected: invoices.filter(i => i.status === "paid" && (i.created_at || "").startsWith(m.key)).reduce((s, i) => s + i.amount, 0),
      pending: invoices.filter(i => i.status !== "paid" && (i.created_at || "").startsWith(m.key)).reduce((s, i) => s + i.amount, 0),
    }));
  })();
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.collected + m.pending), 1);

  const d = t.dashboard;
  const stats = [
    { label: d.activePlayers, value: activePlayers.length, sub: `${players.length} ${d.totalEnrolled}`, accent: "#1F6B45", icon: "👥", href: "/app/players" },
    { label: d.monthlyMrr, value: `$${mrr.toLocaleString()}`, sub: d.recurringRevenue, accent: "#1F6B45", icon: "💰", href: "/app/billing" },
    { label: d.collected, value: `$${collected.toLocaleString()}`, sub: d.invoicesPaid, accent: "#059669", icon: "✅", href: "/app/billing" },
    { label: d.pending, value: `$${pending.toLocaleString()}`, sub: `${pendingCount} ${pendingCount !== 1 ? d.invoicesDue : d.invoiceDue}`, accent: pendingCount > 0 ? "#f59e0b" : "#1F6B45", icon: "⏳", href: "/app/billing" },
    { label: d.sessionsPerMonth, value: sessionsThisMonth.length, sub: `${totalHoursThisMonth}${d.hoursTrainedSuffix}`, accent: "#18B3A4", icon: "🎾", href: "/app/schedule" },
    { label: d.today, value: sessionsToday.length, sub: sessionsToday.length === 0 ? d.noSessions : d.sessionsScheduled, accent: sessionsToday.length > 0 ? "#FFD447" : "var(--c-text-dim)", icon: "📅", href: "/app/schedule" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: 12, color: "#18B3A4", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>{new Date().toLocaleDateString(LOCALE_MAP[lang], { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 0 }}>{d[greetingKey()]} 👋</h1>
        </div>
        <Link href="/app/players" style={{ background: "#1F6B45", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, border: "none", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(31,107,69,.3)" }}>
          {d.addPlayer}
        </Link>
      </div>

      {/* Onboarding (empty state) */}
      {players.length === 0 && (
        <div style={{ background: "linear-gradient(135deg, #0e1e26, #122028)", border: "1px solid rgba(31,107,69,.25)", borderRadius: 18, padding: "28px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#1F6B45,#18B3A4)" }} />
          <p style={{ fontSize: 18, fontWeight: 800, color: "var(--c-text)", marginBottom: 4 }}>{d.welcomeTitle}</p>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)", marginBottom: 22, lineHeight: 1.6 }}>{d.welcomeDesc}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { n: "1", text: d.step1Text, href: "/app/players", btn: d.step1Btn, done: false },
              { n: "2", text: d.step2Text, href: "/app/billing", btn: d.step2Btn, done: false },
              { n: "3", text: d.step3Text, href: "/app/schedule", btn: d.step3Btn, done: false },
            ].map(s => (
              <div key={s.n} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12, padding: "13px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 26, height: 26, background: "#1F6B45", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{s.n}</div>
                  <span style={{ fontSize: 14, color: "var(--c-text-2)" }}>{s.text}</span>
                </div>
                <Link href={s.href} style={{ fontSize: 12, fontWeight: 700, color: "#18B3A4", textDecoration: "none", whiteSpace: "nowrap", background: "rgba(24,179,164,.1)", padding: "5px 12px", borderRadius: 8 }}>{s.btn}</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 10 }}>
        {stats.map(({ label, value, sub, accent, icon, href }) => (
          <Link key={label} href={href} style={{ textDecoration: "none" }}>
            <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 14, padding: "16px 18px", cursor: "pointer", transition: "border-color .2s, transform .15s", boxShadow: "var(--c-shadow)", borderLeft: `3px solid ${accent}` }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border-hover)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: "var(--c-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</p>
                <span style={{ fontSize: 15, background: accent + "15", borderRadius: 8, padding: "4px 6px" }}>{icon}</span>
              </div>
              <p style={{ fontSize: 26, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 4, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 12, color: accent === "var(--c-text-dim)" ? "var(--c-text-dim)" : accent + "cc" }}>{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue chart */}
      <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: "24px 24px 20px", boxShadow: "var(--c-shadow)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 12, color: "var(--c-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 2 }}>{d.revenue}</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-.5px" }}>${(collected + pending).toLocaleString()} <span style={{ fontSize: 13, fontWeight: 500, color: "var(--c-text-muted)" }}>{d.lastSixMonths}</span></p>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, background: "#1F6B45", borderRadius: 2 }} /><span style={{ fontSize: 11, color: "var(--c-text-dim)" }}>{d.collected}</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, background: "rgba(245,158,11,.4)", borderRadius: 2, border: "1px solid #f59e0b" }} /><span style={{ fontSize: 11, color: "var(--c-text-dim)" }}>{d.pending}</span></div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
          {monthlyRevenue.map(m => {
            const total = m.collected + m.pending;
            return (
              <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                {total > 0 && <p style={{ fontSize: 10, color: "var(--c-text-dim)", fontWeight: 600, whiteSpace: "nowrap" }}>${total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total}</p>}
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, height: 96, justifyContent: "flex-end" }}>
                  {m.pending > 0 && (
                    <div title={`Pending $${m.pending}`} style={{ width: "100%", height: `${Math.max((m.pending / maxRevenue) * 96, 4)}px`, background: "rgba(245,158,11,.35)", borderRadius: "4px 4px 0 0", border: "1px solid rgba(245,158,11,.5)", borderBottom: "none" }} />
                  )}
                  {m.collected > 0 && (
                    <div title={`Collected $${m.collected}`} style={{ width: "100%", height: `${Math.max((m.collected / maxRevenue) * 96, 4)}px`, background: `linear-gradient(180deg, #186038, #1F6B45)`, borderRadius: m.pending > 0 ? 0 : "4px 4px 0 0", opacity: m.isCurrent ? 1 : 0.75 }} />
                  )}
                  {total === 0 && <div style={{ width: "100%", height: 3, background: "var(--c-border)", borderRadius: 4 }} />}
                </div>
                <span style={{ fontSize: 11, color: m.isCurrent ? "var(--c-text-3)" : "var(--c-text-dim)", fontWeight: m.isCurrent ? 700 : 500 }}>{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom 2-col */}
      <div className="mobile-grid-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Recent sessions */}
        <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 24, boxShadow: "var(--c-shadow)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>{d.recentSessions}</p>
            <Link href="/app/schedule" style={{ fontSize: 11, color: "#18B3A4", textDecoration: "none", fontWeight: 600 }}>{d.viewAll}</Link>
          </div>
          {sessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>🎾</p>
              <p style={{ fontSize: 13, color: "var(--c-text-dim)" }}>{d.noSessionsLogged}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sessions.slice(0, 6).map(s => {
                const meta = SESSION_META[s.type] || { icon: "🎯", color: "#607080" };
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "var(--c-inner)", borderRadius: 10, borderLeft: `3px solid ${meta.color}` }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{meta.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: "var(--c-text-2)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.player_name}</p>
                      <p style={{ fontSize: 11, color: "var(--c-text-dim)" }}>{s.type} · {s.date}</p>
                    </div>
                    <span style={{ fontSize: 11, color: meta.color, background: meta.color + "18", padding: "2px 7px", borderRadius: 100, fontWeight: 700, flexShrink: 0 }}>{s.duration}m</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Recent players */}
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 22, flex: 1, boxShadow: "var(--c-shadow)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>{d.players}</p>
              <Link href="/app/players" style={{ fontSize: 11, color: "#18B3A4", textDecoration: "none", fontWeight: 600 }}>{d.viewAll}</Link>
            </div>
            {players.length === 0 ? (
              <Link href="/app/players" style={{ fontSize: 13, color: "#1F6B45", textDecoration: "none", fontWeight: 600 }}>{d.addFirstPlayer}</Link>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {players.slice(0, 4).map((p, i) => (
                  <Link key={p.id} href={`/app/players/${p.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: i < Math.min(players.length, 4) - 1 ? "1px solid var(--c-divider)" : "none", textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, background: "var(--c-avatar-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--c-avatar-text)" }}>{p.name[0]}</div>
                      <div>
                        <p style={{ fontSize: 13, color: "var(--c-text-2)", fontWeight: 600, margin: 0 }}>{p.name}</p>
                        <p style={{ fontSize: 11, color: p.status === "active" ? "#1F6B45" : "var(--c-text-dim)", margin: 0 }}>{p.status}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--c-text-muted)", fontWeight: 600 }}>${p.monthly_fee}/mo</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 18, boxShadow: "var(--c-shadow)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>{d.quickActions}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                { label: d.addPlayerAction, href: "/app/players", color: "#1F6B45" },
                { label: d.generateInvoices, href: "/app/billing", color: "#18B3A4" },
                { label: d.viewSchedule, href: "/app/schedule", color: "#FFD447" },
              ].map(({ label, href, color }) => (
                <Link key={label} href={href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", background: color + "0d", border: `1px solid ${color}22`, borderRadius: 9, textDecoration: "none", color: "var(--c-text-2)", fontSize: 13, fontWeight: 600, transition: "all .15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = color + "18"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = color + "0d"; }}>
                  {label}
                  <span style={{ color, fontSize: 12 }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
