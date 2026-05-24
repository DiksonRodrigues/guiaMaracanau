import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import AdminShell from "@/components/AdminShell/AdminShell";
import Link from "next/link";
import styles from "../../../../../admin.module.css";
import FlyerForm from "../../FlyerForm";

export const dynamic = "force-dynamic";

export default async function EditFlyerPage({ params }: { params: Promise<{ id: string; flyerId: string }> }) {
  const { id, flyerId } = await params;

  const [{ data: supermarket }, { data: flyer }] = await Promise.all([
    supabase.from("supermarkets").select("id, name").eq("id", id).single(),
    supabase.from("flyers").select("*, flyer_highlights(*)").eq("id", flyerId).single(),
  ]);

  if (!supermarket || !flyer) notFound();

  const initial = {
    ...flyer,
    valid_from: flyer.valid_from,
    valid_until: flyer.valid_until,
  };

  return (
    <AdminShell>
      <div className={styles.topbar}>
        <div>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.25rem" }}>
            <Link href="/admin/supermercados" style={{ color: "#5b21b6" }}>Supermercados</Link>{" "}
            / <Link href={`/admin/supermercados/${id}/encartes`} style={{ color: "#5b21b6" }}>{supermarket.name}</Link>{" "}
            / Editar encarte
          </p>
          <h1 className={styles.pageTitle}>Editar Encarte</h1>
        </div>
      </div>
      <FlyerForm supermarketId={id} initial={initial} />
    </AdminShell>
  );
}
