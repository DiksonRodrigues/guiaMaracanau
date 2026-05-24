import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import AdminShell from "@/components/AdminShell/AdminShell";
import styles from "../../../admin.module.css";
import DeleteFlyerBtn from "./DeleteFlyerBtn";

export const dynamic = "force-dynamic";

export default async function EncartesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: supermarket } = await supabase
    .from("supermarkets").select("id, name").eq("id", id).single();
  if (!supermarket) notFound();

  const { data: flyers } = await supabase
    .from("flyers")
    .select("*, flyer_highlights(id)")
    .eq("supermarket_id", id)
    .order("valid_from", { ascending: false });

  return (
    <AdminShell>
      <div className={styles.topbar}>
        <div>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.25rem" }}>
            <Link href="/admin/supermercados" style={{ color: "#5b21b6" }}>Supermercados</Link> / {supermarket.name}
          </p>
          <h1 className={styles.pageTitle}>Encartes</h1>
        </div>
        <Link href={`/admin/supermercados/${id}/encartes/new`} className={`${styles.btn} ${styles.btnPrimary}`}>
          <Plus size={16} /> Novo encarte
        </Link>
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: "hidden" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Vigência</th>
              <th>Páginas</th>
              <th>Destaques</th>
              <th>Ativo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {(!flyers || flyers.length === 0) && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
                  Nenhum encarte cadastrado. Crie o primeiro!
                </td>
              </tr>
            )}
            {flyers?.map((f: any) => (
              <tr key={f.id}>
                <td style={{ fontWeight: 600 }}>
                  {new Date(f.valid_from).toLocaleDateString("pt-BR")} → {new Date(f.valid_until).toLocaleDateString("pt-BR")}
                </td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeGray}`}>
                    {f.pages?.length ?? 0} {f.pages?.length === 1 ? "página" : "páginas"}
                  </span>
                </td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeOrange}`}>
                    {f.flyer_highlights?.length ?? 0} {f.flyer_highlights?.length === 1 ? "oferta" : "ofertas"}
                  </span>
                </td>
                <td>
                  <span className={`${styles.badge} ${f.active ? styles.badgeGreen : styles.badgeGray}`}>
                    {f.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <Link
                    href={`/admin/supermercados/${id}/encartes/${f.id}/edit`}
                    className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                  >
                    <Pencil size={13} /> Editar
                  </Link>
                  <DeleteFlyerBtn id={f.id} supermarketId={id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
