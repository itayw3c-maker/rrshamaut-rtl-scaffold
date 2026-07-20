import { createClient } from "@supabase/supabase-js";
import { sanitizePostHtml } from "./post-sanitize.server";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const WP_BASE = (process.env.WP_BASE_URL ?? "").replace(/\/+$/, "");
const WP_UA = "Mozilla/5.0 (compatible; LovableMigrator/1.0; WordPress REST import)";
const OLD_ORIGIN_RE = /^https?:\/\/(?:www\.)?rrshamaut\.co\.il\//i;

function wpAuthHeader(): string {
  const u = process.env.WP_USERNAME ?? "";
  const p = (process.env.WP_APP_PASSWORD ?? "").replace(/\s+/g, "");
  if (!u || !p) throw new Error("WP_USERNAME / WP_APP_PASSWORD not set");
  return "Basic " + Buffer.from(`${u}:${p}`).toString("base64");
}

async function fetchWithTimeout(input: string, init: RequestInit = {}, ms = 20000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(input, { ...init, signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}

const GENERIC_AUTHOR = process.env.SITE_AUTHOR_NAME ?? "רפאל שמאות רכוש";
const AUTHOR_MODE = (process.env.AUTHOR_MODE ?? "as-is") as "as-is" | "generic";

function normalizeSlug(raw: string): string {
  let s = raw;
  try { s = decodeURIComponent(s); } catch { /* keep raw */ }
  return s.normalize("NFC").trim();
}

async function wpFetch(path: string): Promise<Response> {
  return fetchWithTimeout(`${WP_BASE}/wp-json/wp/v2/${path}`, {
    headers: { Authorization: wpAuthHeader(), "User-Agent": WP_UA },
  });
}

function mimeFromExt(ext: string): string {
  const e = ext.toLowerCase();
  return e === "jpg" || e === "jpeg" ? "image/jpeg"
    : e === "png" ? "image/png" : e === "webp" ? "image/webp"
    : e === "gif" ? "image/gif" : e === "svg" ? "image/svg+xml"
    : e === "avif" ? "image/avif" : e === "bmp" ? "image/bmp"
    : e === "pdf" ? "application/pdf" : "application/octet-stream";
}

export function extractVideoUrl(html: string): string | null {
  if (!html) return null;
  const ds = html.match(/youtube_url&quot;:&quot;(https[^&]+)&quot;/i)
    || html.match(/(?:youtube_url|vimeo_url|video_url)&quot;:&quot;(https[^&]+)&quot;/i);
  if (ds) return ds[1].replace(/\\\//g, "/");
  const yt = html.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)[\w-]+|youtu\.be\/[\w-]+)/i);
  if (yt) return yt[0].replace(/\\\//g, "/");
  const vm = html.match(/https?:\/\/(?:www\.)?vimeo\.com\/\d+/i);
  if (vm) return vm[0];
  return null;
}

/** Convert any YouTube/Vimeo URL (watch/shorts/youtu.be/embed) to an embeddable URL. */
export function toEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  const u = url.replace(/\\\//g, "/");
  const m = u.match(/youtube\.com\/shorts\/([\w-]+)/i) || u.match(/youtube\.com\/embed\/([\w-]+)/i)
    || u.match(/youtube\.com\/watch\?v=([\w-]+)/i) || u.match(/youtu\.be\/([\w-]+)/i);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  const v = u.match(/vimeo\.com\/(\d+)/i);
  if (v) return `https://player.vimeo.com/video/${v[1]}`;
  return null;
}

/** Build a responsive 16:9 video embed HTML block. */
export function buildVideoEmbedHtml(url: string | null): string {
  const embed = toEmbedUrl(url);
  if (!embed) return "";
  return `<div class="video-embed" style="position:relative;width:100%;padding-top:56.25%;margin:1.5rem 0;"><iframe src="${embed}" title="video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:12px;"></iframe></div>`;
}

/** Fetch the rendered public page and pull the video URL from Elementor data-settings. */
async function fetchRenderedVideoUrl(link: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(new URL(link).href, { headers: { "User-Agent": WP_UA } });
    if (!res.ok) return null;
    const html = await res.text();
    return extractVideoUrl(html);
  } catch { return null; }
}

