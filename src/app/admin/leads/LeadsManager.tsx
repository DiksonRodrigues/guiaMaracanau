"use client";

import { useState } from "react";
import { MessageCircle, Phone, Mail, MapPin, Building2, User, StickyNote, Check } from "lucide-react";
import styles from "./leads.module.css";

type Lead = {
  id: string;
  company: string;
  responsible: string;
  whatsapp: string;
  email: string;
  address: string;
  status: "novo" | "em_contato" | "fechado" | "descartado";
  notes: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  novo: "Novo",
  em_contato: "Em Contato",
  fechado: "Fechado",
  descartado: "Descartado",
};

const STATUS_COLORS: Record<string, string> = {
  novo: "#ef4444",
  em_contato: "#f97316",
  fechado: "#16a34a",
  descartado: "#94a3b8",
};

const FILTERS = ["all", "novo", "em_contato", "fechado", "descartado"] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildWhatsApp(whatsapp: string, company: string) {
  const phone = whatsapp.replace(/\D/g, "");
  const msg = encodeURIComponent(
    `Olá ${company}! Vi o seu interesse em anunciar no GuiaMaracanaú. Vamos conversar?`
  );
  return `https://wa.me/55${phone}?text=${msg}`;
}

export default function LeadsManager({ leads: initial }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initial);
  const [filter, setFilter] = useState<string>("all");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  const visible = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: status as Lead["status"] } : l)));
    }
  }

  async function saveNotes(id: string) {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notesDraft }),
    });
    if (res.ok) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes: notesDraft } : l)));
    }
    setEditingNotes(null);
  }

  return (
    <div>
      {/* Filtros */}
      <div className={styles.filters}>
        {FILTERS.map((f) => {
          const count = f === "all" ? leads.length : leads.filter((l) => l.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
            >
              {f === "all" ? "Todos" : STATUS_LABELS[f]}
              <span className={styles.filterCount}>{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className={styles.empty}>Nenhum lead encontrado.</div>
      )}

      <div className={styles.list}>
        {visible.map((lead) => (
          <div key={lead.id} className={`${styles.card} ${lead.status === "novo" ? styles.cardNew : ""}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Building2 size={16} />
                <strong>{lead.company}</strong>
                <span
                  className={styles.statusBadge}
                  style={{ background: STATUS_COLORS[lead.status] + "22", color: STATUS_COLORS[lead.status] }}
                >
                  {STATUS_LABELS[lead.status]}
                </span>
              </div>
              <span className={styles.date}>{formatDate(lead.created_at)}</span>
            </div>

            <div className={styles.meta}>
              <span><User size={13} /> {lead.responsible}</span>
              <span><Phone size={13} /> {lead.whatsapp}</span>
              {lead.email && <span><Mail size={13} /> {lead.email}</span>}
              {lead.address && <span><MapPin size={13} /> {lead.address}</span>}
            </div>

            {/* Notas */}
            <div className={styles.notesSection}>
              {editingNotes === lead.id ? (
                <div className={styles.notesEdit}>
                  <textarea
                    className={styles.notesInput}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    placeholder="Adicione observações..."
                    rows={3}
                    autoFocus
                  />
                  <div className={styles.notesActions}>
                    <button className={styles.btnSave} onClick={() => saveNotes(lead.id)}>
                      <Check size={14} /> Salvar
                    </button>
                    <button className={styles.btnCancel} onClick={() => setEditingNotes(null)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className={styles.notesBtn}
                  onClick={() => { setEditingNotes(lead.id); setNotesDraft(lead.notes ?? ""); }}
                >
                  <StickyNote size={13} />
                  {lead.notes ? lead.notes : "Adicionar observação"}
                </button>
              )}
            </div>

            {/* Ações */}
            <div className={styles.actions}>
              <a
                href={buildWhatsApp(lead.whatsapp, lead.company)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnWhatsApp}
              >
                <MessageCircle size={15} /> WhatsApp
              </a>

              <select
                value={lead.status}
                onChange={(e) => updateStatus(lead.id, e.target.value)}
                className={styles.statusSelect}
              >
                {Object.entries(STATUS_LABELS).map(([v, label]) => (
                  <option key={v} value={v}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
