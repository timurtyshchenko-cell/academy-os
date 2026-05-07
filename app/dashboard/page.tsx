"use client";
import { useState } from "react";
import Link from "next/link";

/* ─── Mock Data ───────────────────────────────────────────────────── */
const PLAYERS = [
  { id: 1, name: "Alex Martinez", age: 14, level: "Advanced", coach: "Coach Rivera", status: "active", fee: 800, paid: true, sessions: 12, next: "Mon 10:00" },
  { id: 2, name: "Sofia Chen", age: 12, level: "Intermediate", coach: "Coach Kim", status: "active", fee: 600, paid: true, sessions: 8, next: "Tue 09:00" },
  { id: 3, name: "James Wilson", age: 16, level: "Competitive", coach: "Coach Rivera", status: "active", fee: 1200, paid: false, sessions: 15, next: "Wed 14:00" },
  { id: 4, name: "Emma Torres", age: 10, level: "Beginner", coach: "Coach Park", status: "active", fee: 400, paid: true, sessions: 6, next: "Thu 11:00" },
  { id: 5, name: "Luca Rossi", age: 15, level: "Intermediate", coach: "Coach Kim", status: "active", fee: 600, paid: true, sessions: 10, next: "Fri 15:00" },
  { id: 6, name: "Mia Johnson", age: 13, level: "Advanced", coach: "Coach Rivera", status: "inactive", fee: 800, paid: false, sessions: 3, next: "—" },
  { id: 7, name: "Noah Kim", age: 11, level: "Beginner", coach: "Coach Park", status: "active", fee: 400, paid: true, sessions: 7, next: "Mon 16:00" },
  { id: 8, name: "Olivia Brown", age: 17, level: "Competitive", coach: "Coach Rivera", status: "active", fee: 1200, paid: true, sessions: 18, next: "Tue 13:00" },
];

const SCHEDULE = [
  { time: "09:00", mon: { player: "Sofia Chen", court: "Court 1", coach: "Kim" }, tue: null, wed: { player: "Emma Torres", court: "Court 2", coach: "Park" }, thu: null, fri: { player: "Sofia Chen", court: "Court 1", coach: "Kim" } },
  { time: "10:00", mon: { player: "Alex Martinez", court: "Court 1", coach: "Rivera" }, tue: null, wed: null, thu: { player: "Noah Kim", court: "Court 3", coach: "Park" }, fri: null },
  { time: "11:00", mon: null, tue: { player: "Luca Rossi", court: "Court 2", coach: "Kim" }, wed: null, thu: { player: "Emma Torres", court: "Court 2", coach: "Park" }, fri: { player: "Alex Martinez", court: "Court 1", coach: "Rivera" } },
  { time: "13:00", mon: null, tue: { player: "Olivia Brown", court: "Court 1", coach: "Rivera" }, wed: null, thu: null, fri: { player: "Luca Rossi", court: "Court 2", coach: "Kim" } },
  { time: "14:00", mon: null, tue: null, wed: { player: "James Wilson", court: "Court 1", coach: "Rivera" }, thu: null, fri: null },
  { time: "15:00", mon: { player: "James Wilson", court: "Court 1", coach: "Rivera" }, tue: null, wed: null, thu: null, fri: { player: "Luca Rossi", court: "Court 2", coach: "Kim" } },
  { time: "16:00", mon: { player: "Noah Kim", court: "Court 3", coach: "Park" }, tue: null, wed: null, thu: { player: "Alex Martinez", court: "Court 1", coach: "Rivera" }, fri: null },
];

