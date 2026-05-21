"use client";
import { useState, useEffect } from "react";

interface Invoice { id: number; player_name: string; player_id: number; amount: number; status: string; month: string; due_date: string; paid_at: string; created_at: string }

function initials(name: string) {
  if (!name) return "?";
  const p = name.trim().split(" ");
  return (p[0][0] + (p[1]?.[0] || "")).toUpperCase();
}

function monthLabel(m: string) {
  if (!m) return "—";
  const d = new Date(m + "-01");
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all");
  const [sending, setSending] = useState<number | null>(null);
  const [reminding, setReminding] = useState<number | null>(null);
  const [sentIds, setSentIds] = useState<Set<number>>(new Set());
  const [remindedIds, setRemindedIds] = useState<Set<number>>(new Set());
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const r = await fetch("/api/invoices");
    const d = await r.json();
    setInvoices(d.invoices || []);
    setLoading(false);
  }

  async function generate() {
    setGenerating(true);
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate" }) });
    await load();
    setGenerating(false);
  }

  async function markPaid(id: number) {
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "markPaid", invoiceId: id }) });
    await load();
  }

  async function sendToParent(id: number) {
    setSending(id); setSendError(null);
    const r = await fetch("/api/invoices/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invoiceId: id }) });
    const d = await r.json();
    if (!r.ok) setSendError(d.error || "Failed to send");
    else setSentIds(prev => new Set([...prev, id]));
    setSending(null);
  }

  async function deleteInvoice(id: number) {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", invoiceId: id }) });
    await load();
  }

  async function sendReminder(id: number) {
    setReminding(id); setSendError(null);
    const r = await fetch("/api/invoices/remind", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invoiceId: id }) });
    const d = await r.json();
    if (!r.ok) setSendError(d.error || "Failed to send reminder");
    else setRemindedIds(prev => new Set([...prev, id]));
    setReminding(null);
  }

  function printInvoice(inv: Invoice) {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice — ${inv.player_name}</title>
    <style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:40px;color:#111827;background:#fff}
    .header{text-align:center;margin-bottom:32px}.logo{font-size:24px;font-weight:900;letter-spacing:-1px}
    .hero{background:linear-gradient(135deg,#1F6B45,#18B3A4);border-radius:16px;padding:36px;text-align:center;color:#fff;margin-bottom:24px}
    .hero-label{font-size:11px;font-weight:700;opacity:.6;text-transform:uppercase;letter-spacing:.12em;margin:0 0 8px}
    .hero-amount{font-size:52px;font-weight:900;margin:0 0 6px;letter-spacing:-2px}
    .hero-sub{opacity:.7;margin:0}
    .row{display:flex;gap:16px;margin-bottom:24px}.card{flex:1;border:1px solid #e5e7eb;border-radius:12px;padding:20px}
    .card-label{font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px}
    .card-value{font-size:16px;font-weight:700;margin:0}
    .badge{display:inline-block;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:700;background:${inv.status === "paid" ? "#d1fae5" : "#fef3c7"};color:${inv.status === "paid" ? "#059669" : "#b45309"}}
    @media print{body{padding:20px}}</style></head>
    <body>
    <div class="header"><div class="logo">🎾 AcademyOS</div></div>
    <div class="hero">
      <p class="hero-label">Invoice · ${inv.month || "—"}</p>
      <p class="hero-amount">$${inv.amount.toLocaleString()}</p>
      <p class="hero-sub">Due by ${inv.due_date || "—"}</p>
    </div>
    <div class="row">
      <div class="card"><p class="card-label">Player</p><p class="card-value">${inv.player_name}</p></div>
      <div class="card"><p class="card-label">Status</p><p class="card-value"><span class="badge">${inv.status === "paid" ? "Paid" : "Pending"}</span></p></div>
      ${inv.paid_at ? `<div class="card"><p class="card-label">Paid on</p><p class="card-value">${inv.paid_at.split("T")[0]}</p></div>` : ""}
    </div>
    </body></html>`);
    win.document.close();
    win.print();
  }

  // Stats
  const totalCollected = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0);
  const pendingCount = invoices.filter(i => i.status !== "paid").length;
  const collectionRate = invoices.length > 0 ? Math.round((invoices.filter(i => i.status === "paid").length / invoices.length) * 100) : 0;

  // Monthly chart data — last 6 months
  const chartMonths: { key: string; label: string; paid: number; pending: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const monthInvs = invoices.filter(inv => (inv.month || "").startsWith(key));
    chartMonths.push({
      key, label,
      paid: monthInvs.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0),
      pending: monthInvs.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0),
    });
  }
  const chartMax = Math.max(...chartMonths.map(m => m.paid + m.pending), 1);

  // Group filtered invoices by month
  const filtered = filter === "all" ? invoices : invoices.filter(i => filter === "paid" ? i.status === "paid" : i.status !== "paid");
  const byMonth: Record<string, Invoice[]> = {};
  for (const inv of filtered) {
    const key = inv.month || "other";
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(inv);
  }
  const monthKeys = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "#1F6B45", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @media (max-width: 768px) {
          .billing-stats { grid-template-columns: repeat(2,1fr) !important; }
          .billing-chart { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 4 }}>Billing</h1>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)" }}>{pendingCount} pending · {invoices.length} total invoices</p>
        </div>
        <button onClick={generate} disabled={generating}
          style={{ background: "#1F6B45", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, border: "none", cursor: generating ? "not-allowed" : "pointer", opacity: generating ? .7 : 1, boxShadow: "0 4px 16px rgba(31,107,69,.3)", whiteSpace: "nowrap" }}>
          {generating ? "Generating..." : "⚡ Generate Invoices"}
        </button>
      </div>

      {/* Stats */}
      <div className="billing-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "Collected", value: `$${totalCollected.toLocaleString()}`, sub: `${invoices.filter(i=>i.status==="paid").length} invoices`, color: "#1F6B45" },
          { label: "Outstanding", value: `$${totalPending.toLocaleString()}`, sub: `${pendingCount} pending`, color: "#f59e0b" },
          { label: "Total Billed", value: `$${(totalCollected+totalPending).toLocaleString()}`, sub: `${invoices.length} total`, color: "#18B3A4" },
          { label: "Collection Rate", value: `${collectionRate}%`, sub: "paid on time", color: collectionRate >= 80 ? "#1F6B45" : collectionRate >= 50 ? "#f59e0b" : "#ef4444" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderLeft: `3px solid ${s.color}`, borderRadius: 14, padding: "14px 18px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".07em", margin: "0 0 4px" }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: "var(--c-text)", margin: "0 0 2px", letterSpacing: "-1px" }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "var(--c-text-dim)", margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      {invoices.length > 0 && (
        <div className="billing-chart" style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, padding: "20px 24px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: ".08em", margin: "0 0 16px" }}>Monthly Revenue — Last 6 Months</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 100 }}>
            {chartMonths.map(m => {
              const totalH = ((m.paid + m.pending) / chartMax) * 100;
              const paidH = (m.paid / chartMax) * 100;
              const isCurrent = m.key === `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
              return (
                <div key={m.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative" }}
                    title={`${m.label}: $${(m.paid+m.pending).toLocaleString()} ($${m.paid.toLocaleString()} paid)`}>
                    {/* Pending portion */}
                    {m.pending > 0 && (
                      <div style={{ width: "100%", height: `${((m.pending) / chartMax) * 100}%`, background: "rgba(245,158,11,.25)", borderRadius: paidH === 0 ? "6px 6px 0 0" : "0", borderTop: "2px solid rgba(245,158,11,.4)", minHeight: m.pending > 0 ? 3 : 0 }} />
                    )}
                    {/* Paid portion */}
                    {m.paid > 0 && (
                      <div style={{ width: "100%", height: `${paidH}%`, background: isCurrent ? "linear-gradient(180deg,#18B3A4,#1F6B45)" : "linear-gradient(180deg,#186038,#1F6B45)", borderRadius: m.pending > 0 ? "0 0 6px 6px" : "6px 6px 0 0", minHeight: 3 }} />
                    )}
                    {(m.paid + m.pending) === 0 && (
                      <div style={{ width: "100%", height: 3, background: "var(--c-border)", borderRadius: 6 }} />
                    )}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: isCurrent ? 800 : 600, color: isCurrent ? "#18B3A4" : "var(--c-text-dim)" }}>{m.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: "#1F6B45" }} />
              <span style={{ fontSize: 11, color: "var(--c-text-dim)" }}>Collected</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(245,158,11,.4)", border: "1px solid rgba(245,158,11,.6)" }} />
              <span style={{ fontSize: 11, color: "var(--c-text-dim)" }}>Pending</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6 }}>
        {(["all", "pending", "paid"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "8px 18px", borderRadius: 100, border: "1px solid", borderColor: filter === f ? "#1F6B45" : "var(--c-border)", background: filter === f ? "rgba(31,107,69,.1)" : "transparent", color: filter === f ? "#1F6B45" : "var(--c-text-muted)", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .15s", textTransform: "capitalize" }}>
            {f === "all" ? `All (${invoices.length})` : f === "paid" ? `Paid (${invoices.filter(i=>i.status==="paid").length})` : `Pending (${pendingCount})`}
          </button>
        ))}
      </div>

      {sendError && <p style={{ fontSize: 13, color: "#ef4444", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: "10px 14px" }}>⚠ {sendError}</p>}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div style={{ background: "var(--c-card)", border: "2px dashed var(--c-border)", borderRadius: 20, padding: 60, textAlign: "center" }}>
          <p style={{ fontSize: 40, marginBottom: 14 }}>💳</p>
          <p style={{ fontSize: 17, fontWeight: 800, color: "var(--c-text)", marginBottom: 8 }}>{invoices.length === 0 ? "No invoices yet" : "Nothing here"}</p>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)", marginBottom: 24 }}>{invoices.length === 0 ? "Click Generate to create invoices for all active players" : "Try a different filter"}</p>
          {invoices.length === 0 && <button onClick={generate} disabled={generating} style={{ background: "#1F6B45", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 28px", borderRadius: 12, border: "none", cursor: "pointer" }}>⚡ Generate First Invoices →</button>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {monthKeys.map(monthKey => {
            const monthInvs = byMonth[monthKey].sort((a, b) => a.player_name.localeCompare(b.player_name));
            const monthPaid = monthInvs.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
            const monthTotal = monthInvs.reduce((s, i) => s + i.amount, 0);
            const allPaid = monthInvs.every(i => i.status === "paid");
            return (
              <div key={monthKey} style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, overflow: "hidden" }}>
                {/* Month header */}
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--c-border)", background: "var(--c-inner)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: "var(--c-text)", margin: 0 }}>{monthLabel(monthKey)}</p>
                    <span style={{ fontSize: 11, fontWeight: 700, color: allPaid ? "#059669" : "#f59e0b", background: allPaid ? "#05966915" : "#f59e0b15", padding: "2px 8px", borderRadius: 100 }}>
                      {allPaid ? "All paid" : `${monthInvs.filter(i=>i.status==="paid").length}/${monthInvs.length} paid`}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 15, fontWeight: 900, color: "var(--c-text)", margin: 0 }}>${monthPaid.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--c-text-muted)" }}>/ ${monthTotal.toLocaleString()}</span></p>
                  </div>
                </div>

                {/* Invoice rows */}
                {monthInvs.map((inv, idx) => {
                  const paid = inv.status === "paid";
                  return (
                    <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: idx < monthInvs.length - 1 ? "1px solid var(--c-border)" : "none", borderLeft: `3px solid ${paid ? "#1F6B45" : "#f59e0b"}`, transition: "background .1s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--c-row)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      {/* Avatar */}
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: paid ? "rgba(31,107,69,.12)" : "rgba(245,158,11,.1)", border: `1px solid ${paid ? "rgba(31,107,69,.2)" : "rgba(245,158,11,.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 900, color: paid ? "#1F6B45" : "#f59e0b" }}>{initials(inv.player_name)}</span>
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                          <p style={{ fontSize: 14, fontWeight: 800, color: "var(--c-text)", margin: 0 }}>{inv.player_name}</p>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 100, color: paid ? "#059669" : "#f59e0b", background: paid ? "#05966915" : "#f59e0b15" }}>
                            {paid ? "✓ Paid" : "Pending"}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: "var(--c-text-dim)", margin: 0 }}>
                          Due {inv.due_date || "—"}
                          {paid && inv.paid_at ? ` · Paid ${inv.paid_at.split("T")[0]}` : ""}
                        </p>
                      </div>
                      {/* Amount */}
                      <p style={{ fontSize: 18, fontWeight: 900, color: "var(--c-text)", margin: 0, flexShrink: 0 }}>${inv.amount.toLocaleString()}</p>
                      {/* Actions */}
                      <div style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0 }}>
                        {!paid && (
                          <button onClick={() => markPaid(inv.id)}
                            style={{ fontSize: 12, fontWeight: 700, color: "#1F6B45", background: "rgba(31,107,69,.08)", border: "1px solid rgba(31,107,69,.2)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>
                            ✓ Paid
                          </button>
                        )}
                        <button onClick={() => sendToParent(inv.id)} disabled={sending === inv.id}
                          style={{ fontSize: 12, fontWeight: 600, color: sentIds.has(inv.id) ? "#059669" : "var(--c-text-muted)", background: "var(--c-inner)", border: `1px solid ${sentIds.has(inv.id) ? "rgba(5,150,105,.25)" : "var(--c-border)"}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", opacity: sending === inv.id ? .6 : 1, whiteSpace: "nowrap" }}>
                          {sending === inv.id ? "..." : sentIds.has(inv.id) ? "✓ Sent" : "Send"}
                        </button>
                        {!paid && (
                          <button onClick={() => sendReminder(inv.id)} disabled={reminding === inv.id}
                            style={{ fontSize: 12, fontWeight: 600, color: remindedIds.has(inv.id) ? "#f59e0b" : "var(--c-text-muted)", background: "var(--c-inner)", border: `1px solid ${remindedIds.has(inv.id) ? "rgba(245,158,11,.25)" : "var(--c-border)"}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", opacity: reminding === inv.id ? .6 : 1, whiteSpace: "nowrap" }}>
                            {reminding === inv.id ? "..." : remindedIds.has(inv.id) ? "✓ Reminded" : "Remind"}
                          </button>
                        )}
                        <button onClick={() => printInvoice(inv)}
                          style={{ width: 32, height: 32, background: "var(--c-inner)", border: "1px solid var(--c-border)", borderRadius: 8, color: "var(--c-text-dim)", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}
                          title="Print / PDF">⎙</button>
                        <button onClick={() => deleteInvoice(inv.id)}
                          style={{ width: 32, height: 32, background: "none", border: "1px solid var(--c-border)", borderRadius: 8, color: "var(--c-text-dim)", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#ef4444"; el.style.borderColor = "#ef4444"; }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--c-text-dim)"; el.style.borderColor = "var(--c-border)"; }}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
