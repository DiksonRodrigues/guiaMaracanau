"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import styles from "./BannerCarousel.module.css";

type Business = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  description: string;
  discount_label?: string | null;
  categories?: { name: string };
};

export default function BannerCarousel({ businesses, fullWidth }: { businesses: Business[]; fullWidth?: boolean }) {
  const slides = businesses.slice(0, 5);
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);

  useEffect(() => {
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [next]);

  return (
    <div className={styles.wrapper} style={fullWidth ? { width: "100%", margin: 0 } : undefined}>
      <div className={styles.track}>
        {slides.map((biz, i) => (
          <Link
            href={`/business/${biz.slug}`}
            key={biz.id}
            className={`${styles.slide} ${i === current ? styles.active : ""}`}
            aria-hidden={i !== current}
            tabIndex={i !== current ? -1 : 0}
          >
            <Image
              src={biz.image_url}
              alt={biz.name}
              fill
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
              priority={i === 0}
            />
            <div className={styles.overlay} />
            {biz.discount_label && (
              <span className={styles.discountBadge}>{biz.discount_label}</span>
            )}
            <div className={styles.content}>
              <span className={styles.tag}>{biz.categories?.name}</span>
              <h2 className={styles.name}>{biz.name}</h2>
              <p className={styles.desc}>{biz.description}</p>
              <span className={styles.cta}>Ver estabelecimento →</span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.dots}>
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
