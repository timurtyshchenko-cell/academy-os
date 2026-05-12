import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  try {
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log("Stripe event:", event.type);

    if (event.type === "checkout.session.completed") {
      const checkoutSession = event.data.object as any;
      const bookingId = checkoutSession.metadata?.booking_id;
      if (bookingId) {
        const db = getDb();
        db.prepare("UPDATE court_bookings SET payment_status = 'paid' WHERE id = ?").run(Number(bookingId));
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
