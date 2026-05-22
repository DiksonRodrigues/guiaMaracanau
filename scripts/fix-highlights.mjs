import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://itjverfcnfomqoyerbtz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0anZlcmZjbmZvbXFveWVyYnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxMjY5MCwiZXhwIjoyMDkzMzg4NjkwfQ.4YFicJ6PSmV2rRcT2qW83yQjavisWe25Rub-0gLyU2g"
);

// Imagens reais do product_catalog (Open Food Facts — produtos brasileiros)
const IMG = {
  arroz:    "https://images.openfoodfacts.org/images/products/789/350/002/0110/front_pt.13.400.jpg",  // Arroz Tio João
  feijao:   "https://images.openfoodfacts.org/images/products/789/803/358/0100/front_en.3.400.jpg",  // Feijão Preto
  macarrao: "https://images.openfoodfacts.org/images/products/789/107/900/0205/front_pt.9.400.jpg",  // Miojo Carne
  cafe:     "https://images.openfoodfacts.org/images/products/789/102/100/6125/front_pt.25.400.jpg", // Café Melitta
  leite:    "https://images.openfoodfacts.org/images/products/789/821/515/1708/front_pt.38.400.jpg", // Leite Piracanjuba
  biscoito: "https://images.openfoodfacts.org/images/products/789/602/476/1651/front_en.3.400.jpg",  // Biscoito Maizena
  chocolate:"https://images.openfoodfacts.org/images/products/789/100/033/6373/front_en.18.400.jpg", // Chocolate Alpino
  acucar:   "https://images.openfoodfacts.org/images/products/789/689/490/0013/front_en.3.400.jpg",  // Açúcar
  farinha:  "https://images.openfoodfacts.org/images/products/789/284/081/5783/front_pt.18.400.jpg", // Farinha de Aveia
  cerveja:  "https://images.openfoodfacts.org/images/products/789/604/550/6873/front_en.7.400.jpg",  // Heineken
  cerveja2: "https://images.openfoodfacts.org/images/products/789/739/502/0101/front_en.6.400.jpg",  // Itaipava
  queijo:   "https://images.openfoodfacts.org/images/products/789/662/521/1401/front_es.20.400.jpg", // Requeijão
  iogurte:  "https://images.openfoodfacts.org/images/products/789/605/116/4609/front_pt.26.400.jpg", // Iogurte Natural
  suco:     "https://images.openfoodfacts.org/images/products/789/895/314/8701/front_pt.32.400.jpg", // Suco de laranja
  carne:    "https://images.openfoodfacts.org/images/products/789/300/048/2401/front_pt.7.400.jpg",  // Filé Sadia
  pao:      "https://images.openfoodfacts.org/images/products/789/120/301/0056/front_en.11.400.jpg", // Pão Panco
  atum:     "https://images.openfoodfacts.org/images/products/789/116/701/1779/front_pt.60.400.jpg", // Atum Ralado
  sardinha: "https://images.openfoodfacts.org/images/products/789/600/930/1049/front_en.3.400.jpg",  // Sardinhas
  molho:    "https://images.openfoodfacts.org/images/products/789/400/005/0027/front_pt.17.400.jpg", // Maionese Hellmann's
  manteiga: "https://images.openfoodfacts.org/images/products/789/633/110/0310/front_pt.4.400.jpg",  // Manteiga Aviação
  macarrao2:"https://images.openfoodfacts.org/images/products/789/107/900/0229/front_pt.27.400.jpg", // Nissin Frango
  cafe2:    "https://images.openfoodfacts.org/images/products/789/102/100/6071/front_pt.10.400.jpg", // Café Tradicional
  leite2:   "https://images.openfoodfacts.org/images/products/789/100/032/5858/front_pt.34.400.jpg", // Ninho
  biscoito2:"https://images.openfoodfacts.org/images/products/762/221/059/6413/front_pt.21.400.jpg", // Wafer
};

