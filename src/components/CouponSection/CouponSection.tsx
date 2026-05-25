"use client";

import { useState, useEffect } from "react";
import { Scissors, Copy, Check, MessageCircle, Tag } from "lucide-react";
import Link from "next/link";
import styles from "./CouponSection.module.css";
import { track } from "@/lib/track";

type Coupon = {
  id: string;
  code: string;
  discount_label: string;
  description: string | null;
  expires_at: string | null;
  businesses: {
    name: string;
    whatsapp: string;
    slug: string;
  } | null;
};

type Props = {
  coupons: Coupon[];
  emptyMessage?: string;
  hideHeader?: boolean;
};

function formatExpiry(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function buildWhatsAppUrl(whatsapp: string, code: string, discountLabel: string) {
  const phone = whatsapp.replace(/\D/g, "");
  const msg = encodeURIComponent(
    `Olá! Vim pelo GuiaMaracanau e quero usar o cupom *${code}* — ${discountLabel} 😊`
  );
  return `https://wa.me/55${phone}?text=${msg}`;
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  const today = new Date().toISOString().split("T")[0];
  const storageKey = `coupon_redeemed_${coupon.id}_${today}`;

  const [copied, setCopied] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  useEffect(() => {
    setRedeemed(localStorage.getItem(storageKey) === "true");
  }, [storageKey]);

  function handleCopy() {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRedeem() {
    localStorage.setItem(storageKey, "true");
    setRedeemed(true);
    track("coupon_redeem", { coupon_id: coupon.id });
    if (coupon.businesses?.whatsapp) {
      window.open(
        buildWhatsAppUrl(coupon.businesses.whatsapp, coupon.code, coupon.discount_label),
        "_blank"
      );
    }
  }

  return (
    <div className={`${styles.card} ${redeemed ? styles.cardRedeemed : ""}`}>
      <div className={styles.cardLeft}>
        <div className={styles.discount}>{coupon.discount_label}</div>
        {coupon.businesses && (
          <Link href={`/business/${coupon.businesses.slug}`} className={styles.bizName}>
            {coupon.businesses.name}
          </Link>
        )}
        {coupon.description && (
          <p className={styles.desc}>{coupon.description}</p>
        )}
        {coupon.expires_at && (
          <span className={styles.expiry}>Válido até {formatExpiry(coupon.expires_at)}</span>
        )}
      </div>

      <div className={styles.divider}>
        <div className={styles.notchTop} />
        <div className={styles.notchBottom} />
      </div>

      <div className={styles.cardRight}>
        {redeemed && <span className={styles.redeemedBadge}>Resgatado hoje</span>}

        <div className={styles.codeBox}>
          <span className={styles.code}>{coupon.code}</span>
          <button
            onClick={handleCopy}
            className={styles.copyBtn}
            title="Copiar código"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>

        <button
          onClick={handleRedeem}
          disabled={redeemed}
          className={`${styles.redeemBtn} ${redeemed ? styles.redeemBtnUsed : ""}`}
        >
          <MessageCircle size={14} />
          {redeemed ? "Já resgatado" : "Resgatar no WhatsApp"}
        </button>
      </div>
    </div>
  );
}

const INITIAL_VISIBLE = 4;

export default function CouponSection({ coupons, emptyMessage, hideHeader }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!coupons || coupons.length === 0) {
    if (emptyMessage) {
      return (
        <section className={`${styles.section} section`}>
          <div className="container">
            <p className={styles.empty}>{emptyMessage}</p>
          </div>
        </section>
      );
    }
    return null;
  }

  const visible = expanded ? coupons : coupons.slice(0, INITIAL_VISIBLE);
  const hidden = coupons.length - INITIAL_VISIBLE;

  return (
    <section className={`${styles.section} section`}>
      <div className="container">
        {!hideHeader && (
          <>
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <Scissors size={20} className={styles.scissors} />
                <h2 className={styles.title}>Cupons de Desconto</h2>
              </div>
              <Tag size={16} className={styles.tagIcon} />
            </div>
            <p className={styles.subtitle}>Copie o código e apresente no WhatsApp do estabelecimento</p>
          </>
        )}

        <div className={styles.grid}>
          {visible.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>

        {!expanded && hidden > 0 && (
          <div className={styles.showMoreWrapper}>
            <button onClick={() => setExpanded(true)} className={styles.showMoreBtn}>
              + Ver mais {hidden} cupom{hidden > 1 ? "s" : ""}
            </button>
          </div>
        )}

        {expanded && coupons.length > INITIAL_VISIBLE && (
          <div className={styles.showMoreWrapper}>
            <button onClick={() => setExpanded(false)} className={styles.showMoreBtn}>
              Mostrar menos
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
