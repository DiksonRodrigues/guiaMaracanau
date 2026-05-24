import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import AdminShell from "@/components/AdminShell/AdminShell";
import CouponForm from "../../CouponForm";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: coupon }, { data: businesses }] = await Promise.all([
    supabase.from("coupons").select("*").eq("id", id).single(),
    supabase.from("businesses").select("id, name").order("name"),
  ]);

  if (!coupon) notFound();

  return (
    <AdminShell>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Editar Cupom</h1>
      </div>
      <CouponForm businesses={businesses ?? []} initial={coupon} />
    </AdminShell>
  );
}
