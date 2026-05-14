import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { plan, customerEmail, academyName } = await req.json();
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003";

    let session;
    if (plan === "subscription") {
      session = await getStripe().checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: customerEmail,
        metadata: { academyName },
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { name: "AcademyOS — Academy License", description: "Complete academy management system, unlimited players & coaches" },
            unit_amount: 400000,
            recurring: { interval: "month" },
          },
          quantity: 1,
        }],
        success_url: `${base}/success?type=subscription`,
        cancel_url: `${base}/cancel`,
      });
    } else {
      session = await getStripe().checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: customerEmail,
        metadata: { academyName },
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { name: "AcademyOS — Custom Setup", description: "Full setup, branding, training, and 30-day support" },
            unit_amount: 1000000,
          },
          quantity: 1,
        }],
        success_url: `${base}/success?type=setup`,
        cancel_url: `${base}/cancel`,
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