export async function importMediaItem(wpMediaId: number): Promise<string | null> {
  const { data: existing } = await supabaseAdmin.from("media").select("url").eq("wp_id", wpMediaId).maybeSingle();
  if (existing?.url) return existing.url;
  const metaRes = await wpFetch(`media/${wpMediaId}`);
  if (!metaRes.ok) return null;
  const meta = await metaRes.json();
  const sourceUrl: string | undefined = meta?.source_url;
  if (!sourceUrl) return null;
  const bin = await fetchWithTimeout(new URL(sourceUrl).href, { headers: { "User-Agent": WP_UA } });
  if (!bin.ok) return null;
  const arrayBuf = await bin.arrayBuffer();
  const bytes = new Uint8Array(arrayBuf);
  const ext = (sourceUrl.split(/[?#]/)[0].split(".").pop() ?? "bin").toLowerCase();
  const contentType = (bin.headers.get("content-type") || "").split(";")[0] || mimeFromExt(ext);
  const width: number | null = meta?.media_details?.width ?? null;
  const height: number | null = meta?.media_details?.height ?? null;
  const rawName = (sourceUrl.split("/").pop() ?? `media-${wpMediaId}`).replace(/\.[a-z0-9]+$/i, "");
  const asciiName = (decodeURIComponent(rawName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")) || `media-${wpMediaId}`;
  const storagePath = `wp/${wpMediaId}/${asciiName}.${ext}`;
  const up = await supabaseAdmin.storage.from("media").upload(storagePath, bytes, { contentType, upsert: true });
  if (up.error) throw new Error(`media upload failed: ${up.error.message}`);
  const { data: pub } = supabaseAdmin.storage.from("media").getPublicUrl(storagePath);
  const newUrl = pub.publicUrl;
  await supabaseAdmin.from("media").upsert(
    { wp_id: wpMediaId, legacy_url: sourceUrl, url: newUrl, bucket: "media", filename: `${asciiName}.${ext}`, width, height, metadata: { alt: meta?.alt_text ?? null } },
    { onConflict: "wp_id" }
  );
  return newUrl;
}

export type ImportPageResult = { page: number; imported: number; totalPages: number; slugs: string[] };

export async function importMediaPage(page: number, perPage = 10): Promise<ImportPageResult> {
  const res = await wpFetch(`media?per_page=${perPage}&page=${page}&_fields=id`);
  if (!res.ok) {
    if (res.status === 400) return { page, imported: 0, totalPages: page - 1, slugs: [] };
    throw new Error(`WP media page ${page} failed: ${res.status}`);
  }
  const totalPages = parseInt(res.headers.get("x-wp-totalpages") ?? "1", 10);
  const items = (await res.json()) as any[];
  let imported = 0;
  for (const m of items) { try { const u = await importMediaItem(m.id); if (u) imported++; } catch { /* skip one */ } }
  return { page, imported, totalPages, slugs: [] };
}

export async function rewriteContentMedia(html: string): Promise<string> {
  if (!html) return html;
  const { data } = await supabaseAdmin.from("media").select("legacy_url, url");
  if (!data?.length) return html;
  let out = html;
  for (const m of data) {
    if (!m.legacy_url) continue;
    out = out.split(m.legacy_url).join(m.url);
    const base = m.legacy_url.replace(/\.[a-z0-9]+$/i, "");
    const extMatch = m.legacy_url.match(/\.([a-z0-9]+)$/i);
    if (extMatch) {
      const variantRe = new RegExp(base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + `-\\d+x\\d+\\.${extMatch[1]}`, "gi");
      out = out.replace(variantRe, m.url);
    }
  }
  return out;
}

export async function rewriteInternalLinks(html: string): Promise<string> {
  if (!html) return html;
  const origin = WP_BASE.replace(/^https?:\/\//i, "");
  const hrefRe = new RegExp(`href="https?:\\/\\/(?:www\\.)?${origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^"]*)"`, "gi");
  return html.replace(hrefRe, (_full, path: string) => {
    const clean = "/" + normalizeSlug(path).replace(/^\/+/, "").replace(/\/+$/, "");
    return `href="${clean}"`;
  });
}

export async function importImagesForPost(slug: string, table: "posts" | "pages" = "posts"): Promise<{ slug: string; rehosted: number; errors: string[] }> {
  const errors: string[] = []; let rehosted = 0;
  const { data: row } = await supabaseAdmin.from(table).select("id, wp_id, content").eq("slug", slug).maybeSingle();
  if (!row) return { slug, rehosted, errors: ["not found"] };
  let content: string = row.content ?? "";
  const srcs = [...content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
  for (const src of [...new Set(srcs)]) {
    if (!OLD_ORIGIN_RE.test(src)) continue;
    try {
      const { data: ex } = await supabaseAdmin.from("media").select("url").eq("legacy_url", src).maybeSingle();
      let newUrl = ex?.url ?? null;
      if (!newUrl) {
        const dl = await fetchWithTimeout(new URL(src).href, { headers: { "User-Agent": WP_UA, Accept: "image/*" } });
        if (!dl.ok) { errors.push(`${src}: ${dl.status}`); continue; }
        const buf = new Uint8Array(await dl.arrayBuffer());
        const ext = (src.split(/[?#]/)[0].split(".").pop() ?? "bin").toLowerCase().replace(/-\d+x\d+$/, "");
        const ctype = (dl.headers.get("content-type") || "").startsWith("image/") ? dl.headers.get("content-type")! : mimeFromExt(ext);
        const rawName = (src.split("/").pop() ?? "image").split(/[?#]/)[0].replace(/\.[^.]+$/, "").replace(/-\d+x\d+$/, "");
        const name = (decodeURIComponent(rawName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")) || `img-${row.wp_id ?? "x"}`;
        const path = `content/${row.wp_id ?? "misc"}/${name}.${ext}`;
        const up = await supabaseAdmin.storage.from("media").upload(path, buf, { contentType: ctype, upsert: true });
        if (up.error) { errors.push(`${src}: ${up.error.message}`); continue; }
        newUrl = supabaseAdmin.storage.from("media").getPublicUrl(path).data.publicUrl;
        await supabaseAdmin.from("media").insert({ legacy_url: src, url: newUrl, bucket: "media", filename: `${name}.${ext}` });
      }
      content = content.split(src).join(newUrl);
      rehosted++;
    } catch (e: any) { errors.push(`${src}: ${e?.message ?? e}`); }
  }
  content = content.replace(/\s+srcset=(["']).*?\1/gi, "").replace(/\s+sizes=(["']).*?\1/gi, "");
  if (content !== row.content) await supabaseAdmin.from(table).update({ content }).eq("id", row.id);
  return { slug, rehosted, errors };
}

export async function importCategoriesAll(): Promise<{ imported: number }> {
  let page = 1, imported = 0;
  while (true) {
    const res = await wpFetch(`categories?per_page=100&page=${page}&_fields=id,slug,name,description`);
    if (!res.ok) break;
    const cats = (await res.json()) as any[];
    for (const c of cats) {
      let desc = c.description ?? null;
      if (desc) { desc = await rewriteContentMedia(desc); desc = await rewriteInternalLinks(desc); desc = sanitizePostHtml(desc); }
      await supabaseAdmin.from("categories").upsert(
        { wp_id: c.id, slug: normalizeSlug(c.slug), name: c.name, description: desc },
        { onConflict: "wp_id" }
      );
      imported++;
    }
    const totalPages = parseInt(res.headers.get("x-wp-totalpages") ?? "1", 10);
    if (page >= totalPages) break;
    page++;
  }
  return { imported };
}

export async function importTagsAll(): Promise<{ imported: number }> {
  let page = 1, imported = 0;
  while (true) {
    const res = await wpFetch(`tags?per_page=100&page=${page}&_fields=id,slug,name`);
    if (!res.ok) break;
    const tags = (await res.json()) as any[];
    for (const t of tags) {
      await supabaseAdmin.from("tags").upsert({ wp_id: t.id, slug: normalizeSlug(t.slug), name: t.name }, { onConflict: "wp_id" });
      imported++;
    }
    const totalPages = parseInt(res.headers.get("x-wp-totalpages") ?? "1", 10);
    if (page >= totalPages) break;
    page++;
  }
  return { imported };
}

export async function importPostsPage(page: number, perPage = 10, status = "publish"): Promise<ImportPageResult> {
  const res = await wpFetch(`posts?per_page=${perPage}&page=${page}&status=${status}&_embed=1`);
  if (!res.ok) {
    if (res.status === 400) return { page, imported: 0, totalPages: page - 1, slugs: [] };
    throw new Error(`WP posts page ${page} (${status}) failed: ${res.status}`);
  }
  const totalPages = parseInt(res.headers.get("x-wp-totalpages") ?? "1", 10);
  const posts = (await res.json()) as any[];
  const slugs: string[] = [];
  for (const p of posts) { await upsertPostRow(p, null); slugs.push(normalizeSlug(p.slug)); }
  return { page, imported: posts.length, totalPages, slugs };
}

export async function importCustomPostType(typeSlug: string, page: number, perPage = 10, status = "publish"): Promise<ImportPageResult> {
  const res = await wpFetch(`${typeSlug}?per_page=${perPage}&page=${page}&status=${status}&_embed=1`);
  if (!res.ok) {
    if (res.status === 400) return { page, imported: 0, totalPages: page - 1, slugs: [] };
    throw new Error(`WP CPT ${typeSlug} page ${page} failed: ${res.status}`);
  }
  const totalPages = parseInt(res.headers.get("x-wp-totalpages") ?? "1", 10);
  const items = (await res.json()) as any[];
  const slugs: string[] = [];
  for (const p of items) { await upsertPostRow(p, typeSlug); slugs.push(normalizeSlug(p.slug)); }
  return { page, imported: items.length, totalPages, slugs };
}

async function upsertPostRow(p: any, cptType: string | null): Promise<void> {
  const slug = normalizeSlug(p.slug);
  const terms = (p?._embedded?.["wp:term"]?.[0] ?? []) as any[];
  const allCats = terms.filter((t: any) => t.taxonomy === "category");
  const primaryWpCatId = p.categories?.[0] ?? allCats[0]?.id ?? null;
  const catRows: Array<{ id: string; wp_id: number }> = [];
  for (const cat of allCats) {
    const { data: c } = await supabaseAdmin.from("categories").upsert(
      { wp_id: cat.id, slug: normalizeSlug(cat.slug), name: cat.name, description: cat.description ?? null },
      { onConflict: "wp_id" }
    ).select("id, wp_id").maybeSingle();
    if (c?.id) catRows.push({ id: c.id, wp_id: c.wp_id });
  }

  let coverMediaId: string | null = null;
  if (p.featured_media && p.featured_media !== 0) {
    await importMediaItem(p.featured_media);
    const { data: mid } = await supabaseAdmin.from("media").select("id").eq("wp_id", p.featured_media).maybeSingle();
    coverMediaId = mid?.id ?? null;
  }

  // Yoast meta (byte-exact SEO parity). yoast_head_json is present in the REST payload.
  const yoast = p.yoast_head_json ?? {};
  const metaTitle = yoast.title ? sanitizePostHtml(String(yoast.title)).replace(/<[^>]+>/g, "") : null;
  const metaDescription = (yoast.description || yoast.og_description)
    ? sanitizePostHtml(String(yoast.description || yoast.og_description)).replace(/<[^>]+>/g, "") : null;

  // Content + video handling.
  let rawContent = p.content?.rendered ?? "";
  let videoUrl: string | null = extractVideoUrl(rawContent);

  if (cptType === "movie" || cptType === "shorts") {
    // Video lives in the rendered Elementor page, not in REST content.
    if (!videoUrl && p.link) videoUrl = await fetchRenderedVideoUrl(p.link);
    // Build a clean body ourselves (avoids Elementor global-section leaks).
    let intro = rawContent.trim();
    if (!intro && metaDescription) intro = `<p>${metaDescription}</p>`;
    const embed = buildVideoEmbedHtml(videoUrl);
    rawContent = [embed, intro].filter(Boolean).join("\n");
  }

  let content = await rewriteContentMedia(rawContent);
  content = await rewriteInternalLinks(content);
  content = sanitizePostHtml(content);

  const author = AUTHOR_MODE === "generic" ? GENERIC_AUTHOR : (p._embedded?.author?.[0]?.name ?? GENERIC_AUTHOR);
  const wpStatus = p.status ?? "publish";
  const status = wpStatus === "future" ? "publish" : (wpStatus === "publish" ? "publish" : wpStatus === "draft" ? "draft" : "publish");

  const { data: postRow } = await supabaseAdmin.from("posts").upsert(
    {
      wp_id: p.id, slug,
      title: sanitizePostHtml(p.title?.rendered ?? slug).replace(/<[^>]+>/g, ""),
      content,
      excerpt: sanitizePostHtml(p.excerpt?.rendered ?? ""),
      author_name: author,
      cover_media_id: coverMediaId,
      cpt_type: cptType,
      video_url: videoUrl,
      meta_title: metaTitle,
      meta_description: metaDescription,
      status,
      published_at: p.date_gmt ? `${p.date_gmt}Z` : null,
      updated_at: p.modified_gmt ? `${p.modified_gmt}Z` : new Date().toISOString(),
    },
    { onConflict: "wp_id" }
  ).select("id").maybeSingle();

  if (postRow?.id) {
    await supabaseAdmin.from("post_categories").delete().eq("post_id", postRow.id);
    const rows = catRows.map((c) => ({ post_id: postRow.id, category_id: c.id, is_primary: c.wp_id === primaryWpCatId }));
    if (rows.length) await supabaseAdmin.from("post_categories").insert(rows);
  }
}

export async function importPagesPage(page: number, perPage = 10, status = "publish"): Promise<ImportPageResult> {
  const res = await wpFetch(`pages?per_page=${perPage}&page=${page}&status=${status}`);
  if (!res.ok) {
    if (res.status === 400) return { page, imported: 0, totalPages: page - 1, slugs: [] };
    throw new Error(`WP pages page ${page} failed: ${res.status}`);
  }
  const totalPages = parseInt(res.headers.get("x-wp-totalpages") ?? "1", 10);
  const pages = (await res.json()) as any[];
  const slugs: string[] = [];
  for (const pg of pages) {
    const slug = normalizeSlug(pg.slug);
    let content = pg.content?.rendered ?? "";
    content = await rewriteContentMedia(content);
    content = await rewriteInternalLinks(content);
    content = sanitizePostHtml(content);
    await supabaseAdmin.from("pages").upsert(
      { wp_id: pg.id, slug, title: sanitizePostHtml(pg.title?.rendered ?? slug).replace(/<[^>]+>/g, ""), content, status: pg.status ?? "publish", updated_at: pg.modified_gmt ? `${pg.modified_gmt}Z` : new Date().toISOString() },
      { onConflict: "wp_id" }
    );
    slugs.push(slug);
  }
  return { page, imported: pages.length, totalPages, slugs };
}

export async function listPostsNeedingBackfill(): Promise<{ slugs: string[] }> {
  const { data } = await supabaseAdmin.from("posts").select("slug").is("cover_media_id", null).order("slug");
  return { slugs: (data ?? []).map((r) => r.slug) };
}

export async function backfillCoverForPost(slug: string): Promise<{ slug: string; action: "set" | "skipped" | "none" }> {
  const { data: post } = await supabaseAdmin.from("posts").select("id, content, cover_media_id").eq("slug", slug).maybeSingle();
  if (!post || post.cover_media_id) return { slug, action: "skipped" };
  const firstImg = (post.content ?? "").match(/<img[^>]+src="([^"]+)"/i)?.[1];
  if (firstImg) {
    const { data: m } = await supabaseAdmin.from("media").select("id").eq("url", firstImg).maybeSingle();
    if (m?.id) { await supabaseAdmin.from("posts").update({ cover_media_id: m.id }).eq("id", post.id); return { slug, action: "set" }; }
  }
  return { slug, action: "none" };
}

export async function getImportStats() {
  const [posts, pages, media, cats, tags, missingCover] = await Promise.all([
    supabaseAdmin.from("posts").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("pages").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("media").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("categories").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("tags").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).is("cover_media_id", null),
  ]);
  return {
    posts: posts.count ?? 0, pages: pages.count ?? 0, media: media.count ?? 0,
    categories: cats.count ?? 0, tags: tags.count ?? 0, postsMissingCover: missingCover.count ?? 0,
  };
}
