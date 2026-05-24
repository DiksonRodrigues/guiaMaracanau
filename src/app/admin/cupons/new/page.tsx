import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import AdminShell from "@/components/AdminShell/AdminShell";
import CouponForm from "../CouponForm";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function NewCouponPage() {
  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name")
    .order("name");

  return (
    <AdminShell>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Novo Cupom</h1>
      </div>
      <CouponForm businesses={businesses ?? []} />
    </AdminShell>
  );
}
