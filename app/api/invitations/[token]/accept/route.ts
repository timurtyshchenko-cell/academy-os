import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { password } = await req.json();
  if (!password || password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const admin = supabaseAdmin();

  const { data: invitation, error: invErr } = await admin
    .from("invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .single();

  if (invErr || !invitation) return NextResponse.json({ error: "Invitation not found or expired" }, { status: 404 });

  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
  });

  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 });

  await admin.from("profiles").upsert({
    id: authData.user.id,
    role: invitation.role,
    player_id: invitation.player_id,
    academy_id: invitation.academy_id,
  });

  await admin.from("invitations").update({ status: "accepted" }).eq("id", invitation.id);

  return NextResponse.json({ success: true, role: invitation.role });
}
