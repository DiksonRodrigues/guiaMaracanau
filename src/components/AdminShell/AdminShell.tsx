"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Store, Tag, LogOut, ShoppingCart, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "../../app/admin/admin.module.css";

const navItems = [
  { href: "/admin/businesses", label: "Negócios", icon: Store },
  { href: "/admin/bairros", label: "Bairros", icon: MapPin },
  { href: "/admin/cupons", label: "Cupons", icon: Tag },
  { href: "/admin/supermercados", label: "Supermercados", icon: ShoppingCart },
  { href: "/admin/leads", label: "Leads", icon: Users },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [newLeads, setNewLeads] = useState(0);

  useEffect(() => {
    fetch("/api/admin/leads?status=novo")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setNewLeads(Array.isArray(data) ? data.length : 0))
      .catch(() => {});
  }, [pathname]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/admin/businesses" className={styles.sidebarLogo}>
          Guia<span>Admin</span>
        </Link>
        <nav className={styles.sidebarNav}>
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.sidebarLink} ${pathname.startsWith(href) ? styles.sidebarLinkActive : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {href === "/admin/leads" && newLeads > 0 && (
                <span style={{
                  marginLeft: "auto",
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  padding: "0.1rem 0.4rem",
                  borderRadius: "100px",
                  lineHeight: 1.4,
                }}>
                  {newLeads}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <button className={styles.logoutBtn} onClick={logout}>
            <LogOut size={14} style={{ display: "inline", marginRight: 6 }} />
            Sair
          </button>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
