import { NextRequest, NextResponse } from "next/server";

export async function requireAdminAuth(req: NextRequest): Promise<NextResponse | null> {
  const token = req.cookies.get("admin_session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const expected = await computeToken();
  if (token !== expected) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function computeToken(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET não configurado");
  const password = process.env.ADMIN_PASSWORD;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(password)
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
