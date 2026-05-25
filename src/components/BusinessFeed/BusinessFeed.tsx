"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, Star, Loader2 } from "lucide-react";
import { cityConfig } from "@/config/city";
import styles from "../../app/page.module.css";
import BusinessCardImage from "@/components/BusinessCardImage/BusinessCardImage";
import BannerCarousel from "@/components/BannerCarousel/BannerCarousel";

type Business = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  rating: number;
  discount_label?: string | null;
  featured?: boolean;
  categories?: { name: string } | { name: string }[] | null;
  neighborhoods?: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

type FeaturedBusiness = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  description: string;
  discount_label?: string | null;
  categories?: { name: string };
};

const PAGE = 12;
const BANNER_INTERVAL = 6;

export default function BusinessFeed({
  initial,
  featured = [],
  neighborhoodIds,
}: {
  initial: Business[];
  featured?: FeaturedBusiness[];
  neighborhoodIds?: string[];
}) {
  const [items, setItems] = useState<Business[]>(initial);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initial.length < PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(initial);
    setDone(initial.length < PAGE);
  }, [neighborhoodIds?.join(",")]);

  useEffect(() => {
    if (done) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) loadMore();
      },
      { rootMargin: "200px" },
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [items.length, loading, done]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        offset: String(items.length),
        limit: String(PAGE),
      });
      if (neighborhoodIds && neighborhoodIds.length > 0) {
        params.set("neighborhoodIds", neighborhoodIds.join(","));
      }
      const res = await fetch(`/api/businesses?${params.toString()}`);
      const next: Business[] = await res.json();
      if (next.length < PAGE) setDone(true);
      setItems((prev) => {
        const ids = new Set(prev.map((b) => b.id));
        return [...prev, ...next.filter((b) => !ids.has(b.id))];
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.featuredGrid}>
        {items.map((biz, i) => (
          <React.Fragment key={biz.id}>
            {i > 0 && i % BANNER_INTERVAL === 0 && featured.length > 0 && (
              <div style={{
                gridColumn: "1 / -1",
                margin: "1.5rem 0 0.5rem",
                background: "linear-gradient(160deg, rgba(91,33,182,0.06) 0%, rgba(14,165,233,0.04) 100%)",
                border: "1.5px solid rgba(91, 33, 182, 0.18)",
                borderRadius: "20px",
                padding: "1.25rem 1.25rem 1.5rem",
                boxShadow: "0 4px 24px -4px rgba(91, 33, 182, 0.1)",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  marginBottom: "1rem",
                  paddingBottom: "0.9rem",
                  borderBottom: "1px solid rgba(91, 33, 182, 0.12)",
                }}>
                  <div style={{
                    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                    borderRadius: "10px",
                    width: 36, height: 36,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(91,33,182,0.35)",
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
                      animation: "featuredShimmer 3s ease-in-out infinite",
                      pointerEvents: "none",
                    }} />
                    <Star size={18} fill="white" color="white" />
                  </div>
                  <div>
                    <p style={{ fontSize: "1rem", fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                      Destaques
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                      Estabelecimentos recomendados em {cityConfig.name}
                    </p>
                  </div>
                </div>
                <BannerCarousel businesses={featured} fullWidth />
                <style>{`
                  @keyframes featuredShimmer {
                    0%   { transform: translateX(-100%); }
                    60%  { transform: translateX(200%); }
                    100% { transform: translateX(200%); }
                  }
                `}</style>
              </div>
            )}
            <Link
              href={`/business/${biz.slug}`}
              className={`${styles.featuredCard} glass-card animate-fade`}
              style={{ animationDelay: `${Math.min(i, 5) * 0.08}s` }}
            >
              {biz.discount_label && (
                <span className={styles.discountBadge}>{biz.discount_label}</span>
              )}
              <BusinessCardImage url={biz.image_url} name={biz.name} />
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{biz.name}</h3>
                  <div className={styles.cardRating}>
                    <Star size={14} fill="currentColor" />
                    <span>{Number(biz.rating).toFixed(1)}</span>
                  </div>
                </div>
                <p className={styles.cardDesc}>{biz.description}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.cardTag}>
                    {Array.isArray(biz.categories) ? biz.categories[0]?.name : (biz.categories as any)?.name}
                  </span>
                  <span className={styles.cardLocation}>
                    <MapPin size={12} />
                    {(Array.isArray(biz.neighborhoods) ? biz.neighborhoods[0]?.name : (biz.neighborhoods as any)?.name) ?? cityConfig.name}
                  </span>
                </div>
              </div>
            </Link>
          </React.Fragment>
        ))}
      </div>

      {!done && (
        <div ref={sentinelRef} style={{ display: "flex", justifyContent: "center", padding: "2rem 0" }}>
          {loading && <Loader2 size={28} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
