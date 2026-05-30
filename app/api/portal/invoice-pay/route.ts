import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("role,player_id,academy_id").eq("id", user.id).single();
    if (!profile || profile.role !== "parent") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { invoice_id } = await req.json();
    if (!invoice_id) return NextResponse.json({ error: "invoice_id required" }, { status: 400 });

    const db = getDb();
    const invoice = db.prepare(
      "SELECT * FROM invoices WHERE id = ? AND academy_id = ? AND (player_id = ? OR player_name IN (SELECT name FROM players WHERE id = ? AND academy_id = ?))"
    ).get(invoice_id, profile.academy_id, profile.player_id, profile.player_id, profile.academy_id) as any;

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    if (invoice.status === "paid") return NextResponse.json({ error: "Already paid" }, { status: 400 });

    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003";
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: { invoice_id: String(invoice_id), type: "invoice" },
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `Invoice — ${invoice.player_name} — ${invoice.month}`,
            description: `Training fee for ${invoice.month}`,
          },
          unit_amount: invoice.amount * 100,
        },
        quantity: 1,
      }],
      success_url: `${base}/parent/invoices?paid=${invoice_id}`,
      cancel_url: `${base}/parent/invoices`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
