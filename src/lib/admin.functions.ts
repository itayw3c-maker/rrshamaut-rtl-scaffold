import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Returns { isAdmin } for the current authenticated user by calling the
 * `current_user_is_admin()` SQL function — the same one RLS uses.
 */
export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("current_user_is_admin");
    if (error) {
      console.error("current_user_is_admin failed:", error);
      return { isAdmin: false };
    }
    return { isAdmin: Boolean(data) };
  });
