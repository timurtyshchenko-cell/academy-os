"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const type = params.get("type");
  const isSub = type === "subscription";

  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 540, textAlign: "center" }}>
        <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 32px" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(37,99,235,.1)", animation: "pulse 2s ease-in-out infinite" }} />
          <div style={{ position: "relative", width: 100, height: 100, background: "rgba(37,99,235,.15)", border: "2px solid rgba(37,99,235,.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>✅</div>
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", marginBottom: 12 }}>
          {isSub ? "Welcome to AcademyOS!" : "Setup Initiated!"}
        </h1>
        <p style={{ fontSize: 16, color: "#555", lineHeight: 1.7, marginBottom: 36 }}>
          {isSub ? "Your subscription is active. Our team will reach out within 24 hours to begin your academy setup and onboarding." : "Your setup payment was received. Our team will contact you within 24 hours to kick off your custom implementation."}
        </p>
        <div style={{ background: "#0c0c0c", border: "1px solid rgba(37,99,235,.15)", borderRadius: 20, padding: 28, marginBottom: 36, textAlign: "left" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>What happens next:</p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
            {(isSub ? [
              "📧 Confirmation email sent to your inbox",
              "📞 Onboarding call scheduled within 24 hours",
              "⚙️ Custom academy configuration (3–5 business days)",
              "🎓 Full team training session included",
              "🚀 Go live with full system access",
            ] : [
              "📧 Confirmation email and receipt sent",
              "📞 Discovery call within 24 hours",
              "🛠️ Custom system build (5–7 business days)",
              "🎓 Full coach onboarding session",
              "✅ 30-day post-launch support included",
            ]).map(item => (
              <li key={item} style={{ fontSize: 14, color: "#777", display: "flex", alignItems: "center", gap: 10 }}>{item}</li>
            ))}
          </ul>
        </div>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{ display: "flex", alignItems: "center", gap: 8, background: "#2563eb", color: "#fff", fontWeight: 800, fontSize: 15, padding: "13px 28px", borderRadius: 12, textDecoration: "none", boxShadow: "0 4px 20px rgba(37,99,235,.3)" }}>
            Create your account →
          </Link>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #1a1a1a", color: "#555", fontWeight: 600, fontSize: 14, padding: "13px 24px", borderRadius: 12, textDecoration: "none" }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Success() {
  return <Suspense><SuccessContent /></Suspense>;
}
