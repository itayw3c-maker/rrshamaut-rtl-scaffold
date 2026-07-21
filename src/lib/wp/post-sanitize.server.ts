const CHATGPT_ATTR_RE =
  /(data-testid|data-scroll-anchor|data-message-author-role|data-message-id)\s*=/i;
const CHATGPT_CLASS_RE =
  /class\s*=\s*"[^"]*(text-token-|thread-trailing|conversation-turn|scroll-mb-\[|markdown\s|prose\b)[^"]*"/i;

function stripTagBlock(html: string, tag: string): string {
  const re = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");
  let prev = ""; let cur = html; let safety = 30;
  while (cur !== prev && safety-- > 0) { prev = cur; cur = cur.replace(re, ""); }
  return cur;
}

function unwrapChatGptDivs(html: string): string {
  const tagRe = /<div\b([^>]*)>([\s\S]*?)<\/div>/gi;
  let prev = ""; let cur = html; let safety = 25;
  while (cur !== prev && safety-- > 0) {
    prev = cur;
    cur = cur.replace(tagRe, (full, attrs, inner) =>
      (CHATGPT_ATTR_RE.test(attrs) || CHATGPT_CLASS_RE.test(attrs)) ? inner : full);
  }
  return cur;
}

function stripShortcodes(html: string): string {
  let out = html;
  out = out.replace(/\[(\w+)[^\]]*\][\s\S]*?\[\/\1\]/gi, (full, tag) => {
    if (/^caption$/i.test(tag)) {
      const inner = full.replace(/^\[caption[^\]]*\]/i, "").replace(/\[\/caption\]$/i, "");
      return inner.trim();
    }
    return "";
  });
  out = out.replace(/\[\/?\w+[^\]]*\]/gi, "");
  return out;
}

function collapseEmpties(html: string): string {
  let out = html;
  out = out.replace(/<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "");
  out = out.replace(/(?:<br\s*\/?>\s*){3,}/gi, "<br/>");
  out = out.replace(/\n{3,}/g, "\n\n");
  return out.trim();
}

/** Replace em-dash (U+2014) and en-dash (U+2013) + their HTML entities with ASCII hyphen. */
export function normalizeDashes(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/—/g, "-").replace(/–/g, "-")
    .replace(/&mdash;/gi, "-").replace(/&ndash;/gi, "-")
    .replace(/&#8212;/g, "-").replace(/&#8211;/g, "-");
}

/** Decode common HTML entities that appear in Yoast/WP titles. */
export function decodeEntities(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'").replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCodePoint(parseInt(h, 16)));
}

/** Collapse duplicated brand-name occurrences in a meta title to at most one.
 *  e.g. "X | רפאל שמאות רכוש - רפאל שמאות רכוש | RR" -> "X | רפאל שמאות רכוש | RR" */
export function dedupeBrandInTitle(s: string | null | undefined, brand = "רפאל שמאות רכוש"): string {
  if (!s) return "";
  let out = s;
  const esc = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Collapse two adjacent brand tokens separated by " - " / " | " / " – " / whitespace
  const dupRe = new RegExp(`${esc}\\s*[-–|]\\s*${esc}`, "g");
  let safety = 5;
  while (dupRe.test(out) && safety-- > 0) out = out.replace(dupRe, brand);
  // Also collapse doubled brand with just whitespace between
  const wsRe = new RegExp(`${esc}\\s+${esc}`, "g");
  safety = 5;
  while (wsRe.test(out) && safety-- > 0) out = out.replace(wsRe, brand);
  return out.replace(/\s{2,}/g, " ").trim();
}

/** Remove a <tag ...> ... </tag> block whose opening tag attributes match `attrRe`.
 *  Handles nested same-tag elements via a depth scan. */
