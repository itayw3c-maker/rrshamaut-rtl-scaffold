import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminPageFn, saveAdminPageFn } from "@/lib/admin-cms.functions";
import { TipTapEditor } from "@/components/admin/TipTapEditor";

export const Route = createFileRoute("/admin/pages/$id")({
  component: PageEditor,
});

function PageEditor() {
  const { id } = Route.useParams();
  const [loaded, setLoaded] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"publish" | "draft">("draft");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  useEffect(() => {
    getAdminPageFn({ data: { id } }).then((p: any) => {
      setLoaded(p);
      setTitle(p.title ?? "");
      setContent(p.content ?? "");
      setStatus(p.status === "publish" ? "publish" : "draft");
      setMetaTitle(p.meta_title ?? p.title ?? "");
      setMetaDescription(p.meta_description ?? "");
    }).catch((e) => setErr(String(e?.message ?? e)));
  }, [id]);

  async function onSave() {
    setSaving(true);
    setErr(null);
    try {
      await saveAdminPageFn({
        data: {
          id, title, content, status,
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
        },
      });
      setSavedAt(new Date().toLocaleTimeString("he-IL"));
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setSaving(false);
    }
  }

  if (!loaded && !err) return <p className="text-muted-foreground">טוען…</p>;
  if (err && !loaded) return <p className="text-red-600">שגיאה: {err}</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link to="/admin/pages" className="text-sm text-primary hover:underline">→ חזרה לרשימה</Link>
          <h1 className="mt-1 text-2xl font-bold text-foreground">עריכת עמוד</h1>
          <p className="text-xs text-muted-foreground" dir="ltr">/{loaded.slug}/</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/${loaded.slug}/`} target="_blank" rel="noreferrer"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">תצוגה מקדימה</a>
          <button onClick={onSave} disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {saving ? "שומר…" : "שמירה"}
          </button>
        </div>
      </div>
      {err && <p className="mt-3 text-sm text-red-600">שגיאה: {err}</p>}
      {savedAt && <p className="mt-3 text-sm text-emerald-700">נשמר · {savedAt}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="כותרת" dir="rtl"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-lg font-semibold" />
          <TipTapEditor value={content} onChange={setContent} />
        </div>
        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-bold text-foreground">הגדרות</h3>
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">סטטוס</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5">
                  <option value="publish">פורסם</option>
                  <option value="draft">טיוטה</option>
                </select>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-bold text-foreground">SEO</h3>
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <label className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Meta title</span>
                  <span className={metaTitle.length > 60 ? "text-red-600" : ""}>{metaTitle.length}/60</span>
                </label>
                <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} dir="rtl"
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5" />
              </div>
              <div>
                <label className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Meta description</span>
                  <span className={metaDescription.length > 160 ? "text-red-600" : ""}>{metaDescription.length}/160</span>
                </label>
                <textarea rows={4} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} dir="rtl"
                  className="w-full rounded-md border border-input bg-background p-2" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