const HIGHLIGHTS_BY_SLUG = {
  "supermercado-boa-oferta": [
    { product_name: "Arroz Tio João Tipo 1 — 1kg",          original_price: 7.90,  sale_price: 5.49,  image_url: IMG.arroz },
    { product_name: "Macarrão Instantâneo Miojo — 85g",     original_price: 3.90,  sale_price: 2.29,  image_url: IMG.macarrao },
    { product_name: "Açúcar Cristal — 1kg",                 original_price: 5.90,  sale_price: 3.99,  image_url: IMG.acucar },
    { product_name: "Farinha de Aveia — 500g",               original_price: 9.90,  sale_price: 6.99,  image_url: IMG.farinha },
    { product_name: "Biscoito Maizena — 200g",              original_price: 5.90,  sale_price: 3.49,  image_url: IMG.biscoito },
    { product_name: "Leite UHT Integral — 1L",              original_price: 6.90,  sale_price: 4.79,  image_url: IMG.leite },
  ],
  "mercadao-popular": [
    { product_name: "Filé de Peito de Frango Sadia — 1kg",  original_price: 24.90, sale_price: 17.90, image_url: IMG.carne },
    { product_name: "Requeijão Cremoso — 200g",             original_price: 9.90,  sale_price: 6.99,  image_url: IMG.queijo },
    { product_name: "Iogurte Natural Integral — 170g",      original_price: 3.90,  sale_price: 2.49,  image_url: IMG.iogurte },
    { product_name: "Manteiga Aviação com Sal — 200g",      original_price: 13.90, sale_price: 9.49,  image_url: IMG.manteiga },
    { product_name: "Pão de Forma Panco — 500g",            original_price: 11.90, sale_price: 7.99,  image_url: IMG.pao },
    { product_name: "Café Melitta Tradicional — 500g",      original_price: 22.90, sale_price: 15.90, image_url: IMG.cafe },
    { product_name: "Leite em Pó Ninho Integral — 400g",   original_price: 26.90, sale_price: 19.90, image_url: IMG.leite2 },
  ],
  "extra-economico": [
    { product_name: "Cerveja Heineken Lata 350ml — 6un",    original_price: 42.90, sale_price: 29.90, image_url: IMG.cerveja },
    { product_name: "Cerveja Itaipava Lata 350ml — 12un",   original_price: 49.90, sale_price: 34.90, image_url: IMG.cerveja2 },
    { product_name: "Suco de Laranja Integral — 1L",        original_price: 12.90, sale_price: 8.99,  image_url: IMG.suco },
    { product_name: "Nissin Miojo Frango — 85g",            original_price: 3.90,  sale_price: 2.29,  image_url: IMG.macarrao2 },
    { product_name: "Café Torrado Moído — 500g",            original_price: 19.90, sale_price: 13.49, image_url: IMG.cafe2 },
    { product_name: "Chocolate ao Leite Alpino — 90g",      original_price: 9.90,  sale_price: 6.49,  image_url: IMG.chocolate },
  ],
  "hiper-familia": [
    { product_name: "Feijão Preto — 1kg",                   original_price: 11.90, sale_price: 7.99,  image_url: IMG.feijao },
    { product_name: "Arroz Integral — 1kg",                 original_price: 8.90,  sale_price: 5.99,  image_url: IMG.arroz },
    { product_name: "Atum Ralado ao Natural — 170g",        original_price: 9.90,  sale_price: 6.49,  image_url: IMG.atum },
    { product_name: "Sardinhas com Óleo — 125g",            original_price: 6.90,  sale_price: 4.29,  image_url: IMG.sardinha },
    { product_name: "Biscoito Wafer Recheado — 100g",       original_price: 4.90,  sale_price: 2.99,  image_url: IMG.biscoito2 },
    { product_name: "Maionese Hellmann's — 250g",           original_price: 11.90, sale_price: 7.99,  image_url: IMG.molho },
    { product_name: "Iogurte Nestlé Natural — 340g",        original_price: 7.90,  sale_price: 5.49,  image_url: IMG.iogurte },
  ],
  "mercado-vizinho": [
    { product_name: "Arroz Tio João — 1kg",                 original_price: 7.90,  sale_price: 5.29,  image_url: IMG.arroz },
    { product_name: "Feijão Preto — 1kg",                   original_price: 11.90, sale_price: 8.49,  image_url: IMG.feijao },
    { product_name: "Café Melitta 500g",                    original_price: 22.90, sale_price: 15.90, image_url: IMG.cafe },
    { product_name: "Atum Ralado Natural — 170g",           original_price: 9.90,  sale_price: 6.99,  image_url: IMG.atum },
    { product_name: "Maionese Hellmann's Pote — 250g",      original_price: 11.90, sale_price: 7.49,  image_url: IMG.molho },
    { product_name: "Pão de Forma Integral — 500g",         original_price: 13.90, sale_price: 9.49,  image_url: IMG.pao },
  ],
};

const slugs = Object.keys(HIGHLIGHTS_BY_SLUG);

const { data: supermarkets } = await supabase
  .from("supermarkets")
  .select("id, slug")
  .in("slug", slugs);

for (const sm of supermarkets) {
  const { data: flyer } = await supabase
    .from("flyers")
    .select("id")
    .eq("supermarket_id", sm.id)
    .single();

  if (!flyer) { console.warn(`sem encarte: ${sm.slug}`); continue; }

  // Apaga highlights antigos
  await supabase.from("flyer_highlights").delete().eq("flyer_id", flyer.id);

  // Insere com imagens do catálogo
  const rows = HIGHLIGHTS_BY_SLUG[sm.slug].map(h => ({ ...h, flyer_id: flyer.id }));
  const { error } = await supabase.from("flyer_highlights").insert(rows);

  if (error) console.error(`✗ ${sm.slug}:`, error.message);
  else console.log(`✓ ${sm.slug} — ${rows.length} ofertas atualizadas`);
}

console.log("\n🎉 Highlights atualizados com imagens do catálogo (Open Food Facts).");
