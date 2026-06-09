"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fmtDate, langToLocale } from "@/lib/date-ru";
import { useLang } from "@/lib/i18n/context";

export const dynamic = "force-dynamic";

interface Invoice {
  id: number; player_name: string; amount: number;
  status: string; month: string; due_date: string;
  created_at: string; paid_at: string | null;
}

function ParentInvoicesInner() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useLang();
  const p = t.portal;
  const locale = langToLocale(lang);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/portal/login"); return; }

    const paidParam = searchParams.get("paid");
    if (paidParam) {
      await fetch("/api/portal/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: parseInt(paidParam) }),
      });
      setSuccessId(parseInt(paidParam));
      router.replace("/parent/invoices");
    }

    const res = await fetch("/api/portal/invoices");
    if (!res.ok) { router.push("/portal/login"); return; }
    const data = await res.json();
    setInvoices(data.invoices || []);
    setLoading(false);
  }

  async function pay(invoice: Invoice) {
    setPayingId(invoice.id);
    const res = await fetch("/api/portal/invoice-pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoice_id: invoice.id }),
    });
    const data = await res.json();
    setPayingId(null);
    if (data.url) window.location.href = data.url;
  }

  const unpaid = invoices.filter(i => i.status !== "paid");
  const paid = invoices.filter(i => i.status === "paid");
  const totalOwed = unpaid.reduce((s, i) => s + i.amount, 0);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--c-bg)" }}>
      <div style={{ width:32, height:32, border:"3px solid var(--c-border)", borderTopColor:"#1F6B45", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--c-bg)", fontFamily:"inherit" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#186038,#1F6B45)", padding:"18px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, background:"rgba(255,255,255,.15)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:16, fontWeight:900, color:"#FFD447" }}>A</span>
          </div>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:".1em", margin:0 }}>{p.parentPortal}</p>
            <p style={{ fontSize:16, fontWeight:800, color:"#fff", margin:0 }}>{p.invoices}</p>
          </div>
        </div>
        <button onClick={() => router.push("/parent")} style={{ background:"rgba(255,255,255,.15)", border:"none", color:"#fff", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600 }}>{p.back}</button>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"20px 16px", display:"flex", flexDirection:"column", gap:16 }}>

        {/* Success banner */}
        {successId && (
          <div style={{ background:"rgba(31,107,69,.1)", border:"1px solid rgba(31,107,69,.3)", borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>✅</span>
            <p style={{ fontSize:14, fontWeight:700, color:"#1F6B45", margin:0 }}>{p.paymentSuccess}</p>
          </div>
        )}

        {/* Summary */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
          {[
            { label: p.total, value: invoices.length, color:"#1F6B45" },
            { label: p.owed,  value: `$${totalOwed.toLocaleString()}`, color: totalOwed > 0 ? "#ef4444" : "#1F6B45" },
            { label: p.paid,  value: paid.length, color:"#18B3A4" },
          ].map(st => (
            <div key={st.label} style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderLeft:`3px solid ${st.color}`, borderRadius:12, padding:"12px 14px" }}>
              <p style={{ fontSize:10, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".07em", margin:"0 0 3px" }}>{st.label}</p>
              <p style={{ fontSize:20, fontWeight:900, color:"var(--c-text)", margin:0 }}>{st.value}</p>
            </div>
          ))}
        </div>

        {/* Unpaid */}
        {unpaid.length > 0 && (
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".08em", margin:"0 0 10px" }}>{p.unpaidInvoices}</p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {unpaid.map(inv => (
                <div key={inv.id} style={{ background:"var(--c-card)", border:"1px solid rgba(239,68,68,.25)", borderRadius:14, padding:"16px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <p style={{ fontSize:15, fontWeight:900, color:"var(--c-text)", margin:0 }}>{inv.month}</p>
                      <span style={{ fontSize:11, fontWeight:700, color:"#ef4444", background:"rgba(239,68,68,.1)", padding:"2px 8px", borderRadius:100 }}>{p.invoiceUnpaid}</span>
                    </div>
                    <p style={{ fontSize:12, color:"var(--c-text-muted)", margin:0 }}>{p.dueBy} {fmtDate(inv.due_date, locale)}</p>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <p style={{ fontSize:22, fontWeight:900, color:"var(--c-text)", margin:0 }}>${inv.amount.toLocaleString()}</p>
                    <button onClick={() => pay(inv)} disabled={payingId === inv.id}
                      style={{ padding:"10px 20px", background:"#1F6B45", border:"none", borderRadius:10, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", opacity: payingId === inv.id ? .7 : 1, whiteSpace:"nowrap" }}>
                      {payingId === inv.id ? p.opening : p.payNow}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paid */}
        {paid.length > 0 && (
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".08em", margin:"0 0 10px" }}>{p.paidInvoices}</p>
            <div style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:14, overflow:"hidden" }}>
              {paid.map((inv, i) => (
                <div key={inv.id} style={{ padding:"14px 18px", borderBottom: i < paid.length-1 ? "1px solid var(--c-border)" : "none", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:"var(--c-text)", margin:"0 0 2px" }}>{inv.month}</p>
                    <p style={{ fontSize:12, color:"var(--c-text-muted)", margin:0 }}>{inv.paid_at ? `${p.paidOn} ${fmtDate(inv.paid_at, locale)}` : p.paidOn}</p>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <p style={{ fontSize:16, fontWeight:900, color:"var(--c-text)", margin:0 }}>${inv.amount.toLocaleString()}</p>
                    <span style={{ fontSize:11, fontWeight:700, color:"#1F6B45", background:"rgba(31,107,69,.1)", padding:"3px 10px", borderRadius:100 }}>{p.invoicePaid}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {invoices.length === 0 && (
          <div style={{ background:"var(--c-card)", border:"2px dashed var(--c-border)", borderRadius:16, padding:48, textAlign:"center" }}>
            <p style={{ fontSize:32, margin:"0 0 12px" }}>🧾</p>
            <p style={{ fontSize:15, fontWeight:700, color:"var(--c-text)", margin:0 }}>{p.noInvoices}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ParentInvoices() {
  return (
    <Suspense>
      <ParentInvoicesInner />
    </Suspense>
  );
}
