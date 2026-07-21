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

export const getHomeVideosFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomeVideo[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select("slug, title, video_url, cover:media!posts_cover_media_id_fkey(url)")
      .eq("cpt_type", "movie")
      .eq("status", "publish")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(6);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => ({
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
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(8);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => ({
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
