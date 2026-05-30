import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const player_id = searchParams.get("player_id");
  const academy_id = searchParams.get("academy_id");
  if (!player_id || !academy_id) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const db = getDb();
  const player = db.prepare(
    "SELECT id, name, age, level, coach_name FROM players WHERE id = ? AND academy_id = ?"
  ).get(parseInt(player_id), parseInt(academy_id));

  return NextResponse.json({ player });
}