const INVOICES = [
  { id: "INV-001", player: "Alex Martinez", amount: 800, due: "2025-05-01", status: "paid", month: "May 2025" },
  { id: "INV-002", player: "Sofia Chen", amount: 600, due: "2025-05-01", status: "paid", month: "May 2025" },
  { id: "INV-003", player: "James Wilson", amount: 1200, due: "2025-05-01", status: "overdue", month: "May 2025" },
  { id: "INV-004", player: "Emma Torres", amount: 400, due: "2025-05-01", status: "paid", month: "May 2025" },
  { id: "INV-005", player: "Luca Rossi", amount: 600, due: "2025-05-01", status: "paid", month: "May 2025" },
  { id: "INV-006", player: "Mia Johnson", amount: 800, due: "2025-04-01", status: "overdue", month: "Apr 2025" },
  { id: "INV-007", player: "Noah Kim", amount: 400, due: "2025-05-01", status: "paid", month: "May 2025" },
  { id: "INV-008", player: "Olivia Brown", amount: 1200, due: "2025-05-01", status: "paid", month: "May 2025" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri"] as const;
const LEVEL_COLORS: Record<string, string> = { Beginner: "#059669", Intermediate: "#2563eb", Advanced: "#7c3aed", Competitive: "#dc2626" };

type Tab = "overview" | "players" | "schedule" | "billing" | "coaches";

/* ─── Stat Card ───────────────────────────────────────────────────── */
function Stat({ emoji, label, value, sub, color }: { emoji: string; label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 16, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>{label}</p>
        <span style={{ fontSize: 18 }}>{emoji}</span>
      </div>
      <p style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 12, color: color }}>{sub}</p>
    </div>
  );
}

