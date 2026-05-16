import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  try {
    const event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log("Stripe event:", event.type);

    if (event.type === "checkout.session.completed") {
      const checkoutSession = event.data.object as any;
      const db = getDb();

      const bookingId = checkoutSession.metadata?.booking_id;
      if (bookingId) {
        db.prepare("UPDATE court_bookings SET payment_status = 'paid' WHERE id = ?").run(Number(bookingId));
      }

      const invoiceId = checkoutSession.metadata?.invoiceId;
      if (invoiceId) {
        db.prepare("UPDATE invoices SET status = 'paid', paid_at = datetime('now') WHERE id = ?").run(Number(invoiceId));
        console.log("Invoice auto-marked paid:", invoiceId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
