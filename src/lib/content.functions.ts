import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { slugCandidates } from "./slug";

export type ArchiveItem = {
  slug: string;
  title: string;
  cover_url: string | null;
  video_url: string | null;
};

export type ResolvedPage = {
  kind: "page";
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  cover_url: string | null;
  archive: null | { type: "movie" | "success"; items: ArchiveItem[] };
};

export type ResolvedPost = {
  kind: "post";
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  author_name: string;
  published_at: string | null;
  cover_url: string | null;
  primary_category: { slug: string; name: string } | null;
  related: Array<{ slug: string; title: string; cover_url: string | null }>;
};

export type ResolvedContent = ResolvedPage | ResolvedPost | null;

const ARCHIVE_SLUGS: Record<string, "movie" | "success"> = {
  "סרטונים": "movie",
  "ההצלחות-שלנו": "success",
};

async function fetchArchive(type: "movie" | "success"): Promise<ArchiveItem[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const nowIso = new Date().toISOString();
  const { data } = await supabaseAdmin
    .from("posts")
    .select("slug, title, video_url, cover:media!posts_cover_media_id_fkey(url)")
    .eq("cpt_type", type)
    .eq("status", "publish")
    .or(`published_at.is.null,published_at.lte.${nowIso}`)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(60);
  return (data ?? []).map((r: any) => ({
    slug: r.slug,
    title: r.title,
    video_url: r.video_url ?? null,
    cover_url: r.cover?.url ?? null,
  }));
}

export const resolveSlugFn = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(300) }).parse(d))
  .handler(async ({ data }): Promise<ResolvedContent> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cands = slugCandidates(data.slug);

    // 1) pages
    const pageRes = await supabaseAdmin
      .from("pages")
      .select("id, slug, title, content, meta_title, meta_description, cover:media!pages_cover_media_id_fkey(url)")
      .in("slug", cands)
      .eq("status", "publish")
      .limit(1)
      .maybeSingle();

    if (pageRes.data) {
      const p: any = pageRes.data;
      const archiveType = ARCHIVE_SLUGS[p.slug];
      const archive = archiveType
        ? { type: archiveType, items: await fetchArchive(archiveType) }
        : null;
      return {
        kind: "page",
        id: p.id,
        slug: p.slug,
        title: p.title,
        content: p.content ?? "",
        meta_title: p.meta_title,
        meta_description: p.meta_description,
        cover_url: p.cover?.url ?? null,
        archive,
      };
    }

    // 2) posts (regular articles, cpt_type IS NULL)
    const nowIso = new Date().toISOString();
    const postRes = await supabaseAdmin
      .from("posts")
      .select("id, slug, title, content, excerpt, meta_title, meta_description, author_name, published_at, cover:media!posts_cover_media_id_fkey(url)")
      .in("slug", cands)
      .is("cpt_type", null)
      .eq("status", "publish")
      .or(`published_at.is.null,published_at.lte.${nowIso}`)
      .limit(1)
      .maybeSingle();

    if (!postRes.data) return null;

    const post: any = postRes.data;

    const { data: pcRows } = await supabaseAdmin
      .from("post_categories")
      .select("is_primary, category:categories(slug, name)")
      .eq("post_id", post.id);
    const primary =
      (pcRows ?? []).find((r: any) => r.is_primary)?.category ??
      (pcRows ?? [])[0]?.category ??
      null;

    const { data: recent } = await supabaseAdmin
      .from("posts")
      .select("slug, title, cover:media!posts_cover_media_id_fkey(url)")
      .is("cpt_type", null)
      .eq("status", "publish")
      .or(`published_at.is.null,published_at.lte.${nowIso}`)
      .neq("id", post.id)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(5);

    return {
      kind: "post",
      id: post.id,
      slug: post.slug,
      title: post.title,
      content: post.content ?? "",
      excerpt: post.excerpt,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      author_name: post.author_name ?? "",
      published_at: post.published_at,
      cover_url: post.cover?.url ?? null,
      primary_category: primary
        ? { slug: (primary as any).slug, name: (primary as any).name }
        : null,
      related: (recent ?? []).map((r: any) => ({
        slug: r.slug,
        title: r.title,
        cover_url: r.cover?.url ?? null,
      })),
    };
  });

export type CategoryPayload = {
  slug: string;
  name: string;
  description: string | null;
  posts: Array<{
    slug: string;
    title: string;
    excerpt: string | null;
    cover_url: string | null;
    published_at: string | null;
  }>;
};

export const getCategoryFn = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(300) }).parse(d))
  .handler(async ({ data }): Promise<CategoryPayload | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cands = slugCandidates(data.slug);

    const catRes = await supabaseAdmin
      .from("categories")
      .select("id, slug, name, description")
      .in("slug", cands)
      .limit(1)
      .maybeSingle();
    if (!catRes.data) return null;
    const cat: any = catRes.data;

    const nowIso = new Date().toISOString();
    const { data: rows } = await supabaseAdmin
      .from("post_categories")
      .select("post:posts!inner(id, slug, title, excerpt, published_at, status, cpt_type, cover:media!posts_cover_media_id_fkey(url))")
      .eq("category_id", cat.id)
      .limit(60);

    const posts = (rows ?? [])
      .map((r: any) => r.post)
      .filter((p: any) => p && p.status === "publish" && p.cpt_type == null)
      .filter((p: any) => !p.published_at || p.published_at <= nowIso)
      .sort((a: any, b: any) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))
      .slice(0, 30)
      .map((p: any) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        cover_url: p.cover?.url ?? null,
        published_at: p.published_at,
      }));

    return {
      slug: cat.slug,
      name: cat.name,
      description: cat.description ?? null,
      posts,
    };
  });

export type CptItem = {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  video_url: string | null;
  cover_url: string | null;
  published_at: string | null;
  cpt_type: string;
  related: Array<{ slug: string; title: string; cover_url: string | null; video_url: string | null }>;
};

export const getCptItemFn = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        type: z.enum(["movie", "shorts", "success"]),
        slug: z.string().min(1).max(300),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<CptItem | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cands = slugCandidates(data.slug);
    const nowIso = new Date().toISOString();

    const res = await supabaseAdmin
      .from("posts")
      .select("id, slug, title, content, excerpt, meta_title, meta_description, video_url, published_at, cpt_type, cover:media!posts_cover_media_id_fkey(url)")
      .in("slug", cands)
      .eq("cpt_type", data.type)
      .eq("status", "publish")
      .or(`published_at.is.null,published_at.lte.${nowIso}`)
      .limit(1)
      .maybeSingle();

    if (!res.data) return null;
    const p: any = res.data;

    const { data: rel } = await supabaseAdmin
      .from("posts")
      .select("slug, title, video_url, cover:media!posts_cover_media_id_fkey(url)")
      .eq("cpt_type", data.type)
      .eq("status", "publish")
      .or(`published_at.is.null,published_at.lte.${nowIso}`)
      .neq("id", p.id)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(6);

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      content: p.content ?? "",
      excerpt: p.excerpt,
      meta_title: p.meta_title,
      meta_description: p.meta_description,
      video_url: p.video_url ?? null,
      cover_url: p.cover?.url ?? null,
      published_at: p.published_at,
      cpt_type: p.cpt_type,
      related: (rel ?? []).map((r: any) => ({
        slug: r.slug,
        title: r.title,
        video_url: r.video_url ?? null,
        cover_url: r.cover?.url ?? null,
      })),
    };
  });
