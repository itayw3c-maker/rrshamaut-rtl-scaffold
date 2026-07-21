import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { listAdminPagesFn } from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/pages/")({
  component: AdminPagesList,
});

type Row = Awaited<ReturnType<typeof listAdminPagesFn>>[number];

function fmtDate(s: string | null) {
  if (!s) return "—";
  try { return new Date(s).toLocaleDateString("he-IL"); } catch { return "—"; }
}

function AdminPagesList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    listAdminPagesFn().then((d) => setRows(d)).catch((e) => setErr(String(e?.message ?? e))).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (ql && !(r.title.toLowerCase().includes(ql) || r.slug.toLowerCase().includes(ql))) return false;
      return true;
    });
  }, [rows, q, status]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">עמודים</h1>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        {[
          { k: "all", l: "הכל" },
          { k: "publish", l: "פורסם" },
          { k: "draft", l: "טיוטה" },
        ].map((t) => (
          <button key={t.k} onClick={() => setStatus(t.k)}
            className={`rounded-md px-3 py-1.5 text-sm ${status === t.k ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"}`}>
            {t.l}
          </button>
        ))}
        <div className="mr-auto">
          <input type="search" placeholder="חיפוש…" value={q} onChange={(e) => setQ(e.target.value)}
            className="w-64 rounded-md border border-input bg-background px-3 py-1.5 text-sm" />
        </div>
      </div>

      {err && <p className="mt-3 text-sm text-red-600">שגיאה: {err}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-right text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">כותרת</th>
              <th className="p-3 font-medium">Slug</th>
              <th className="p-3 font-medium">סטטוס</th>
              <th className="p-3 font-medium">עודכן</th>
              <th className="p-3 font-medium">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">טוען…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">אין עמודים</td></tr>}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-medium text-foreground">{r.title}</td>
                <td className="p-3 text-xs text-muted-foreground" dir="ltr">{r.slug}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "publish" ? "bg-emerald-100 text-emerald-900" : "bg-slate-200 text-slate-800"}`}>
                    {r.status === "publish" ? "פורסם" : "טיוטה"}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{fmtDate(r.updated_at)}</td>
                <td className="p-3">
                  <Link to="/admin/pages/$id" params={{ id: r.id }} className="text-primary hover:underline">עריכה</Link>
                  <span className="mx-2 text-muted-foreground">·</span>
                  <a href={`/${r.slug}/`} target="_blank" rel="noreferrer" className="text-primary hover:underline">צפייה</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
