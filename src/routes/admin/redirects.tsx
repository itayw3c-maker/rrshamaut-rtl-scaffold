import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  addRedirectFn,
  checkSlugShadowFn,
  deleteRedirectFn,
  listRedirectsFn,
} from "@/lib/admin-ops.functions";

export const Route = createFileRoute("/admin/redirects")({
  ssr: false,
  component: RedirectsPage,
});

type Row = { id: string; from_path: string; to_path: string; status: number; created_at: string };

function RedirectsPage() {
  const { isAdmin } = Route.useRouteContext() as any;
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [shadow, setShadow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    try { setRows((await listRedirectsFn()) as Row[]); } finally { setLoading(false); }
  }
  useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);

  useEffect(() => {
    if (!from.trim()) { setShadow(false); return; }
    const t = setTimeout(async () => {
      try {
        const r = await checkSlugShadowFn({ data: { path: from } });
        setShadow(Boolean(r.shadows));
      } catch { setShadow(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [from]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((r) => r.from_path.toLowerCase().includes(qq) || r.to_path.toLowerCase().includes(qq));
  }, [rows, q]);

  async function add() {
    if (!from.trim() || !to.trim()) return;
    setSaving(true); setErr(null);
    try {
      await addRedirectFn({ data: { from_path: from, to_path: to } });
      setFrom(""); setTo("");
      await reload();
    } catch (e: any) { setErr(e?.message ?? "שגיאה"); }
    finally { setSaving(false); }
  }

  async function remove(id: string) {
    if (!confirm("למחוק את ההפניה?")) return;
    await deleteRedirectFn({ data: { id } });
    await reload();
  }

  if (!isAdmin) return <div className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">אין הרשאה</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">הפניות (Redirects)</h1>

      <div className="rounded-md border border-border bg-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">הוספת הפניה חדשה</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">מ (from)</span>
            <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="/old-path" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">אל (to)</span>
            <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="/new-path" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
        </div>
        {shadow && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            ⚠️ ה-from תואם ל-slug של פוסט/עמוד/קטגוריה קיים ופעיל — ההפניה עשויה להסתיר את הדף.
          </div>
        )}
        <div className="flex items-center gap-3">
          <button onClick={add} disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {saving ? "שומר..." : "הוסף (301)"}
          </button>
          {err && <span className="text-sm text-red-600">{err}</span>}
        </div>
      </div>

      <div className="space-y-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:max-w-sm" />

        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs">
              <tr>
                <th className="p-2 text-right">מ</th>
                <th className="p-2 text-right">אל</th>
                <th className="p-2 text-right">סטטוס</th>
                <th className="p-2 text-right">נוצר</th>
                <th className="p-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">טוען...</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">אין הפניות</td></tr>}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-2 break-all">{r.from_path}</td>
                  <td className="p-2 break-all">{r.to_path}</td>
                  <td className="p-2">{r.status}</td>
                  <td className="p-2 whitespace-nowrap text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("he-IL")}</td>
                  <td className="p-2 text-left">
                    <button onClick={() => remove(r.id)} className="rounded-md border border-input bg-background px-2 py-1 text-xs hover:bg-accent">מחק</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
