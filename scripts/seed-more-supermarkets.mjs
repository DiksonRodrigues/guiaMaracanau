import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://itjverfcnfomqoyerbtz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0anZlcmZjbmZvbXFveWVyYnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxMjY5MCwiZXhwIjoyMDkzMzg4NjkwfQ.4YFicJ6PSmV2rRcT2qW83yQjavisWe25Rub-0gLyU2g"
);

const U = (id, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

const today = new Date().toISOString().split("T")[0];
const until = new Date();
until.setDate(until.getDate() + 6);
const valid_until = until.toISOString().split("T")[0];

const SUPERMARKETS = [
  {
    name: "Supermercado Boa Oferta",
    slug: "supermercado-boa-oferta",
    logo_url: U("photo-1604719312566-8912e9227c6a", 400, 400),
    description: "Promoções imbatíveis toda semana para sua família.",
    address: "Rua das Flores, 210 — Jereissati I",
    phone: "(85) 3321-4455",
    pages: [
      U("photo-1556742049-0cfed4f6a45d", 1400, 1980),
      U("photo-1608686207856-001b95cf60ca", 1400, 1980),
    ],
    highlights: [
      { product_name: "Macarrão Espaguete — 500g", original_price: 5.90, sale_price: 3.49, image_url: U("photo-1551462147-ff29053bfc14", 600, 600) },
      { product_name: "Açúcar Cristal — 5kg", original_price: 22.90, sale_price: 16.90, image_url: U("photo-1559622214-f8a9850965bb", 600, 600) },
      { product_name: "Farinha de Trigo — 1kg", original_price: 7.90, sale_price: 4.99, image_url: U("photo-1574323347407-f5e1ad6d020b", 600, 600) },
      { product_name: "Leite em Pó — 400g", original_price: 18.90, sale_price: 13.90, image_url: U("photo-1550583724-b2692b85b150", 600, 600) },
      { product_name: "Sabão em Pó — 1kg", original_price: 16.90, sale_price: 11.49, image_url: U("photo-1585771724684-38269d6639fd", 600, 600) },
      { product_name: "Biscoito Recheado — 130g", original_price: 4.50, sale_price: 2.99, image_url: U("photo-1558961363-fa8fdf82db35", 600, 600) },
    ],
  },
  {
    name: "Mercadão Popular",
    slug: "mercadao-popular",
    logo_url: U("photo-1542838132-92c53300491e", 400, 400),
    description: "O mercado do povo, preço justo todo dia.",
    address: "Av. Contorno, 875 — Centro",
    phone: "(85) 3398-1122",
    pages: [
      U("photo-1534723452862-4c874986ebad", 1400, 1980),
      U("photo-1583258292688-d0213dc5a3a8", 1400, 1980),
      U("photo-1604719312566-8912e9227c6a", 1400, 1980),
    ],
    highlights: [
      { product_name: "Frango Inteiro Congelado — kg", original_price: 14.90, sale_price: 9.99, image_url: U("photo-1604503468506-a8da13d82791", 600, 600) },
      { product_name: "Presunto Fatiado — 200g", original_price: 11.90, sale_price: 7.99, image_url: U("photo-1546549032-9571cd6b27df", 600, 600) },
      { product_name: "Queijo Mussarela — 200g", original_price: 13.90, sale_price: 9.49, image_url: U("photo-1486297678162-eb2a19b0a32d", 600, 600) },
      { product_name: "Iogurte Natural — 170g", original_price: 3.90, sale_price: 2.49, image_url: U("photo-1488477181946-6428a0291777", 600, 600) },
      { product_name: "Requeijão Cremoso — 200g", original_price: 9.90, sale_price: 6.99, image_url: U("photo-1559561853-08451507cbe7", 600, 600) },
      { product_name: "Manteiga com Sal — 200g", original_price: 12.90, sale_price: 8.99, image_url: U("photo-1589985270826-4b7bb135bc9d", 600, 600) },
      { product_name: "Ovos Vermelhos — Dúzia", original_price: 15.90, sale_price: 10.90, image_url: U("photo-1587486913049-53fc88980cfc", 600, 600) },
    ],
  },
  {
    name: "Extra Econômico",
    slug: "extra-economico",
    logo_url: U("photo-1567620905732-2d1ec7ab7445", 400, 400),
    description: "Economia real para o seu dia a dia.",
    address: "Rua São João, 1050 — Jereissati II",
    phone: "(85) 3344-8899",
    pages: [
      U("photo-1556742393-d75f468bfcb0", 1400, 1980),
      U("photo-1542838132-92c53300491e", 1400, 1980),
    ],
    highlights: [
      { product_name: "Refrigerante 2L", original_price: 9.90, sale_price: 6.49, image_url: U("photo-1598306442928-4d90f32c6866", 600, 600) },
      { product_name: "Cerveja Lata 350ml — Pack 6", original_price: 32.90, sale_price: 22.90, image_url: U("photo-1535958636474-b021ee887b13", 600, 600) },
      { product_name: "Suco de Caixinha 1L", original_price: 8.90, sale_price: 5.99, image_url: U("photo-1600271886742-f049cd451bba", 600, 600) },
      { product_name: "Água Mineral 1,5L — Pack 6", original_price: 18.90, sale_price: 12.90, image_url: U("photo-1548839140-29a749e1cf4d", 600, 600) },
      { product_name: "Café Solúvel — 100g", original_price: 14.90, sale_price: 9.99, image_url: U("photo-1495474472287-4d71bcdd2085", 600, 600) },
      { product_name: "Achocolatado em Pó — 400g", original_price: 16.90, sale_price: 11.99, image_url: U("photo-1481391319762-47dff72954d9", 600, 600) },
    ],
  },
  {
    name: "Hiper Família",
    slug: "hiper-familia",
    logo_url: U("photo-1517686469429-8bdb88b9f907", 400, 400),
    description: "Tudo que sua família precisa em um só lugar.",
    address: "Av. das Indústrias, 3400 — Distrito Industrial",
    phone: "(85) 3276-5500",
    pages: [
      U("photo-1490818387583-1baba5e638af", 1400, 1980),
      U("photo-1534723452862-4c874986ebad", 1400, 1980),
      U("photo-1556742049-0cfed4f6a45d", 1400, 1980),
    ],
    highlights: [
      { product_name: "Detergente Líquido 500ml", original_price: 4.90, sale_price: 2.99, image_url: U("photo-1563453392212-326f5e854473", 600, 600) },
      { product_name: "Papel Higiênico — 12 rolos", original_price: 29.90, sale_price: 19.90, image_url: U("photo-1583947215259-38e31be8751f", 600, 600) },
      { product_name: "Sabonete em Barra — 90g", original_price: 3.90, sale_price: 1.99, image_url: U("photo-1600857544200-b2f666a9a2ec", 600, 600) },
      { product_name: "Shampoo 400ml", original_price: 19.90, sale_price: 13.90, image_url: U("photo-1526045612212-70caf35c14df", 600, 600) },
      { product_name: "Creme Dental 90g", original_price: 5.90, sale_price: 3.49, image_url: U("photo-1559304822-9eb2813c9e1e", 600, 600) },
      { product_name: "Amaciante 2L", original_price: 18.90, sale_price: 12.49, image_url: U("photo-1585771724684-38269d6639fd", 600, 600) },
      { product_name: "Esponja de Limpeza — Pack 3", original_price: 6.90, sale_price: 3.99, image_url: U("photo-1563453392212-326f5e854473", 600, 600) },
    ],
  },
  {
    name: "Mercado Vizinho",
    slug: "mercado-vizinho",
    logo_url: U("photo-1604719312566-8912e9227c6a", 400, 400),
    description: "Pertinho de você, com o melhor preço.",
    address: "Rua Caetano Muniz, 45 — Novo Maracanaú",
    phone: "(85) 3365-7744",
    pages: [
      U("photo-1583258292688-d0213dc5a3a8", 1400, 1980),
      U("photo-1556742393-d75f468bfcb0", 1400, 1980),
    ],
    highlights: [
      { product_name: "Arroz Branco — 5kg", original_price: 29.90, sale_price: 21.90, image_url: U("photo-1586201375761-83865001e31c", 600, 600) },
      { product_name: "Feijão Preto — 1kg", original_price: 11.90, sale_price: 7.99, image_url: U("photo-1561043433-aaf687c4cf04", 600, 600) },
      { product_name: "Óleo de Soja — 900ml", original_price: 9.90, sale_price: 6.49, image_url: U("photo-1474979266404-7eaacbcd87c5", 600, 600) },
      { product_name: "Molho de Tomate — 340g", original_price: 5.90, sale_price: 3.29, image_url: U("photo-1558818498-28c1e002b655", 600, 600) },
      { product_name: "Atum em Lata — 170g", original_price: 8.90, sale_price: 5.99, image_url: U("photo-1534482421-64566f976cfa", 600, 600) },
      { product_name: "Maionese — 500g", original_price: 11.90, sale_price: 7.99, image_url: U("photo-1604152135912-04a022e23696", 600, 600) },
    ],
  },
];

let smCount = 0;
for (const sm of SUPERMARKETS) {
  const { pages, highlights, ...smData } = sm;

  const { data: created, error: smErr } = await supabase
    .from("supermarkets")
    .insert({ ...smData, active: true })
    .select()
    .single();

  if (smErr) { console.error(`✗ ${smData.name}:`, smErr.message); continue; }

  const validFrom = new Date();
  validFrom.setDate(validFrom.getDate() - Math.floor(Math.random() * 2)); // alguns começaram ontem

  const { data: flyer, error: flyerErr } = await supabase
    .from("flyers")
    .insert({
      supermarket_id: created.id,
      valid_from: validFrom.toISOString().split("T")[0],
      valid_until,
      pages,
      active: true,
    })
    .select()
    .single();

  if (flyerErr) { console.error(`✗ encarte ${smData.name}:`, flyerErr.message); continue; }

  const { error: hlErr } = await supabase
    .from("flyer_highlights")
    .insert(highlights.map((h) => ({ ...h, flyer_id: flyer.id })));

  if (hlErr) { console.error(`✗ highlights ${smData.name}:`, hlErr.message); continue; }

  smCount++;
  console.log(`✓ ${smData.name} — ${highlights.length} ofertas, ${pages.length} páginas`);
}

console.log(`\n🎉 ${smCount} supermercados criados.`);
