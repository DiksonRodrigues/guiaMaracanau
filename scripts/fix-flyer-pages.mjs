import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://itjverfcnfomqoyerbtz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0anZlcmZjbmZvbXFveWVyYnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxMjY5MCwiZXhwIjoyMDkzMzg4NjkwfQ.4YFicJ6PSmV2rRcT2qW83yQjavisWe25Rub-0gLyU2g"
);

const U = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`;

// Todos testados e retornando 200
const PAGES_BY_SLUG = {
  "supermercado-boa-oferta": [
    U("photo-1556742049-0cfed4f6a45d"), // prateleiras supermercado
    U("photo-1488459716781-31db52582fe9"), // produtos expostos
    U("photo-1601598851547-4302969d0614"), // produtos na gôndola
  ],
  "mercadao-popular": [
    U("photo-1542838132-92c53300491e"), // interior supermercado
    U("photo-1586190848861-99aa4a171e90"), // produtos mercado
    U("photo-1571019613454-1cb2f99b2d8b"), // promo mercado
  ],
  "extra-economico": [
    U("photo-1556742393-d75f468bfcb0"), // supermercado corredor
    U("photo-1619566636858-adf3ef46400b"), // produtos promoção
    U("photo-1579113800032-c38bd7635818"), // ofertas mercado
  ],
  "hiper-familia": [
    U("photo-1615485500704-8e990f9900f7"), // supermercado gôndola
    U("photo-1506617420156-8e4536971650"), // hiper produtos
    U("photo-1563636619-e9143da7973b"), // mercado família
  ],
  "mercado-vizinho": [
    U("photo-1592417817098-8fd3d9eb14a5"), // mercado pequeno
    U("photo-1534483509719-3feaee7c30da"), // ofertas vizinho
  ],
  "atacadao-bom-preco": [
    U("photo-1578916171728-46686eac8d58"), // atacado grande
    U("photo-1580913428735-bd3c269d6a82"), // prateleiras atacado
    U("photo-1608686207856-001b95cf60ca"), // produtos atacado
  ],
};

const slugs = Object.keys(PAGES_BY_SLUG);

const { data: supermarkets } = await supabase
  .from("supermarkets")
  .select("id, slug")
  .in("slug", slugs);

for (const sm of supermarkets) {
  const pages = PAGES_BY_SLUG[sm.slug];

  const { data: flyer } = await supabase
    .from("flyers")
    .select("id")
    .eq("supermarket_id", sm.id)
    .single();

  if (!flyer) { console.warn(`sem encarte: ${sm.slug}`); continue; }

  const { error } = await supabase
    .from("flyers")
    .update({ pages })
    .eq("id", flyer.id);

  if (error) console.error(`✗ ${sm.slug}:`, error.message);
  else console.log(`✓ ${sm.slug} — ${pages.length} páginas atualizadas`);
}

console.log("\n✅ Páginas dos encartes atualizadas.");
