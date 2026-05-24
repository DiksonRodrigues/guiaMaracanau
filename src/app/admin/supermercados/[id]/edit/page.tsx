import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import AdminShell from "@/components/AdminShell/AdminShell";
import styles from "../../../admin.module.css";
import SupermarketForm from "../../SupermarketForm";

export const dynamic = "force-dynamic";

export default async function EditSupermarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabase.from("supermarkets").select("*").eq("id", id).single();
  if (!data) notFound();

  return (
    <AdminShell>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Editar: {data.name}</h1>
      </div>
      <SupermarketForm initial={data} />
    </AdminShell>
  );
}
