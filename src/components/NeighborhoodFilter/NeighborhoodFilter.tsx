"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MapPin, ChevronDown, X, Check } from "lucide-react";
import styles from "./NeighborhoodFilter.module.css";
import { track } from "@/lib/track";

type Neighborhood = { id: string; name: string; slug: string };

export default function NeighborhoodFilter({
  neighborhoods,
  active,
}: {
  neighborhoods: Neighborhood[];
  active: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(active);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(active);
  }, [active.join(",")]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (selected.length > 0) {
      params.set("bairros", selected.join(","));
      track("filter_neighborhood", { metadata: { slugs: selected } });
    } else {
      params.delete("bairros");
    }
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  const clear = () => {
    setSelected([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("bairros");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  if (neighborhoods.length === 0) return null;

  const count = active.length;

  return (
    <>
      <div className={styles.filterWrap}>
        <button
          className={`${styles.filterBtn} ${count > 0 ? styles.filterBtnActive : ""}`}
          onClick={() => setOpen(true)}
        >
          <MapPin size={15} />
          <span>Pesquisar por bairro</span>
          {count > 0 && <span className={styles.filterBadge}>{count}</span>}
          <ChevronDown size={14} className={styles.filterChevron} />
        </button>

        {count > 0 && (
          <div className={styles.activeChips}>
            {active.map((slug) => {
              const n = neighborhoods.find((nb) => nb.slug === slug);
              if (!n) return null;
              return (
                <span key={slug} className={styles.activeChip}>
                  {n.name}
                  <button
                    onClick={() => {
                      const next = active.filter((s) => s !== slug);
                      const params = new URLSearchParams(searchParams.toString());
                      if (next.length > 0) params.set("bairros", next.join(","));
                      else params.delete("bairros");
                      router.push(`${pathname}?${params.toString()}`);
                    }}
                    className={styles.activeChipRemove}
                    aria-label={`Remover ${n.name}`}
                  >
                    <X size={11} />
                  </button>
                </span>
              );
            })}
            <button className={styles.clearAll} onClick={clear}>
              Limpar tudo
            </button>
          </div>
        )}
      </div>

      {open && (
        <div
          className={styles.overlay}
          ref={overlayRef}
          onClick={(e) => {
            if (e.target === overlayRef.current) setOpen(false);
          }}
        >
          <div className={styles.popup} role="dialog" aria-modal="true" aria-label="Filtrar por bairro">
            <div className={styles.popupHeader}>
              <h3 className={styles.popupTitle}>Filtrar por bairro</h3>
              <button className={styles.popupClose} onClick={() => setOpen(false)} aria-label="Fechar">
                <X size={18} />
              </button>
            </div>

            <div className={styles.popupList}>
              {neighborhoods.map((n) => {
                const checked = selected.includes(n.slug);
                return (
                  <button
                    key={n.id}
                    className={`${styles.popupItem} ${checked ? styles.popupItemActive : ""}`}
                    onClick={() => toggle(n.slug)}
                    role="checkbox"
                    aria-checked={checked}
                  >
                    <span className={styles.popupCheckbox}>
                      {checked && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span className={styles.popupItemName}>{n.name}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.popupFooter}>
              <button className={styles.popupClear} onClick={clear}>
                Limpar
              </button>
              <button className={styles.popupApply} onClick={apply}>
                Aplicar{selected.length > 0 ? ` (${selected.length})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
