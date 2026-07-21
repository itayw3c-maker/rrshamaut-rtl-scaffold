import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site-config";

function enc(slug: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(slug));
  } catch {
    return encodeURIComponent(slug);
  }
}

function urlEntry(path: string, lastmod?: string | null): string {
  const loc = SITE_URL + path;
  return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ""}</url>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const nowIso = new Date().toISOString();

        const [posts, pages, cats, movies, shorts, successes] = await Promise.all([
          supabaseAdmin.from("posts")
            .select("slug, updated_at, published_at, status, cpt_type")
            .is("cpt_type", null).eq("status", "publish")
            .or(`published_at.is.null,published_at.lte.${nowIso}`),
          supabaseAdmin.from("pages")
            .select("slug, updated_at").eq("status", "publish"),
          supabaseAdmin.from("categories").select("id, slug"),
          supabaseAdmin.from("posts")
            .select("slug, updated_at, published_at").eq("cpt_type", "movie").eq("status", "publish")
            .or(`published_at.is.null,published_at.lte.${nowIso}`),
          supabaseAdmin.from("posts")
            .select("slug, updated_at, published_at").eq("cpt_type", "shorts").eq("status", "publish")
            .or(`published_at.is.null,published_at.lte.${nowIso}`),
          supabaseAdmin.from("posts")
            .select("slug, updated_at, published_at").eq("cpt_type", "success").eq("status", "publish")
            .or(`published_at.is.null,published_at.lte.${nowIso}`),
        ]);

        // Categories that actually have published, non-CPT posts.
        const publishedPostIds = new Set<string>();
        {
          const { data: pubPosts } = await supabaseAdmin
            .from("posts").select("id, published_at")
            .is("cpt_type", null).eq("status", "publish")
            .or(`published_at.is.null,published_at.lte.${nowIso}`);
          for (const p of (pubPosts ?? []) as any[]) publishedPostIds.add(p.id);
        }
        const catIds = (cats.data ?? []).map((c: any) => c.id);
        const nonEmptyCatIds = new Set<string>();
        if (catIds.length && publishedPostIds.size) {
          const { data: pc } = await supabaseAdmin
            .from("post_categories").select("category_id, post_id").in("category_id", catIds);
          for (const row of (pc ?? []) as any[]) {
            if (publishedPostIds.has(row.post_id)) nonEmptyCatIds.add(row.category_id);
          }
        }
        const activeCats = (cats.data ?? []).filter((c: any) => nonEmptyCatIds.has(c.id));

        const seen = new Set<string>();
        const lines: string[] = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><!-- v3 catIds=${catIds.length} pubPosts=${publishedPostIds.size} activeCats=${activeCats.length} -->`,
        ];
        const add = (path: string, lastmod?: string | null) => {
          if (seen.has(path)) return;
          seen.add(path);
          lines.push(urlEntry(path, lastmod ?? null));
        };

        add("/", null);
        for (const p of posts.data ?? []) add(`/${enc((p as any).slug)}/`, (p as any).updated_at);
        for (const p of pages.data ?? []) add(`/${enc((p as any).slug)}/`, (p as any).updated_at);
        for (const c of activeCats) add(`/category/${enc((c as any).slug)}/`, (c as any).updated_at);
        for (const m of movies.data ?? []) add(`/movie/${enc((m as any).slug)}/`, (m as any).updated_at);
        for (const s of shorts.data ?? []) add(`/shorts/${enc((s as any).slug)}/`, (s as any).updated_at);
        for (const s of successes.data ?? []) add(`/success/${enc((s as any).slug)}/`, (s as any).updated_at);

        lines.push(`</urlset>`);
        return new Response(lines.join("\n"), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
