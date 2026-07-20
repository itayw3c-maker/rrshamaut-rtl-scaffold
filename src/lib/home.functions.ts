import { createServerFn } from "@tanstack/react-start";

export type HomeVideo = {
  slug: string;
  title: string;
  video_url: string | null;
  cover_url: string | null;
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
      .limit(4);

    if (error) throw new Error(error.message);

    return (data ?? []).map((row: any) => ({
      slug: row.slug,
      title: row.title,
      video_url: row.video_url ?? null,
      cover_url: row.cover?.url ?? null,
    }));
  },
);
