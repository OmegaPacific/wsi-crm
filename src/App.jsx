import { useState, useMemo, useEffect } from "react";

const initialContacts = [
  { id: 1, name: "Sophia Reyes", company: "Vertex Capital", email: "sophia@vertexcap.com", phone: "+1 415-820-4421", status: "Customer", value: 48000, lastContact: "2026-02-20", tags: ["Enterprise", "High Value"] },
  { id: 2, name: "Marcus Chen", company: "Nimbus Solutions", email: "m.chen@nimbus.io", phone: "+1 628-441-9900", status: "Lead", value: 12000, lastContact: "2026-02-22", tags: ["SMB", "Tech"] },
  { id: 3, name: "Aaliya Patel", company: "Driftwood Studios", email: "aaliya@driftwood.co", phone: "+1 332-667-1182", status: "Prospect", value: 8500, lastContact: "2026-01-30", tags: ["Creative"] },
  { id: 4, name: "Tom Bergstrom", company: "Icelandic Logistics", email: "tom.b@icelogi.is", phone: "+354 555-1244", status: "Churned", value: 22000, lastContact: "2025-11-14", tags: ["Enterprise"] },
  { id: 5, name: "Priya Nair", company: "Solarfield Energy", email: "p.nair@solarfield.in", phone: "+91 98200-55312", status: "Customer", value: 67000, lastContact: "2026-02-25", tags: ["Enterprise", "Renewable"] },
  { id: 6, name: "Jake Okafor", company: "Finblue", email: "jake@finblue.ng", phone: "+234 812-4400-992", status: "Lead", value: 5200, lastContact: "2026-02-18", tags: ["Fintech"] },
];
const initialDeals = [
  { id: 1, title: "Vertex Capital Enterprise Plan", contactId: 1, stage: "Closed Won", value: 48000, closeDate: "2026-03-01", probability: 100 },
  { id: 2, title: "Nimbus Annual Subscription", contactId: 2, stage: "Proposal", value: 12000, closeDate: "2026-03-15", probability: 60 },
  { id: 3, title: "Driftwood Starter Package", contactId: 3, stage: "Qualified", value: 8500, closeDate: "2026-04-01", probability: 40 },
  { id: 4, title: "Solarfield Platform License", contactId: 5, stage: "Negotiation", value: 67000, closeDate: "2026-03-10", probability: 85 },
  { id: 5, title: "Finblue Pilot", contactId: 6, stage: "Discovery", value: 5200, closeDate: "2026-04-20", probability: 25 },
];
const initialActivities = [
  { id: 1, type: "Call", contactId: 1, note: "Discussed Q1 renewal terms, very positive.", date: "2026-02-20", done: true },
  { id: 2, type: "Email", contactId: 2, note: "Sent proposal deck and pricing sheet.", date: "2026-02-22", done: true },
  { id: 3, type: "Meeting", contactId: 5, note: "Demo of new features, strong interest in API.", date: "2026-02-25", done: false },
  { id: 4, type: "Task", contactId: 3, note: "Follow up on trial feedback.", date: "2026-03-02", done: false },
  { id: 5, type: "Call", contactId: 6, note: "Initial discovery call scheduled.", date: "2026-03-05", done: false },
];

