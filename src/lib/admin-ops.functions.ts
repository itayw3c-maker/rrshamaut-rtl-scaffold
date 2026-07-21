import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(ctx: any) {
  const { data, error } = await ctx.supabase.rpc("current_user_is_admin");
  if (error || !data) throw new Error("Forbidden: admin role required");
}

// ─── LEADS ────────────────────────────────────────────────────────────────

export const listLeadsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("id, name, phone, email, message, source_url, source_variant, created_at, webhook_ok, handled")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const toggleLeadHandledFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), handled: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("leads").update({ handled: data.handled }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── WEBHOOK CONFIG ───────────────────────────────────────────────────────

export const getWebhookConfigFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("webhook_config").select("*").eq("id", 1).maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? { id: 1, webhook_url: "", enabled: false };
  });

export const saveWebhookConfigFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ webhook_url: z.string().max(1000).nullable(), enabled: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("webhook_config")
      .upsert({ id: 1, webhook_url: data.webhook_url || null, enabled: data.enabled, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const testWebhookFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cfg } = await supabaseAdmin.from("webhook_config").select("webhook_url").eq("id", 1).maybeSingle();
    if (!cfg?.webhook_url) throw new Error("לא הוגדרה כתובת webhook");
    const payload = {
      name: "בדיקה",
      email: "test@test.com",
      phone: "0500000000",
      message: "הודעת בדיקה",
      source_url: "/admin/webhooks",
      timestamp: new Date().toISOString(),
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetch(cfg.webhook_url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const body = (await res.text()).slice(0, 4000);
      return { status: res.status, ok: res.ok, body };
    } catch (e: any) {
      return { status: 0, ok: false, body: e?.message ?? "network error" };
    } finally {
      clearTimeout(timeout);
    }
  });

// ─── REDIRECTS ────────────────────────────────────────────────────────────

function normalizePath(p: string): string {
  let s = p.trim();
  try { s = decodeURIComponent(s); } catch { /* ignore */ }
  if (!s.startsWith("/") && !/^https?:\/\//i.test(s)) s = "/" + s;
  return s;
}

export const listRedirectsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("redirects")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addRedirectFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ from_path: z.string().min(1), to_path: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const from_path = normalizePath(data.from_path);
    const to_path = normalizePath(data.to_path);
    const { error } = await supabaseAdmin.from("redirects").insert({ from_path, to_path, status: 301 });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteRedirectFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("redirects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const checkSlugShadowFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ path: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const p = normalizePath(data.path);
    const slug = p.replace(/^\//, "").replace(/\/$/, "");
    if (!slug) return { shadows: false };
    const [posts, pages, cats] = await Promise.all([
      supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).eq("slug", slug).eq("status", "publish"),
      supabaseAdmin.from("pages").select("id", { count: "exact", head: true }).eq("slug", slug).eq("status", "publish"),
      supabaseAdmin.from("categories").select("id", { count: "exact", head: true }).eq("slug", slug),
    ]);
    const shadows = (posts.count ?? 0) + (pages.count ?? 0) + (cats.count ?? 0) > 0;
    return { shadows };
  });

// ─── USERS ────────────────────────────────────────────────────────────────

export const listUsersFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: usersData, error: uErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (uErr) throw new Error(uErr.message);
    const { data: roles, error: rErr } = await supabaseAdmin.from("user_roles").select("user_id, role");
    if (rErr) throw new Error(rErr.message);
    const roleMap = new Map<string, string>();
    for (const r of roles ?? []) roleMap.set(r.user_id as string, r.role as string);
    return (usersData.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      role: roleMap.get(u.id) ?? null,
    }));
  });

export const setUserRoleFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ user_id: z.string().uuid(), role: z.enum(["admin", "editor"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // If demoting an admin → guard: must not remove last admin
    const { data: existing } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user_id)
      .maybeSingle();

    if (existing?.role === "admin" && data.role !== "admin") {
      const { count } = await supabaseAdmin
        .from("user_roles")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) throw new Error("לא ניתן להסיר את מנהל המערכת האחרון");
    }

    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id);
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.user_id, role: data.role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const inviteUserFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        email: z.string().email(),
        role: z.enum(["admin", "editor"]).default("editor"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tempPassword =
      "Tmp!" + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase();
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    const uid = created.user?.id;
    if (!uid) throw new Error("Failed to create user");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", uid);
    await supabaseAdmin.from("user_roles").insert({ user_id: uid, role: data.role });
    return { email: data.email, tempPassword };
  });
