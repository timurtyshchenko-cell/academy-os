"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Player { id: number; name: string; age: number; level: string; coach_name: string; monthly_fee: number; status: string; parent_email: string; parent_name: string; notes: string; created_at: string }
interface Invoice { id: number; amount: number; status: string; month: string; due_date: string; paid_at: string }
interface Session { id: number; date: string; duration: number; type: string; coach_name: string; notes: string }

const LEVEL_COLORS: Record<string, { color: string; bg: string }> = {
  Beginner:     { color: "#18B3A4", bg: "rgba(24,179,164,.12)" },
  Intermediate: { color: "#1F6B45", bg: "rgba(31,107,69,.12)" },
  Advanced:     { color: "#FFD447", bg: "rgba(255,212,71,.12)" },
  Competitive:  { color: "#ef4444", bg: "rgba(239,68,68,.12)" },
};

const SESSION_META: Record<string, { icon: string; color: string }> = {
  Training:        { icon: "🎯", color: "#1F6B45" },
  Match:           { icon: "🎾", color: "#FFD447" },
  Fitness:         { icon: "💪", color: "#18B3A4" },
  "Serve Practice":{ icon: "🏆", color: "#e07b4f" },
  Doubles:         { icon: "👥", color: "#9b59b6" },
  "Video Analysis":{ icon: "📹", color: "#607080" },
};

