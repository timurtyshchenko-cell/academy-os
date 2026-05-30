"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

interface Stats {
  attended: number; missed: number; total: number;
  level: string; weekNoMissed: boolean; weekHasSessions: boolean;
}

interface Badge {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  color: string;
  earned: (s: Stats) => boolean;
}

const BADGES: Badge[] = [
  {
    id: "first",
    emoji: "🎾",
    title: "Первая тренировка",
    desc: "Посетить первую тренировку",
    color: "#1F6B45",
    earned: s => s.attended >= 1,
  },
  {
    id: "ten",
    emoji: "🔥",
    title: "10 тренировок",
    desc: "Посетить 10 тренировок",
    color: "#e07b4f",
    earned: s => s.attended >= 10,
  },
  {
    id: "fifty",
    emoji: "🏆",
    title: "50 тренировок",
    desc: "Посетить 50 тренировок",
    color: "#FFD447",
    earned: s => s.attended >= 50,
  },
  {
    id: "fullweek",
    emoji: "📅",
    title: "Полная неделя",
    desc: "Не пропустить ни одной тренировки на этой неделе",
    color: "#18B3A4",
    earned: s => s.weekNoMissed,
  },
  {
    id: "levelup",
    emoji: "⬆️",
    title: "Новый уровень",
    desc: "Подняться выше начального уровня",
    color: "#9b59b6",
    earned: s => s.level !== "Beginner",
  },
  {
    id: "consistent",
    emoji: "💪",
    title: "Постоянство",
    desc: "Посетить 25 тренировок",
    color: "#d97706",
    earned: s => s.attended >= 25,
  },
];

export default function PlayerAchievements() {
  const supabase = createClient();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/portal/login"); return; }
    const res = await fetch("/api/portal/achievements");
    if (!res.ok) { router.push("/portal/login"); return; }
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--c-bg)" }}>
      <div style={{ width:32, height:32, border:"3px solid var(--c-border)", borderTopColor:"#1F6B45", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const earnedCount = stats ? BADGES.filter(b => b.earned(stats)).length : 0;

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
            <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:".1em", margin:0 }}>Портал игрока</p>
            <p style={{ fontSize:16, fontWeight:800, color:"#fff", margin:0 }}>Достижения</p>
          </div>
        </div>
        <button onClick={() => router.push("/player")} style={{ background:"rgba(255,255,255,.15)", border:"none", color:"#fff", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600 }}>← Назад</button>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"20px 16px", display:"flex", flexDirection:"column", gap:16 }}>

        {/* Progress summary */}
        <div style={{ background:"var(--c-card)", border:"1px solid var(--c-border)", borderRadius:16, padding:"20px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <p style={{ fontSize:14, fontWeight:800, color:"var(--c-text)", margin:0 }}>Получено наград</p>
            <p style={{ fontSize:20, fontWeight:900, color:"#1F6B45", margin:0 }}>{earnedCount} / {BADGES.length}</p>
          </div>
          <div style={{ height:8, background:"var(--c-inner)", borderRadius:100, overflow:"hidden" }}>
            <div style={{ width:`${(earnedCount/BADGES.length)*100}%`, height:"100%", background:"linear-gradient(90deg,#186038,#1F6B45)", borderRadius:100, transition:"width .5s ease" }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:14 }}>
            {[
              { label:"Посещено", value: stats!.attended, color:"#1F6B45" },
              { label:"Пропущено", value: stats!.missed, color:"#ef4444" },
              { label:"Уровень", value: stats!.level, color:"#9b59b6" },
            ].map(st => (
              <div key={st.label} style={{ background:"var(--c-inner)", borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
                <p style={{ fontSize:10, fontWeight:700, color:"var(--c-text-muted)", textTransform:"uppercase", letterSpacing:".07em", margin:"0 0 4px" }}>{st.label}</p>
                <p style={{ fontSize:16, fontWeight:900, color:st.color, margin:0 }}>{st.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Badge grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
          {BADGES.map(badge => {
            const isEarned = badge.earned(stats!);
            return (
              <div key={badge.id} style={{
                background: isEarned ? "var(--c-card)" : "var(--c-inner)",
                border: `1px solid ${isEarned ? badge.color + "44" : "var(--c-border)"}`,
                borderRadius:16, padding:"20px 18px",
                opacity: isEarned ? 1 : 0.55,
                transition:"all .2s",
                position:"relative", overflow:"hidden",
              }}>
                {isEarned && (
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:badge.color, borderRadius:"16px 16px 0 0" }} />
                )}
                <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <div style={{
                    width:52, height:52, borderRadius:14, flexShrink:0,
                    background: isEarned ? badge.color + "18" : "var(--c-border)",
                    border: `2px solid ${isEarned ? badge.color + "44" : "transparent"}`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:24,
                  }}>
                    {isEarned ? badge.emoji : "🔒"}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:14, fontWeight:800, color: isEarned ? "var(--c-text)" : "var(--c-text-muted)", margin:"0 0 4px", lineHeight:1.2 }}>{badge.title}</p>
                    <p style={{ fontSize:12, color:"var(--c-text-muted)", margin:0, lineHeight:1.4 }}>{badge.desc}</p>
                    {isEarned && (
                      <span style={{ display:"inline-block", marginTop:8, fontSize:11, fontWeight:700, color:badge.color, background:badge.color+"18", padding:"2px 8px", borderRadius:100 }}>
                        ✓ Получено
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
