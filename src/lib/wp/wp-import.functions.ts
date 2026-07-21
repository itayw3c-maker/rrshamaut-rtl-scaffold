import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  importCategoriesAll,
  importTagsAll,
  importMediaPage,
  importPostsPage,
  importCustomPostType,
  importPagesPage,
  importImagesForPost,
  listPostsNeedingBackfill,
  backfillCoverForPost,
  getImportStats,
  importPageMeta,
} from "./wp-import.server";

const pageSchema = z.object({
  page: z.number().int().min(1),
  perPage: z.number().int().min(1).optional(),
});

const postsPageSchema = pageSchema.extend({
  status: z.string().optional(),
});

const customPostTypeSchema = z.object({
  typeSlug: z.string().min(1),
  page: z.number().int().min(1),
  perPage: z.number().int().min(1).optional(),
  status: z.string().optional(),
});

const slugSchema = z.object({
  slug: z.string().min(1),
});

const imagesForPostSchema = z.object({
  slug: z.string().min(1),
  table: z.enum(["posts", "pages"]).optional(),
});

export const importCategoriesAllFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("current_user_is_admin");
    if (error) {
      console.error("current_user_is_admin failed:", error);
      throw new Error("Forbidden: admin role required");
    }
    if (!data) throw new Error("Forbidden: admin role required");
    return importCategoriesAll();
  });

export const importTagsAllFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("current_user_is_admin");
    if (error) {
      console.error("current_user_is_admin failed:", error);
      throw new Error("Forbidden: admin role required");
    }
    if (!data) throw new Error("Forbidden: admin role required");
    return importTagsAll();
  });

export const importMediaPageFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => pageSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: isAdmin, error } = await context.supabase.rpc("current_user_is_admin");
    if (error) {
      console.error("current_user_is_admin failed:", error);
      throw new Error("Forbidden: admin role required");
    }
    if (!isAdmin) throw new Error("Forbidden: admin role required");
    return importMediaPage(data.page, data.perPage ?? 10);
  });

export const importPostsPageFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => postsPageSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: isAdmin, error } = await context.supabase.rpc("current_user_is_admin");
    if (error) {
      console.error("current_user_is_admin failed:", error);
      throw new Error("Forbidden: admin role required");
    }
    if (!isAdmin) throw new Error("Forbidden: admin role required");
    return importPostsPage(data.page, data.perPage ?? 10, data.status ?? "publish");
  });

export const importCustomPostTypeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => customPostTypeSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: isAdmin, error } = await context.supabase.rpc("current_user_is_admin");
    if (error) {
      console.error("current_user_is_admin failed:", error);
      throw new Error("Forbidden: admin role required");
    }
    if (!isAdmin) throw new Error("Forbidden: admin role required");
    return importCustomPostType(data.typeSlug, data.page, data.perPage ?? 10, data.status ?? "publish");
  });

export const importPagesPageFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => postsPageSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: isAdmin, error } = await context.supabase.rpc("current_user_is_admin");
    if (error) {
      console.error("current_user_is_admin failed:", error);
      throw new Error("Forbidden: admin role required");
    }
    if (!isAdmin) throw new Error("Forbidden: admin role required");
    return importPagesPage(data.page, data.perPage ?? 10, data.status ?? "publish");
  });

export const importImagesForPostFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => imagesForPostSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: isAdmin, error } = await context.supabase.rpc("current_user_is_admin");
    if (error) {
      console.error("current_user_is_admin failed:", error);
      throw new Error("Forbidden: admin role required");
    }
    if (!isAdmin) throw new Error("Forbidden: admin role required");
    return importImagesForPost(data.slug, data.table ?? "posts");
  });

export const listPostsNeedingBackfillFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("current_user_is_admin");
    if (error) {
      console.error("current_user_is_admin failed:", error);
      throw new Error("Forbidden: admin role required");
    }
    if (!data) throw new Error("Forbidden: admin role required");
    return listPostsNeedingBackfill();
  });

export const backfillCoverForPostFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => slugSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: isAdmin, error } = await context.supabase.rpc("current_user_is_admin");
    if (error) {
      console.error("current_user_is_admin failed:", error);
      throw new Error("Forbidden: admin role required");
    }
    if (!isAdmin) throw new Error("Forbidden: admin role required");
    return backfillCoverForPost(data.slug);
  });

export const getImportStatsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("current_user_is_admin");
    if (error) {
      console.error("current_user_is_admin failed:", error);
      throw new Error("Forbidden: admin role required");
    }
    if (!data) throw new Error("Forbidden: admin role required");
    return getImportStats();
  });
