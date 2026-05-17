"use client";
import { useState, useEffect } from "react";

interface Invoice { id: number; player_name: string; player_id: number; amount: number; status: string; month: string; due_date: string; paid_at: string; created_at: string }

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
    .hero{background:linear-gradient(135deg,#4f46e5,#2563eb);border-radius:16px;padding:36px;text-align:center;color:#fff;margin-bottom:24px}
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

  const filtered = filter === "all" ? invoices : invoices.filter(i => filter === "paid" ? i.status === "paid" : i.status !== "paid");
  const totalPending = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0);
  const totalCollected = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const pendingCount = invoices.filter(i => i.status !== "paid").length;

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <div style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="mobile-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--c-text)", letterSpacing: "-1px", marginBottom: 4 }}>Billing</h1>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)" }}>{pendingCount} pending · {invoices.length} total</p>
        </div>
        <button onClick={generate} disabled={generating} style={{ background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 10, border: "none", cursor: generating ? "not-allowed" : "pointer", opacity: generating ? .7 : 1, boxShadow: "0 4px 16px rgba(37,99,235,.3)", whiteSpace: "nowrap" }}>
          {generating ? "Generating..." : "⚡ Generate"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {[
          { label: "Collected", value: `$${totalCollected.toLocaleString()}`, color: "#059669", sub: `${invoices.filter(i => i.status === "paid").length} paid` },
          { label: "Pending", value: `$${totalPending.toLocaleString()}`, color: "#f59e0b", sub: `${pendingCount} invoice${pendingCount !== 1 ? "s" : ""}` },
          { label: "Total Billed", value: `$${(totalCollected + totalPending).toLocaleString()}`, color: "var(--c-text)", sub: `${invoices.length} total` },
        ].map(({ label, value, color, sub }) => (
          <div key={label} style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 14, padding: "18px 20px", boxShadow: "var(--c-shadow)" }}>
            <p style={{ fontSize: 11, color: "var(--c-text-dim)", fontWeight: 600, marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 26, fontWeight: 900, color, marginBottom: 4 }}>{value}</p>
            <p style={{ fontSize: 12, color: "var(--c-text-dim)" }}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {(["all", "pending", "paid"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "8px 16px", borderRadius: 8, border: "1px solid",
            borderColor: filter === f ? "#2563eb" : "var(--c-border)",
            background: filter === f ? "rgba(37,99,235,.12)" : "transparent",
            color: filter === f ? "#60a5fa" : "var(--c-text-muted)",
            fontSize: 13, fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
          }}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: "var(--c-card)", border: "1px dashed var(--c-border)", borderRadius: 16, padding: 60, textAlign: "center", boxShadow: "var(--c-shadow)" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>💳</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", marginBottom: 8 }}>{invoices.length === 0 ? "No invoices yet" : "No invoices match this filter"}</p>
          <p style={{ fontSize: 14, color: "var(--c-text-muted)", marginBottom: 20 }}>{invoices.length === 0 ? "Click Generate Invoices to bill all active players" : "Try a different filter"}</p>
          {invoices.length === 0 && <button onClick={generate} disabled={generating} style={{ background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer" }}>Generate First Invoices →</button>}
        </div>
      ) : (
        <div style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--c-shadow)" }}>
          <div className="mobile-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--c-border)", background: "var(--c-inner)" }}>
                {["Player", "Month", "Amount", "Due Date", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: ".08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id} style={{ borderBottom: "1px solid var(--c-border)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--c-row)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, background: "var(--c-avatar-bg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--c-avatar-text)" }}>{(inv.player_name || "?")[0]}</div>
                      <span style={{ fontSize: 14, color: "var(--c-text-2)", fontWeight: 600 }}>{inv.player_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--c-text-3)" }}>{inv.month || "—"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "var(--c-text)" }}>${inv.amount.toLocaleString()}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--c-text-muted)" }}>{inv.due_date || "—"}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, color: inv.status === "paid" ? "#059669" : "#f59e0b", background: inv.status === "paid" ? "#05966918" : "#f59e0b18" }}>
                      {inv.status === "paid" ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      {inv.status !== "paid" && (
                        <button onClick={() => markPaid(inv.id)} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "1px solid rgba(37,99,235,.3)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontWeight: 600 }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none"; }}>
                          Mark Paid
                        </button>
                      )}
                      <button onClick={() => sendToParent(inv.id)} disabled={sending === inv.id}
                        style={{ fontSize: 12, color: sentIds.has(inv.id) ? "#059669" : "var(--c-text-3)", background: "none", border: "1px solid", borderColor: sentIds.has(inv.id) ? "rgba(5,150,105,.3)" : "var(--c-border)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontWeight: 600, opacity: sending === inv.id ? .6 : 1 }}>
                        {sending === inv.id ? "..." : sentIds.has(inv.id) ? "✓ Sent" : "📧 Send"}
                      </button>
                      {inv.status !== "paid" && (
                        <button onClick={() => sendReminder(inv.id)} disabled={reminding === inv.id}
                          style={{ fontSize: 12, color: remindedIds.has(inv.id) ? "#f59e0b" : "var(--c-text-3)", background: "none", border: "1px solid", borderColor: remindedIds.has(inv.id) ? "rgba(245,158,11,.3)" : "var(--c-border)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontWeight: 600, opacity: reminding === inv.id ? .6 : 1 }}>
                          {reminding === inv.id ? "..." : remindedIds.has(inv.id) ? "✓ Reminded" : "🔔 Remind"}
                        </button>
                      )}
                      <button onClick={() => printInvoice(inv)}
                        style={{ fontSize: 12, color: "var(--c-text-3)", background: "none", border: "1px solid var(--c-border)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontWeight: 600 }}>
                        🖨️ PDF
                      </button>
                    </div>
                    {sendError && (sending === null && reminding === null) && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4, maxWidth: 300, wordBreak: "break-word" }}>{sendError}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