const STAGES = ["Discovery", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

const STATUS_COLORS = {
  Customer:  { bg: "#ecfdf5", text: "#059669", dot: "#10b981" },
  Lead:      { bg: "#eff6ff", text: "#2563eb", dot: "#3b82f6" },
  Prospect:  { bg: "#fefce8", text: "#ca8a04", dot: "#eab308" },
  Churned:   { bg: "#fef2f2", text: "#dc2626", dot: "#ef4444" },
};

const STAGE_META = {
  Discovery:    { bg: "#f0f4ff", text: "#4f46e5", bar: "#818cf8" },
  Qualified:    { bg: "#eff6ff", text: "#2563eb", bar: "#60a5fa" },
  Proposal:     { bg: "#fefce8", text: "#b45309", bar: "#fbbf24" },
  Negotiation:  { bg: "#fff7ed", text: "#c2410c", bar: "#fb923c" },
  "Closed Won": { bg: "#ecfdf5", text: "#059669", bar: "#34d399" },
  "Closed Lost":{ bg: "#fef2f2", text: "#dc2626", bar: "#f87171" },
};

const ACTIVITY_ICONS = { Call: "📞", Email: "✉️", Meeting: "🤝", Task: "✓" };

const C = {
  bg:           "#f5f7fa",
  surface:      "#ffffff",
  surfaceHover: "#f8faff",
  border:       "#e8edf5",
  borderFocus:  "#6366f1",
  text:         "#0f172a",
  textSub:      "#475569",
  muted:        "#94a3b8",
  accent:       "#6366f1",
  accentDark:   "#4f46e5",
  accentLight:  "#eef2ff",
  accentText:   "#4338ca",
  success:      "#10b981",
  warning:      "#f59e0b",
  danger:       "#ef4444",
  sidebarBg:    "#0f172a",
  sidebarBorder:"#1e293b",
  sidebarMuted: "#475569",
  sidebarActive:"#6366f1",
};

const FONT = "'Inter', 'Segoe UI', sans-serif";

// localStorage-based storage (works in any browser)
function loadStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ── Primitives ────────────────────────────────────────────────────────────────

function Badge({ label, status }) {
  const s = STATUS_COLORS[status] || { bg: C.accentLight, text: C.accentText, dot: C.accent };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.text, padding: "3px 10px 3px 8px", borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: 0.2 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function TagChip({ label }) {
  return <span style={{ background: C.accentLight, color: C.accentText, padding: "2px 9px", borderRadius: 6, fontSize: 11, fontWeight: 500 }}>{label}</span>;
}

function FieldLabel({ children }) {
  return <div style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{children}</div>;
}

const inputStyle = {
  width: "100%", background: "#fff", border: `1.5px solid ${C.border}`,
  borderRadius: 10, padding: "10px 13px", color: C.text, fontSize: 14,
  fontFamily: FONT, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
};

function SaveDot({ saving }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: saving ? C.warning : C.success, fontWeight: 500 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: saving ? C.warning : C.success, display: "inline-block", boxShadow: saving ? `0 0 0 2px #fef3c7` : `0 0 0 2px #d1fae5` }} />
      {saving ? "Saving…" : "All saved"}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(2px)" }}>
      <div style={{ background: C.surface, borderRadius: 20, padding: "32px 36px", width: 460, boxShadow: "0 24px 64px rgba(15,23,42,0.18)", maxHeight: "92vh", overflowY: "auto", border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>{title}</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: C.bg, border: "none", color: C.muted, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Btn({ onClick, variant = "ghost", children }) {
  const styles = {
    primary: { background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`, color: "#fff", border: "none", boxShadow: `0 2px 8px rgba(99,102,241,0.35)` },
    ghost:   { background: "transparent", color: C.textSub, border: `1.5px solid ${C.border}` },
    danger:  { background: "#fff", color: C.danger, border: `1.5px solid #fecaca` },
  };
  return (
    <button onClick={onClick} style={{ flex: 1, ...styles[variant], borderRadius: 10, padding: "11px 16px", fontWeight: 600, cursor: "pointer", fontFamily: FONT, fontSize: 14, transition: "opacity 0.15s" }}>
      {children}
    </button>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ active, setActive, onLogout }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
    )},
    { key: "contacts", label: "Contacts", icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>
    )},
    { key: "deals", label: "Pipeline", icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    )},
    { key: "activities", label: "Activities", icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    )},
  ];

  return (
    <nav style={{ width: 232, minHeight: "100vh", background: C.sidebarBg, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "28px 24px 24px", borderBottom: `1px solid ${C.sidebarBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, #8b5cf6)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#f1f5f9", letterSpacing: -0.5, fontFamily: FONT }}>WSI</div>
            <div style={{ fontSize: 10, color: C.sidebarMuted, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 1, fontWeight: 500 }}>CRM Suite</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "16px 12px", flex: 1 }}>
        {items.map(item => {
          const isActive = active === item.key;
          return (
            <button key={item.key} onClick={() => setActive(item.key)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "10px 12px", marginBottom: 2,
              background: isActive ? `linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))` : "transparent",
              border: "none", borderRadius: 10,
              color: isActive ? "#c7d2fe" : C.sidebarMuted,
              cursor: "pointer", fontSize: 14, fontWeight: isActive ? 600 : 400,
              fontFamily: FONT, textAlign: "left", transition: "all 0.15s",
              boxShadow: isActive ? `inset 0 0 0 1px rgba(99,102,241,0.3)` : "none",
            }}>
              <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
              {item.label}
              {isActive && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: C.accent }} />}
            </button>
          );
        })}
      </div>
      <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.sidebarBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, #6366f1, #8b5cf6)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 13 }}>U</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>Your Team</div>
            <div style={{ color: C.sidebarMuted, fontSize: 11 }}>Administrator</div>
          </div>
          <button onClick={onLogout} title="Sign out" style={{ background: "transparent", border: "none", color: C.sidebarMuted, cursor: "pointer", fontSize: 16, padding: 4, display: "flex", alignItems: "center" }}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard({ contacts, deals, activities }) {
  const openDeals = deals.filter(d => !d.stage.startsWith("Closed"));
  const totalPipeline = openDeals.reduce((s, d) => s + d.value, 0);
  const wonValue = deals.filter(d => d.stage === "Closed Won").reduce((s, d) => s + d.value, 0);
  const customers = contacts.filter(c => c.status === "Customer").length;
  const pending = activities.filter(a => !a.done).length;

  const stats = [
    { label: "Open Pipeline", value: `$${(totalPipeline/1000).toFixed(0)}k`, sub: `${openDeals.length} active deals`, color: C.accent, icon: "◈" },
    { label: "Closed Won", value: `$${(wonValue/1000).toFixed(0)}k`, sub: "this quarter", color: C.success, icon: "✓" },
    { label: "Customers", value: customers, sub: `of ${contacts.length} contacts`, color: "#8b5cf6", icon: "⬡" },
    { label: "Open Tasks", value: pending, sub: "need attention", color: pending > 3 ? C.danger : C.warning, icon: "◎" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.5 }}>Welcome back 👋</h1>
        <p style={{ color: C.muted, margin: "6px 0 0", fontSize: 14 }}>WSI CRM Dashboard</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: C.surface, borderRadius: 16, padding: "22px 24px", border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(15,23,42,0.05)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 10, background: s.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: s.color }}>{s.icon}</div>
            <div style={{ color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: 30, fontWeight: 800, margin: "10px 0 4px", letterSpacing: -1 }}>{s.value}</div>
            <div style={{ color: C.muted, fontSize: 12 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        <div style={{ background: C.surface, borderRadius: 16, padding: 28, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 24 }}>Pipeline Overview</div>
          {STAGES.slice(0, 5).map(stage => {
            const val = deals.filter(d => d.stage === stage).reduce((s, d) => s + d.value, 0);
            const m = STAGE_META[stage];
            const pct = Math.min(100, (val / 70000) * 100);
            return (
              <div key={stage} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: m.bar, display: "inline-block" }} />
                    <span style={{ color: C.textSub, fontSize: 13, fontWeight: 500 }}>{stage}</span>
                  </div>
                  <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>${val.toLocaleString()}</span>
                </div>
                <div style={{ height: 8, background: C.bg, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: m.bar, borderRadius: 99, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ background: C.surface, borderRadius: 16, padding: 28, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 20 }}>Upcoming Activities</div>
          {activities.filter(a => !a.done).length === 0 && (
            <div style={{ color: C.muted, fontSize: 13, textAlign: "center", paddingTop: 20 }}>All clear! No pending tasks.</div>
          )}
          {activities.filter(a => !a.done).map(a => {
            const contact = contacts.find(c => c.id === a.contactId);
            return (
              <div key={a.id} style={{ display: "flex", gap: 12, paddingBottom: 14, marginBottom: 14, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{ACTIVITY_ICONS[a.type]}</div>
                <div>
                  <div style={{ color: C.text, fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{a.note}</div>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>{contact?.name} · {a.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Contact Form ──────────────────────────────────────────────────────────────

function ContactForm({ initial, onSave, onClose, title }) {
  const [form, setForm] = useState(initial);
  const F = (key) => ({ value: form[key] ?? "", onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) });
  return (
    <Modal title={title} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[["Name","name"],["Company","company"],["Email","email"],["Phone","phone"],["Value ($)","value"]].map(([label,key]) => (
          <div key={key} style={{ gridColumn: key === "email" || key === "name" ? "1 / -1" : undefined }}>
            <FieldLabel>{label}</FieldLabel>
            <input {...F(key)} style={inputStyle} />
          </div>
        ))}
        <div>
          <FieldLabel>Status</FieldLabel>
          <select {...F("status")} style={inputStyle}>
            {["Lead","Prospect","Customer","Churned"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>Tags</FieldLabel>
          <input {...F("tags")} placeholder="e.g. Enterprise" style={inputStyle} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <Btn variant="primary" onClick={() => { if (form.name?.trim()) onSave(form); }}>{title.startsWith("Edit") ? "Save Changes" : "Add Contact"}</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  );
}

// ── Contacts ──────────────────────────────────────────────────────────────────

function Contacts({ contacts, setContacts, saving }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editContact, setEditContact] = useState(null);

  const blank = { name: "", company: "", email: "", phone: "", status: "Lead", value: "", tags: "" };

  const filtered = useMemo(() => contacts.filter(c =>
    (filter === "All" || c.status === filter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase()))
  ), [contacts, search, filter]);

  const handleAdd = (form) => {
    const tags = typeof form.tags === "string" ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : form.tags;
    setContacts(prev => [{ ...form, id: Date.now(), value: Number(form.value)||0, tags, lastContact: new Date().toISOString().split("T")[0] }, ...prev]);
    setShowAdd(false);
  };
  const handleEdit = (form) => {
    const tags = typeof form.tags === "string" ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : form.tags;
    const updated = { ...form, value: Number(form.value)||0, tags };
    setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (selected?.id === updated.id) setSelected(updated);
    setEditContact(null);
  };
  const openEdit = (c, e) => { e?.stopPropagation(); setEditContact({ ...c, tags: Array.isArray(c.tags) ? c.tags.join(", ") : c.tags, value: String(c.value) }); };
  const removeContact = (id, e) => { e.stopPropagation(); setContacts(p => p.filter(x => x.id !== id)); if (selected?.id === id) setSelected(null); };
  const avatarColor = (name) => { const colors = ["#6366f1","#8b5cf6","#ec4899","#06b6d4","#10b981","#f59e0b"]; return colors[name.charCodeAt(0) % colors.length]; };

  return (
    <div style={{ display: "flex", gap: 20, height: "calc(100vh - 80px)" }}>
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…" style={{ ...inputStyle, paddingLeft: 36 }} />
          </div>
          <div style={{ display: "flex", gap: 4, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4 }}>
            {["All","Lead","Prospect","Customer","Churned"].map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{ padding: "6px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: FONT, background: filter === s ? C.accent : "transparent", color: filter === s ? "#fff" : C.muted, transition: "all 0.15s" }}>{s}</button>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)} style={{ padding: "10px 18px", background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`, color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontFamily: FONT, fontSize: 13, boxShadow: `0 2px 8px rgba(99,102,241,0.3)`, whiteSpace: "nowrap" }}>+ New Contact</button>
          <SaveDot saving={saving} />
        </div>
        <div style={{ flex: 1, overflowY: "auto", background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {["Contact","Status","Value","Last Contact",""].map(h => (
                  <th key={h} style={{ padding: "13px 18px", textAlign: "left", color: C.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  style={{ cursor: "pointer", borderBottom: `1px solid ${C.border}`, background: selected?.id === c.id ? C.accentLight : "transparent", transition: "background 0.1s" }}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: avatarColor(c.name), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{c.name.charAt(0)}</div>
                      <div>
                        <div style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ color: C.muted, fontSize: 12, marginTop: 1 }}>{c.company}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px" }}><Badge label={c.status} status={c.status} /></td>
                  <td style={{ padding: "14px 18px", color: C.text, fontSize: 14, fontWeight: 600 }}>${c.value.toLocaleString()}</td>
                  <td style={{ padding: "14px 18px", color: C.muted, fontSize: 13 }}>{c.lastContact}</td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button onClick={e => openEdit(c, e)} style={{ width: 30, height: 30, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>✎</button>
                      <button onClick={e => removeContact(c.id, e)} style={{ width: 30, height: 30, borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: C.danger, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>×</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 48, color: C.muted, fontSize: 14 }}>No contacts found.</div>
          )}
        </div>
      </div>
      {selected && (
        <div style={{ width: 280, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, overflowY: "auto", flexShrink: 0, boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${C.accent}, #8b5cf6)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 20 }}>{selected.name.charAt(0)}</div>
            <button onClick={() => setSelected(null)} style={{ width: 30, height: 30, borderRadius: 8, background: C.bg, border: "none", color: C.muted, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 2 }}>{selected.name}</div>
          <div style={{ color: C.muted, fontSize: 13, marginBottom: 14 }}>{selected.company}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <Badge label={selected.status} status={selected.status} />
            <button onClick={e => openEdit(selected, e)} style={{ padding: "5px 14px", background: C.accentLight, border: `1px solid #c7d2fe`, color: C.accentText, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Edit</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[["Email", selected.email], ["Phone", selected.phone], ["Value", `$${selected.value.toLocaleString()}`], ["Last Contact", selected.lastContact]].map(([k,v]) => (
              <div key={k}><FieldLabel>{k}</FieldLabel><div style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{v}</div></div>
            ))}
            {selected.tags?.length > 0 && (
              <div><FieldLabel>Tags</FieldLabel><div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>{selected.tags.map(t => <TagChip key={t} label={t} />)}</div></div>
            )}
          </div>
        </div>
      )}
      {showAdd && <ContactForm title="New Contact" initial={blank} onSave={handleAdd} onClose={() => setShowAdd(false)} />}
      {editContact && <ContactForm title="Edit Contact" initial={editContact} onSave={handleEdit} onClose={() => setEditContact(null)} />}
    </div>
  );
}

// ── Pipeline ──────────────────────────────────────────────────────────────────

function Pipeline({ deals, setDeals, contacts, saving }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", contactId: "", stage: "Discovery", value: "", closeDate: "", probability: 25 });

  const handleAdd = () => {
    setDeals(prev => [{ ...form, id: Date.now(), value: Number(form.value)||0, contactId: Number(form.contactId), probability: Number(form.probability) }, ...prev]);
    setShowForm(false);
    setForm({ title: "", contactId: "", stage: "Discovery", value: "", closeDate: "", probability: 25 });
  };
  const moveStage = (deal, dir) => {
    const idx = STAGES.indexOf(deal.stage), next = STAGES[idx + dir];
    if (!next) return;
    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, stage: next } : d));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.3 }}>Sales Pipeline</h2>
          <p style={{ color: C.muted, margin: "4px 0 0", fontSize: 13 }}>${deals.filter(d => !d.stage.startsWith("Closed")).reduce((s,d) => s+d.value, 0).toLocaleString()} total open value</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <SaveDot saving={saving} />
          <button onClick={() => setShowForm(true)} style={{ padding: "10px 20px", background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`, color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontFamily: FONT, boxShadow: `0 2px 8px rgba(99,102,241,0.3)` }}>+ New Deal</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, overflowX: "auto", flex: 1, paddingBottom: 16, alignItems: "flex-start" }}>
        {STAGES.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage);
          const total = stageDeals.reduce((s, d) => s + d.value, 0);
          const m = STAGE_META[stage];
          return (
            <div key={stage} style={{ minWidth: 220, flex: "0 0 220px", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "10px 14px", background: m.bg, borderRadius: "12px 12px 0 0", border: `1px solid ${C.border}`, borderBottom: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: m.text, textTransform: "uppercase", letterSpacing: 0.8 }}>{stage}</span>
                <span style={{ fontSize: 11, color: m.text, background: m.text + "18", padding: "2px 7px", borderRadius: 6, fontWeight: 600 }}>{stageDeals.length}</span>
              </div>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "0 0 12px 12px", minHeight: 120, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
                {stageDeals.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", color: C.muted, fontSize: 12 }}>No deals</div>}
                {stageDeals.map(deal => {
                  const contact = contacts.find(c => c.id === deal.contactId);
                  const si = STAGES.indexOf(deal.stage);
                  const probColor = deal.probability >= 75 ? C.success : deal.probability >= 40 ? C.warning : C.danger;
                  return (
                    <div key={deal.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 14px 12px", boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
                        <div style={{ color: C.text, fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{deal.title}</div>
                        <button onClick={() => setDeals(p => p.filter(d => d.id !== deal.id))} style={{ width: 20, height: 20, borderRadius: 5, background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
                      </div>
                      {contact && <div style={{ color: C.muted, fontSize: 11, marginBottom: 10 }}>{contact.name} · {contact.company}</div>}
                      <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 8, letterSpacing: -0.5 }}>${deal.value.toLocaleString()}</div>
                      <div style={{ height: 4, background: C.border, borderRadius: 99, marginBottom: 10, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${deal.probability}%`, background: probColor, borderRadius: 99 }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: C.muted, fontSize: 10 }}>{deal.closeDate}</span>
                        <div style={{ display: "flex", gap: 4 }}>
                          {si > 0 && <button onClick={() => moveStage(deal,-1)} style={{ width: 24, height: 24, borderRadius: 6, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>}
                          {si < STAGES.length-1 && <button onClick={() => moveStage(deal,1)} style={{ width: 24, height: 24, borderRadius: 6, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {showForm && (
        <Modal title="New Deal" onClose={() => setShowForm(false)}>
          {[["Deal Title","title"],["Value ($)","value"],["Close Date","closeDate"]].map(([label,key]) => (
            <div key={key} style={{ marginBottom: 14 }}><FieldLabel>{label}</FieldLabel><input value={form[key]} onChange={e => setForm(f => ({...f,[key]:e.target.value}))} type={key==="closeDate"?"date":"text"} style={inputStyle} /></div>
          ))}
          <div style={{ marginBottom: 14 }}><FieldLabel>Contact</FieldLabel><select value={form.contactId} onChange={e => setForm(f => ({...f,contactId:e.target.value}))} style={inputStyle}><option value="">Select contact…</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div style={{ marginBottom: 14 }}><FieldLabel>Stage</FieldLabel><select value={form.stage} onChange={e => setForm(f => ({...f,stage:e.target.value}))} style={inputStyle}>{STAGES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><FieldLabel>Probability</FieldLabel><span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>{form.probability}%</span></div>
            <input type="range" min="0" max="100" value={form.probability} onChange={e => setForm(f => ({...f,probability:Number(e.target.value)}))} style={{ width: "100%", accentColor: C.accent }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}><Btn variant="primary" onClick={handleAdd}>Add Deal</Btn><Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ── Activity Form ─────────────────────────────────────────────────────────────

function ActivityForm({ initial, onSave, onClose, title, contacts }) {
  const [f, setF] = useState(initial);
  return (
    <Modal title={title} onClose={onClose}>
      <div style={{ marginBottom: 14 }}><FieldLabel>Type</FieldLabel><select value={f.type} onChange={e => setF(x => ({...x,type:e.target.value}))} style={inputStyle}>{["Call","Email","Meeting","Task"].map(t => <option key={t}>{t}</option>)}</select></div>
      <div style={{ marginBottom: 14 }}><FieldLabel>Contact</FieldLabel><select value={f.contactId} onChange={e => setF(x => ({...x,contactId:e.target.value}))} style={inputStyle}><option value="">Select contact…</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div style={{ marginBottom: 14 }}><FieldLabel>Note</FieldLabel><textarea value={f.note} onChange={e => setF(x => ({...x,note:e.target.value}))} rows={3} style={{...inputStyle, resize:"vertical"}} /></div>
      <div style={{ marginBottom: 24 }}><FieldLabel>Date</FieldLabel><input type="date" value={f.date} onChange={e => setF(x => ({...x,date:e.target.value}))} style={inputStyle} /></div>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="primary" onClick={() => onSave(f)}>{title.startsWith("Edit") ? "Save Changes" : "Log Activity"}</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  );
}

// ── Activities ────────────────────────────────────────────────────────────────

function Activities({ activities, setActivities, contacts, saving }) {
  const [showForm, setShowForm] = useState(false);
  const [editActivity, setEditActivity] = useState(null);

  const handleAdd = (f) => {
    setActivities(prev => [{ ...f, id: Date.now(), contactId: Number(f.contactId), done: false }, ...prev]);
    setShowForm(false);
  };
  const handleEdit = (f) => {
    setActivities(prev => prev.map(a => a.id === f.id ? { ...f, contactId: Number(f.contactId) } : a));
    setEditActivity(null);
  };
  const openEdit = (a, e) => { e.stopPropagation(); setEditActivity({ ...a, contactId: String(a.contactId) }); };
  const toggle = (id) => setActivities(prev => prev.map(a => a.id === id ? { ...a, done: !a.done } : a));
  const sorted = [...activities].sort((a, b) => a.done - b.done || new Date(a.date) - new Date(b.date));
  const typeColors = { Call: "#dbeafe", Email: "#ede9fe", Meeting: "#dcfce7", Task: "#fef9c3" };
  const typeText   = { Call: "#1d4ed8", Email: "#7c3aed", Meeting: "#059669", Task: "#b45309" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.3 }}>Activities</h2>
          <p style={{ color: C.muted, margin: "4px 0 0", fontSize: 13 }}>{activities.filter(a => !a.done).length} pending · {activities.filter(a => a.done).length} completed</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <SaveDot saving={saving} />
          <button onClick={() => setShowForm(true)} style={{ padding: "10px 20px", background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`, color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontFamily: FONT, boxShadow: `0 2px 8px rgba(99,102,241,0.3)` }}>+ Log Activity</button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map(a => {
          const contact = contacts.find(c => c.id === a.contactId);
          return (
            <div key={a.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, opacity: a.done ? 0.5 : 1, transition: "all 0.2s", boxShadow: a.done ? "none" : "0 1px 4px rgba(15,23,42,0.05)" }}>
              <div onClick={() => toggle(a.id)} style={{ width: 24, height: 24, borderRadius: 8, border: `2px solid ${a.done ? C.success : C.border}`, background: a.done ? C.success : "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}>
                {a.done && <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <span style={{ padding: "4px 10px", borderRadius: 8, background: typeColors[a.type] || C.accentLight, color: typeText[a.type] || C.accentText, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{a.type}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.text, fontSize: 14, fontWeight: 500, textDecoration: a.done ? "line-through" : "none" }}>{a.note}</div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{contact?.name} · {a.date}</div>
              </div>
              <button onClick={e => openEdit(a, e)} style={{ width: 28, height: 28, borderRadius: 7, background: C.bg, border: `1px solid ${C.border}`, color: C.textSub, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✎</button>
              <button onClick={() => setActivities(p => p.filter(x => x.id !== a.id))} style={{ width: 28, height: 28, borderRadius: 7, background: "#fef2f2", border: "1px solid #fecaca", color: C.danger, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
            </div>
          );
        })}
      </div>
      {showForm && <ActivityForm title="Log Activity" initial={{ type: "Call", contactId: "", note: "", date: "" }} onSave={handleAdd} onClose={() => setShowForm(false)} contacts={contacts} />}
      {editActivity && <ActivityForm title="Edit Activity" initial={editActivity} onSave={handleEdit} onClose={() => setEditActivity(null)} contacts={contacts} />}
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────

const PASSWORD = "wsi2026"; // ← change this to whatever you want

function Login({ onSuccess }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const submit = () => {
    if (value === PASSWORD) { onSuccess(); setError(false); }
    else { setError(true); setValue(""); }
  };
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: C.sidebarBg, fontFamily: FONT }}>
      <div style={{ background: C.surface, borderRadius: 20, padding: "48px 44px", width: 380, boxShadow: "0 24px 64px rgba(0,0,0,0.3)", border: `1px solid ${C.border}` }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${C.accent}, #8b5cf6)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>WSI CRM</div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>Team Access</div>
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <FieldLabel>Password</FieldLabel>
          <input
            type="password"
            value={value}
            onChange={e => { setValue(e.target.value); setError(false); }}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Enter password…"
            autoFocus
            style={{ ...inputStyle, border: `1.5px solid ${error ? C.danger : C.border}` }}
          />
        </div>
        {error && <div style={{ color: C.danger, fontSize: 12, marginBottom: 12, fontWeight: 500 }}>Incorrect password. Try again.</div>}
        {!error && <div style={{ marginBottom: 20 }} />}
        <button onClick={submit} style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontFamily: FONT, fontSize: 15, boxShadow: `0 2px 8px rgba(99,102,241,0.35)` }}>
          Sign In →
        </button>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function CRM() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("wsi-authed") === "true");
  const [active, setActive] = useState("dashboard");
  const [contacts, setContacts] = useState(() => loadStore("crm-contacts", initialContacts));
  const [deals, setDeals] = useState(() => loadStore("crm-deals", initialDeals));
  const [activities, setActivities] = useState(() => loadStore("crm-activities", initialActivities));
  const [saving, setSaving] = useState(false);

  const handleLogin = () => { sessionStorage.setItem("wsi-authed", "true"); setAuthed(true); };
  const handleLogout = () => { sessionStorage.removeItem("wsi-authed"); setAuthed(false); };

  useEffect(() => {
    setSaving(true);
    const t = setTimeout(() => {
      saveStore("crm-contacts", contacts);
      saveStore("crm-deals", deals);
      saveStore("crm-activities", activities);
      setSaving(false);
    }, 600);
    return () => clearTimeout(t);
  }, [contacts, deals, activities]);

  if (!authed) return <Login onSuccess={handleLogin} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: FONT }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <Sidebar active={active} setActive={setActive} onLogout={handleLogout} />
      <main style={{ flex: 1, padding: "36px 44px", overflowY: "auto", minWidth: 0 }}>
        {active === "dashboard"  && <Dashboard contacts={contacts} deals={deals} activities={activities} />}
        {active === "contacts"   && <Contacts contacts={contacts} setContacts={setContacts} saving={saving} />}
        {active === "deals"      && <Pipeline deals={deals} setDeals={setDeals} contacts={contacts} saving={saving} />}
        {active === "activities" && <Activities activities={activities} setActivities={setActivities} contacts={contacts} saving={saving} />}
      </main>
    </div>
  );
}
