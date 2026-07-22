import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { slugCandidates } from "./slug";

export type ArchiveItem = {
  slug: string;
  title: string;
  cover_url: string | null;
  video_url: string | null;
  cpt_type?: string;
};

export type PressCard = {
  href: string;
  img: string | null;
  logo: string | null;
  title: string;
  excerpt?: string | null;
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
  archive: null | { type: "movie" | "success" | "video"; items: ArchiveItem[] };
  press?: PressCard[];
  service?: import("./custom-pages.server").ServicePageData;
  bio?: import("./custom-pages.server").BioPageData;
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

const ARCHIVE_SLUGS: Record<string, "movie" | "success" | "video"> = {
  "סרטונים": "video",
  "ההצלחות-שלנו": "success",
};

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parsePressCardsFromHtml(html: string): PressCard[] {
  const cards: PressCard[] = [];
  // Each press card lives in an `e-con-full e-flex e-con e-child` container.
  const containerRe =
    /<div\b[^>]*class="[^"]*\be-con-full\b[^"]*\be-flex\b[^"]*\be-con\b[^"]*\be-child\b[^"]*"[^>]*>([\s\S]*?)(?=<div\b[^>]*class="[^"]*\be-con-full\b[^"]*\be-flex\b[^"]*\be-con\b[^"]*\be-child\b|<\/div>\s*<\/div>\s*<\/div>\s*<footer)/g;
  // Simpler: split on the container opening tag and process each chunk.
  const parts = html.split(
    /<div\b[^>]*class="[^"]*\be-con-full\b[^"]*\be-flex\b[^"]*\be-con\b[^"]*\be-child\b[^"]*"[^>]*>/,
  );
  // parts[0] is preamble; each subsequent part is one card's inner HTML + trailing siblings.
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const imgs = Array.from(chunk.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/g)).map(
      (m) => m[1],
    );
    const titleMatch = chunk.match(
      /<p class="elementor-heading-title[^"]*"[^>]*>([\s\S]*?)<\/p>/,
    );
    const linkMatch = chunk.match(
      /<a\b[^>]*class="[^"]*\belementor-button\b[^"]*"[^>]*href="([^"]+)"/,
    );
    if (!linkMatch || imgs.length < 1) continue;
    const title = titleMatch
      ? decodeHtmlEntities(titleMatch[1].replace(/<[^>]+>/g, "").trim())
      : "";
    cards.push({
      href: linkMatch[1],
      img: imgs[0] ?? null,
      logo: imgs[1] ?? null,
      title,
      excerpt: null,
    });
  }
  // Suppress void containerRe warning by referencing it once.
  void containerRe;
  return cards;
}


async function fetchArchive(type: "movie" | "success" | "video"): Promise<ArchiveItem[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const nowIso = new Date().toISOString();
  const types = type === "video" ? ["movie", "shorts"] : [type];
  const { data } = await supabaseAdmin
    .from("posts")
    .select("slug, title, video_url, cpt_type, cover:media!posts_cover_media_id_fkey(url)")
    .in("cpt_type", types)
    .eq("status", "publish")
    .or(`published_at.is.null,published_at.lte.${nowIso}`)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(120);
  return (data ?? []).map((r: any) => ({
    slug: r.slug,
    title: r.title,
    video_url: r.video_url ?? null,
    cover_url: r.cover?.url ?? null,
    cpt_type: r.cpt_type ?? undefined,
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

      let content: string = p.content ?? "";
      let press: PressCard[] | undefined;

      // Rehost gallery images so they don't point at the old origin.
      if (p.slug === "גלריית-נזקי-מים-אש-ומלחמה") {
        const { resolveMany } = await import("@/lib/media/resolve.server");
        const urls = Array.from(
          new Set([
            ...Array.from(content.matchAll(/data-thumbnail="([^"]+)"/g)).map((m) => m[1]),
            ...Array.from(content.matchAll(/<img[^>]+src="([^"]+)"/g)).map((m) => m[1]),
          ]),
        ).filter((u) => /rrshamaut\.co\.il\/wp-content\//i.test(u));
        const map = await resolveMany(urls);
        for (const [from, to] of Object.entries(map)) {
          content = content.split(from).join(to);
        }
      }

      // Press cards: parse each card container directly from the source HTML
      // (image → title → logo → button link). Source has no separate excerpt widget.
      if (p.slug === "כתבו-עלינו") {
        press = parsePressCardsFromHtml(content);
        // Suppress the raw elementor content — the view renders cards itself.
        content = "";
      }


      const {
        extractServicePage,
        extractBioPage,
        CUSTOM_SERVICE_SLUG,
        CUSTOM_CERT_SLUG,
        CUSTOM_BIO_SLUGS,
      } = await import("./custom-pages.server");

      let service: import("./custom-pages.server").ServicePageData | undefined;
      let bio: import("./custom-pages.server").BioPageData | undefined;
      let outContent = content;
      if (p.slug === CUSTOM_SERVICE_SLUG) {
        service = extractServicePage(content);
        outContent = "";
      } else if (p.slug === CUSTOM_CERT_SLUG) {
        outContent = "";
      } else if (CUSTOM_BIO_SLUGS.has(p.slug)) {
        bio = extractBioPage(content);
        outContent = "";
      }

      return {
        kind: "page",
        id: p.id,
        slug: p.slug,
        title: p.title,
        content: outContent,
        meta_title: p.meta_title,
        meta_description: p.meta_description,
        cover_url: p.cover?.url ?? null,
        archive,
        press,
        service,
        bio,
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
  meta_title: string | null;
  meta_description: string | null;
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
      .select("id, slug, name, description, meta_title, meta_description")
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
      meta_title: cat.meta_title ?? null,
      meta_description: cat.meta_description ?? null,
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