function stripBlockByOpenAttrs(html: string, tag: string, attrRe: RegExp): string {
  const openRe = new RegExp(`<${tag}\\b([^>]*)>`, "gi");
  const anyOpenRe = new RegExp(`<${tag}\\b[^>]*>`, "gi");
  const closeRe = new RegExp(`</${tag}\\s*>`, "gi");
  let out = html;
  let safety = 50;
  while (safety-- > 0) {
    openRe.lastIndex = 0;
    let m: RegExpExecArray | null = null;
    let found: { start: number; attrs: string } | null = null;
    while ((m = openRe.exec(out)) !== null) {
      if (attrRe.test(m[1])) { found = { start: m.index, attrs: m[1] }; break; }
    }
    if (!found) break;
    // Find matching close accounting for nesting
    let depth = 1;
    let idx = found.start + `<${tag}`.length;
    while (depth > 0) {
      anyOpenRe.lastIndex = idx;
      closeRe.lastIndex = idx;
      const nextOpen = anyOpenRe.exec(out);
      const nextClose = closeRe.exec(out);
      if (!nextClose) { // unbalanced - strip to end
        out = out.slice(0, found.start);
        depth = 0;
        break;
      }
      if (nextOpen && nextOpen.index < nextClose.index) {
        depth++;
        idx = nextOpen.index + nextOpen[0].length;
      } else {
        depth--;
        idx = nextClose.index + nextClose[0].length;
      }
    }
    if (depth === 0) out = out.slice(0, found.start) + out.slice(idx);
  }
  return out;
}

function stripSuperPicture(html: string): string {
  let out = html;
  // Remove wrapping divs by id or class starting with super-picture
  out = stripBlockByOpenAttrs(out, "div", /\b(id|class)\s*=\s*["'][^"']*\bsuper-picture[\w-]*/i);
  // Remove standalone img placeholders (super-picture-img-loading / -error)
  out = out.replace(/<img\b[^>]*\bclass\s*=\s*["'][^"']*\bsuper-picture-img-(?:loading|error)[^"']*["'][^>]*\/?>/gi, "");
  return out;
}

function stripSrclessImgs(html: string): string {
  let out = html;
  // <img ... src="" ...>
  out = out.replace(/<img\b[^>]*\bsrc\s*=\s*(["'])\s*\1[^>]*\/?>/gi, "");
  // <img ...> with NO src attribute at all
  out = out.replace(/<img\b([^>]*)\/?>/gi, (full, attrs: string) =>
    /\bsrc\s*=/i.test(attrs) ? full : ""
  );
  return out;
}

function downgradeH1(html: string): string {
  return html
    .replace(/<h1\b([^>]*)>/gi, "<h2$1>")
    .replace(/<\/h1\s*>/gi, "</h2>");
}

export function sanitizePostHtml(input: string | null | undefined): string {
  if (!input) return "";
  let html = input;
 html = html.replace(new RegExp("<!" + "--\\[if[\\s\\S]*?\\[endif\\]--" + ">", "gi"), "");
 html = html.replace(new RegExp("<!" + "--[\\s\\S]*?--" + ">", "g"), "");
  html = stripTagBlock(html, "script");
  html = stripTagBlock(html, "style");
  html = stripTagBlock(html, "audio");
  html = html.replace(/<a\b[^>]*href="[^"]*\.(?:mp3|wav|m4a|ogg)"[^>]*>[\s\S]*?<\/a>/gi, "");
  html = html.replace(/^\s*https?:\/\/\S+\.(?:mp3|wav|m4a|ogg)\s*/i, "");
  html = unwrapChatGptDivs(html);
  html = stripShortcodes(html);
  // New self-heal rules (run BEFORE dash-normalize):
  html = stripSuperPicture(html);
  html = stripSrclessImgs(html);
  html = downgradeH1(html);
  html = collapseEmpties(html);
  html = normalizeDashes(html);
  return html;
}

export function hasGarbage(input: string | null | undefined): boolean {
  if (!input) return false;
  return (
    new RegExp("<!" + "--\\[if", "i").test(input) || /<audio\b/i.test(input) || /<script\b/i.test(input) ||
    CHATGPT_ATTR_RE.test(input) || CHATGPT_CLASS_RE.test(input) ||
    /\[(caption|audio|playlist|gallery|embed)\b/i.test(input)
  );
}
