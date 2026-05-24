import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import Link from "next/link";
import { Plus, Pencil, FileText } from "lucide-react";
import AdminShell from "@/components/AdminShell/AdminShell";
import styles from "../admin.module.css";
import DeleteSupermarketBtn from "./DeleteSupermarketBtn";

export const dynamic = "force-dynamic";

export default async function AdminSupermercadosPage() {
  const { data: supermarkets } = await supabase
    .from("supermarkets")
    .select("*, flyers(id, valid_until, active)")
    .order("name");

  return (
    <AdminShell>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Supermercados</h1>
        <Link href="/admin/supermercados/new" className={`${styles.btn} ${styles.btnPrimary}`}>
          <Plus size={16} /> Novo supermercado
        </Link>
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: "hidden" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Logo</th>
              <th>Nome</th>
              <th>Endereço</th>
              <th>Encartes</th>
              <th>Ativo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {(!supermarkets || supermarkets.length === 0) && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
                  Nenhum supermercado cadastrado ainda.
                </td>
              </tr>
            )}
            {supermarkets?.map((s: any) => {
              const activeFlyer = s.flyers?.find((f: any) => f.active);
              return (
                <tr key={s.id}>
                  <td>
                    {s.logo_url
                      ? <img src={s.logo_url} alt={s.name} className={styles.thumb} />
                      : <div className={styles.thumb} style={{ background: "#e2e8f0" }} />}
                  </td>
                  <td style={{ fontWeight: 700 }}>{s.name}</td>
                  <td style={{ color: "#64748b", fontSize: "0.82rem" }}>{s.address ?? "—"}</td>
                  <td>
                    {activeFlyer
                      ? <span className={`${styles.badge} ${styles.badgeGreen}`}>
                          Ativo até {new Date(activeFlyer.valid_until).toLocaleDateString("pt-BR")}
                        </span>
                      : <span className={`${styles.badge} ${styles.badgeGray}`}>Sem encarte</span>}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${s.active ? styles.badgeGreen : styles.badgeGray}`}>
                      {s.active ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: "0.5rem" }}>
                    <Link
                      href={`/admin/supermercados/${s.id}/encartes`}
                      className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                    >
                      <FileText size={13} /> Encartes
                    </Link>
                    <Link
                      href={`/admin/supermercados/${s.id}/edit`}
                      className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                    >
                      <Pencil size={13} /> Editar
                    </Link>
                    <DeleteSupermarketBtn id={s.id} name={s.name} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
