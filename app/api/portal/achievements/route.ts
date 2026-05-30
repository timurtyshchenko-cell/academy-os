import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

function weekBounds() {
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(monday), to: fmt(sunday) };
}

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("role,player_id,academy_id").eq("id", user.id).single();
    if (!profile || !["parent","player"].includes(profile.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { player_id, academy_id } = profile;
    const db = getDb();

    const player = db.prepare("SELECT name, level FROM players WHERE id = ? AND academy_id = ?").get(player_id, academy_id) as any;
    const name = player?.name || "";

    const allSessions = db.prepare(
      "SELECT attendance FROM sessions WHERE academy_id = ? AND (player_id = ? OR player_name = ?)"
    ).all(academy_id, player_id, name) as any[];

    const attended = allSessions.filter(s => s.attendance !== "missed").length;
    const missed = allSessions.filter(s => s.attendance === "missed").length;

    const { from, to } = weekBounds();
    const weekSessions = db.prepare(
      "SELECT attendance FROM sessions WHERE academy_id = ? AND (player_id = ? OR player_name = ?) AND date >= ? AND date <= ?"
    ).all(academy_id, player_id, name, from, to) as any[];
    const weekHasSessions = weekSessions.length > 0;
    const weekNoMissed = weekHasSessions && weekSessions.every(s => s.attendance !== "missed");

    return NextResponse.json({
      attended,
      missed,
      total: allSessions.length,
      level: player?.level || "Beginner",
      weekNoMissed,
      weekHasSessions,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
