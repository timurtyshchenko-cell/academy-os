"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fmtDate, fmtHours, langToLocale } from "@/lib/date-ru";
import { useLang } from "@/lib/i18n/context";

export const dynamic = "force-dynamic";

interface Session {
  id: number; date: string; start_time: string | null;
  duration: number; type: string; coach_name: string;
  notes: string | null; attendance: string | null; rating: number | null;
}

const SESSION_META: Record<string, { color: string; light: string }> = {
  Training:         { color: "#1F6B45", light: "rgba(31,107,69,.1)" },
  Match:            { color: "#b8960a", light: "rgba(184,150,10,.1)" },
  Fitness:          { color: "#18B3A4", light: "rgba(24,179,164,.1)" },
  "Serve Practice": { color: "#e07b4f", light: "rgba(224,123,79,.1)" },
  Doubles:          { color: "#9b59b6", light: "rgba(155,89,182,.1)" },
  "Video Analysis": { color: "#607080", light: "rgba(96,112,128,.1)" },
};

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display:"flex", gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize:14, color: i <= rating ? "#FFD447" : "var(--c-border)" }}>★</span>
      ))}
    </div>
  );
}

export default function ParentProgress() {
  const supabase = createClient();
  const router = useRouter();
  const { t, lang } = useLang();
  const p = t.portal;
  const locale = langToLocale(lang);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/portal/login"); return; }

    const res = await fetch("/api/portal/progress");
    if (!res.ok) { router.push("/portal/login"); return; }
    const data = await res.json();
    setSessions(data.sessions || []);
    setPlayerName(data.playerName || "");
    setLoading(false);
  }

  const attended = sessions.filter(s => s.attendance !== "missed").length;
  const missed = sessions.filter(s => s.attendance === "missed").length;
  const totalHours = sessions.reduce((sum, s) => sum + (s.duration || 60), 0) / 60;

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
            <p style={{ fontSize:16, fontWeight:800, color:"#fff", margin:0 }}>{p.progress} · {playerName}</p>
          </div>
        </div>
        <button onClick={() => router.push("/parent")} style={{ background:"rgba(255,255,255,.15)", border:"none", color:"#fff", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600 }}>{p.back}</button>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"20px 16px", display:"flex", flexDirection:"column", gap:16 }}>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[
            { label: p.totalLabel, value: sessions.length, color:"#1F6B45" },
            { label: p.attended,   value: attended,        color:"#18B3A4" },
            { label: p.missed,     value: missed,          color:"#ef4444" },
            { label: p.hours,      value: fmtHours(totalHours, lang), color:"#d97706" },
          ].map(st => (
            <div key={st.label} style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderLeft:`3px solid ${st.color}`, borderRadius:12, padding:"12px 14px" }}>
              <p style={{ fontSize:10, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".07em", margin:"0 0 3px" }}>{st.label}</p>
              <p style={{ fontSize:20, fontWeight:900, color:"var(--c-text)", margin:0 }}>{st.value}</p>
            </div>
          ))}
        </div>

        {/* Session list */}
        {sessions.length === 0 ? (
          <div style={{ background:"var(--c-card)", border:"2px dashed var(--c-border)", borderRadius:16, padding:48, textAlign:"center" }}>
            <p style={{ fontSize:32, margin:"0 0 12px" }}>🎾</p>
            <p style={{ fontSize:15, fontWeight:700, color:"var(--c-text)", margin:0 }}>{p.noSessions}</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {sessions.map(sess => {
              const meta = SESSION_META[sess.type] || SESSION_META.Training;
              const wasAttended = sess.attendance !== "missed";
              return (
                <div key={sess.id} style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:14, overflow:"hidden" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderBottom: (sess.notes || sess.rating) ? "1px solid var(--c-border)" : "none" }}>
                    <div style={{ width:40, height:40, background:meta.light, border:`1px solid ${meta.color}33`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:11, fontWeight:900, color:meta.color }}>{sess.type.slice(0,2).toUpperCase()}</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <p style={{ fontSize:14, fontWeight:800, color:"var(--c-text)", margin:0 }}>{sess.type}</p>
                        <span style={{ fontSize:11, fontWeight:700, color: wasAttended ? "#1F6B45" : "#ef4444", background: wasAttended ? "rgba(31,107,69,.1)" : "rgba(239,68,68,.1)", padding:"2px 8px", borderRadius:100 }}>
                          {wasAttended ? p.sessionAttended : p.sessionMissed}
                        </span>
                      </div>
                      <p style={{ fontSize:12, color:"var(--c-text-muted)", margin:"3px 0 0" }}>
                        {fmtDate(sess.date, locale)}
                        {sess.start_time && ` · ${sess.start_time}`}
                        {sess.duration && ` · ${sess.duration} ${p.minsAbbr}`}
                        {sess.coach_name && ` · ${sess.coach_name}`}
                      </p>
                    </div>
                    {sess.rating && <Stars rating={sess.rating} />}
                  </div>
                  {sess.notes && (
                    <div style={{ padding:"12px 16px", background:"var(--c-inner)" }}>
                      <p style={{ fontSize:11, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".07em", margin:"0 0 4px" }}>{p.coachNote}</p>
                      <p style={{ fontSize:13, color:"var(--c-text)", margin:0, lineHeight:1.5 }}>{sess.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
