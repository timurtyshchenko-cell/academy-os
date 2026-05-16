"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Player { id: number; name: string; monthly_fee: number; status: string }
interface Invoice { id: number; amount: number; status: string; month: string; created_at: string }
interface Session { id: number; player_name: string; date: string; duration: number; type: string; coach_name: string }

export default function Overview() {
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
      <div style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  const activePlayers = players.filter(p => p.status === "active");
  const mrr = activePlayers.reduce((s, p) => s + p.monthly_fee, 0);
  const collected = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0);
  const pendingCount = invoices.filter(i => i.status !== "paid").length;
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const sessionsThisMonth = sessions.filter(s => s.date?.startsWith(thisMonth));
  const totalHoursThisMonth = (sessionsThisMonth.reduce((s, r) => s + (r.duration || 0), 0) / 60).toFixed(1);
  const totalHoursAll = (sessions.reduce((s, r) => s + (r.duration || 0), 0) / 60).toFixed(1);
  const SESSION_EMOJI: Record<string, string> = { Match: "🎾", Fitness: "💪", "Video Analysis": "📹", Training: "🎯", "Serve Practice": "🏆", Doubles: "👥" };

  // Last 6 months revenue chart data
  const monthlyRevenue = (() => {
    const months: { label: string; key: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleString("en-US", { month: "short" }), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` });
    }
    return months.map(m => ({
      label: m.label,
      collected: invoices.filter(i => i.status === "paid" && (i.created_at || "").startsWith(m.key)).reduce((s, i) => s + i.amount, 0),
      pending: invoices.filter(i => i.status !== "paid" && (i.created_at || "").startsWith(m.key)).reduce((s, i) => s + i.amount, 0),
    }));
  })();
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.collected + m.pending), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 4 }}>Overview</h1>
        <p style={{ fontSize: 14, color: "var(--c-text-muted)" }}>Your academy at a glance</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {[
          { emoji: "👥", label: "Active Players", value: activePlayers.length, sub: `${players.length} total`, color: "#2563eb", href: "/app/players" },
          { emoji: "💰", label: "Monthly MRR", value: `$${mrr.toLocaleString()}`, sub: "recurring revenue", color: "#059669", href: "/app/billing" },
          { emoji: "✅", label: "Collected", value: `$${collected.toLocaleString()}`, sub: "invoices paid", color: "#059669", href: "/app/billing" },
          { emoji: "⏳", label: "Pending", value: `$${pending.toLocaleString()}`, sub: `${pendingCount} invoice${pendingCount !== 1 ? "s" : ""}`, color: "#f59e0b", href: "/app/billing" },
          { emoji: "🎯", label: "Sessions This Month", value: sessionsThisMonth.length, sub: `${totalHoursThisMonth}h trained`, color: "#7c3aed", href: "/app/players" },
          { emoji: "⏱️", label: "Total Hours", value: `${totalHoursAll}h`, sub: `${sessions.length} sessions all time`, color: "#7c3aed", href: "/app/players" },
        ].map(({ emoji, label, value, sub, color, href }) => (
          <Link key={label} href={href} style={{ textDecoration: "none" }}>
            <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 18, cursor: "pointer", transition: "border-color .2s", boxShadow: "var(--c-shadow)" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--c-border-hover)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--c-border)")}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: "var(--c-text-muted)", fontWeight: 600 }}>{label}</p>
                <span style={{ fontSize: 16 }}>{emoji}</span>
              </div>
              <p style={{ fontSize: 24, fontWeight: 900, color: "var(--c-text)", marginBottom: 4 }}>{value}</p>
              <p style={{ fontSize: 12, color }}>{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue chart */}
      <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 24, boxShadow: "var(--c-shadow)" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 20 }}>Monthly Revenue — Last 6 Months</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 100 }}>
          {monthlyRevenue.map(m => (
            <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, height: 80, justifyContent: "flex-end" }}>
                {m.pending > 0 && <div title={`Pending $${m.pending}`} style={{ width: "100%", height: `${(m.pending / maxRevenue) * 80}px`, background: "#f59e0b40", borderRadius: "4px 4px 0 0", minHeight: 4 }} />}
                {m.collected > 0 && <div title={`Collected $${m.collected}`} style={{ width: "100%", height: `${(m.collected / maxRevenue) * 80}px`, background: "linear-gradient(180deg,#2563eb,#4f46e5)", borderRadius: m.pending > 0 ? 0 : "4px 4px 0 0", minHeight: 4 }} />}
                {m.collected === 0 && m.pending === 0 && <div style={{ width: "100%", height: 4, background: "var(--c-border)", borderRadius: 4 }} />}
              </div>
              <span style={{ fontSize: 11, color: "var(--c-text-dim)", fontWeight: 600 }}>{m.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, background: "#2563eb", borderRadius: 2 }} /><span style={{ fontSize: 11, color: "var(--c-text-dim)" }}>Collected</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, background: "#f59e0b40", borderRadius: 2, border: "1px solid #f59e0b" }} /><span style={{ fontSize: 11, color: "var(--c-text-dim)" }}>Pending</span></div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 24, boxShadow: "var(--c-shadow)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Recent Sessions</p>
          {sessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ fontSize: 13, color: "var(--c-text-dim)", marginBottom: 8 }}>No sessions logged yet</p>
              <p style={{ fontSize: 12, color: "var(--c-text-dim)" }}>Go to a player profile to log training</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sessions.slice(0, 6).map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--c-border)" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{SESSION_EMOJI[s.type] || "🎯"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: "var(--c-text-2)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.player_name}</p>
                    <p style={{ fontSize: 11, color: "var(--c-text-dim)" }}>{s.type} · {s.date}</p>
                  </div>
                  <span style={{ fontSize: 12, color: "#7c3aed", background: "#7c3aed18", padding: "2px 8px", borderRadius: 100, fontWeight: 700, flexShrink: 0 }}>{s.duration}m</span>
                </div>
              ))}
              {sessions.length > 6 && <p style={{ fontSize: 12, color: "var(--c-text-dim)", paddingTop: 4 }}>{sessions.length - 6} more sessions</p>}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 24, flex: 1, boxShadow: "var(--c-shadow)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Recent Players</p>
            {players.length === 0 ? (
              <Link href="/app/players" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none" }}>Add your first player →</Link>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {players.slice(0, 4).map(p => (
                  <Link key={p.id} href={`/app/players/${p.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--c-border)", textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 26, height: 26, background: "var(--c-avatar-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--c-avatar-text)" }}>{p.name[0]}</div>
                      <span style={{ fontSize: 13, color: "var(--c-text-2)" }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--c-text-muted)" }}>${p.monthly_fee}/mo</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 20, boxShadow: "var(--c-shadow)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Quick Actions</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Add player", href: "/app/players", emoji: "👤" },
                { label: "Generate invoices", href: "/app/billing", emoji: "💳" },
                { label: "Add coach", href: "/app/coaches", emoji: "🎾" },
              ].map(({ label, href, emoji }) => (
                <Link key={label} href={href} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 8, textDecoration: "none", color: "var(--c-text-muted)", fontSize: 13, fontWeight: 500, transition: "all .15s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--c-text)"; el.style.borderColor = "var(--c-border-hover)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--c-text-muted)"; el.style.borderColor = "var(--c-border)"; }}>
                  <span>{emoji}</span>{label} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
