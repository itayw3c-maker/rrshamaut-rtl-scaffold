// Server-only: resolve legacy WP image URLs to Supabase media, rehosting if missing.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const UA = "Mozilla/5.0 (compatible; LovableRehost/1.0)";

function mimeFromExt(ext: string): string {
  const e = ext.toLowerCase();
  return e === "jpg" || e === "jpeg" ? "image/jpeg"
    : e === "png" ? "image/png" : e === "webp" ? "image/webp"
    : e === "gif" ? "image/gif" : e === "svg" ? "image/svg+xml"
    : e === "avif" ? "image/avif" : e === "bmp" ? "image/bmp"
    : "application/octet-stream";
}

function stripSize(url: string): string {
  return url.replace(/-\d+x\d+(\.[a-z0-9]+)(\?.*)?$/i, "$1");
}

function filenameOf(url: string): string {
  return (url.split("?")[0].split("#")[0].split("/").pop() ?? "").toLowerCase();
}

async function fetchWithTimeout(u: string, ms = 20000): Promise<Response> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try { return await fetch(u, { headers: { "User-Agent": UA, Accept: "image/*" }, signal: c.signal }); }
  finally { clearTimeout(t); }
}

/** Resolve one legacy image URL to a Supabase URL, rehosting when necessary.
 *  Returns null if the image cannot be located or fetched. */
export async function resolveOrRehostImage(originalUrl: string): Promise<string | null> {
  const url = originalUrl.trim();
  if (!url) return null;
  // Already on Supabase / relative
  if (!/^https?:\/\/(?:www\.)?rrshamaut\.co\.il\//i.test(url)) return url;

  const stripped = stripSize(url);
  const fname = filenameOf(stripped);

  // 1) exact legacy_url
  let hit = await supabaseAdmin.from("media").select("url").eq("legacy_url", url).maybeSingle();
  if (hit.data?.url) return hit.data.url;
  // 2) size-stripped legacy_url
  if (stripped !== url) {
    hit = await supabaseAdmin.from("media").select("url").eq("legacy_url", stripped).maybeSingle();
    if (hit.data?.url) return hit.data.url;
  }
  // 3) filename ILIKE
  if (fname) {
    const like = await supabaseAdmin.from("media").select("url").ilike("filename", fname).limit(1).maybeSingle();
    if (like.data?.url) return like.data.url;
    const base = fname.replace(/\.[^.]+$/, "");
    const like2 = await supabaseAdmin.from("media").select("url").ilike("filename", `${base}.%`).limit(1).maybeSingle();
    if (like2.data?.url) return like2.data.url;
  }

  // 4) download + upload
  try {
    const src = encodeURI(decodeURI(url));
    const dl = await fetchWithTimeout(src);
    if (!dl.ok) return null;
    const buf = new Uint8Array(await dl.arrayBuffer());
    const ext = (fname.split(".").pop() || "bin").toLowerCase();
    const base = (fname.replace(/\.[^.]+$/, "") || `img-${Date.now()}`)
      .replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || `img-${Date.now()}`;
    const path = `content/rehost/${base}.${ext}`;
    const ctype = (dl.headers.get("content-type") || "").startsWith("image/")
      ? dl.headers.get("content-type")!
      : mimeFromExt(ext);
    const up = await supabaseAdmin.storage.from("media").upload(path, buf, { contentType: ctype, upsert: true });
    if (up.error) return null;
    const pub = supabaseAdmin.storage.from("media").getPublicUrl(path).data.publicUrl;
    await supabaseAdmin.from("media").insert({
      legacy_url: url, url: pub, bucket: "media", filename: `${base}.${ext}`,
    });
    return pub;
  } catch {
    return null;
  }
}

export async function resolveMany(urls: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const uniq = Array.from(new Set(urls.filter(Boolean)));
  for (const u of uniq) {
    const r = await resolveOrRehostImage(u);
    if (r) out[u] = r;
  }
  return out;
}
