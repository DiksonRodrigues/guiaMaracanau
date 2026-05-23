import { createClient } from "@supabase/supabase-js";
import AdminShell from "@/components/AdminShell/AdminShell";
import LeadsManager from "./LeadsManager";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const novos = (leads ?? []).filter((l) => l.status === "novo").length;

  return (
    <AdminShell>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>
          Leads de Anunciantes
          {novos > 0 && (
            <span style={{
              marginLeft: "0.75rem",
              background: "#ef4444",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.15rem 0.55rem",
              borderRadius: "100px",
              verticalAlign: "middle",
            }}>
              {novos} novo{novos > 1 ? "s" : ""}
            </span>
          )}
        </h1>
      </div>

      <LeadsManager leads={leads ?? []} />
    </AdminShell>
  );
}
