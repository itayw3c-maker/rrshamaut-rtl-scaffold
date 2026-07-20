import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

const CONSENT_VERSION = "v1-2026-07";

const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  damageType: z.string().trim().max(80).optional().or(z.literal("")),
  sourceUrl: z.string().trim().max(500).optional().or(z.literal("")),
  sourceVariant: z.string().trim().max(40).optional().or(z.literal("")),
  agreed: z.boolean(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const submitLeadFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    if (data.agreed !== true) {
      throw new Error("Consent required");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const userAgent = getRequestHeader("user-agent") ?? null;

    const damage = (data.damageType ?? "").trim();
    const rawMessage = (data.message ?? "").trim();
    const combinedMessage = damage
      ? `[${damage}]${rawMessage ? `\n${rawMessage}` : ""}`
      : rawMessage;

    const email = (data.email ?? "").trim() || null;

    const insertPayload = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email,
      message: combinedMessage || null,
      source_url: (data.sourceUrl ?? "").trim() || null,
      source_variant: (data.sourceVariant ?? "").trim() || null,
      agreed: true,
      agreed_at: new Date().toISOString(),
      consent_text_version: CONSENT_VERSION,
      user_agent: userAgent,
      handled: false,
    };

    const { data: inserted, error } = await supabaseAdmin
      .from("leads")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error) {
      console.error("[submitLeadFn] insert failed:", error);
      throw new Error("Failed to save lead");
    }

    // Fire-and-forget webhook (never fail the submit).
    try {
      const { data: cfg } = await supabaseAdmin
        .from("webhook_config")
        .select("webhook_url, enabled")
        .eq("id", 1)
        .maybeSingle();

      if (cfg?.enabled && cfg.webhook_url) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        let webhook_ok = false;
        let webhook_response: string | null = null;
        try {
          const res = await fetch(cfg.webhook_url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: insertPayload.name,
              email: insertPayload.email,
              phone: insertPayload.phone,
              message: rawMessage || null,
              damageType: damage || null,
              source_url: insertPayload.source_url,
              timestamp: insertPayload.agreed_at,
            }),
            signal: controller.signal,
          });
          webhook_ok = res.ok;
          webhook_response = (await res.text()).slice(0, 2000);
        } catch (whErr) {
          webhook_ok = false;
          webhook_response = whErr instanceof Error ? whErr.message.slice(0, 2000) : "unknown";
        } finally {
          clearTimeout(timeout);
        }

        await supabaseAdmin
          .from("leads")
          .update({ webhook_ok, webhook_response })
          .eq("id", inserted.id);
      }
    } catch (whOuter) {
      console.error("[submitLeadFn] webhook stage failed:", whOuter);
    }

    return { ok: true };
  });
