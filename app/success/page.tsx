"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { useLang } from "@/lib/i18n/context";

function SuccessContent() {
  const params = useSearchParams();
  const { t } = useLang();
  const l = t.success;
  const type = params.get("type");
  const isSub = type === "subscription";

  const subSteps = [
    { icon: "📧", text: l.subStep1 },
    { icon: "📞", text: l.subStep2 },
    { icon: "⚙️", text: l.subStep3 },
    { icon: "🎓", text: l.subStep4 },
    { icon: "🚀", text: l.subStep5 },
  ];

  const setupSteps = [
    { icon: "📧", text: l.setupStep1 },
    { icon: "📞", text: l.setupStep2 },
    { icon: "🛠️", text: l.setupStep3 },
    { icon: "🎓", text: l.setupStep4 },
    { icon: "✅", text: l.setupStep5 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#081418", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <style>{`@keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.15);opacity:.1} }`}</style>
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
        {/* Icon */}
        <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto 36px" }}>
          <div style={{ position: "absolute", inset: -8, borderRadius: "50%", background: "rgba(31,107,69,.15)", animation: "pulse-ring 2.5s ease-in-out infinite" }} />
          <div style={{ position: "relative", width: 96, height: 96, background: "linear-gradient(135deg,#186038,#1F6B45)", border: "2px solid rgba(31,107,69,.4)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, boxShadow: "0 8px 32px rgba(31,107,69,.35)" }}>✓</div>
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(31,107,69,.1)", border: "1px solid rgba(31,107,69,.22)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: "#97A6B2", fontWeight: 600 }}>{l.paymentConfirmed}</span>
        </div>

        <h1 style={{ fontSize: 40, fontWeight: 900, color: "#F5F7FA", letterSpacing: "-1.5px", marginBottom: 14, lineHeight: 1.1 }}>
          {isSub ? l.titleSub : l.titleSetup}
        </h1>
        <p style={{ fontSize: 16, color: "#97A6B2", lineHeight: 1.75, marginBottom: 40, maxWidth: 440, margin: "0 auto 40px" }}>
          {isSub ? l.descSub : l.descSetup}
        </p>

        {/* What happens next */}
        <div style={{ background: "#0b1a20", border: "1px solid rgba(31,107,69,.2)", borderRadius: 20, padding: "28px 32px", marginBottom: 32, textAlign: "left" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#18B3A4", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 18 }}>{l.whatNext}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(isSub ? subSteps : setupSteps).map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 12 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: "#97A6B2" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FFD447", color: "#081418", fontWeight: 800, fontSize: 15, padding: "13px 32px", borderRadius: 12, textDecoration: "none", boxShadow: "0 4px 20px rgba(255,212,71,.25)" }}>
            {l.createAccount}
          </Link>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,.1)", color: "#97A6B2", fontWeight: 600, fontSize: 14, padding: "13px 24px", borderRadius: 12, textDecoration: "none" }}>
            {l.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Success() {
  return <Suspense><SuccessContent /></Suspense>;
}
