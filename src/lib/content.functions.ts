import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { slugCandidates } from "./slug";

export type ResolvedPage = {
  kind: "page";
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  cover_url: string | null;
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
      return {
        kind: "page",
        id: p.id,
        slug: p.slug,
        title: p.title,
        content: p.content ?? "",
        meta_title: p.meta_title,
        meta_description: p.meta_description,
        cover_url: p.cover?.url ?? null,
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

    // primary category
    const { data: pcRows } = await supabaseAdmin
      .from("post_categories")
      .select("is_primary, category:categories(slug, name)")
      .eq("post_id", post.id);
    const primary =
      (pcRows ?? []).find((r: any) => r.is_primary)?.category ??
      (pcRows ?? [])[0]?.category ??
      null;

    // related posts (same primary cat if any, else recent)
    let related: any[] = [];
    if (primary) {
      const { data: sib } = await supabaseAdmin
        .from("post_categories")
        .select("post:posts(id, slug, title, published_at, status, cpt_type, cover:media!posts_cover_media_id_fkey(url))")
        .eq("category_id", (pcRows ?? []).find((r: any) => r.category?.slug === (primary as any).slug)?.category?.slug ? undefined as any : undefined as any)
        .limit(1);
      // fallback path — do a simpler direct query
      const catId = (pcRows ?? []).find((r: any) => r.category?.slug === (primary as any).slug)?.category;
      void sib; void catId;
    }
    if (related.length === 0) {
      const { data: recent } = await supabaseAdmin
        .from("posts")
        .select("slug, title, cover:media!posts_cover_media_id_fkey(url)")
        .is("cpt_type", null)
        .eq("status", "publish")
        .or(`published_at.is.null,published_at.lte.${nowIso}`)
        .neq("id", post.id)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(5);
      related = recent ?? [];
    }

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
      related: related.map((r: any) => ({
        slug: r.slug,
        title: r.title,
        cover_url: r.cover?.url ?? null,
      })),
    };
  });
