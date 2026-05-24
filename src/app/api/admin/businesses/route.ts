import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { requireAdminAuth } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdminAuth(req);
  if (denied) return denied;
  const { data, error } = await supabase
    .from("businesses")
    .select("*, categories(name)")
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminAuth(req);
  if (denied) return denied;
  const body = await req.json();
  const { error, data } = await supabase
    .from("businesses")
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
