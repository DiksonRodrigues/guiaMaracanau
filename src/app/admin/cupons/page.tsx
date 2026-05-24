import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import AdminShell from "@/components/AdminShell/AdminShell";
import styles from "../admin.module.css";
import DeleteCouponBtn from "./DeleteCouponBtn";

export const dynamic = "force-dynamic";

export default async function AdminCuponsPage() {
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*, businesses(name)")
    .order("created_at", { ascending: false });

  return (
    <AdminShell>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Cupons de Desconto</h1>
        <Link href="/admin/cupons/new" className={`${styles.btn} ${styles.btnPrimary}`}>
          <Plus size={16} /> Novo cupom
        </Link>
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: "hidden" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Desconto</th>
              <th>Estabelecimento</th>
              <th>Validade</th>
              <th>Ativo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {coupons?.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
                  Nenhum cupom cadastrado ainda.
                </td>
              </tr>
            )}
            {coupons?.map((c: any) => (
              <tr key={c.id}>
                <td>
                  <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.9rem" }}>
                    {c.code}
                  </span>
                </td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeOrange}`}>
                    {c.discount_label}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{c.businesses?.name ?? "—"}</td>
                <td>
                  {c.expires_at
                    ? new Date(c.expires_at).toLocaleDateString("pt-BR")
                    : <span style={{ color: "#94a3b8" }}>Sem validade</span>}
                </td>
                <td>
                  <span className={`${styles.badge} ${c.active ? styles.badgeGreen : styles.badgeGray}`}>
                    {c.active ? "Sim" : "Não"}
                  </span>
                </td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <Link
                    href={`/admin/cupons/${c.id}/edit`}
                    className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                  >
                    <Pencil size={13} /> Editar
                  </Link>
                  <DeleteCouponBtn id={c.id} code={c.code} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
