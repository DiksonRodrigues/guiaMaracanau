import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { requireAdminAuth } from "@/lib/admin-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminAuth(req);
  if (denied) return denied;
  const { id } = await params;
  const { data, error } = await supabase
    .from("supermarkets")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminAuth(req);
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();
  const { data, error } = await supabase
    .from("supermarkets")
    .update(body)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminAuth(req);
  if (denied) return denied;
  const { id } = await params;
  const { error } = await supabase.from("supermarkets").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
