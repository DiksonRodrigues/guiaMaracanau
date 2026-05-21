"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X, Plus, Trash2 } from "lucide-react";
import { uploadImage } from "@/lib/storage";
import styles from "../../../admin.module.css";

type Highlight = {
  id?: string;
  product_name: string;
  original_price: string;
  sale_price: string;
  image_url: string;
};

type FlyerData = {
  id?: string;
  supermarket_id: string;
  valid_from: string;
  valid_until: string;
  pages: string[];
  active: boolean;
  flyer_highlights?: Highlight[];
};

const emptyHighlight = (): Highlight => ({
  product_name: "", original_price: "", sale_price: "", image_url: "",
});

export default function FlyerForm({
  supermarketId,
  initial,
}: {
  supermarketId: string;
  initial?: FlyerData;
}) {
  const isEdit = !!initial?.id;
  const router = useRouter();

  const [form, setForm] = useState<FlyerData>(
    initial ?? { supermarket_id: supermarketId, valid_from: "", valid_until: "", pages: [], active: true }
  );
  const [highlights, setHighlights] = useState<Highlight[]>(initial?.flyer_highlights ?? []);
  const [uploadingPage, setUploadingPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FlyerData, v: any) => setForm((f) => ({ ...f, [k]: v }));

  // ── Páginas do encarte ─────────────────────────────────
  const handlePageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingPage(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadImage(f, "flyers")));
      setForm((prev) => ({ ...prev, pages: [...prev.pages, ...urls] }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingPage(false);
      e.target.value = "";
    }
  };

  const removePage = (idx: number) =>
    setForm((f) => ({ ...f, pages: f.pages.filter((_, i) => i !== idx) }));

  // ── Highlights ─────────────────────────────────────────
  const addHighlight = () => setHighlights((h) => [...h, emptyHighlight()]);

  const setHighlight = (idx: number, k: keyof Highlight, v: string) =>
    setHighlights((h) => h.map((item, i) => i === idx ? { ...item, [k]: v } : item));

  const removeHighlight = async (idx: number) => {
    const h = highlights[idx];
    if (h.id) {
      await fetch(`/api/admin/highlights/${h.id}`, { method: "DELETE" });
    }
    setHighlights((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleHighlightImageUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file, "flyers");
      setHighlight(idx, "image_url", url);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ── Submit ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.valid_from || !form.valid_until) {
      setError("Datas de vigência são obrigatórias.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let flyerId = initial?.id;

      if (isEdit) {
        const res = await fetch(`/api/admin/flyers/${flyerId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ valid_from: form.valid_from, valid_until: form.valid_until, pages: form.pages, active: form.active }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
      } else {
        const res = await fetch("/api/admin/flyers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ supermarket_id: supermarketId, valid_from: form.valid_from, valid_until: form.valid_until, pages: form.pages, active: form.active }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const created = await res.json();
        flyerId = created.id;
      }

      // salva highlights novos (sem id)
      const newHighlights = highlights.filter((h) => !h.id && h.product_name && h.sale_price);
      await Promise.all(
        newHighlights.map((h) =>
          fetch(`/api/admin/flyers/${flyerId}/highlights`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              product_name: h.product_name,
              original_price: h.original_price ? parseFloat(h.original_price) : null,
              sale_price: parseFloat(h.sale_price),
              image_url: h.image_url || null,
            }),
          })
        )
      );

      router.push(`/admin/supermercados/${supermarketId}/encartes`);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ── Datas e status ── */}
      <div className={styles.card}>
        <p style={{ fontWeight: 700, marginBottom: "1rem", color: "#1e1b4b" }}>Vigência do Encarte</p>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Válido a partir de *</label>
            <input className={styles.input} type="date" value={form.valid_from} onChange={(e) => set("valid_from", e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Válido até *</label>
            <input className={styles.input} type="date" value={form.valid_until} onChange={(e) => set("valid_until", e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
              Encarte ativo (visível no site)
            </label>
          </div>
        </div>
      </div>

      {/* ── Páginas do encarte ── */}
      <div className={styles.card}>
        <p style={{ fontWeight: 700, marginBottom: "1rem", color: "#1e1b4b" }}>
          Páginas do Encarte
          <span style={{ fontWeight: 400, color: "#64748b", fontSize: "0.82rem", marginLeft: "0.5rem" }}>
            ({form.pages.length} {form.pages.length === 1 ? "página" : "páginas"})
          </span>
        </p>

        {form.pages.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
            {form.pages.map((url, idx) => (
              <div key={idx} style={{ position: "relative" }}>
                <img
                  src={url}
                  alt={`Página ${idx + 1}`}
                  style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0", display: "block" }}
                />
                <span style={{ position: "absolute", top: 4, left: 6, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: "0.7rem", fontWeight: 700, borderRadius: 4, padding: "1px 6px" }}>
                  {idx + 1}
                </span>
                <button
                  onClick={() => removePage(idx)}
                  style={{ position: "absolute", top: 4, right: 4, background: "#ef4444", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <label className={`${styles.btn} ${styles.btnOutline}`} style={{ cursor: "pointer", width: "fit-content" }}>
          {uploadingPage
            ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Enviando...</>
            : <><Upload size={14} /> Adicionar páginas</>}
          <input type="file" accept="image/*" multiple onChange={handlePageUpload} style={{ display: "none" }} disabled={uploadingPage} />
        </label>
        <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem" }}>
          Selecione múltiplas imagens de uma vez. Ordem de upload = ordem das páginas.
        </p>
      </div>

      {/* ── Ofertas destaque ── */}
      <div className={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <p style={{ fontWeight: 700, color: "#1e1b4b" }}>
            Ofertas em Destaque
            <span style={{ fontWeight: 400, color: "#64748b", fontSize: "0.82rem", marginLeft: "0.5rem" }}>
              (aparece no topo da página do encarte)
            </span>
          </p>
          <button onClick={addHighlight} className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}>
            <Plus size={13} /> Adicionar oferta
          </button>
        </div>

        {highlights.length === 0 && (
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Nenhuma oferta destaque ainda. Clique em "Adicionar oferta" para incluir.</p>
        )}

        {highlights.map((h, idx) => (
          <div key={idx} className={styles.productRow} style={{ gridTemplateColumns: "1fr 130px 130px 80px auto" }}>
            <div className={styles.field}>
              <label className={styles.label}>Produto</label>
              <input
                className={styles.input}
                value={h.product_name}
                onChange={(e) => setHighlight(idx, "product_name", e.target.value)}
                placeholder="Ex: Arroz 5kg"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Preço de</label>
              <input
                className={styles.input}
                type="number"
                step="0.01"
                value={h.original_price}
                onChange={(e) => setHighlight(idx, "original_price", e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Preço por *</label>
              <input
                className={styles.input}
                type="number"
                step="0.01"
                value={h.sale_price}
                onChange={(e) => setHighlight(idx, "sale_price", e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Foto</label>
              <label className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`} style={{ cursor: "pointer" }}>
                <Upload size={12} />
                <input type="file" accept="image/*" onChange={(e) => handleHighlightImageUpload(idx, e)} style={{ display: "none" }} />
              </label>
              {h.image_url && (
                <img src={h.image_url} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4, marginTop: 4 }} />
              )}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "0.1rem" }}>
              <button
                onClick={() => removeHighlight(idx)}
                className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <p style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "0.875rem" }}>{error}</p>}

      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleSubmit}
          disabled={loading || uploadingPage}
          style={{ minWidth: 180, justifyContent: "center" }}
        >
          {loading
            ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Salvando...</>
            : isEdit ? "Salvar alterações" : "Criar encarte"}
        </button>
        <a href={`/admin/supermercados/${supermarketId}/encartes`} className={`${styles.btn} ${styles.btnOutline}`}>
          Cancelar
        </a>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
