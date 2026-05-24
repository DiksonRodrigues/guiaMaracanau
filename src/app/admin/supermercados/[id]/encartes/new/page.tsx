import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import AdminShell from "@/components/AdminShell/AdminShell";
import Link from "next/link";
import styles from "../../../../admin.module.css";
import FlyerForm from "../FlyerForm";

export const dynamic = "force-dynamic";

export default async function NewFlyerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: supermarket } = await supabase.from("supermarkets").select("id, name").eq("id", id).single();
  if (!supermarket) notFound();

  return (
    <AdminShell>
      <div className={styles.topbar}>
        <div>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.25rem" }}>
            <Link href="/admin/supermercados" style={{ color: "#5b21b6" }}>Supermercados</Link>{" "}
            / <Link href={`/admin/supermercados/${id}/encartes`} style={{ color: "#5b21b6" }}>{supermarket.name}</Link>{" "}
            / Novo encarte
          </p>
          <h1 className={styles.pageTitle}>Novo Encarte</h1>
        </div>
      </div>
      <FlyerForm supermarketId={id} />
    </AdminShell>
  );
}
