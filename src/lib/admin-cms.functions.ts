import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { normalizeDashes, sanitizePostHtml } from "@/lib/wp/post-sanitize.server";

async function assertAdmin(ctx: any) {
  const { data, error } = await ctx.supabase.rpc("current_user_is_admin");
  if (error || !data) throw new Error("Forbidden: admin role required");
}

export const getAdminStatsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const nowIso = new Date().toISOString();

    const [pubPosts, drafts, scheduled, pages, leads, unhandled, media, latest] =
      await Promise.all([
        supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).eq("status", "publish").or(`published_at.is.null,published_at.lte.${nowIso}`),
        supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).eq("status", "draft"),
        supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).eq("status", "publish").gt("published_at", nowIso),
        supabaseAdmin.from("pages").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("leads").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("leads").select("id", { count: "exact", head: true }).eq("handled", false),
        supabaseAdmin.from("media").select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("posts")
          .select("id, title, slug, status, cpt_type, published_at, updated_at")
          .order("updated_at", { ascending: false })
          .limit(10),
      ]);

    return {
      publishedPosts: pubPosts.count ?? 0,
      drafts: drafts.count ?? 0,
      scheduled: scheduled.count ?? 0,
      pages: pages.count ?? 0,
      leads: leads.count ?? 0,
      unhandledLeads: unhandled.count ?? 0,
      media: media.count ?? 0,
      latest: latest.data ?? [],
    };
  });

export const listAdminPostsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select("id, title, slug, status, cpt_type, published_at, updated_at, post_categories(is_primary, category:categories(id, name, slug))")
      .order("updated_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []).map((p: any) => {
      const primary = (p.post_categories ?? []).find((pc: any) => pc.is_primary) ?? p.post_categories?.[0];
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        status: p.status,
        cpt_type: p.cpt_type,
        published_at: p.published_at,
        updated_at: p.updated_at,
        primary_category: primary?.category?.name ?? null,
      };
    });
  });

export const getAdminPostFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .select("*, post_categories(is_primary, category_id)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!post) throw new Error("Not found");
    const { data: cats } = await supabaseAdmin.from("categories").select("id, name, slug").order("name");
    const primary = (post.post_categories ?? []).find((pc: any) => pc.is_primary) ?? post.post_categories?.[0];
    return { post, categories: cats ?? [], primaryCategoryId: primary?.category_id ?? null };
  });

const savePostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  content: z.string(),
  excerpt: z.string().nullable().optional(),
  status: z.enum(["publish", "draft", "trash"]),
  published_at: z.string().nullable().optional(),
  author_name: z.string().optional(),
  video_url: z.string().nullable().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  primary_category_id: z.string().uuid().nullable().optional(),
});

export const saveAdminPostFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => savePostSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: any = {
      title: normalizeDashes(data.title),
      content: sanitizePostHtml(normalizeDashes(data.content)),
      excerpt: data.excerpt ? normalizeDashes(data.excerpt) : null,
      status: data.status,
      published_at: data.published_at || null,
      author_name: data.author_name || "רפאל שמאות רכוש",
      video_url: data.video_url || null,
      meta_title: data.meta_title ? normalizeDashes(data.meta_title) : null,
      meta_description: data.meta_description ? normalizeDashes(data.meta_description) : null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabaseAdmin.from("posts").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);

    if (data.primary_category_id !== undefined) {
      await supabaseAdmin.from("post_categories").delete().eq("post_id", data.id);
      if (data.primary_category_id) {
        await supabaseAdmin.from("post_categories").insert({
          post_id: data.id,
          category_id: data.primary_category_id,
          is_primary: true,
        });
      }
    }
    return { ok: true };
  });

export const duplicatePostFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: src, error } = await supabaseAdmin.from("posts").select("*").eq("id", data.id).maybeSingle();
    if (error || !src) throw new Error("Not found");
    const copy: any = { ...src };
    delete copy.id;
    delete copy.created_at;
    delete copy.updated_at;
    delete copy.wp_id;
    copy.slug = `${src.slug}-copy-${Date.now()}`;
    copy.title = `${src.title} (עותק)`;
    copy.status = "draft";
    copy.published_at = null;
    const { data: ins, error: insErr } = await supabaseAdmin.from("posts").insert(copy).select("id").single();
    if (insErr) throw new Error(insErr.message);
    return { id: ins.id };
  });

export const trashPostFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("posts").update({ status: "trash" }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const restorePostFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("posts").update({ status: "draft" }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePostFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("post_categories").delete().eq("post_id", data.id);
    await supabaseAdmin.from("post_tags").delete().eq("post_id", data.id);
    const { error } = await supabaseAdmin.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAdminPagesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("pages")
      .select("id, title, slug, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getAdminPageFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: page, error } = await supabaseAdmin.from("pages").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!page) throw new Error("Not found");
    return page;
  });

const savePageSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  content: z.string(),
  status: z.enum(["publish", "draft"]),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
});

export const saveAdminPageFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => savePageSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("pages")
      .update({
        title: normalizeDashes(data.title),
        content: sanitizePostHtml(normalizeDashes(data.content)),
        status: data.status,
        meta_title: data.meta_title ? normalizeDashes(data.meta_title) : null,
        meta_description: data.meta_description ? normalizeDashes(data.meta_description) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
