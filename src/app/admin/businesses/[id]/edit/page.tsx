import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import AdminShell from "@/components/AdminShell/AdminShell";
import BusinessForm from "../../BusinessForm";
import { notFound } from "next/navigation";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ data: business }, { data: categories }, { data: neighborhoods }] = await Promise.all([
    supabase.from("businesses").select("*, business_products(*)").eq("id", id).single(),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("neighborhoods").select("id, name").eq("is_active", true).order("position"),
  ]);

  if (!business) return notFound();

  return (
    <AdminShell>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Editar: {business.name}</h1>
      </div>
      <BusinessForm
        categories={categories ?? []}
        neighborhoods={neighborhoods ?? []}
        initial={business}
      />
    </AdminShell>
  );
}
