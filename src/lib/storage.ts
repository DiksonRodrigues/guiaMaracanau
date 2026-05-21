import { supabase } from "./supabase";

export async function uploadImage(file: File, folder: "businesses" | "products" | "supermarkets" | "supermarkets/covers" | "flyers"): Promise<string> {
  const ext = file.name.split(".").pop();
  const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("guia-images")
    .upload(name, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("guia-images").getPublicUrl(name);
  return data.publicUrl;
}
