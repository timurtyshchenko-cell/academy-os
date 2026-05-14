import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, academy, phone, players, message } = body;
    if (!name || !email || !academy) return NextResponse.json({ error: "Name, email and academy required" }, { status: 400 });

    const leadsPath = path.join(process.cwd(), "leads.json");
    let leads: object[] = [];
    if (fs.existsSync(leadsPath)) {
      try { leads = JSON.parse(fs.readFileSync(leadsPath, "utf-8")); } catch { leads = []; }
    }
    const lead = { id: Date.now().toString(), name, email, academy, phone, players, message, createdAt: new Date().toISOString(), status: "new" };
    leads.unshift(lead);
    fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2));
    console.log("New demo lead:", lead);

    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      });
      transporter.sendMail({
        from: `"AcademyOS" <${process.env.GMAIL_USER}>`,
        to: "sasha.tischenko.ua@gmail.com",
        subject: `New Demo Request — ${academy}`,
        html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px">
          <h2 style="color:#111;margin-bottom:24px">New Demo Request</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666;width:40%">Name</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:600">${name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666">Email</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:600">${email}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666">Academy</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:600">${academy}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666">Phone</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0">${phone || "—"}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666">Players</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0">${players || "—"}</td></tr>
            <tr><td style="padding:10px 0;color:#666">Message</td><td style="padding:10px 0">${message || "—"}</td></tr>
          </table>
          <a href="mailto:${email}" style="display:inline-block;margin-top:24px;background:#2563eb;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700">Reply to ${name}</a>
        </div>`,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
