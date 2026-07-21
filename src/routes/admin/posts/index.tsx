import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  listAdminPostsFn,
  duplicatePostFn,
  trashPostFn,
  restorePostFn,
  deletePostFn,
} from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/posts/")({
  component: AdminPostsList,
});

type Row = Awaited<ReturnType<typeof listAdminPostsFn>>[number];

const TYPE_TABS: Array<{ key: string; label: string; match: (r: Row) => boolean }> = [
  { key: "all", label: "הכל", match: () => true },
  { key: "post", label: "מאמרים", match: (r) => !r.cpt_type },
  { key: "success", label: "הצלחות", match: (r) => r.cpt_type === "success" },
  { key: "movie", label: "סרטונים", match: (r) => r.cpt_type === "movie" },
  { key: "shorts", label: "שורטס", match: (r) => r.cpt_type === "shorts" },
];

const STATUS_TABS = [
  { key: "all", label: "הכל" },
  { key: "publish", label: "פורסם" },
  { key: "scheduled", label: "מתוזמן" },
  { key: "draft", label: "טיוטה" },
  { key: "trash", label: "אשפה" },
];

function fmtDate(s: string | null) {
  if (!s) return "—";
  try { return new Date(s).toLocaleDateString("he-IL"); } catch { return "—"; }
}

function liveHref(r: Row) {
  const prefix = r.cpt_type ? `/${r.cpt_type}` : "";
  return `${prefix}/${r.slug}/`;
}

function statusBadge(r: Row) {
  const now = Date.now();
  if (r.status === "publish" && r.published_at && new Date(r.published_at).getTime() > now) {
    return { key: "scheduled", label: "מתוזמן", cls: "bg-amber-100 text-amber-900" };
  }
  if (r.status === "publish") return { key: "publish", label: "פורסם", cls: "bg-emerald-100 text-emerald-900" };
  if (r.status === "draft") return { key: "draft", label: "טיוטה", cls: "bg-slate-200 text-slate-800" };
  if (r.status === "trash") return { key: "trash", label: "אשפה", cls: "bg-red-100 text-red-900" };
  return { key: r.status, label: r.status, cls: "bg-slate-100 text-slate-700" };
}

function AdminPostsList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [typeTab, setTypeTab] = useState("all");
  const [statusTab, setStatusTab] = useState("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await listAdminPostsFn();
      setRows(data);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    const typeMatch = TYPE_TABS.find((t) => t.key === typeTab)!.match;
    return rows.filter((r) => {
      if (!typeMatch(r)) return false;
      const b = statusBadge(r);
      if (statusTab !== "all" && b.key !== statusTab) return false;
      if (qLower && !(r.title.toLowerCase().includes(qLower) || r.slug.toLowerCase().includes(qLower))) return false;
      return true;
    });
  }, [rows, typeTab, statusTab, q]);

  async function onDuplicate(id: string) {
    setBusy(id);
    try {
      const { id: newId } = await duplicatePostFn({ data: { id } });
      navigate({ to: "/admin/posts/$id", params: { id: newId } });
    } catch (e: any) {
      alert(`שגיאה בשכפול: ${e?.message ?? e}`);
    } finally {
      setBusy(null);
    }
  }
  async function onTrash(id: string) {
    if (!confirm("להעביר לאשפה?")) return;
    setBusy(id);
    try { await trashPostFn({ data: { id } }); await load(); } catch (e: any) { alert(e?.message ?? e); } finally { setBusy(null); }
  }
  async function onRestore(id: string) {
    setBusy(id);
    try { await restorePostFn({ data: { id } }); await load(); } catch (e: any) { alert(e?.message ?? e); } finally { setBusy(null); }
  }
  async function onDelete(id: string) {
    if (!confirm("למחוק לצמיתות? לא ניתן לשחזר.")) return;
    if (!confirm("אישור סופי — מחיקה בלתי הפיכה.")) return;
    setBusy(id);
    try { await deletePostFn({ data: { id } }); await load(); } catch (e: any) { alert(e?.message ?? e); } finally { setBusy(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">פוסטים</h1>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        {TYPE_TABS.map((t) => (
          <button key={t.key} onClick={() => setTypeTab(t.key)}
            className={`rounded-md px-3 py-1.5 text-sm ${typeTab === t.key ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-accent"}`}>
            {t.label}
          </button>
        ))}
        <span className="mx-2 h-6 w-px bg-border" />
        {STATUS_TABS.map((t) => (
          <button key={t.key} onClick={() => setStatusTab(t.key)}
            className={`rounded-md px-3 py-1.5 text-sm ${statusTab === t.key ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-accent"}`}>
            {t.label}
          </button>
        ))}
        <div className="mr-auto">
          <input
            type="search"
            placeholder="חיפוש (כותרת / slug)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      {err && <p className="mt-3 text-sm text-red-600">שגיאה: {err}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-right text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">כותרת</th>
              <th className="p-3 font-medium">סוג</th>
              <th className="p-3 font-medium">סטטוס</th>
              <th className="p-3 font-medium">קטגוריה</th>
              <th className="p-3 font-medium">תאריך</th>
              <th className="p-3 font-medium">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">טוען…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">אין פוסטים</td></tr>}
            {filtered.map((r) => {
              const b = statusBadge(r);
              const inTrash = b.key === "trash";
              return (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 font-medium text-foreground">
                    <div>{r.title}</div>
                    <div className="text-xs text-muted-foreground">{r.slug}</div>
                  </td>
                  <td className="p-3 text-muted-foreground">{r.cpt_type ?? "מאמר"}</td>
                  <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${b.cls}`}>{b.label}</span></td>
                  <td className="p-3 text-muted-foreground">{r.primary_category ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{fmtDate(r.published_at ?? r.updated_at)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to="/admin/posts/$id" params={{ id: r.id }} className="text-primary hover:underline">עריכה</Link>
                      <a href={liveHref(r)} target="_blank" rel="noreferrer" className="text-primary hover:underline">צפייה</a>
                      <button disabled={busy === r.id} onClick={() => onDuplicate(r.id)} className="text-primary hover:underline disabled:opacity-40">שכפול</button>
                      {inTrash ? (
                        <>
                          <button disabled={busy === r.id} onClick={() => onRestore(r.id)} className="text-primary hover:underline disabled:opacity-40">שחזר</button>
                          <button disabled={busy === r.id} onClick={() => onDelete(r.id)} className="text-red-600 hover:underline disabled:opacity-40">מחק לצמיתות</button>
                        </>
                      ) : (
                        <button disabled={busy === r.id} onClick={() => onTrash(r.id)} className="text-red-600 hover:underline disabled:opacity-40">אשפה</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
