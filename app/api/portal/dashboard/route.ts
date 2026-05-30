import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role,player_id,academy_id")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "parent") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { player_id, academy_id } = profile;
    const db = getDb();

    const player = db.prepare(
      "SELECT name, coach_name FROM players WHERE id = ? AND academy_id = ?"
    ).get(player_id, academy_id) as any;

    const today = new Date().toISOString().slice(0, 10);

    const nextSession = db.prepare(
      "SELECT date, start_time, type, coach_name, notes FROM sessions WHERE academy_id = ? AND (player_id = ? OR player_name = ?) AND date >= ? ORDER BY date ASC, start_time ASC LIMIT 1"
    ).get(academy_id, player_id, player?.name || "", today) as any;

    const lastNote = db.prepare(
      "SELECT notes, date FROM sessions WHERE academy_id = ? AND (player_id = ? OR player_name = ?) AND notes IS NOT NULL AND notes != '' ORDER BY date DESC LIMIT 1"
    ).get(academy_id, player_id, player?.name || "") as any;

    const unpaidCount = (db.prepare(
      "SELECT COUNT(*) as cnt FROM invoices WHERE academy_id = ? AND (player_id = ? OR player_name = ?) AND status = 'pending'"
    ).get(academy_id, player_id, player?.name || "") as any)?.cnt || 0;

    const totalSessions = (db.prepare(
      "SELECT COUNT(*) as cnt FROM sessions WHERE academy_id = ? AND (player_id = ? OR player_name = ?)"
    ).get(academy_id, player_id, player?.name || "") as any)?.cnt || 0;

    return NextResponse.json({ player, nextSession, lastNote, unpaidCount, totalSessions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
