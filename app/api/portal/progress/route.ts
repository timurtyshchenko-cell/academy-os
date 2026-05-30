import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("role,player_id,academy_id").eq("id", user.id).single();
    if (!profile || profile.role !== "parent") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { player_id, academy_id } = profile;
    const db = getDb();

    const player = db.prepare("SELECT name FROM players WHERE id = ? AND academy_id = ?").get(player_id, academy_id) as any;
    const sessions = db.prepare(
      "SELECT id, date, start_time, duration, type, coach_name, notes, attendance, rating FROM sessions WHERE academy_id = ? AND (player_id = ? OR player_name = ?) ORDER BY date DESC, start_time DESC"
    ).all(academy_id, player_id, player?.name || "");

    return NextResponse.json({ sessions, playerName: player?.name || "" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
