import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
