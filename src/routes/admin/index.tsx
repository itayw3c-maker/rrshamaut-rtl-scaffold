import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminStatsFn } from "@/lib/admin-cms.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Stats = Awaited<ReturnType<typeof getAdminStatsFn>>;

function fmtDate(s: string | null) {
  if (!s) return "—";
  try { return new Date(s).toLocaleDateString("he-IL"); } catch { return "—"; }
}

function postLiveHref(p: { slug: string; cpt_type: string | null }) {
  const prefix = p.cpt_type ? `/${p.cpt_type}` : "";
  return `${prefix}/${p.slug}/`;
}

function statusBadge(p: { status: string; published_at: string | null }) {
  const now = Date.now();
  if (p.status === "publish" && p.published_at && new Date(p.published_at).getTime() > now) {
    return { label: "מתוזמן", cls: "bg-amber-100 text-amber-900" };
  }
  if (p.status === "publish") return { label: "פורסם", cls: "bg-emerald-100 text-emerald-900" };
  if (p.status === "draft") return { label: "טיוטה", cls: "bg-slate-200 text-slate-800" };
  if (p.status === "trash") return { label: "אשפה", cls: "bg-red-100 text-red-900" };
  return { label: p.status, cls: "bg-slate-100 text-slate-700" };
}

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getAdminStatsFn().then(setStats).catch((e) => setErr(String(e?.message ?? e)));
  }, []);

  const cards = [
    { title: "פוסטים פורסמו", value: stats?.publishedPosts, to: "/admin/posts" as const },
    { title: "טיוטות", value: stats?.drafts, to: "/admin/posts" as const },
    { title: "מתוזמנים", value: stats?.scheduled, to: "/admin/posts" as const },
    { title: "עמודים", value: stats?.pages, to: "/admin/pages" as const },
    { title: `פניות (${stats?.unhandledLeads ?? 0} לא טופלו)`, value: stats?.leads, to: "/admin" as const },
    { title: "מדיה", value: stats?.media, to: "/admin" as const },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">לוח בקרה</h1>
      {err && <p className="mt-3 text-sm text-red-600">שגיאה: {err}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.title}
            to={c.to}
            className="rounded-lg border border-border bg-card p-5 shadow-sm hover:border-primary transition"
          >
            <div className="text-sm text-muted-foreground">{c.title}</div>
            <div className="mt-2 text-3xl font-bold text-foreground">
              {c.value ?? "…"}
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">פוסטים אחרונים</h2>
          <Link to="/admin/posts" className="text-sm text-primary hover:underline">כל הפוסטים ←</Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-right text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">כותרת</th>
                <th className="p-3 font-medium">סטטוס</th>
                <th className="p-3 font-medium">תאריך</th>
                <th className="p-3 font-medium">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.latest ?? []).map((p) => {
                const b = statusBadge(p);
                return (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3 font-medium text-foreground">{p.title}</td>
                    <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${b.cls}`}>{b.label}</span></td>
                    <td className="p-3 text-muted-foreground">{fmtDate(p.published_at ?? p.updated_at)}</td>
                    <td className="p-3">
                      <Link to="/admin/posts/$id" params={{ id: p.id }} className="text-primary hover:underline">עריכה</Link>
                      <span className="mx-2 text-muted-foreground">·</span>
                      <a href={postLiveHref(p)} target="_blank" rel="noreferrer" className="text-primary hover:underline">צפייה</a>
                    </td>
                  </tr>
                );
              })}
              {stats && stats.latest.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">אין פוסטים</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
