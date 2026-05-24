import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { requireAdminAuth } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const denied = await requireAdminAuth(req);
  if (denied) return denied;
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("*")
    .order("position");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminAuth(req);
  if (denied) return denied;
  const body = await req.json();
  const { name } = body;
  if (!name || name.trim().length < 2)
    return NextResponse.json({ error: "Nome obrigatório (mín. 2 caracteres)." }, { status: 400 });

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const { data: maxPos } = await supabase
    .from("neighborhoods")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const position = (maxPos?.position ?? 0) + 1;

  const { data, error } = await supabase
    .from("neighborhoods")
    .insert({ name: name.trim(), slug, position })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