/* ─── Overview Tab ────────────────────────────────────────────────── */
function OverviewTab() {
  const totalRevenue = INVOICES.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const overdue = INVOICES.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  const activePlayers = PLAYERS.filter(p => p.status === "active").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <Stat emoji="👥" label="Active Players" value={String(activePlayers)} sub="+2 this month" color="#059669" />
        <Stat emoji="💰" label="Monthly Revenue" value={`$${totalRevenue.toLocaleString()}`} sub="May 2025" color="#2563eb" />
        <Stat emoji="⚠️" label="Overdue" value={`$${overdue.toLocaleString()}`} sub="2 invoices pending" color="#dc2626" />
        <Stat emoji="🎾" label="Sessions This Week" value="24" sub="Across 3 coaches" color="#7c3aed" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent activity */}
        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 16, padding: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Recent Activity</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { text: "Invoice paid — Olivia Brown", time: "2h ago", color: "#059669" },
              { text: "New player added — Noah Kim", time: "1d ago", color: "#2563eb" },
              { text: "Invoice overdue — James Wilson", time: "2d ago", color: "#dc2626" },
              { text: "Session completed — Alex Martinez", time: "3d ago", color: "#7c3aed" },
              { text: "Invoice paid — Luca Rossi", time: "4d ago", color: "#059669" },
            ].map(({ text, time, color }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: "#777", flex: 1 }}>{text}</p>
                <p style={{ fontSize: 11, color: "#333" }}>{time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Court utilization */}
        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 16, padding: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Court Utilization</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { name: "Court 1", pct: 78, color: "#2563eb" },
              { name: "Court 2", pct: 62, color: "#7c3aed" },
              { name: "Court 3", pct: 45, color: "#059669" },
            ].map(({ name, pct, color }) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <p style={{ fontSize: 13, color: "#888" }}>{name}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{pct}%</p>
                </div>
                <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Players Tab ─────────────────────────────────────────────────── */
function PlayersTab() {
  const [search, setSearch] = useState("");
  const filtered = PLAYERS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.coach.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players or coaches..." style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#fff", outline: "none", width: 280, fontFamily: "inherit" }} />
        <button style={{ background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer" }}>+ Add Player</button>
      </div>
      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
              {["Player", "Age", "Level", "Coach", "Sessions", "Monthly Fee", "Status", "Next Session"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: ".06em", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #161616" : "none", transition: "background .15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#161616")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: "#1a1a1a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{p.name[0]}</div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#666" }}>{p.age}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: LEVEL_COLORS[p.level], background: LEVEL_COLORS[p.level] + "18", padding: "3px 10px", borderRadius: 100 }}>{p.level}</span>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#666" }}>{p.coach}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#666" }}>{p.sessions}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#fff" }}>${p.fee}/mo</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: p.status === "active" ? "#059669" : "#555", background: p.status === "active" ? "rgba(5,150,105,.12)" : "#1a1a1a", padding: "3px 10px", borderRadius: 100 }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#555" }}>{p.next}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Schedule Tab ────────────────────────────────────────────────── */
function ScheduleTab() {
  const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626"];
  const coachColors: Record<string, string> = { Rivera: COLORS[0], Kim: COLORS[1], Park: COLORS[2] };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: 14, color: "#555" }}>Week of May 5–9, 2025</p>
        <button style={{ background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer" }}>+ Book Session</button>
      </div>
      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 16, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
              <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: ".06em", textAlign: "left", width: 80 }}>Time</th>
              {DAYS.map(d => (
                <th key={d} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: ".06em", textAlign: "left" }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCHEDULE.map((row, i) => (
              <tr key={row.time} style={{ borderBottom: i < SCHEDULE.length - 1 ? "1px solid #161616" : "none" }}>
                <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: "#444", verticalAlign: "top" }}>{row.time}</td>
                {DAY_KEYS.map(dk => {
                  const cell = row[dk] as { player: string; court: string; coach: string } | null;
                  return (
                    <td key={dk} style={{ padding: "6px 8px", verticalAlign: "top" }}>
                      {cell ? (
                        <div style={{ background: (coachColors[cell.coach] || COLORS[0]) + "18", border: `1px solid ${(coachColors[cell.coach] || COLORS[0])}30`, borderRadius: 8, padding: "8px 10px", cursor: "pointer" }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = ".8")}
                          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{cell.player}</p>
                          <p style={{ fontSize: 11, color: "#555" }}>{cell.court} · {cell.coach}</p>
                        </div>
                      ) : (
                        <div style={{ height: 52, borderRadius: 8, border: "1px dashed #1a1a1a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = "#2563eb")}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = "#1a1a1a")}>
                          <span style={{ fontSize: 18, color: "#222" }}>+</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {Object.entries(coachColors).map(([coach, color]) => (
          <div key={coach} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            <span style={{ fontSize: 12, color: "#555" }}>Coach {coach}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Billing Tab ─────────────────────────────────────────────────── */
function BillingTab() {
  const total = INVOICES.reduce((s, i) => s + i.amount, 0);
  const paid = INVOICES.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const overdue = INVOICES.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: 20 }}>
          <p style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>Total Billed</p>
          <p style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>${total.toLocaleString()}</p>
          <p style={{ fontSize: 12, color: "#444", marginTop: 4 }}>May 2025</p>
        </div>
        <div style={{ background: "#111", border: "1px solid rgba(5,150,105,.2)", borderRadius: 14, padding: 20 }}>
          <p style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>Collected</p>
          <p style={{ fontSize: 26, fontWeight: 900, color: "#059669" }}>${paid.toLocaleString()}</p>
          <p style={{ fontSize: 12, color: "#059669", marginTop: 4 }}>{Math.round(paid / total * 100)}% collection rate</p>
        </div>
        <div style={{ background: "#111", border: "1px solid rgba(220,38,38,.2)", borderRadius: 14, padding: 20 }}>
          <p style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>Overdue</p>
          <p style={{ fontSize: 26, fontWeight: 900, color: "#dc2626" }}>${overdue.toLocaleString()}</p>
          <p style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{INVOICES.filter(i => i.status === "overdue").length} invoices</p>
        </div>
      </div>

      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Invoices</p>
          <button style={{ background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 12, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer" }}>Send All Invoices</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
              {["Invoice", "Player", "Period", "Amount", "Due Date", "Status", "Action"].map(h => (
                <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: ".06em", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((inv, i) => (
              <tr key={inv.id} style={{ borderBottom: i < INVOICES.length - 1 ? "1px solid #161616" : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#161616")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#555" }}>{inv.id}</td>
                <td style={{ padding: "14px 16px", fontSize: 14, color: "#fff" }}>{inv.player}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#555" }}>{inv.month}</td>
                <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "#fff" }}>${inv.amount}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#555" }}>{inv.due}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: inv.status === "paid" ? "#059669" : "#dc2626", background: inv.status === "paid" ? "rgba(5,150,105,.12)" : "rgba(220,38,38,.1)", padding: "3px 10px", borderRadius: 100, textTransform: "capitalize" }}>
                    {inv.status}
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <button style={{ fontSize: 12, color: inv.status === "overdue" ? "#dc2626" : "#555", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                    {inv.status === "overdue" ? "Send Reminder" : "View"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Coaches Tab ─────────────────────────────────────────────────── */
function CoachesTab() {
  const coaches = [
    { name: "Coach Rivera", specialty: "Competitive & Advanced", players: 4, sessions: 18, rating: 4.9, status: "active" },
    { name: "Coach Kim", specialty: "Intermediate", players: 2, sessions: 12, rating: 4.7, status: "active" },
    { name: "Coach Park", specialty: "Beginners & Juniors", players: 2, sessions: 8, rating: 4.8, status: "active" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button style={{ background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer" }}>+ Add Coach</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {coaches.map(c => (
          <div key={c.name} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, background: "#1a1a1a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff" }}>{c.name.split(" ")[1][0]}</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{c.name}</p>
                <p style={{ fontSize: 12, color: "#555" }}>{c.specialty}</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { label: "Players", value: c.players },
                { label: "Sessions/wk", value: c.sessions },
                { label: "Rating", value: c.rating },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "#0c0c0c", borderRadius: 10, padding: 12, textAlign: "center" }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{value}</p>
                  <p style={{ fontSize: 10, color: "#444" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Dashboard ───────────────────────────────────────────────────── */
export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { id: Tab; emoji: string; label: string }[] = [
    { id: "overview", emoji: "📊", label: "Overview" },
    { id: "players", emoji: "👥", label: "Players" },
    { id: "schedule", emoji: "📅", label: "Schedule" },
    { id: "billing", emoji: "💳", label: "Billing" },
    { id: "coaches", emoji: "🎾", label: "Coaches" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #1a1a1a", background: "rgba(10,10,10,.95)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <div style={{ width: 28, height: 28, background: "#2563eb", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 13 }}>A</div>
              <span style={{ fontWeight: 800, color: "#fff", fontSize: 14 }}>AcademyOS</span>
            </Link>
            <div style={{ width: 1, height: 16, background: "#1a1a1a" }} />
            <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 700, background: "rgba(37,99,235,.1)", padding: "4px 12px", borderRadius: 8 }}>Miami Tennis Academy</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#059669", animation: "pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 12, color: "#555" }}>Live</span>
            <Link href="/" style={{ fontSize: 12, color: "#444", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#444")}>
              ← Back to site
            </Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "24px", display: "flex", gap: 24 }}>
        {/* Sidebar */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {tabs.map(({ id, emoji, label }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10,
                background: tab === id ? "rgba(37,99,235,.12)" : "transparent",
                border: tab === id ? "1px solid rgba(37,99,235,.2)" : "1px solid transparent",
                color: tab === id ? "#60a5fa" : "#555", fontWeight: tab === id ? 700 : 500,
                fontSize: 13, cursor: "pointer", transition: "all .15s", textAlign: "left",
              }}
                onMouseEnter={e => { if (tab !== id) (e.currentTarget.style.color = "#fff"); }}
                onMouseLeave={e => { if (tab !== id) (e.currentTarget.style.color = "#555"); }}>
                <span>{emoji}</span>{label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
              {tabs.find(t => t.id === tab)?.emoji} {tabs.find(t => t.id === tab)?.label}
            </h1>
            <p style={{ fontSize: 13, color: "#444" }}>
              {tab === "overview" && "Academy performance at a glance"}
              {tab === "players" && `${PLAYERS.length} players total · ${PLAYERS.filter(p => p.status === "active").length} active`}
              {tab === "schedule" && "Weekly court and session schedule"}
              {tab === "billing" && "Invoice management and payment tracking"}
              {tab === "coaches" && "3 coaches · 24 sessions this week"}
            </p>
          </div>
          {tab === "overview" && <OverviewTab />}
          {tab === "players" && <PlayersTab />}
          {tab === "schedule" && <ScheduleTab />}
          {tab === "billing" && <BillingTab />}
          {tab === "coaches" && <CoachesTab />}
        </div>
      </div>
    </div>
  );
}
