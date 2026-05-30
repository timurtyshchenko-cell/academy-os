import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";
import { sendInviteEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, role, player_id } = await req.json();
    if (!email || !role || !player_id) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 500 });
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return NextResponse.json({ error: "NEXT_PUBLIC_SUPABASE_URL not configured" }, { status: 500 });

    const db = getDb();
    const player = db.prepare("SELECT * FROM players WHERE id = ? AND academy_id = ?").get(player_id, session.academyId) as any;
    if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 });

    const admin = supabaseAdmin();
    const { data: invitation, error } = await admin
      .from("invitations")
      .insert({ email, role, player_id, academy_id: session.academyId })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.token}`;

    try {
      await sendInviteEmail({ to: email, role, playerName: player.name, academyName: session.academyName, token: invitation.token });
    } catch (e) {
      console.warn("Email send failed:", e);
    }

    return NextResponse.json({ success: true, inviteUrl, token: invitation.token });
  } catch (e: any) {
    console.error("Invitation error:", e);
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
