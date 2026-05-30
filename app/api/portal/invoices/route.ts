import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const player_id = searchParams.get("player_id");
  const academy_id = searchParams.get("academy_id");
  if (!player_id || !academy_id) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const db = getDb();
  const player = db.prepare("SELECT name FROM players WHERE id = ? AND academy_id = ?").get(parseInt(player_id), parseInt(academy_id)) as any;
  const invoices = player
    ? db.prepare("SELECT * FROM invoices WHERE academy_id = ? AND (player_id = ? OR player_name = ?) ORDER BY created_at DESC LIMIT 20").all(parseInt(academy_id), parseInt(player_id), player.name)
    : [];

  return NextResponse.json({ invoices });
}
