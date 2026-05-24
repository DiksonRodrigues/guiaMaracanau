import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { requireAdminAuth } from "@/lib/admin-auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminAuth(req);
  if (denied) return denied;
  const { id: business_id } = await params;
  const body = await req.json();
  const { error, data } = await supabase
    .from("business_products")
    .insert({ ...body, business_id })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
