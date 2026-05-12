import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { booking_id, court_name, player_name, date, start_time, end_time, total_price } = await req.json();
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      metadata: { booking_id: String(booking_id) },
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `Court Booking — ${court_name}`,
            description: `${player_name || "Guest"} · ${date} · ${start_time}–${end_time}`,
          },
          unit_amount: total_price * 100,
        },
        quantity: 1,
      }],
      success_url: `${base}/app/courts?paid=1`,
      cancel_url: `${base}/app/courts`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Court checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
