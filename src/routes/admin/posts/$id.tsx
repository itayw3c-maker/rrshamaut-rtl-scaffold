import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminPostFn, saveAdminPostFn } from "@/lib/admin-cms.functions";
import { TipTapEditor } from "@/components/admin/TipTapEditor";

export const Route = createFileRoute("/admin/posts/$id")({
  component: PostEditor,
});

type Loaded = Awaited<ReturnType<typeof getAdminPostFn>>;

function toLocalDatetime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

function fromLocalDatetime(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function liveHref(cpt: string | null, slug: string) {
  return `${cpt ? `/${cpt}` : ""}/${slug}/`;
}

function PostEditor() {
  const { id } = Route.useParams();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"publish" | "draft" | "trash">("draft");
  const [publishedAt, setPublishedAt] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [primaryCat, setPrimaryCat] = useState<string>("");

  useEffect(() => {
    getAdminPostFn({ data: { id } })
      .then((r) => {
        setLoaded(r);
        const p: any = r.post;
        setTitle(p.title ?? "");
        setContent(p.content ?? "");
        setExcerpt(p.excerpt ?? "");
        setStatus(p.status);
        setPublishedAt(toLocalDatetime(p.published_at));
        setAuthorName(p.author_name ?? "");
        setVideoUrl(p.video_url ?? "");
        setMetaTitle(p.meta_title ?? p.title ?? "");
        setMetaDescription(p.meta_description ?? p.excerpt ?? "");
        setPrimaryCat(r.primaryCategoryId ?? "");
      })
      .catch((e) => setErr(String(e?.message ?? e)));
  }, [id]);

  async function onSave() {
    setSaving(true);
    setErr(null);
    try {
      await saveAdminPostFn({
        data: {
          id,
          title,
          content,
          excerpt: excerpt || null,
          status,
          published_at: fromLocalDatetime(publishedAt),
          author_name: authorName,
          video_url: videoUrl || null,
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
          primary_category_id: primaryCat || null,
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
  const p: any = loaded!.post;
  const isVideoType = p.cpt_type === "movie" || p.cpt_type === "shorts";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link to="/admin/posts" className="text-sm text-primary hover:underline">→ חזרה לרשימה</Link>
          <h1 className="mt-1 text-2xl font-bold text-foreground">עריכת פוסט</h1>
          <p className="text-xs text-muted-foreground">סוג: {p.cpt_type ?? "מאמר"} · slug: {p.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={liveHref(p.cpt_type, p.slug)} target="_blank" rel="noreferrer"
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
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="כותרת"
            dir="rtl"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-lg font-semibold"
          />
          <TipTapEditor value={content} onChange={setContent} />
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">תקציר</label>
            <textarea
              dir="rtl"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
            />
          </div>
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
                  <option value="trash">אשפה</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">תאריך פרסום</label>
                <input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5" />
                <p className="mt-1 text-[11px] text-muted-foreground">תאריך עתידי = פרסום מתוזמן</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">קטגוריה ראשית</label>
                <select value={primaryCat} onChange={(e) => setPrimaryCat(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5">
                  <option value="">— ללא —</option>
                  {loaded!.categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">שם הכותב</label>
                <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)}
                  dir="rtl" className="w-full rounded-md border border-input bg-background px-2 py-1.5" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">סוג</label>
                <div className="rounded-md border border-input bg-muted/30 px-2 py-1.5 text-muted-foreground">
                  {p.cpt_type ?? "מאמר"}
                </div>
              </div>
              {isVideoType && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Video URL</label>
                  <input type="url" dir="ltr" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-2 py-1.5" />
                </div>
              )}
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
                <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                  dir="rtl" className="w-full rounded-md border border-input bg-background px-2 py-1.5" />
              </div>
              <div>
                <label className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Meta description</span>
                  <span className={metaDescription.length > 160 ? "text-red-600" : ""}>{metaDescription.length}/160</span>
                </label>
                <textarea rows={4} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
                  dir="rtl" className="w-full rounded-md border border-input bg-background p-2" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
