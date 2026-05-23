export const dynamic = "force-dynamic";

import { cityConfig } from "@/config/city";
import { getCategories, getBusinessesPaginated, getFeaturedBusinesses, getSupermarkets, getNeighborhoodsWithCount } from "@/lib/database";
import Link from "next/link";
import styles from "./page.module.css";
import * as LucideIcons from "lucide-react";
import FloatingSearch from "@/components/FloatingSearch/FloatingSearch";
import BannerCarousel from "@/components/BannerCarousel/BannerCarousel";
import BusinessFeed from "@/components/BusinessFeed/BusinessFeed";
import { Suspense } from "react";
import NeighborhoodFilter from "@/components/NeighborhoodFilter/NeighborhoodFilter";
import { supabase } from "@/lib/supabase";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ bairros?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};
  const activeSlugs = sp.bairros ? sp.bairros.split(",").filter(Boolean) : [];

  let neighborhoodIds: string[] | undefined;
  if (activeSlugs.length > 0) {
    const { data: hoods } = await supabase
      .from("neighborhoods")
      .select("id, slug")
      .in("slug", activeSlugs)
      .eq("is_active", true);
    neighborhoodIds = (hoods ?? []).map((h: { id: string }) => h.id);
  }

  const [categories, featuredBusinesses, initialBusinesses, supermarkets, neighborhoods] = await Promise.all([
    getCategories(),
    getFeaturedBusinesses().catch(() => []),
    getBusinessesPaginated(0, 12, neighborhoodIds).catch(() => []),
    getSupermarkets().catch(() => []),
    getNeighborhoodsWithCount().catch(() => []),
  ]);

  const activeFlyerCount = supermarkets.filter((s: any) => s.activeFlyer).length;

  return (
    <div className={styles.homePage}>
      <FloatingSearch />
      <BannerCarousel businesses={featuredBusinesses} />

      {/* Categories Section */}
      <section className={`${styles.categories} section`}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Categorias Populares</h2>
          <div className={styles.categoryGrid}>
            {categories.map((cat: any, i: number) => {
              // @ts-ignore
              const IconComponent = LucideIcons[cat.icon_name] || LucideIcons.HelpCircle;
              return (
                <Link
                  href={`/categories/${cat.slug}`}
                  key={cat.id}
                  className={`${styles.categoryItem} glass-card animate-fade`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={styles.categoryIcon} style={{ color: cat.color }}>
                    <IconComponent size={24} />
                  </div>
                  <span className={styles.categoryName}>{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Coupon Teaser */}
      <section className={styles.couponTeaser}>
        <div className="container">
          <Link href="/cupons" className={styles.couponTeaserInner}>
            <div className={styles.couponTeaserLeft}>
              <span className={styles.couponTeaserIcon}>🏷️</span>
              <div>
                <p className={styles.couponTeaserTitle}>Cupons de Desconto</p>
                <p className={styles.couponTeaserSub}>Economize nos melhores estabelecimentos de {cityConfig.name}</p>
              </div>
            </div>
            <span className={styles.couponTeaserCta}>Ver cupons →</span>
          </Link>
        </div>
      </section>

      {/* Supermarket Teaser */}
      {supermarkets.length > 0 && (
        <section className={styles.supermarketTeaser}>
          <div className="container">
            <Link href="/supermercados" className={styles.supermarketTeaserInner}>
              <div className={styles.couponTeaserLeft}>
                <span className={styles.couponTeaserIcon}>🛒</span>
                <div>
                  <p className={styles.couponTeaserTitle}>Encartes Semanais</p>
                  <p className={styles.couponTeaserSub}>
                    {activeFlyerCount > 0
                      ? `${activeFlyerCount} supermercado${activeFlyerCount > 1 ? "s" : ""} com encarte ativo em ${cityConfig.name}`
                      : `Ofertas dos supermercados de ${cityConfig.name}`}
                  </p>
                </div>
              </div>
              <span className={styles.supermarketTeaserCta}>Ver encartes →</span>
            </Link>
          </div>
        </section>
      )}

      {/* Business Feed com filtro de bairro */}
      <section className={`${styles.featured} section`}>
        <div className="container">
          {neighborhoods.length > 0 && (
            <Suspense fallback={null}>
              <NeighborhoodFilter
                neighborhoods={neighborhoods}
                active={activeSlugs}
              />
            </Suspense>
          )}
          <BusinessFeed initial={initialBusinesses} featured={featuredBusinesses} neighborhoodIds={neighborhoodIds} />
        </div>
      </section>
    </div>
  );
}
