import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import AdminShell from "@/components/AdminShell/AdminShell";
import styles from "../admin.module.css";
import DeleteBusinessBtn from "./DeleteBusinessBtn";

export const dynamic = "force-dynamic";

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ missing_neighborhood?: string }>;
}) {
  const sp = await searchParams;
  const missingOnly = sp.missing_neighborhood === "1";

  let query = supabase
    .from("businesses")
    .select("*, categories(name), neighborhoods(name)")
    .order("name");

  if (missingOnly) query = (query as any).is("neighborhood_id", null);

  const { data: businesses } = await query;
  const missingCount = businesses?.filter((b: any) => !b.neighborhoods).length ?? 0;

  return (
    <AdminShell>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>
          Negócios
          {missingOnly && (
            <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#f59e0b", marginLeft: "0.75rem" }}>
              — sem bairro ({businesses?.length ?? 0})
            </span>
          )}
        </h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {missingOnly ? (
            <Link href="/admin/businesses" className={`${styles.btn} ${styles.btnOutline}`}>
              Ver todos
            </Link>
          ) : missingCount > 0 ? (
            <Link href="/admin/businesses?missing_neighborhood=1" className={`${styles.btn} ${styles.btnOutline}`}
              style={{ color: "#f59e0b", borderColor: "#fcd34d" }}>
              {missingCount} sem bairro
            </Link>
          ) : null}
          <Link href="/admin/businesses/new" className={`${styles.btn} ${styles.btnPrimary}`}>
            <Plus size={16} /> Novo negócio
          </Link>
        </div>
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: "hidden" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Bairro</th>
              <th>Desconto</th>
              <th>Destaque</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {businesses?.map((biz: any) => (
              <tr key={biz.id}>
                <td>
                  <img src={biz.image_url} alt={biz.name} className={styles.thumb} />
                </td>
                <td style={{ fontWeight: 600 }}>{biz.name}</td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeGray}`}>
                    {biz.categories?.name ?? "—"}
                  </span>
                </td>
                <td>
                  {biz.neighborhoods ? (
                    <span className={`${styles.badge} ${styles.badgeGray}`}>
                      {biz.neighborhoods.name}
                    </span>
                  ) : (
                    <span className={`${styles.badge}`} style={{ background: "#fef3c7", color: "#92400e" }}>
                      Sem bairro
                    </span>
                  )}
                </td>
                <td>
                  {biz.discount_label ? (
                    <span className={`${styles.badge} ${styles.badgeOrange}`}>
                      {biz.discount_label}
                    </span>
                  ) : "—"}
                </td>
                <td>
                  <span className={`${styles.badge} ${biz.featured ? styles.badgeGreen : styles.badgeGray}`}>
                    {biz.featured ? "Sim" : "Não"}
                  </span>
                </td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <Link
                    href={`/admin/businesses/${biz.id}/edit`}
                    className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                  >
                    <Pencil size={13} /> Editar
                  </Link>
                  <DeleteBusinessBtn id={biz.id} name={biz.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
