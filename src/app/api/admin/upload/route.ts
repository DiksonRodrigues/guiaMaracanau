import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { requireAdminAuth } from "@/lib/admin-auth";

const FLYER_WIDTH = 900;
const FLYER_HEIGHT = 1200;

export async function POST(req: NextRequest) {
  const denied = await requireAdminAuth(req);
  if (denied) return denied;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "flyers";

  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  const processed = await sharp(buffer)
    .resize(FLYER_WIDTH, FLYER_HEIGHT, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .sharpen({ sigma: 1.2, m1: 1.5, m2: 2.5 })
    .webp({ quality: 88 })
    .toBuffer();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

  const { error } = await supabase.storage
    .from("guia-images")
    .upload(filename, processed, { contentType: "image/webp", upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from("guia-images").getPublicUrl(filename);
  return NextResponse.json({ url: data.publicUrl });
}
