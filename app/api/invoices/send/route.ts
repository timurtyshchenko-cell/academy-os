import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendInvoiceEmail } from "@/lib/email";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { invoiceId } = await req.json();
  const db = getDb();

  const invoice = db.prepare("SELECT * FROM invoices WHERE id = ? AND academy_id = ?").get(invoiceId, session.academyId) as any;
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const player = db.prepare("SELECT * FROM players WHERE id = ? AND academy_id = ?").get(invoice.player_id, session.academyId) as any;
  if (!player?.parent_email) return NextResponse.json({ error: "Player has no parent email" }, { status: 400 });

  const academy = db.prepare("SELECT * FROM academies WHERE id = ?").get(session.academyId) as any;

  const sessions = db.prepare(
    "SELECT * FROM sessions WHERE player_id = ? AND strftime('%Y-%m', date) = strftime('%Y-%m', ?) ORDER BY date ASC"
  ).all(invoice.player_id, invoice.due_date || new Date().toISOString()) as any[];

  // Create Stripe checkout session for invoice payment
  let paymentUrl: string | undefined;
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || "https://academy-os-production.up.railway.app";
    const stripeSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: player.parent_email,
      metadata: { invoiceId: String(invoiceId), academyId: String(session.academyId) },
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `Training Invoice — ${player.name}`,
            description: `${invoice.month || "Monthly"} · ${sessions.length} sessions`,
          },
          unit_amount: Math.round(invoice.amount * 100),
        },
        quantity: 1,
      }],
      success_url: `${base}/app/billing?paid=1`,
      cancel_url: `${base}/app/billing`,
    });
    paymentUrl = stripeSession.url ?? undefined;
  } catch (stripeErr: any) {
    console.error("Stripe checkout error:", stripeErr.message);
    // Continue without payment link if Stripe fails
  }

  console.log("Sending invoice email to:", player.parent_email, "| paymentUrl:", !!paymentUrl);

  try {
    await sendInvoiceEmail({
      to: player.parent_email,
      playerName: player.name,
      academyName: academy?.name || session.academyName,
      month: invoice.month || "—",
      amount: invoice.amount,
      dueDate: invoice.due_date || "—",
      sessions,
      paymentUrl,
    });
    console.log("Email sent OK to:", player.parent_email);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email error full:", JSON.stringify(err), err.message, err.statusCode);
    return NextResponse.json({ error: err.message || "Failed to send email" }, { status: 500 });
  }
}
