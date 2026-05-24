import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import AdminShell from "@/components/AdminShell/AdminShell";
import NeighborhoodManager from "./NeighborhoodManager";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminBairrosPage() {
  const { data: neighborhoods } = await supabase
    .from("neighborhoods")
    .select("id, name, slug, is_active, position")
    .order("position");

  return (
    <AdminShell>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Bairros</h1>
      </div>
      <NeighborhoodManager initial={neighborhoods ?? []} />
    </AdminShell>
  );
}
