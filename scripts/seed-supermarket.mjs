import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://itjverfcnfomqoyerbtz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0anZlcmZjbmZvbXFveWVyYnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxMjY5MCwiZXhwIjoyMDkzMzg4NjkwfQ.4YFicJ6PSmV2rRcT2qW83yQjavisWe25Rub-0gLyU2g"
);

const U = (id, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

// ── Supermarket ────────────────────────────────────────────
const { data: sm, error: smErr } = await supabase
  .from("supermarkets")
  .insert({
    name: "Atacadão Bom Preço",
    slug: "atacadao-bom-preco",
    logo_url: U("photo-1542838132-92c53300491e", 400, 400),
    description: "O melhor atacado da cidade com preços imbatíveis toda semana.",
    address: "Av. Principal, 500 — Centro",
    phone: "(85) 3456-7890",
    active: true,
  })
  .select()
  .single();

if (smErr) { console.error("Supermarket:", smErr.message); process.exit(1); }
console.log("✓ Supermercado criado:", sm.id);

// ── Flyer ──────────────────────────────────────────────────
const today = new Date();
const valid_from = today.toISOString().split("T")[0];
const until = new Date(today);
until.setDate(until.getDate() + 6);
const valid_until = until.toISOString().split("T")[0];

const pages = [
  // imagens largas, alta resolução — simulam páginas de encarte
  U("photo-1604719312566-8912e9227c6a", 1400, 1980),
  U("photo-1542838132-92c53300491e", 1400, 1980),
  U("photo-1490818387583-1baba5e638af", 1400, 1980),
];

const { data: flyer, error: flyerErr } = await supabase
  .from("flyers")
  .insert({
    supermarket_id: sm.id,
    valid_from,
    valid_until,
    pages,
    active: true,
  })
  .select()
  .single();

if (flyerErr) { console.error("Flyer:", flyerErr.message); process.exit(1); }
console.log("✓ Encarte criado:", flyer.id);

// ── Highlights ─────────────────────────────────────────────
const highlights = [
  {
    product_name: "Arroz Tipo 1 — 5kg",
    original_price: 28.90,
    sale_price: 19.90,
    image_url: U("photo-1586201375761-83865001e31c", 600, 600),
  },
  {
    product_name: "Peito de Frango Congelado — 1kg",
    original_price: 18.50,
    sale_price: 12.99,
    image_url: U("photo-1604503468506-a8da13d82791", 600, 600),
  },
  {
    product_name: "Leite Integral Longa Vida — 1L",
    original_price: 6.49,
    sale_price: 4.79,
    image_url: U("photo-1550583724-b2692b85b150", 600, 600),
  },
  {
    product_name: "Café Torrado em Pó — 500g",
    original_price: 19.90,
    sale_price: 13.49,
    image_url: U("photo-1495474472287-4d71bcdd2085", 600, 600),
  },
  {
    product_name: "Ovos Brancos — Dúzia",
    original_price: 14.90,
    sale_price: 9.90,
    image_url: U("photo-1587486913049-53fc88980cfc", 600, 600),
  },
  {
    product_name: "Óleo de Soja — 900ml",
    original_price: 9.90,
    sale_price: 6.99,
    image_url: U("photo-1474979266404-7eaacbcd87c5", 600, 600),
  },
  {
    product_name: "Cerveja Lata 350ml — Pack 12",
    original_price: 59.90,
    sale_price: 42.90,
    image_url: U("photo-1535958636474-b021ee887b13", 600, 600),
  },
  {
    product_name: "Feijão Carioca — 1kg",
    original_price: 12.90,
    sale_price: 8.49,
    image_url: U("photo-1561043433-aaf687c4cf04", 600, 600),
  },
];

const { error: hlErr } = await supabase
  .from("flyer_highlights")
  .insert(highlights.map((h) => ({ ...h, flyer_id: flyer.id })));

if (hlErr) { console.error("Highlights:", hlErr.message); process.exit(1); }
console.log(`✓ ${highlights.length} ofertas criadas`);

console.log("\n🎉 Pronto! Acesse: http://localhost:3000/supermercados/atacadao-bom-preco");
