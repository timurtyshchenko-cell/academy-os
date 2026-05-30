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
  sunday.setHours(23, 59, 59, 999);
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
    if (!profile || profile.role !== "player") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { player_id, academy_id } = profile;
    const db = getDb();

    const player = db.prepare(
      "SELECT name, level, coach_name, age FROM players WHERE id = ? AND academy_id = ?"
    ).get(player_id, academy_id) as any;

    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toTimeString().slice(0, 5);

    const nextSession = db.prepare(`
      SELECT date, start_time, type, coach_name, duration FROM sessions
      WHERE academy_id = ? AND (player_id = ? OR player_name = ?)
        AND (date > ? OR (date = ? AND (start_time IS NULL OR start_time > ?)))
      ORDER BY date ASC, start_time ASC LIMIT 1
    `).get(academy_id, player_id, player?.name || "", today, today, now) as any;

    const { from, to } = weekBounds();
    const weekSessions = db.prepare(`
      SELECT attendance FROM sessions
      WHERE academy_id = ? AND (player_id = ? OR player_name = ?)
        AND date >= ? AND date <= ?
    `).all(academy_id, player_id, player?.name || "", from, to) as any[];

    const weekTotal = weekSessions.length;
    const weekAttended = weekSessions.filter(s => s.attendance !== "missed").length;

    const allTime = (db.prepare(`
      SELECT COUNT(*) as cnt FROM sessions
      WHERE academy_id = ? AND (player_id = ? OR player_name = ?)
    `).get(academy_id, player_id, player?.name || "") as any)?.cnt || 0;

    const totalHours = (db.prepare(`
      SELECT SUM(duration) as total FROM sessions
      WHERE academy_id = ? AND (player_id = ? OR player_name = ?)
    `).get(academy_id, player_id, player?.name || "") as any)?.total || 0;

    return NextResponse.json({ player, nextSession, weekTotal, weekAttended, allTime, totalHours });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
