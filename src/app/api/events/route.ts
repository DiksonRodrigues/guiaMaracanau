import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  try {
    const body = await req.json();
    const { event_type, business_id, coupon_id, metadata } = body;

    if (!event_type || typeof event_type !== "string") {
      return NextResponse.json({ error: "event_type required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    let session_id = cookieStore.get("session_id")?.value;

    const res = NextResponse.json({ ok: true });

    if (!session_id) {
      session_id = crypto.randomUUID();
      res.cookies.set("session_id", session_id, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }

    await supabase.from("events").insert({
      event_type,
      business_id: business_id ?? null,
      coupon_id: coupon_id ?? null,
      metadata: metadata ?? {},
      user_agent: req.headers.get("user-agent") ?? null,
      referrer: req.headers.get("referer") ?? null,
      session_id,
    });

    return res;
  } catch {
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
