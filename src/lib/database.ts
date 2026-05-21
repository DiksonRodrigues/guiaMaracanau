import { supabase } from "./supabase";

export async function getNeighborhoods() {
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("id, name, slug, position")
    .eq("is_active", true)
    .order("position");
  if (error) throw error;
  return data ?? [];
}

export async function getNeighborhoodBySlug(slug: string) {
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("id, name, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error) throw error;
  return data;
}

export async function getNeighborhoodsWithCount() {
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("id, name, slug, position, businesses(count)")
    .eq("is_active", true)
    .order("position");
  if (error) throw error;
  return (data ?? []).map((n: any) => ({
    ...n,
    business_count: n.businesses?.[0]?.count ?? 0,
  }));
}

export async function getBusinessesByNeighborhood(neighborhoodSlug: string) {
  const { data: hood, error: hoodErr } = await supabase
    .from("neighborhoods")
    .select("id, name, slug")
    .eq("slug", neighborhoodSlug)
    .eq("is_active", true)
    .single();
  if (hoodErr) throw hoodErr;

  const { data, error } = await supabase
    .from("businesses")
    .select("*, categories(name)")
    .eq("neighborhood_id", hood.id)
    .order("name");
  if (error) throw error;
  return { neighborhood: hood, businesses: data ?? [] };
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  
  if (error) throw error;
  return data;
}

export async function getFeaturedBusinesses() {
  const { data, error } = await supabase
    .from("businesses")
    .select("*, categories(name)")
    .eq("featured", true)
    .limit(20);
  if (error) throw error;
  return data;
}

export async function getBusinessesPaginated(offset = 0, limit = 12, neighborhoodIds?: string[]) {
  let query = supabase
    .from("businesses")
    .select("id, name, slug, description, image_url, rating, discount_label, featured, categories(name), neighborhoods(name, slug)")
    .order("featured", { ascending: false })
    .order("name")
    .range(offset, offset + limit - 1);

  if (neighborhoodIds && neighborhoodIds.length === 1) {
    query = query.eq("neighborhood_id", neighborhoodIds[0]);
  } else if (neighborhoodIds && neighborhoodIds.length > 1) {
    query = query.in("neighborhood_id", neighborhoodIds);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getBusinessesByCategory(
  categorySlug: string,
  neighborhoodIds?: string[],
) {
  const { data: catData, error: catError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", categorySlug)
    .single();
  if (catError) throw catError;

  let query = supabase
    .from("businesses")
    .select("*, categories(name), neighborhoods(name, slug)")
    .eq("category_id", catData.id);

  if (neighborhoodIds && neighborhoodIds.length === 1) {
    query = query.eq("neighborhood_id", neighborhoodIds[0]);
  } else if (neighborhoodIds && neighborhoodIds.length > 1) {
    query = query.in("neighborhood_id", neighborhoodIds);
  }

  const { data, error } = await query.order("name");
  if (error) throw error;
  return { businesses: data ?? [], category: catData };
}

export async function getCoupons() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("coupons")
    .select(`
      *,
      businesses (name, whatsapp, slug)
    `)
    .eq("active", true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

export async function getBusinessBySlug(slug: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select(`
      *,
      categories (name),
      business_products (name, price, image_url)
    `)
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
}

export async function getSupermarkets() {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("supermarkets")
    .select(`
      *,
      flyers (id, valid_from, valid_until, active)
    `)
    .eq("active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []).map((s: any) => ({
    ...s,
    activeFlyer: s.flyers?.find((f: any) => f.active && f.valid_until >= today) ?? null,
  }));
}

export async function getSupermarketBySlug(slug: string) {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("supermarkets")
    .select(`
      *,
      flyers (
        id, valid_from, valid_until, pages, active,
        flyer_highlights (id, product_name, original_price, sale_price, image_url)
      )
    `)
    .eq("slug", slug)
    .eq("active", true)
    .single();
  if (error) throw error;
  const activeFlyer = data.flyers?.find((f: any) => f.active && f.valid_until >= today) ?? null;
  return { ...data, activeFlyer };
}
