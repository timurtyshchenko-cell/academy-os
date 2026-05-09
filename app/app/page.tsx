"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Player { id: number; name: string; monthly_fee: number; status: string }
interface Invoice { id: number; amount: number; status: string }
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
      <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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
  const totalMinutesThisMonth = sessionsThisMonth.reduce((s, r) => s + (r.duration || 0), 0);
  const totalHoursThisMonth = (totalMinutesThisMonth / 60).toFixed(1);
  const totalHoursAll = (sessions.reduce((s, r) => s + (r.duration || 0), 0) / 60).toFixed(1);

  const SESSION_EMOJI: Record<string, string> = { Match: "🎾", Fitness: "💪", "Video Analysis": "📹", Training: "🎯", "Serve Practice": "🏆", Doubles: "👥" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", letterSpacing: "-1px", marginBottom: 4 }}>Overview</h1>
        <p style={{ fontSize: 14, color: "#64748b" }}>Your academy at a glance</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {[
          { emoji: "👥", label: "Active Players", value: activePlayers.length, sub: `${players.length} total`, color: "#2563eb", href: "/app/players" },
          { emoji: "💰", label: "Monthly MRR", value: `$${mrr.toLocaleString()}`, sub: "recurring revenue", color: "#059669", href: "/app/billing" },
          { emoji: "✅", label: "Collected", value: `$${collected.toLocaleString()}`, sub: "invoices paid", color: "#059669", href: "/app/billing" },
          { emoji: "⏳", label: "Pending", value: `$${pending.toLocaleString()}`, sub: `${pendingCount} invoice${pendingCount !== 1 ? "s" : ""}`, color: "#d97706", href: "/app/billing" },
          { emoji: "🎯", label: "Sessions This Month", value: sessionsThisMonth.length, sub: `${totalHoursThisMonth}h trained`, color: "#7c3aed", href: "/app/players" },
          { emoji: "⏱️", label: "Total Hours", value: `${totalHoursAll}h`, sub: `${sessions.length} sessions all time`, color: "#7c3aed", href: "/app/players" },
        ].map(({ emoji, label, value, sub, color, href }) => (
          <Link key={label} href={href} style={{ textDecoration: "none" }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18, cursor: "pointer", transition: "border-color .2s, box-shadow .2s", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = "#cbd5e1"; el.style.boxShadow = "0 4px 12px rgba(0,0,0,.08)"; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = "#e2e8f0"; el.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{label}</p>
                <span style={{ fontSize: 16 }}>{emoji}</span>
              </div>
              <p style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", marginBottom: 4 }}>{value}</p>
              <p style={{ fontSize: 12, color }}>{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent sessions */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Recent Sessions</p>
          {sessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>No sessions logged yet</p>
              <p style={{ fontSize: 12, color: "#cbd5e1" }}>Go to a player profile to log training</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sessions.slice(0, 6).map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{SESSION_EMOJI[s.type] || "🎯"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: "#1e293b", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.player_name}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8" }}>{s.type} · {s.date}</p>
                  </div>
                  <span style={{ fontSize: 12, color: "#7c3aed", background: "#7c3aed12", padding: "2px 8px", borderRadius: 100, fontWeight: 700, flexShrink: 0 }}>{s.duration}m</span>
                </div>
              ))}
              {sessions.length > 6 && (
                <p style={{ fontSize: 12, color: "#94a3b8", paddingTop: 4 }}>{sessions.length - 6} more sessions</p>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Recent players */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, flex: 1, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Recent Players</p>
            {players.length === 0 ? (
              <Link href="/app/players" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none" }}>Add your first player →</Link>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {players.slice(0, 4).map(p => (
                  <Link key={p.id} href={`/app/players/${p.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9", textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 26, height: 26, background: "#eff6ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#2563eb" }}>{p.name[0]}</div>
                      <span style={{ fontSize: 13, color: "#1e293b" }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>${p.monthly_fee}/mo</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Quick Actions</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Add player", href: "/app/players", emoji: "👤" },
                { label: "Generate invoices", href: "/app/billing", emoji: "💳" },
                { label: "Add coach", href: "/app/coaches", emoji: "🎾" },
              ].map(({ label, href, emoji }) => (
                <Link key={label} href={href} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, textDecoration: "none", color: "#64748b", fontSize: 13, fontWeight: 500, transition: "all .15s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#0f172a"; el.style.borderColor = "#cbd5e1"; el.style.background = "#f1f5f9"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#64748b"; el.style.borderColor = "#e2e8f0"; el.style.background = "#f8fafc"; }}>
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
