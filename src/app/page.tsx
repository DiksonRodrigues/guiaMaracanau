export const dynamic = "force-dynamic";

import { cityConfig } from "@/config/city";
import { getCategories, getBusinessesPaginated, getFeaturedBusinesses, getSupermarkets, getNeighborhoodsWithCount } from "@/lib/database";
import Link from "next/link";
import styles from "./page.module.css";
import * as LucideIcons from "lucide-react";
import FloatingSearch from "@/components/FloatingSearch/FloatingSearch";
import BannerCarousel from "@/components/BannerCarousel/BannerCarousel";
import BusinessFeed from "@/components/BusinessFeed/BusinessFeed";

export default async function Home() {
  const [categories, featuredBusinesses, initialBusinesses, supermarkets, neighborhoods] = await Promise.all([
    getCategories(),
    getFeaturedBusinesses().catch(() => []),
    getBusinessesPaginated(0, 12).catch(() => []),
    getSupermarkets().catch(() => []),
    getNeighborhoodsWithCount().catch(() => []),
  ]);
  const topNeighborhoods = neighborhoods
    .sort((a: any, b: any) => b.business_count - a.business_count)
    .slice(0, 5);
  const activeFlyerCount = supermarkets.filter((s: any) => s.activeFlyer).length;

  return (
    <div className={styles.homePage}>
      {/* Lupa Flutuante - fixa na tela */}
      <FloatingSearch />

      {/* Banner Carousel */}
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

      {/* Neighborhood Chips */}
      {topNeighborhoods.length > 0 && (
        <section className={styles.neighborhoodStrip}>
          <div className="container">
            <div className={styles.neighborhoodChips}>
              <span className={styles.neighborhoodLabel}>Explorar por bairro:</span>
              {topNeighborhoods.map((n: any) => (
                <Link key={n.id} href={`/bairros/${n.slug}`} className={styles.neighborhoodChip}>
                  {n.name}
                </Link>
              ))}
              <Link href="/bairros" className={styles.neighborhoodChipMore}>
                Ver todos →
              </Link>
            </div>
          </div>
        </section>
      )}

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

      {/* Business Feed com infinite scroll */}
      <section className={`${styles.featured} section`}>
        <div className="container">
          <BusinessFeed initial={initialBusinesses} featured={featuredBusinesses} />
        </div>
      </section>
    </div>
  );
}
