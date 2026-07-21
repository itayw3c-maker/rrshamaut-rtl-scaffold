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

const PRESS_CARDS_RAW: PressCard[] = [
  { href: "https://www.inn.co.il/news/701435", img: "https://www.rrshamaut.co.il/wp-content/uploads/2026/07/מאחורי-הקלעים_-מה-באמת-קורה-כשתובעים-את-חברת-הביטוח_.webp", logo: null, title: "ערוץ 7" },
  { href: "https://timeout.co.il/ppost/%d7%94%d7%a4%d7%a8%d7%93%d7%95%d7%a7%d7%a1-%d7%a9%d7%9c-%d7%aa%d7%91%d7%99%d7%a2%d7%95%d7%aa-%d7%94%d7%91%d7%99%d7%98%d7%95%d7%97/", img: "https://www.rrshamaut.co.il/wp-content/uploads/2026/06/הפרדוקס-של-תביעות-הביטוח.webp", logo: null, title: "Time Out" },
  { href: "https://www.ashqelon.net/%d7%9e%d7%92%d7%96%d7%99%d7%9f-%d7%90%d7%a9%d7%a7%d7%9c%d7%95%d7%9f-%d7%a0%d7%98/%d7%90%d7%99%d7%9a-%d7%9c%d7%91%d7%97%d7%95%d7%a8-%d7%98%d7%99%d7%a1%d7%95%d7%aa-%d7%90%d7%9c-%d7%a2%d7%9c-%d7%9c%d7%97%d7%95%d7%a4%d7%a9%d7%94-%d7%91%d7%97%d7%95-%d7%9c-%d7%91%d7%a6%d7%95%d7%a8%d7%94-%d7%97%d7%9b%d7%9e%d7%94-%d7%95%d7%a0%d7%95%d7%97%d7%94-%d7%99%d7%95%d7%aa%d7%a8-789871", img: "https://www.rrshamaut.co.il/wp-content/uploads/2026/06/גם-כשהקירות-נראים-לבנים-ונקיים-המים-הכלואים-מתחת-לרצפה-ממשיכים-להרוס-את-הבית-שלכם_.webp", logo: null, title: "אשקלון נט" },
  { href: "https://ashdodnet.com/%d7%a6%d7%a8%d7%9b%d7%a0%d7%95%d7%aa-%d7%95%d7%a2%d7%a1%d7%a7%d7%99%d7%9d/%d7%94%d7%a4%d7%99%d7%a6%d7%95%d7%a5-%d7%91%d7%a6%d7%a0%d7%a8%d7%aa-%d7%94%d7%95%d7%90-%d7%a8%d7%a7-%d7%94%d7%94%d7%aa%d7%97%d7%9c%d7%94-%d7%9b%d7%9a-%d7%aa%d7%91%d7%98%d7%99%d7%97%d7%95-%d7%a4%d7%99%d7%a6%d7%95%d7%99-%d7%9e%d7%9c%d7%90-%d7%95%d7%aa%d7%99%d7%9e%d7%a0%d7%a2%d7%95-%d7%9e%d7%94%d7%a4%d7%a1%d7%93%d7%99%d7%9d-%d7%9b%d7%a1%d7%a4%d7%99%d7%99%d7%9d-%d7%9b%d7%91%d7%93%d7%99%d7%9d-788285", img: "https://www.rrshamaut.co.il/wp-content/uploads/2026/05/הפיצוץ-בצנרת-הוא-רק-ההתחלה-כך-תבטיחו-פיצוי-מלא-ותימנעו-מהפסדים-כספיים-כבדים.webp", logo: null, title: "אשדוד נט" },
  { href: "https://13tv.co.il/item/special/artices/promoted/lyqrn-904894446/", img: "https://www.rrshamaut.co.il/wp-content/uploads/2025/12/האויב-השקט__.webp", logo: null, title: "חדשות 13" },
  { href: "https://www.maariv.co.il/economy/consumerism/article-1204138", img: "https://www.rrshamaut.co.il/wp-content/uploads/2026/03/כתבה-במעריב-שמאי-רכוש-רפאל-ריבוח.jpg", logo: null, title: "מעריב" },
  { href: "https://www.israelhayom.co.il/mumlazim/article/19039227", img: "https://www.rrshamaut.co.il/wp-content/uploads/2025/10/רפאל-ריבוח.webp", logo: null, title: "ישראל היום" },
  { href: "https://www.ynet.co.il/article/r1eu0i4mwe", img: "https://www.rrshamaut.co.il/wp-content/uploads/2025/12/שמאי-רכוש-מוביל-בענף.webp", logo: null, title: "ynet" },
  { href: "https://aa.mcity.co.il/?id=3202512020929049", img: "https://www.rrshamaut.co.il/wp-content/uploads/2025/12/חוויתם-נזק-בבית_.webp", logo: null, title: "mcity" },
  { href: "https://www.bizportal.co.il/bizpoint-sponsored/news/article/20026784", img: "https://www.rrshamaut.co.il/wp-content/uploads/2026/01/Screenshot-at-Jan-28-10-14-16.webp", logo: null, title: "ביזפורטל" },
  { href: "https://www.kipa.co.il/%D7%9B%D7%93%D7%90%D7%99-%D7%9C%D7%93%D7%A2%D7%AA/1218611-0/", img: "https://www.rrshamaut.co.il/wp-content/uploads/2026/01/Screenshot-at-Jan-28-10-31-55.webp", logo: null, title: "כיפה" },
];

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

      // Press cards: use verified source list, resolve images through media/rehost.
      if (p.slug === "כתבו-עלינו") {
        const { resolveMany } = await import("@/lib/media/resolve.server");
        const raw = PRESS_CARDS_RAW;
        const map = await resolveMany(raw.map((c) => c.img).filter(Boolean) as string[]);
        press = raw.map((c) => ({
          ...c,
          img: c.img ? (map[c.img] ?? c.img) : null,
        }));
      }

      return {
        kind: "page",
        id: p.id,
        slug: p.slug,
        title: p.title,
        content,
        meta_title: p.meta_title,
        meta_description: p.meta_description,
        cover_url: p.cover?.url ?? null,
        archive,
        press,
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
