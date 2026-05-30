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
    const invoices = db.prepare(
      "SELECT * FROM invoices WHERE academy_id = ? AND (player_id = ? OR player_name = ?) ORDER BY created_at DESC"
    ).all(academy_id, player_id, player?.name || "");

    return NextResponse.json({ invoices });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("role,player_id,academy_id").eq("id", user.id).single();
    if (!profile || profile.role !== "parent") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { invoice_id } = await req.json();
    const db = getDb();
    db.prepare("UPDATE invoices SET status = 'paid', paid_at = datetime('now') WHERE id = ? AND academy_id = ?")
      .run(invoice_id, profile.academy_id);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
