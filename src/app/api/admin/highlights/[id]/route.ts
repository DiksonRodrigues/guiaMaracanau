import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { requireAdminAuth } from "@/lib/admin-auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminAuth(req);
  if (denied) return denied;
  const { id } = await params;
  const { error } = await supabase.from("flyer_highlights").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
