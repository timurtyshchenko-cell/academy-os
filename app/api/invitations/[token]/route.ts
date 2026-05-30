import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = supabaseAdmin();

  const { data, error } = await admin
    .from("invitations")
    .select("id,email,role,status,expires_at,player_id,academy_id")
    .eq("token", token)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !data) return NextResponse.json({ error: "Invitation not found or expired" }, { status: 404 });
  return NextResponse.json(data);
}
