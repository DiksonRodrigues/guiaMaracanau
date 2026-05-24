import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { requireAdminAuth } from "@/lib/admin-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdminAuth(req);
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) {
    updates.name = body.name;
    updates.slug = body.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.position !== undefined) updates.position = body.position;

  const { data, error } = await supabase
    .from("neighborhoods")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdminAuth(req);
  if (denied) return denied;
  const { id } = await params;
  const { error } = await supabase.from("neighborhoods").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return new NextResponse(null, { status: 204 });
}