const inp: React.CSSProperties = { width: "100%", background: "var(--c-input-bg)", border: "1px solid var(--c-input-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--c-text)", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
const SESSION_TYPES = ["Training", "Match", "Fitness", "Serve Practice", "Doubles", "Video Analysis"];

export default function PlayerProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({ date: new Date().toISOString().split("T")[0], duration: "60", type: "Training", coach_name: "", notes: "" });
  const [savingSession, setSavingSession] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [sendingReminder, setSendingReminder] = useState<number | null>(null);
  const [reminderSent, setReminderSent] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", age: "", level: "Intermediate", coach_name: "", parent_email: "", parent_name: "", monthly_fee: "", notes: "", status: "active" });

  useEffect(() => { load(); }, [id]);

  async function load() {
    const r = await fetch(`/api/players/${id}`);
    if (r.status === 404) { router.push("/app/players"); return; }
    const [d, sr] = await Promise.all([r.json(), fetch(`/api/sessions?player_id=${id}`)]);
    const sd = await sr.json();
    setPlayer(d.player); setInvoices(d.invoices || []); setSessions(sd.sessions || []);
    setForm({ name: d.player.name, age: d.player.age?.toString() || "", level: d.player.level, coach_name: d.player.coach_name || "", parent_email: d.player.parent_email || "", parent_name: d.player.parent_name || "", monthly_fee: d.player.monthly_fee?.toString() || "0", notes: d.player.notes || "", status: d.player.status });
    setLoading(false);
  }

  async function addSession() {
    if (!sessionForm.date) return;
    setSavingSession(true);
    await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ player_id: parseInt(id), player_name: player?.name, ...sessionForm, duration: parseInt(sessionForm.duration) || 60 }) });
    const sr = await fetch(`/api/sessions?player_id=${id}`);
    setSessions((await sr.json()).sessions || []);
    setShowAddSession(false);
    setSessionForm({ date: new Date().toISOString().split("T")[0], duration: "60", type: "Training", coach_name: "", notes: "" });
    setSavingSession(false);
  }

  async function deleteSession(sessionId: number) {
    await fetch("/api/sessions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: sessionId }) });
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/players/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, age: parseInt(form.age) || null, monthly_fee: parseInt(form.monthly_fee) || 0 }) });
    await load(); setEditing(false); setSaving(false);
  }

  async function sendReport() {
    setSendingReport(true); setReportError(null);
    const r = await fetch("/api/sessions/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ playerId: parseInt(id) }) });
    const d = await r.json();
    if (!r.ok) setReportError(d.error === "no_email" ? "No parent email on file" : d.error || "Failed to send");
    else { setReportSent(true); setTimeout(() => setReportSent(false), 3000); }
    setSendingReport(false);
  }

  async function sendReminder(sessionId: number) {
    setSendingReminder(sessionId);
    await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ player_id: parseInt(id), session_id: sessionId }) });
    setSendingReminder(null);
    setReminderSent(sessionId);
    setTimeout(() => setReminderSent(null), 3000);
  }

  async function markPaid(invoiceId: number) {
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "markPaid", invoiceId }) });
    await load();
  }

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "#1F6B45", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (!player) return null;

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0);
  const totalSessionHours = (sessions.reduce((s, r) => s + (r.duration || 0), 0) / 60).toFixed(1);
  const levelStyle = LEVEL_COLORS[player.level] || { color: "var(--c-text-muted)", bg: "var(--c-inner)" };

  // Sessions per month (last 6)
  const now = new Date();
  const monthBars = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short" });
    const count = sessions.filter(s => s.date?.startsWith(key)).length;
    return { label, count };
  });
  const maxBar = Math.max(...monthBars.map(m => m.count), 1);

  // Session type breakdown
  const typeBreakdown = SESSION_TYPES.map(t => ({
    type: t,
    count: sessions.filter(s => s.type === t).length,
    meta: SESSION_META[t] || { icon: "🎯", color: "#607080" },
  })).filter(t => t.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @media (max-width: 768px) {
          .profile-2col { grid-template-columns: 1fr !important; }
          .profile-hero-row { flex-direction: column !important; gap: 16px !important; }
          .profile-stats { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link href="/app/players" style={{ fontSize: 13, color: "var(--c-text-muted)", textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--c-text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--c-text-muted)")}>← Players</Link>
        <span style={{ color: "var(--c-text-dim)", fontSize: 13 }}>/</span>
        <span style={{ fontSize: 13, color: "var(--c-text-3)" }}>{player.name}</span>
      </div>

      {/* Hero card */}
      <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 20, overflow: "hidden", boxShadow: "var(--c-shadow-lg)" }}>
        {/* Top gradient strip */}
        <div style={{ height: 6, background: "linear-gradient(90deg, #1F6B45, #18B3A4 60%, #1F6B45)" }} />
        <div style={{ padding: "28px 28px 24px" }}>
          <div className="profile-hero-row" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 68, height: 68, background: "var(--c-avatar-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#18B3A4", border: "2px solid rgba(24,179,164,.25)" }}>
                  {player.name[0].toUpperCase()}
                </div>
                <div style={{ position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: "50%", background: player.status === "active" ? "#1F6B45" : "#607080", border: "2px solid var(--c-card)" }} />
              </div>
              {/* Name + badges */}
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-0.8px", marginBottom: 8 }}>{player.name}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: levelStyle.color, background: levelStyle.bg, padding: "4px 12px", borderRadius: 100, border: `1px solid ${levelStyle.color}30` }}>{player.level}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: player.status === "active" ? "#1F6B45" : "var(--c-text-muted)", background: player.status === "active" ? "rgba(31,107,69,.1)" : "var(--c-inner)", padding: "4px 12px", borderRadius: 100 }}>{player.status}</span>
                  {player.coach_name && <span style={{ fontSize: 12, color: "var(--c-text-muted)", background: "var(--c-inner)", padding: "4px 12px", borderRadius: 100 }}>🎾 {player.coach_name}</span>}
                  {player.age && <span style={{ fontSize: 12, color: "var(--c-text-muted)", background: "var(--c-inner)", padding: "4px 12px", borderRadius: 100 }}>Age {player.age}</span>}
                </div>
              </div>
            </div>
            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={sendReport} disabled={sendingReport || sessions.length === 0}
                style={{ fontSize: 13, color: reportSent ? "#1F6B45" : sendingReport ? "var(--c-text-dim)" : "#18B3A4", background: "var(--c-inner)", fontWeight: 600, padding: "9px 16px", borderRadius: 10, border: "1px solid var(--c-border)", cursor: sessions.length === 0 ? "not-allowed" : "pointer", opacity: sessions.length === 0 ? .4 : 1, whiteSpace: "nowrap" }}>
                {reportSent ? "✓ Sent" : sendingReport ? "…" : "📧 Report"}
              </button>
              <button onClick={() => setEditing(true)} style={{ fontSize: 13, color: "var(--c-text)", background: "var(--c-inner)", fontWeight: 600, padding: "9px 16px", borderRadius: 10, border: "1px solid var(--c-border)", cursor: "pointer" }}>Edit</button>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="profile-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, marginTop: 20 }}>
            {[
              { label: "Monthly Fee", value: `$${player.monthly_fee}`, sub: "per month" },
              { label: "Total Paid", value: `$${totalPaid.toLocaleString()}`, sub: "all invoices", color: "#1F6B45" },
              { label: "Pending", value: `$${totalPending.toLocaleString()}`, sub: totalPending > 0 ? "unpaid" : "all clear", color: totalPending > 0 ? "#f59e0b" : "#1F6B45" },
              { label: "Sessions", value: sessions.length, sub: "all time" },
              { label: "Hours", value: `${totalSessionHours}h`, sub: "trained total", color: "#18B3A4" },
            ].map(({ label, value, sub, color }) => (
              <div key={label} style={{ background: "var(--c-inner)", borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ fontSize: 10, color: "var(--c-text-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: color || "var(--c-text)", letterSpacing: "-.5px", marginBottom: 2 }}>{value}</p>
                <p style={{ fontSize: 10, color: "var(--c-text-dim)" }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2-col: Info + Invoices */}
      <div className="profile-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Player Info */}
        <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 24, boxShadow: "var(--c-shadow)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 18 }}>Player Info</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { label: "Age", value: player.age ? `${player.age} years old` : "—" },
              { label: "Coach", value: player.coach_name || "—" },
              { label: "Parent Name", value: player.parent_name || "—" },
              { label: "Parent Email", value: player.parent_email || "—" },
            ].map(({ label, value }, i, arr) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--c-divider)" : "none" }}>
                <span style={{ fontSize: 12, color: "var(--c-text-muted)" }}>{label}</span>
                <span style={{ fontSize: 13, color: "var(--c-text-2)", maxWidth: 200, textAlign: "right", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
          {player.notes && (
            <div style={{ marginTop: 14, background: "var(--c-inner)", borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ fontSize: 10, color: "var(--c-text-dim)", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>Notes</p>
              <p style={{ fontSize: 13, color: "var(--c-text-3)", lineHeight: 1.6 }}>{player.notes}</p>
            </div>
          )}
          {reportError && <p style={{ marginTop: 10, fontSize: 12, color: "#ef4444" }}>⚠ {reportError}</p>}
        </div>

        {/* Invoices */}
        <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 24, boxShadow: "var(--c-shadow)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 18 }}>Invoice History</p>
          {invoices.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--c-text-dim)", textAlign: "center", paddingTop: 20 }}>No invoices yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {invoices.map(inv => (
                <div key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--c-inner)", borderRadius: 10, borderLeft: `3px solid ${inv.status === "paid" ? "#1F6B45" : "#f59e0b"}` }}>
                  <div>
                    <p style={{ fontSize: 13, color: "var(--c-text-2)", fontWeight: 600 }}>{inv.month || "—"}</p>
                    <p style={{ fontSize: 11, color: "var(--c-text-dim)" }}>Due {inv.due_date || "—"}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "var(--c-text)" }}>${inv.amount}</span>
                    {inv.status === "paid" ? (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#1F6B45", background: "rgba(31,107,69,.1)", padding: "3px 10px", borderRadius: 100 }}>✓ Paid</span>
                    ) : (
                      <button onClick={() => markPaid(inv.id)} style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,.1)", padding: "5px 10px", borderRadius: 100, border: "none", cursor: "pointer" }}>Mark Paid</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Training Log */}
      <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 24, boxShadow: "var(--c-shadow)" }}>
        {/* Training header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Training Log</p>
            <p style={{ fontSize: 13, color: "var(--c-text-muted)" }}>{sessions.length} sessions · {totalSessionHours}h total</p>
          </div>
          <button onClick={() => setShowAddSession(true)} style={{ background: "#1F6B45", color: "#fff", fontWeight: 700, fontSize: 13, padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer", boxShadow: "0 2px 8px rgba(31,107,69,.3)" }}>+ Log Session</button>
        </div>

        {sessions.length > 0 && (
          <>
            {/* Mini charts row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--c-divider)" }}>
              {/* Month bars */}
              <div>
                <p style={{ fontSize: 10, color: "var(--c-text-dim)", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".08em" }}>Sessions / Month</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 48 }}>
                  {monthBars.map(m => (
                    <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: "100%", borderRadius: "4px 4px 0 0", minHeight: 3, height: `${Math.max((m.count / maxBar) * 40, m.count > 0 ? 6 : 3)}px`, background: m.count > 0 ? "#1F6B45" : "var(--c-border)" }} />
                      <span style={{ fontSize: 9, color: "var(--c-text-dim)", fontWeight: 600 }}>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Type breakdown */}
              {typeBreakdown.length > 0 && (
                <div style={{ minWidth: 130 }}>
                  <p style={{ fontSize: 10, color: "var(--c-text-dim)", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".08em" }}>By Type</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {typeBreakdown.slice(0, 4).map(t => (
                      <div key={t.type} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12 }}>{t.meta.icon}</span>
                        <span style={{ fontSize: 11, color: "var(--c-text-3)", flex: 1 }}>{t.type}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: t.meta.color }}>{t.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Session list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sessions.map(s => {
                const meta = SESSION_META[s.type] || { icon: "🎯", color: "#607080" };
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: "var(--c-inner)", borderRadius: 10, borderLeft: `3px solid ${meta.color}` }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{meta.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text-2)" }}>{s.type}</span>
                        <span style={{ fontSize: 11, color: meta.color, background: meta.color + "18", padding: "2px 8px", borderRadius: 100, fontWeight: 700 }}>{s.duration} min</span>
                        {s.coach_name && <span style={{ fontSize: 11, color: "var(--c-text-dim)" }}>{s.coach_name}</span>}
                      </div>
                      <p style={{ fontSize: 11, color: "var(--c-text-dim)", margin: 0 }}>{s.date}{s.notes ? ` · ${s.notes}` : ""}</p>
                    </div>
                    {player.parent_email && (
                      <button onClick={() => sendReminder(s.id)} disabled={sendingReminder === s.id} title="Notify parent"
                        style={{ padding: "4px 8px", background: "none", border: "none", color: reminderSent === s.id ? "#1F6B45" : "var(--c-text-dim)", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>
                        {reminderSent === s.id ? "✓" : sendingReminder === s.id ? "…" : "🔔"}
                      </button>
                    )}
                    <button onClick={() => deleteSession(s.id)} style={{ padding: "4px 8px", background: "none", border: "none", color: "var(--c-text-dim)", cursor: "pointer", fontSize: 13, flexShrink: 0 }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--c-text-dim)")}>✕</button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {sessions.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🎾</p>
            <p style={{ fontSize: 14, color: "var(--c-text-dim)" }}>No sessions logged yet</p>
          </div>
        )}
      </div>

      {/* Add Session Modal */}
      {showAddSession && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 440 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--c-text)", marginBottom: 24 }}>Log Training Session</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Date", type: "date", key: "date", val: sessionForm.date },
                  { label: "Duration (min)", type: "number", key: "duration", val: sessionForm.duration },
                ].map(({ label, type, key, val }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{label}</label>
                    <input type={type} value={val} onChange={e => setSessionForm(p => ({ ...p, [key]: e.target.value }))} style={inp} />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Session Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                  {SESSION_TYPES.map(t => {
                    const m = SESSION_META[t] || { icon: "🎯", color: "#607080" };
                    const active = sessionForm.type === t;
                    return (
                      <button key={t} type="button" onClick={() => setSessionForm(p => ({ ...p, type: t }))}
                        style={{ padding: "9px 8px", borderRadius: 10, border: `2px solid ${active ? m.color : "var(--c-border)"}`, background: active ? m.color + "18" : "var(--c-inner)", cursor: "pointer", textAlign: "center", transition: "all .15s" }}>
                        <span style={{ fontSize: 14, display: "block", marginBottom: 2 }}>{m.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: active ? m.color : "var(--c-text-dim)", display: "block", lineHeight: 1.2 }}>{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Coach", key: "coach_name", val: sessionForm.coach_name },
                  { label: "Notes", key: "notes", val: sessionForm.notes },
                ].map(({ label, key, val }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{label}</label>
                    <input value={val} onChange={e => setSessionForm(p => ({ ...p, [key]: e.target.value }))} style={inp} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setShowAddSession(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-inner)", color: "var(--c-text-muted)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={addSession} disabled={savingSession} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "#1F6B45", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: savingSession ? .7 : 1 }}>{savingSession ? "Saving…" : "Log Session"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--c-text)", marginBottom: 24 }}>Edit Player</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { k: "name", label: "Name *", type: "text" },
                { k: "age", label: "Age", type: "number" },
                { k: "coach_name", label: "Coach Name", type: "text" },
                { k: "parent_name", label: "Parent Name", type: "text" },
                { k: "parent_email", label: "Parent Email", type: "email" },
                { k: "monthly_fee", label: "Monthly Fee ($)", type: "number" },
              ].map(({ k, label, type }) => (
                <div key={k}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>{label}</label>
                  <input type={type} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Level</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {(["Beginner","Intermediate","Advanced","Competitive"] as const).map(l => {
                    const lc = LEVEL_COLORS[l] || { color: "#607080", bg: "var(--c-inner)" };
                    const active = form.level === l;
                    return (
                      <button key={l} type="button" onClick={() => setForm(p => ({ ...p, level: l }))}
                        style={{ padding: "10px 12px", borderRadius: 10, border: `2px solid ${active ? lc.color : "var(--c-border)"}`, background: active ? lc.bg : "var(--c-inner)", cursor: "pointer", textAlign: "left", transition: "all .15s" }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: active ? lc.color : "var(--c-text-muted)" }}>{l}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Status</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {(["active","inactive","paused"] as const).map(s => {
                    const c = s === "active" ? "#1F6B45" : s === "paused" ? "#f59e0b" : "#607080";
                    const active = form.status === s;
                    return (
                      <button key={s} type="button" onClick={() => setForm(p => ({ ...p, status: s }))}
                        style={{ flex: 1, padding: "9px 8px", borderRadius: 10, border: `2px solid ${active ? c : "var(--c-border)"}`, background: active ? c + "18" : "var(--c-inner)", cursor: "pointer", transition: "all .15s" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: active ? c : "var(--c-text-muted)", textTransform: "capitalize" }}>{s}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} style={{ ...inp, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setEditing(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-inner)", color: "var(--c-text-muted)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "#1F6B45", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving ? .7 : 1 }}>{saving ? "Saving…" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
