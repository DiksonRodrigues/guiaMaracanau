import { getSupermarketBySlug } from "@/lib/database";
import { cityConfig } from "@/config/city";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Phone, CalendarDays, ShoppingCart, FileText } from "lucide-react";
import FlyerViewer from "@/components/FlyerViewer/FlyerViewer";
import styles from "./supermarket.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const s = await getSupermarketBySlug(slug);
    return {
      title: `${s.name} — Encartes e Ofertas | ${cityConfig.appTitle}`,
      description: s.description ?? `Confira o encarte semanal e ofertas do ${s.name} em ${cityConfig.name}.`,
    };
  } catch {
    return {};
  }
}

function formatDateRange(from: string, until: string) {
  const f = new Date(from + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const u = new Date(until + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  return `${f} a ${u}`;
}

function formatPrice(n: number | null) {
  if (n == null) return null;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calcDiscount(original: number | null, sale: number | null) {
  if (!original || !sale || original <= sale) return null;
  return Math.round(((original - sale) / original) * 100);
}

export default async function SupermarketDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let supermarket: any;
  try {
    supermarket = await getSupermarketBySlug(slug);
  } catch {
    notFound();
  }

  const flyer = supermarket.activeFlyer;
  const highlights = flyer?.flyer_highlights ?? [];
  const pages = flyer?.pages ?? [];

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <div className={styles.hero}>
        {(supermarket.cover_url || supermarket.logo_url) ? (
          <Image
            src={supermarket.cover_url || supermarket.logo_url}
            alt={supermarket.name}
            fill
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
          />
        ) : (
          <div className={styles.heroFallback} />
        )}
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} container`}>
          <Link href="/supermercados" className={styles.back}>
            <ArrowLeft size={18} /> Todos os supermercados
          </Link>
          <h1 className={styles.heroName}>{supermarket.name}</h1>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="container">
        <div className={styles.infoBar}>
          {supermarket.address && (
            <span className={styles.infoItem}>
              <MapPin size={15} /> {supermarket.address}
            </span>
          )}
          {supermarket.phone && (
            <span className={styles.infoItem}>
              <Phone size={15} /> {supermarket.phone}
            </span>
          )}
          {flyer && (
            <span className={`${styles.infoItem} ${styles.infoFlyer}`}>
              <CalendarDays size={15} /> Encarte válido: {formatDateRange(flyer.valid_from, flyer.valid_until)}
            </span>
          )}
          {supermarket.description && (
            <p className={styles.desc}>{supermarket.description}</p>
          )}
        </div>

        {!flyer ? (
          <div className={styles.noFlyer}>
            <FileText size={48} />
            <p>Nenhum encarte disponível no momento.</p>
            <span>Volte em breve para conferir as ofertas da semana!</span>
          </div>
        ) : (
          <>
            {/* ── Ofertas destaque ── */}
            {highlights.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>🔥 Ofertas em Destaque</h2>
                <div className={styles.highlightsGrid}>
                  {highlights.map((h: any) => {
                    const discount = calcDiscount(h.original_price, h.sale_price);
                    return (
                      <div key={h.id} className={`${styles.highlightCard} glass-card`}>
                        {h.image_url ? (
                          <div className={styles.highlightImg}>
                            <Image src={h.image_url} alt={h.product_name} fill sizes="(max-width: 640px) 50vw, 200px" style={{ objectFit: "cover" }} />
                          </div>
                        ) : (
                          <div className={`${styles.highlightImg} ${styles.highlightImgPlaceholder}`}>
                            <ShoppingCart size={28} />
                          </div>
                        )}
                        {discount && (
                          <span className={styles.discountBadge}>{discount}% OFF</span>
                        )}
                        <div className={styles.highlightBody}>
                          <p className={styles.productName}>{h.product_name}</p>
                          {h.original_price && (
                            <span className={styles.originalPrice}>{formatPrice(h.original_price)}</span>
                          )}
                          <span className={styles.salePrice}>{formatPrice(h.sale_price)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Encarte completo ── */}
            {pages.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <FileText size={20} /> Encarte Completo
                  <span className={styles.sectionSub}>{pages.length} {pages.length === 1 ? "página" : "páginas"}</span>
                </h2>
                <FlyerViewer pages={pages} />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
