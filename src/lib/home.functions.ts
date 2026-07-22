import { createServerFn } from "@tanstack/react-start";

export type HomeVideo = {
  slug: string;
  title: string;
  video_url: string | null;
  cover_url: string | null;
};

export type HomeSuccess = {
  slug: string;
  title: string;
  cover_url: string | null;
};

export type HomeArticle = {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
};

const HOME_VIDEO_SLUGS = [
  "סרטון-בנושא-נזקי-התנגשות-ברכוש-איך-מתמ",
  "צפו-בסרטון-נזקי-מים-בביטוח-דירה-איך-למ",
  "סרטון-בנושא-נזקי-שוכרים-בנכס-איך-לזהות",
  "סרטון-בנושא-נזקי-אש-בביטוח-דירה-איך-לנ",
];

const HOME_SUCCESS_SLUGS = [
  "plumbing-damage-insurance-claim-success",
  "trapped-water-insurance-claim-success",
  "clal-insurance-plumbing-damage-settlement",
  "בלילה-אחד-הכל-נשרף-ובזכות-ליווי-צמוד",
  "תשלום-ע״ס-306638-בגין-נזק-בדירה",
  "payment-290000-nis-water-damage-luxury-home-ashdod",
];

export const getHomeVideosFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomeVideo[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select("slug, title, video_url, cover:media!posts_cover_media_id_fkey(url)")
      .eq("cpt_type", "movie")
      .eq("status", "publish")
      .in("slug", HOME_VIDEO_SLUGS);
    if (error) throw new Error(error.message);
    const bySlug = new Map((data ?? []).map((row: any) => [row.slug, row]));
    return HOME_VIDEO_SLUGS
      .map((slug) => bySlug.get(slug))
      .filter(Boolean)
      .map((row: any) => ({
        slug: row.slug,
        title: row.title,
        video_url: row.video_url ?? null,
        cover_url: row.cover?.url ?? null,
      }));
  },
);

export const getHomeSuccessesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomeSuccess[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select("slug, title, cover:media!posts_cover_media_id_fkey(url)")
      .eq("cpt_type", "success")
      .eq("status", "publish")
      .in("slug", HOME_SUCCESS_SLUGS);
    if (error) throw new Error(error.message);
    const bySlug = new Map((data ?? []).map((row: any) => [row.slug, row]));
    return HOME_SUCCESS_SLUGS
      .map((slug) => bySlug.get(slug))
      .filter(Boolean)
      .map((row: any) => ({
        slug: row.slug,
        title: row.title,
        cover_url: row.cover?.url ?? null,
      }));
  },
);

export const getHomeArticlesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomeArticle[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const nowIso = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select("slug, title, excerpt, published_at")
      .is("cpt_type", null)
      .eq("status", "publish")
      .lte("published_at", nowIso)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(6);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => ({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt ?? null,
      published_at: row.published_at ?? null,
    }));
  },
);

export type FooterArticle = { slug: string; title: string };

export const getFooterArticlesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<FooterArticle[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const nowIso = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select("slug, title")
      .is("cpt_type", null)
      .eq("status", "publish")
      .lte("published_at", nowIso)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(8);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => ({ slug: row.slug, title: row.title }));
  },
);
