import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import AdminShell from "@/components/AdminShell/AdminShell";
import BusinessForm from "../BusinessForm";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function NewBusinessPage() {
  const [{ data: categories }, { data: neighborhoods }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("neighborhoods").select("id, name").eq("is_active", true).order("position"),
  ]);

  return (
    <AdminShell>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Novo Negócio</h1>
      </div>
      <BusinessForm categories={categories ?? []} neighborhoods={neighborhoods ?? []} />
    </AdminShell>
  );
}
