/**
 * Busca ~300 produtos brasileiros do Open Food Facts e insere no Supabase.
 * Armazena APENAS URLs externas — zero uso de Supabase Storage.
 *
 * Pré-requisito: tabela product_catalog criada no Supabase SQL Editor.
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://itjverfcnfomqoyerbtz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0anZlcmZjbmZvbXFveWVyYnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgxMjY5MCwiZXhwIjoyMDkzMzg4NjkwfQ.4YFicJ6PSmV2rRcT2qW83yQjavisWe25Rub-0gLyU2g"
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Categorias × nome PT-BR
const CATEGORIES = [
  ["en:cooking-oils",      "Óleo"],
  ["en:soft-drinks",       "Refrigerante"],
  ["en:sauces",            "Molho"],
  ["en:butters",           "Manteiga"],
];

const PER_CATEGORY = 15; // 20 × 15 = 300 produtos

async function fetchCategory(categoryId, categoryName, attempt = 1) {
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl` +
    `?action=process` +
    `&tagtype_0=countries&tag_contains_0=contains&tag_0=brazil` +
    `&tagtype_1=categories&tag_contains_1=contains&tag_1=${encodeURIComponent(categoryId)}` +
    `&json=1&page_size=40&sort_by=popularity` +
    `&fields=product_name,image_front_url`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "GuiaDesconto/1.0 (seed script)" },
    });

    // 503 → retry até 3x com backoff
    if (res.status === 503 && attempt <= 3) {
      await sleep(3000 * attempt);
      return fetchCategory(categoryId, categoryName, attempt + 1);
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const products = json.products ?? [];

    return products
      .filter((p) => p.image_front_url && p.product_name?.trim().length > 0)
      .map((p) => ({
        name: p.product_name.trim().slice(0, 80),
        category: categoryName,
        image_url: p.image_front_url,
      }))
      .slice(0, PER_CATEGORY);
  } catch (err) {
    console.warn(`  ⚠ ${categoryName}: ${err.message}`);
    return [];
  }
}

// ── Main ──────────────────────────────────────────────────────
let total = 0;

for (const [categoryId, categoryName] of CATEGORIES) {
  process.stdout.write(`Buscando ${categoryName}...`);

  const products = await fetchCategory(categoryId, categoryName);

  if (products.length === 0) {
    console.log(" sem resultados.");
    await sleep(1000);
    continue;
  }

  const { error } = await supabase.from("product_catalog").insert(products);

  if (error) {
    console.log(` erro no insert: ${error.message}`);
  } else {
    total += products.length;
    console.log(` ✓ ${products.length} produtos (total: ${total})`);
  }

  // 1.2s entre categorias — respeita rate limit do Open Food Facts
  await sleep(1200);
}

console.log(`\n🎉 ${total} produtos inseridos no product_catalog`);
console.log("   Imagens hospedadas no Open Food Facts CDN — zero uso de Supabase Storage.");
