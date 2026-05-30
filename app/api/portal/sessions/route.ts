import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const player_id = searchParams.get("player_id");
  const academy_id = searchParams.get("academy_id");
  if (!player_id || !academy_id) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") || req.cookies.get("sb-access-token")?.value;

  const admin = supabaseAdmin();
  const { data: { user } } = token
    ? await admin.auth.getUser(token)
    : { data: { user: null } };

  if (!user) {
    const cookies = req.headers.get("cookie") || "";
    const match = cookies.match(/sb-[^=]+-auth-token=([^;]+)/);
    if (!match) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const player = db.prepare("SELECT name FROM players WHERE id = ? AND academy_id = ?").get(parseInt(player_id), parseInt(academy_id)) as any;
  const sessions = player
    ? db.prepare("SELECT * FROM sessions WHERE academy_id = ? AND (player_id = ? OR player_name = ?) ORDER BY date DESC LIMIT 50").all(parseInt(academy_id), parseInt(player_id), player.name)
    : [];

  return NextResponse.json({ sessions });
}
